// src/services/integrations/amazonIntegration.ts
import {
  CustomerSource,
  CustomerStatus,
  CustomerTier,
  PaymentStatus,
  SaleStatus,
} from '../../types/enums';
import {
  Address,
  Customer,
  FulfillmentStatus,
  Sale,
  SalesChannel,
  SalesItem,
} from '../../types/salesTypes';
import { PlatformAuthConfig } from './platformIntegration';

/**
 * Amazon SP-API order response structure (simplified version)
 */
interface AmazonOrder {
  AmazonOrderId: string;
  PurchaseDate: string;
  LastUpdateDate: string;
  OrderStatus: string;
  FulfillmentChannel: string;
  NumberOfItemsShipped: number;
  NumberOfItemsUnshipped: number;
  PaymentMethod: string;
  MarketplaceId: string;
  BuyerInfo: AmazonBuyerInfo;
  OrderTotal: AmazonMoney;
  ShippingAddress?: AmazonAddress;
  OrderItems: AmazonOrderItem[];
  ShipmentDetails?: AmazonShipmentDetails;
}

interface AmazonBuyerInfo {
  BuyerEmail: string;
  BuyerName: string;
  BuyerCounty: string;
  BuyerTaxInfo?: {
    TaxingRegion: string;
    TaxClassifications: Array<{
      Name: string;
      Value: string;
    }>;
  };
  PurchaseOrderNumber?: string;
}

interface AmazonMoney {
  Amount: string;
  CurrencyCode: string;
}

interface AmazonAddress {
  Name: string;
  AddressLine1: string;
  AddressLine2?: string;
  AddressLine3?: string;
  City: string;
  County?: string;
  District?: string;
  StateOrRegion: string;
  PostalCode: string;
  CountryCode: string;
  Phone?: string;
}

interface AmazonOrderItem {
  ASIN: string;
  SellerSKU: string;
  OrderItemId: string;
  Title: string;
  QuantityOrdered: number;
  QuantityShipped: number;
  ItemPrice: AmazonMoney;
  ShippingPrice?: AmazonMoney;
  ItemTax?: AmazonMoney;
  ShippingTax?: AmazonMoney;
  PromotionDiscount?: AmazonMoney;
  PromotionDiscountTax?: AmazonMoney;
  ConditionId: string;
  ConditionNote?: string;
  ConditionSubtypeId?: string;
  IsGift: boolean;
  ProductInfo?: {
    NumberOfItems?: number;
  };
}

interface AmazonShipmentDetails {
  ShipmentServiceLevelCategory: string;
  EarliestShipDate: string;
  LatestShipDate: string;
  EarliestDeliveryDate?: string;
  LatestDeliveryDate?: string;
  IsBusinessOrder: boolean;
  IsGlobalExpressEnabled: boolean;
  IsISPU: boolean;
  IsPrime: boolean;
  IsPremiumOrder: boolean;
}

/**
 * Convert Amazon order to HideSync Sale
 */
