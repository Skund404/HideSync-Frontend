// src/services/integrations/ebayIntegration.ts
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
 * eBay API order response structure (simplified version)
 */
interface EbayOrder {
  orderId: string;
  legacyOrderId: string;
  creationDate: string;
  lastModifiedDate: string;
  orderFulfillmentStatus: string;
  orderPaymentStatus: string;
  sellerId: string;
  buyer: EbayBuyer;
  pricingSummary: EbayPricingSummary;
  fulfillmentStartInstructions: EbayFulfillmentStartInstructions[];
  lineItems: EbayLineItem[];
  salesRecordReference?: string;
  totalFeeBasisAmount?: EbayAmount;
  cancelStatus?: {
    cancelState: string;
    cancelRequests?: {
      cancelCompletedDate: string;
      cancelRequestedDate: string;
      cancelReason: string;
    }[];
  };
}

interface EbayBuyer {
  username: string;
  taxAddress?: EbayAddress;
  taxIdentifier?: {
    taxpayerId: string;
    taxIdentifierType: string;
    issuingCountry: string;
  };
}

interface EbayAddress {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  stateOrProvince?: string;
  postalCode: string;
  countryCode: string;
  phoneNumber?: string;
  fullName?: string;
  email?: string;
}

interface EbayPricingSummary {
  priceSubtotal: EbayAmount;
  deliveryCost: EbayAmount;
  tax: EbayAmount;
  total: EbayAmount;
}

interface EbayAmount {
  value: string;
  currency: string;
}

interface EbayFulfillmentStartInstructions {
  fulfillmentInstructionsType: string;
  shippingStep: {
    shippingCarrierCode?: string;
    shippingServiceCode?: string;
    shipTo: EbayAddress;
    shippingCost?: EbayAmount;
  };
  pickupStep?: {
    merchantLocationKey: string;
    pickupLocationName: string;
    pickupAddress: EbayAddress;
  };
}

interface EbayLineItem {
  lineItemId: string;
  legacyItemId: string;
  title: string;
  sku?: string;
  quantity: number;
  lineItemCost: EbayAmount;
  tax?: EbayAmount;
  deliveryCost?: EbayAmount;
  discountedLineItemCost?: EbayAmount;
  properties?: {
    name: string;
    value: string;
  }[];
  legacyVariationId?: string;
  fulfillmentStatus?: string;
}

/**
 * Convert eBay order to HideSync Sale
 */