const convertAmazonOrderToSale = (amazonOrder: AmazonOrder): Sale => {
  // Map Amazon order status to HideSync sale status
  const mapSaleStatus = (status: string): SaleStatus => {
    switch (status) {
      case 'Pending':
        return SaleStatus.INQUIRY; // Using INQUIRY as a suitable alternative to PENDING
      case 'Unshipped':
        return SaleStatus.CONFIRMED;
      case 'PartiallyShipped':
        return SaleStatus.IN_PROGRESS;
      case 'Shipped':
        return SaleStatus.SHIPPED;
      case 'Canceled':
        return SaleStatus.CANCELLED;
      default:
        return SaleStatus.INQUIRY; // Default to INQUIRY when status is unknown
    }
  };

  // Map Amazon payment status
  const mapPaymentStatus = (order: AmazonOrder): PaymentStatus => {
    // Amazon doesn't provide detailed payment status, we have to infer
    if (order.OrderStatus === 'Canceled') {
      return PaymentStatus.CANCELLED;
    }
    return PaymentStatus.PAID; // Amazon typically holds payment until shipping
  };

  // Map Amazon fulfillment status
  const mapFulfillmentStatus = (order: AmazonOrder): FulfillmentStatus => {
    if (order.NumberOfItemsShipped === 0) {
      return FulfillmentStatus.PENDING;
    } else if (
      order.NumberOfItemsShipped <
      order.NumberOfItemsUnshipped + order.NumberOfItemsShipped
    ) {
      return FulfillmentStatus.READY_TO_SHIP; // Using READY_TO_SHIP as an alternative to PARTIALLY_SHIPPED
    } else {
      return FulfillmentStatus.SHIPPED;
    }
  };

  // Convert Amazon address to HideSync address
  const convertAddress = (
    amazonAddress?: AmazonAddress
  ): Address | undefined => {
    if (!amazonAddress) return undefined;

    return {
      street: [
        amazonAddress.AddressLine1,
        amazonAddress.AddressLine2,
        amazonAddress.AddressLine3,
      ]
        .filter(Boolean)
        .join(', '),
      city: amazonAddress.City,
      state: amazonAddress.StateOrRegion,
      postalCode: amazonAddress.PostalCode,
      country: amazonAddress.CountryCode,
    };
  };

  // Create customer object
  const customer: Customer = {
    id: 0, // This would be mapped to your internal customer ID in a real implementation
    name: amazonOrder.BuyerInfo.BuyerName,
    email: amazonOrder.BuyerInfo.BuyerEmail,
    phone: amazonOrder.ShippingAddress?.Phone || '',
    status: CustomerStatus.ACTIVE,
    tier: CustomerTier.STANDARD,
    source: CustomerSource.MARKETPLACE,
  };

  // Convert order items
  const items: SalesItem[] = amazonOrder.OrderItems.map((item) => ({
    id: parseInt(item.OrderItemId.slice(-8), 16), // Generate a temporary ID from the order item ID
    name: item.Title,
    sku: item.SellerSKU,
    price: parseFloat(item.ItemPrice.Amount),
    quantity: item.QuantityOrdered,
    type: 'PRODUCT',
    notes: item.ConditionNote,
  }));

  // Calculate totals
  const total = parseFloat(amazonOrder.OrderTotal.Amount);
  const shipping = amazonOrder.OrderItems.reduce((sum, item) => {
    return (
      sum + (item.ShippingPrice ? parseFloat(item.ShippingPrice.Amount) : 0)
    );
  }, 0);
  const taxes = amazonOrder.OrderItems.reduce((sum, item) => {
    const itemTax = item.ItemTax ? parseFloat(item.ItemTax.Amount) : 0;
    const shippingTax = item.ShippingTax
      ? parseFloat(item.ShippingTax.Amount)
      : 0;
    return sum + itemTax + shippingTax;
  }, 0);

  // Amazon takes approximately 15% as fees (simplified)
  const platformFees = Math.round(total * 0.15 * 100) / 100;

  // Store additional info in tags array
  const tags = [];
  if (amazonOrder.ShipmentDetails?.IsPrime) tags.push('prime');
  if (amazonOrder.MarketplaceId)
    tags.push(`marketplace:${amazonOrder.MarketplaceId}`);

  return {
    id: parseInt(amazonOrder.AmazonOrderId.slice(-8), 16), // Generate a temporary ID
    customer,
    createdAt: amazonOrder.PurchaseDate,
    status: mapSaleStatus(amazonOrder.OrderStatus),
    paymentStatus: mapPaymentStatus(amazonOrder),
    fulfillmentStatus: mapFulfillmentStatus(amazonOrder),
    total,
    taxes,
    shipping,
    platformFees,
    netRevenue: total - platformFees,
    items,
    channel: SalesChannel.AMAZON,
    marketplaceData: {
      externalOrderId: amazonOrder.AmazonOrderId,
      platform: SalesChannel.AMAZON,
      orderUrl: `https://sellercentral.amazon.com/orders-v3/order/${amazonOrder.AmazonOrderId}`,
      platformFees,
    },
    shippingAddress: convertAddress(amazonOrder.ShippingAddress),
    shippingMethod: amazonOrder.ShipmentDetails?.ShipmentServiceLevelCategory,
    communications: [],
    tags,
  };
};