const convertEbayOrderToSale = (ebayOrder: EbayOrder): Sale => {
  // Map eBay fulfillment status to HideSync fulfillment status
  const mapFulfillmentStatus = (status: string): FulfillmentStatus => {
    switch (status) {
      case 'FULFILLED':
        return FulfillmentStatus.SHIPPED;
      case 'IN_PROGRESS':
        return FulfillmentStatus.READY_TO_SHIP; // Using READY_TO_SHIP instead of PROCESSING
      case 'NOT_STARTED':
        return FulfillmentStatus.PENDING;
      default:
        return FulfillmentStatus.PENDING;
    }
  };

  // Map eBay payment status to HideSync payment status
  const mapPaymentStatus = (status: string): PaymentStatus => {
    switch (status) {
      case 'FULLY_PAID':
        return PaymentStatus.PAID;
      case 'PARTIALLY_PAID':
        return PaymentStatus.PARTIALLY_PAID;
      case 'NOT_PAID':
        return PaymentStatus.PENDING;
      case 'REFUNDED':
        return PaymentStatus.REFUNDED;
      default:
        return PaymentStatus.PENDING;
    }
  };

  // Map eBay order status to HideSync sale status
  const mapSaleStatus = (order: EbayOrder): SaleStatus => {
    if (order.cancelStatus && order.cancelStatus.cancelState === 'COMPLETE') {
      return SaleStatus.CANCELLED;
    }

    switch (order.orderFulfillmentStatus) {
      case 'FULFILLED':
        return SaleStatus.SHIPPED;
      case 'IN_PROGRESS':
        return SaleStatus.IN_PROGRESS;
      case 'NOT_STARTED':
        if (order.orderPaymentStatus === 'FULLY_PAID') {
          return SaleStatus.CONFIRMED;
        }
        return SaleStatus.INQUIRY; // Using INQUIRY instead of PENDING
      default:
        return SaleStatus.INQUIRY; // Using INQUIRY instead of PENDING
    }
  };

  // Get shipping address from order
  const getShippingAddress = (order: EbayOrder): Address | undefined => {
    // Find the shipping instruction if available
    const shippingInstruction = order.fulfillmentStartInstructions.find(
      (instruction) => instruction.fulfillmentInstructionsType === 'SHIP_TO'
    );

    if (!shippingInstruction || !shippingInstruction.shippingStep.shipTo) {
      return undefined;
    }

    const shipTo = shippingInstruction.shippingStep.shipTo;

    return {
      street: [shipTo.addressLine1, shipTo.addressLine2]
        .filter(Boolean)
        .join(', '),
      city: shipTo.city,
      state: shipTo.stateOrProvince || '',
      postalCode: shipTo.postalCode,
      country: shipTo.countryCode,
    };
  };

  // Get the shipping method from order
  const getShippingMethod = (order: EbayOrder): string | undefined => {
    const shippingInstruction = order.fulfillmentStartInstructions.find(
      (instruction) => instruction.fulfillmentInstructionsType === 'SHIP_TO'
    );

    if (!shippingInstruction) {
      return undefined;
    }

    const carrierCode = shippingInstruction.shippingStep.shippingCarrierCode;
    const serviceCode = shippingInstruction.shippingStep.shippingServiceCode;

    if (carrierCode && serviceCode) {
      return `${carrierCode} - ${serviceCode}`;
    } else if (carrierCode) {
      return carrierCode;
    } else if (serviceCode) {
      return serviceCode;
    }

    return undefined;
  };

  // Create customer object
  // eBay provides limited customer info in the order
  const customer: Customer = {
    id: 0, // This would be mapped to your internal customer ID in a real implementation
    name: getShippingName(ebayOrder) || ebayOrder.buyer.username,
    email: getShippingEmail(ebayOrder) || '',
    phone: getShippingPhone(ebayOrder) || '',
    status: CustomerStatus.ACTIVE,
    tier: CustomerTier.STANDARD,
    source: CustomerSource.MARKETPLACE,
  };

  // Helper functions to extract customer details
  function getShippingName(order: EbayOrder): string | undefined {
    const shippingInstruction = order.fulfillmentStartInstructions.find(
      (instruction) => instruction.fulfillmentInstructionsType === 'SHIP_TO'
    );
    return shippingInstruction?.shippingStep.shipTo.fullName;
  }

  function getShippingEmail(order: EbayOrder): string | undefined {
    const shippingInstruction = order.fulfillmentStartInstructions.find(
      (instruction) => instruction.fulfillmentInstructionsType === 'SHIP_TO'
    );
    return shippingInstruction?.shippingStep.shipTo.email;
  }

  function getShippingPhone(order: EbayOrder): string | undefined {
    const shippingInstruction = order.fulfillmentStartInstructions.find(
      (instruction) => instruction.fulfillmentInstructionsType === 'SHIP_TO'
    );
    return shippingInstruction?.shippingStep.shipTo.phoneNumber;
  }

  // Convert line items
  const items: SalesItem[] = ebayOrder.lineItems.map((item) => {
    // Combine item properties as notes if available
    const propertyNotes = item.properties
      ? item.properties.map((prop) => `${prop.name}: ${prop.value}`).join(', ')
      : undefined;

    return {
      id: parseInt(item.lineItemId),
      name: item.title,
      sku: item.sku || `EBAY-${item.legacyItemId}`,
      price: parseFloat(item.lineItemCost.value),
      quantity: item.quantity,
      type: 'PRODUCT',
      notes: propertyNotes,
    };
  });

  // Calculate totals
  const total = parseFloat(ebayOrder.pricingSummary.total.value);
  const shipping = parseFloat(ebayOrder.pricingSummary.deliveryCost.value);
  const taxes = parseFloat(ebayOrder.pricingSummary.tax.value);

  // eBay fees are typically around 10-12% (simplified for demo)
  const platformFees = ebayOrder.totalFeeBasisAmount
    ? parseFloat(ebayOrder.totalFeeBasisAmount.value)
    : Math.round(total * 0.1 * 100) / 100;

  // Store additional info in tags
  const tags = [];
  if (ebayOrder.salesRecordReference)
    tags.push(`srn:${ebayOrder.salesRecordReference}`);

  return {
    id: parseInt(ebayOrder.orderId.slice(-8), 16), // Generate a temporary ID
    customer,
    createdAt: ebayOrder.creationDate,
    status: mapSaleStatus(ebayOrder),
    paymentStatus: mapPaymentStatus(ebayOrder.orderPaymentStatus),
    fulfillmentStatus: mapFulfillmentStatus(ebayOrder.orderFulfillmentStatus),
    total,
    taxes,
    shipping,
    platformFees,
    netRevenue: total - platformFees,
    items,
    channel: SalesChannel.EBAY,
    marketplaceData: {
      externalOrderId: ebayOrder.legacyOrderId || ebayOrder.orderId,
      platform: SalesChannel.EBAY,
      orderUrl: `https://www.ebay.com/sh/ord/?orderid=${
        ebayOrder.legacyOrderId || ebayOrder.orderId
      }`,
      platformFees,
    },
    shippingAddress: getShippingAddress(ebayOrder),
    shippingMethod: getShippingMethod(ebayOrder),
    communications: [],
    tags,
  };
};