/**
 * Fetch orders from Amazon
 * In a real implementation, this would make API calls to Amazon SP-API
 * For this demo, we're returning mock data
 */
export const fetchAmazonOrders = async (
  config: PlatformAuthConfig,
  fromDate?: Date
): Promise<Sale[]> => {
  // In a real implementation, this would make API calls to Amazon SP-API
  console.log('Fetching Amazon orders with config:', config);
  console.log('From date:', fromDate);

  // For now, return mock data
  const mockAmazonOrders: AmazonOrder[] = [
    {
      AmazonOrderId: '114-3941689-8772232',
      PurchaseDate: new Date().toISOString(),
      LastUpdateDate: new Date().toISOString(),
      OrderStatus: 'Unshipped',
      FulfillmentChannel: 'MFN', // Merchant Fulfilled Network
      NumberOfItemsShipped: 0,
      NumberOfItemsUnshipped: 2,
      PaymentMethod: 'Credit Card',
      MarketplaceId: 'ATVPDKIKX0DER', // US marketplace
      BuyerInfo: {
        BuyerEmail: 'buyer@example.com',
        BuyerName: 'Robert Thompson',
        BuyerCounty: 'United States',
      },
      OrderTotal: {
        Amount: '158.99',
        CurrencyCode: 'USD',
      },
      ShippingAddress: {
        Name: 'Robert Thompson',
        AddressLine1: '789 Pine Lane',
        AddressLine2: 'Apt 304',
        City: 'Seattle',
        StateOrRegion: 'WA',
        PostalCode: '98101',
        CountryCode: 'US',
        Phone: '206-555-0189',
      },
      OrderItems: [
        {
          ASIN: 'B07X9YDRGD',
          SellerSKU: 'LTR-BELT-01',
          OrderItemId: '32891349571',
          Title: 'Handcrafted Leather Belt - Premium Quality',
          QuantityOrdered: 1,
          QuantityShipped: 0,
          ItemPrice: {
            Amount: '89.99',
            CurrencyCode: 'USD',
          },
          ShippingPrice: {
            Amount: '4.99',
            CurrencyCode: 'USD',
          },
          ItemTax: {
            Amount: '8.10',
            CurrencyCode: 'USD',
          },
          ConditionId: 'New',
          IsGift: false,
          ProductInfo: {
            NumberOfItems: 1,
          },
        },
        {
          ASIN: 'B09D3QHNMK',
          SellerSKU: 'LTR-WALLET-02',
          OrderItemId: '32891349572',
          Title: 'Premium Leather Bifold Wallet with RFID Protection',
          QuantityOrdered: 1,
          QuantityShipped: 0,
          ItemPrice: {
            Amount: '59.99',
            CurrencyCode: 'USD',
          },
          ShippingPrice: {
            Amount: '0.00',
            CurrencyCode: 'USD',
          },
          ItemTax: {
            Amount: '5.40',
            CurrencyCode: 'USD',
          },
          ConditionId: 'New',
          IsGift: true,
          ConditionNote: 'Gift wrap requested',
          ProductInfo: {
            NumberOfItems: 1,
          },
        },
      ],
      ShipmentDetails: {
        ShipmentServiceLevelCategory: 'Standard',
        EarliestShipDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        LatestShipDate: new Date(Date.now() + 259200000).toISOString(), // 3 days from now
        IsBusinessOrder: false,
        IsGlobalExpressEnabled: false,
        IsISPU: false,
        IsPrime: true,
        IsPremiumOrder: false,
      },
    },
    {
      AmazonOrderId: '112-2567183-0987654',
      PurchaseDate: new Date(Date.now() - 604800000).toISOString(), // 7 days ago
      LastUpdateDate: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
      OrderStatus: 'Shipped',
      FulfillmentChannel: 'MFN', // Merchant Fulfilled Network
      NumberOfItemsShipped: 1,
      NumberOfItemsUnshipped: 0,
      PaymentMethod: 'Credit Card',
      MarketplaceId: 'ATVPDKIKX0DER', // US marketplace
      BuyerInfo: {
        BuyerEmail: 'james.walker@example.com',
        BuyerName: 'James Walker',
        BuyerCounty: 'United States',
        PurchaseOrderNumber: 'PO-12345',
      },
      OrderTotal: {
        Amount: '145.50',
        CurrencyCode: 'USD',
      },
      ShippingAddress: {
        Name: 'James Walker',
        AddressLine1: '456 Market Street',
        City: 'San Francisco',
        StateOrRegion: 'CA',
        PostalCode: '94103',
        CountryCode: 'US',
        Phone: '415-555-7890',
      },
      OrderItems: [
        {
          ASIN: 'B08F7ZMTRQ',
          SellerSKU: 'LTR-BAG-03',
          OrderItemId: '40087612389',
          Title: 'Leather Messenger Bag - Professional Series',
          QuantityOrdered: 1,
          QuantityShipped: 1,
          ItemPrice: {
            Amount: '129.99',
            CurrencyCode: 'USD',
          },
          ShippingPrice: {
            Amount: '0.00',
            CurrencyCode: 'USD',
          },
          ItemTax: {
            Amount: '11.70',
            CurrencyCode: 'USD',
          },
          PromotionDiscount: {
            Amount: '13.00',
            CurrencyCode: 'USD',
          },
          ConditionId: 'New',
          IsGift: false,
          ProductInfo: {
            NumberOfItems: 1,
          },
        },
      ],
      ShipmentDetails: {
        ShipmentServiceLevelCategory: 'Expedited',
        EarliestShipDate: new Date(Date.now() - 518400000).toISOString(), // 6 days ago
        LatestShipDate: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
        EarliestDeliveryDate: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
        LatestDeliveryDate: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        IsBusinessOrder: true,
        IsGlobalExpressEnabled: false,
        IsISPU: false,
        IsPrime: true,
        IsPremiumOrder: true,
      },
    },
  ];

  // Convert Amazon orders to HideSync Sales
  return mockAmazonOrders.map(convertAmazonOrderToSale);
};

/**
 * Update fulfillment status in Amazon
 * In a real implementation, this would make API calls to Amazon SP-API
 * For this demo, we just log the information
 */
export const updateAmazonFulfillment = async (
  orderId: string,
  trackingNumber: string,
  shippingProvider: string,
  config: PlatformAuthConfig
): Promise<boolean> => {
  // In a real implementation, this would make API calls to Amazon SP-API
  console.log('Updating Amazon fulfillment for order:', orderId);
  console.log('Tracking number:', trackingNumber);
  console.log('Shipping provider:', shippingProvider);
  console.log('Config:', config);

  // Simulate success
  return true;
};

/**
 * Generate authorization URL for Amazon SP-API OAuth flow
 */
export const getAmazonAuthUrl = (
  clientId: string,
  redirectUri: string,
  state: string
): string => {
  return `https://sellercentral.amazon.com/apps/authorize/consent?application_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&state=${encodeURIComponent(state)}`;
};

/**
 * Exchange authorization code for Amazon LWA access token (OAuth flow)
 * In a real implementation, this would make API calls to Amazon Login with Amazon service
 * For this demo, we just return a mock token
 */
export const exchangeAmazonAuthCode = async (
  clientId: string,
  clientSecret: string,
  code: string,
  redirectUri: string
): Promise<PlatformAuthConfig> => {
  // In a real implementation, this would make API calls to Amazon
  console.log('Exchanging auth code for Amazon access token');
  console.log('Client ID:', clientId);
  console.log('Code:', code);
  console.log('Redirect URI:', redirectUri);

  // Return mock access token
  return {
    apiKey: clientId,
    apiSecret: clientSecret,
    accessToken: 'mock_amazon_access_token',
    refreshToken: 'mock_amazon_refresh_token',
    expiresAt: Date.now() + 3600000, // 1 hour from now
    region: 'na',
    scopes: ['sellingpartnerapi:orders_read', 'sellingpartnerapi:orders_write'],
  };
};