/**
 * Fetch orders from eBay
 * In a real implementation, this would make API calls to eBay API
 * For this demo, we're returning mock data
 */
export const fetchEbayOrders = async (
  config: PlatformAuthConfig,
  fromDate?: Date
): Promise<Sale[]> => {
  // In a real implementation, this would make API calls to eBay API
  console.log('Fetching eBay orders with config:', config);
  console.log('From date:', fromDate);

  // For now, return mock data
  const mockEbayOrders: EbayOrder[] = [
    {
      orderId: '12-12345-67890',
      legacyOrderId: '12345678901',
      creationDate: new Date().toISOString(),
      lastModifiedDate: new Date().toISOString(),
      orderFulfillmentStatus: 'NOT_STARTED',
      orderPaymentStatus: 'FULLY_PAID',
      sellerId: 'your_ebay_seller_id',
      buyer: {
        username: 'ebay_buyer123',
      },
      pricingSummary: {
        priceSubtotal: {
          value: '85.99',
          currency: 'USD',
        },
        deliveryCost: {
          value: '5.99',
          currency: 'USD',
        },
        tax: {
          value: '7.32',
          currency: 'USD',
        },
        total: {
          value: '99.30',
          currency: 'USD',
        },
      },
      fulfillmentStartInstructions: [
        {
          fulfillmentInstructionsType: 'SHIP_TO',
          shippingStep: {
            shippingCarrierCode: 'USPS',
            shippingServiceCode: 'Priority',
            shipTo: {
              fullName: 'Sarah Miller',
              email: 'sarah.miller@example.com',
              phoneNumber: '303-555-2468',
              addressLine1: '123 Cherry Street',
              addressLine2: 'Unit 456',
              city: 'Denver',
              stateOrProvince: 'CO',
              postalCode: '80202',
              countryCode: 'US',
            },
            shippingCost: {
              value: '5.99',
              currency: 'USD',
            },
          },
        },
      ],
      lineItems: [
        {
          lineItemId: '12345678',
          legacyItemId: '998877665544',
          title: 'Handmade Leather Card Holder - Minimalist Design',
          sku: 'LCH-005',
          quantity: 1,
          lineItemCost: {
            value: '34.99',
            currency: 'USD',
          },
          tax: {
            value: '2.98',
            currency: 'USD',
          },
          properties: [
            {
              name: 'Color',
              value: 'Chestnut',
            },
            {
              name: 'Monogram',
              value: 'SM',
            },
          ],
        },
        {
          lineItemId: '12345679',
          legacyItemId: '998877665545',
          title: 'Leather Key Fob with Custom Initials',
          sku: 'LKF-002',
          quantity: 2,
          lineItemCost: {
            value: '25.50',
            currency: 'USD',
          },
          tax: {
            value: '4.34',
            currency: 'USD',
          },
          properties: [
            {
              name: 'Color',
              value: 'Black',
            },
            {
              name: 'Monogram',
              value: 'SM',
            },
          ],
        },
      ],
      totalFeeBasisAmount: {
        value: '9.93',
        currency: 'USD',
      },
      salesRecordReference: 'SRN-12345',
    },
    {
      orderId: '12-23456-78901',
      legacyOrderId: '23456789012',
      creationDate: new Date(Date.now() - 864000000).toISOString(), // 10 days ago
      lastModifiedDate: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
      orderFulfillmentStatus: 'FULFILLED',
      orderPaymentStatus: 'FULLY_PAID',
      sellerId: 'your_ebay_seller_id',
      buyer: {
        username: 'leatherfan_2022',
      },
      pricingSummary: {
        priceSubtotal: {
          value: '129.99',
          currency: 'USD',
        },
        deliveryCost: {
          value: '8.50',
          currency: 'USD',
        },
        tax: {
          value: '11.05',
          currency: 'USD',
        },
        total: {
          value: '149.54',
          currency: 'USD',
        },
      },
      fulfillmentStartInstructions: [
        {
          fulfillmentInstructionsType: 'SHIP_TO',
          shippingStep: {
            shippingCarrierCode: 'FedEx',
            shippingServiceCode: 'Ground',
            shipTo: {
              fullName: 'David Johnson',
              addressLine1: '456 Main Street',
              city: 'Austin',
              stateOrProvince: 'TX',
              postalCode: '78701',
              countryCode: 'US',
              phoneNumber: '512-555-7890',
            },
            shippingCost: {
              value: '8.50',
              currency: 'USD',
            },
          },
        },
      ],
      lineItems: [
        {
          lineItemId: '23456789',
          legacyItemId: '112233445566',
          title: 'Handmade Leather Journal with Refillable Pages',
          sku: 'LJ-003',
          quantity: 1,
          lineItemCost: {
            value: '129.99',
            currency: 'USD',
          },
          tax: {
            value: '11.05',
            currency: 'USD',
          },
          fulfillmentStatus: 'FULFILLED',
        },
      ],
      totalFeeBasisAmount: {
        value: '14.95',
        currency: 'USD',
      },
      salesRecordReference: 'SRN-23456',
    },
  ];

  // Convert eBay orders to HideSync Sales
  return mockEbayOrders.map(convertEbayOrderToSale);
};

/**
 * Update fulfillment status in eBay
 * In a real implementation, this would make API calls to eBay API
 * For this demo, we just log the information
 */
export const updateEbayFulfillment = async (
  orderId: string,
  trackingNumber: string,
  shippingProvider: string,
  config: PlatformAuthConfig
): Promise<boolean> => {
  // In a real implementation, this would make API calls to eBay API
  console.log('Updating eBay fulfillment for order:', orderId);
  console.log('Tracking number:', trackingNumber);
  console.log('Shipping provider:', shippingProvider);
  console.log('Config:', config);

  // Simulate success
  return true;
};

/**
 * Generate authorization URL for eBay OAuth flow
 */
export const getEbayAuthUrl = (
  clientId: string,
  redirectUri: string,
  scopes: string[]
): string => {
  const scopesParam = scopes.join('%20');
  return `https://auth.ebay.com/oauth2/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=${scopesParam}`;
};

/**
 * Exchange authorization code for eBay access token (OAuth flow)
 * In a real implementation, this would make API calls to eBay
 * For this demo, we just return a mock token
 */
export const exchangeEbayAuthCode = async (
  clientId: string,
  clientSecret: string,
  code: string,
  redirectUri: string
): Promise<PlatformAuthConfig> => {
  // In a real implementation, this would make API calls to eBay
  console.log('Exchanging auth code for eBay access token');
  console.log('Client ID:', clientId);
  console.log('Code:', code);
  console.log('Redirect URI:', redirectUri);

  // Return mock access token
  return {
    apiKey: clientId,
    apiSecret: clientSecret,
    accessToken: 'mock_ebay_access_token',
    refreshToken: 'mock_ebay_refresh_token',
    expiresAt: Date.now() + 7200000, // 2 hours from now
    scopes: [
      'https://api.ebay.com/oauth/api_scope/sell.fulfillment',
      'https://api.ebay.com/oauth/api_scope/sell.inventory',
    ],
  };
};
