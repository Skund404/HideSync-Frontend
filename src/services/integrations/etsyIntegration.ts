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
 * Etsy API response structures (simplified version)
 */
interface EtsyOrder {
  receipt_id: number;
  order_id: number;
  shop_id: number;
  buyer_user_id: number;
  creation_tsz: number;
  last_modified_tsz: number;
  name: string;
  first_line: string;
  second_line: string;
  city: string;
  state: string;
  zip: string;
  country_id: number;
  payment_method: string;
  payment_email: string;
  message_from_buyer: string;
  was_paid: boolean;
  was_shipped: boolean;
  transactions: EtsyTransaction[];
  buyer: EtsyBuyer;
  total_price: {
    amount: number;
    currency_code: string;
  };
  total_shipping_cost: {
    amount: number;
    currency_code: string;
  };
  total_tax_cost: {
    amount: number;
    currency_code: string;
  };
  status: 'open' | 'paid' | 'completed' | 'canceled';
}

interface EtsyTransaction {
  transaction_id: number;
  title: string;
  description: string;
  seller_user_id: number;
  buyer_user_id: number;
  creation_tsz: number;
  price: {
    amount: number;
    currency_code: string;
  };
  quantity: number;
  shipping_cost: {
    amount: number;
    currency_code: string;
  };
  variations: Array<{
    property_id: number;
    value_id: number;
    formatted_name: string;
    formatted_value: string;
  }>;
  sku: string;
  listing_id: number;
}

interface EtsyBuyer {
  user_id: number;
  login_name: string;
  first_name: string;
  last_name: string;
  email: string;
}

/**
 * Convert Etsy order to HideSync Sale
 */
const convertEtsyOrderToSale = (etsyOrder: EtsyOrder): Sale => {
  // Map Etsy order status to HideSync payment status
  const mapPaymentStatus = (
    status: string,
    wasPaid: boolean
  ): PaymentStatus => {
    if (!wasPaid) return PaymentStatus.PENDING;

    switch (status) {
      case 'open':
        return PaymentStatus.PENDING;
      case 'paid':
        return PaymentStatus.PAID;
      case 'completed':
        return PaymentStatus.PAID;
      case 'canceled':
        return PaymentStatus.CANCELLED;
      default:
        return PaymentStatus.PENDING;
    }
  };

  // Map Etsy shipping status to HideSync fulfillment status
  const mapFulfillmentStatus = (
    status: string,
    wasShipped: boolean
  ): FulfillmentStatus => {
    if (status === 'canceled') return FulfillmentStatus.CANCELLED;
    if (!wasShipped) return FulfillmentStatus.PENDING;
    if (status === 'completed') return FulfillmentStatus.DELIVERED;
    return FulfillmentStatus.SHIPPED;
  };

  // Map Etsy status to Sale status
  const mapSaleStatus = (status: string): SaleStatus => {
    if (status === 'canceled') return SaleStatus.CANCELLED;
    // You might need to adjust these mappings based on your specific SaleStatus enum values
    return SaleStatus.CONFIRMED; // Or another appropriate default
  };

  // Create address from Etsy order
  const shippingAddress: Address = {
    street: [etsyOrder.first_line, etsyOrder.second_line]
      .filter(Boolean)
      .join(', '),
    city: etsyOrder.city,
    state: etsyOrder.state,
    postalCode: etsyOrder.zip,
    country: etsyOrder.country_id.toString(), // In a real implementation, this would be mapped to country name
  };

  // Convert transactions to sales items
  const items: SalesItem[] = etsyOrder.transactions.map((transaction) => {
    // Format variations as notes
    const variationNotes = transaction.variations
      .map((v) => `${v.formatted_name}: ${v.formatted_value}`)
      .join(', ');

    return {
      id: transaction.transaction_id,
      name: transaction.title,
      sku: transaction.sku || `ETSY-${transaction.listing_id}`,
      price: transaction.price.amount,
      quantity: transaction.quantity,
      type: 'PRODUCT',
      notes: variationNotes || undefined,
    };
  });

  // Create customer object
  const customer: Customer = {
    id: etsyOrder.buyer_user_id,
    name: `${etsyOrder.buyer.first_name} ${etsyOrder.buyer.last_name}`.trim(),
    email: etsyOrder.buyer.email,
    phone: '', // Etsy doesn't provide phone numbers in the API
    status: CustomerStatus.ACTIVE,
    tier: CustomerTier.STANDARD, // Default tier for marketplace customers
    source: CustomerSource.MARKETPLACE,
  };

  // Calculate total and fees
  // Etsy takes approximately 6.5% of the total sale as fees (simplified)
  const total = etsyOrder.total_price.amount;
  const shipping = etsyOrder.total_shipping_cost.amount;
  const taxes = etsyOrder.total_tax_cost.amount;
  const platformFees = Math.round(total * 0.065 * 100) / 100; // Round to 2 decimal places

  return {
    id: etsyOrder.receipt_id,
    customer,
    createdAt: new Date(etsyOrder.creation_tsz * 1000).toISOString(),
    status: mapSaleStatus(etsyOrder.status),
    paymentStatus: mapPaymentStatus(etsyOrder.status, etsyOrder.was_paid),
    fulfillmentStatus: mapFulfillmentStatus(
      etsyOrder.status,
      etsyOrder.was_shipped
    ),
    total,
    taxes,
    shipping,
    platformFees,
    netRevenue: total - platformFees,
    items,
    channel: SalesChannel.ETSY,
    marketplaceData: {
      externalOrderId: etsyOrder.receipt_id.toString(),
      platform: SalesChannel.ETSY,
      orderUrl: `https://www.etsy.com/your/orders/${etsyOrder.receipt_id}`,
      platformFees,
    },
    shippingAddress,
    notes: etsyOrder.message_from_buyer || undefined,
    communications: [], // Etsy doesn't provide communication history in the order API
  };
};

/**
 * Fetch orders from Etsy
 * In a real implementation, this would make API calls to Etsy
 * For this demo, we're returning mock data
 */
export const fetchEtsyOrders = async (
  config: PlatformAuthConfig,
  fromDate?: Date
): Promise<Sale[]> => {
  // In a real implementation, this would make API calls to Etsy
  console.log('Fetching Etsy orders with config:', config);
  console.log('From date:', fromDate);

  // For now, return mock data
  const mockEtsyOrders: EtsyOrder[] = [
    {
      receipt_id: 2001,
      order_id: 3001,
      shop_id: 12345,
      buyer_user_id: 67890,
      creation_tsz: Math.floor(Date.now() / 1000) - 86400, // Yesterday
      last_modified_tsz: Math.floor(Date.now() / 1000),
      name: 'Emma Johnson',
      first_line: '789 Oak Street',
      second_line: 'Unit 12',
      city: 'San Francisco',
      state: 'CA',
      zip: '94102',
      country_id: 209, // USA
      payment_method: 'cc',
      payment_email: 'emma.johnson@example.com',
      message_from_buyer:
        'This is a gift, please add a gift note saying "Happy Birthday Lisa!"',
      was_paid: true,
      was_shipped: false,
      transactions: [
        {
          transaction_id: 4001,
          title: 'Handcrafted Leather Journal',
          description: 'Beautiful genuine leather journal with handmade paper',
          seller_user_id: 12345,
          buyer_user_id: 67890,
          creation_tsz: Math.floor(Date.now() / 1000) - 86400,
          price: {
            amount: 65.0,
            currency_code: 'USD',
          },
          quantity: 1,
          shipping_cost: {
            amount: 8.5,
            currency_code: 'USD',
          },
          variations: [
            {
              property_id: 1,
              value_id: 2,
              formatted_name: 'Color',
              formatted_value: 'Dark Brown',
            },
            {
              property_id: 3,
              value_id: 4,
              formatted_name: 'Personalization',
              formatted_value: 'Lisa',
            },
          ],
          sku: 'LJ-001',
          listing_id: 5001,
        },
      ],
      buyer: {
        user_id: 67890,
        login_name: 'emmaj',
        first_name: 'Emma',
        last_name: 'Johnson',
        email: 'emma.johnson@example.com',
      },
      total_price: {
        amount: 65.0,
        currency_code: 'USD',
      },
      total_shipping_cost: {
        amount: 8.5,
        currency_code: 'USD',
      },
      total_tax_cost: {
        amount: 5.85,
        currency_code: 'USD',
      },
      status: 'paid',
    },
    {
      receipt_id: 2002,
      order_id: 3002,
      shop_id: 12345,
      buyer_user_id: 67891,
      creation_tsz: Math.floor(Date.now() / 1000) - 604800, // A week ago
      last_modified_tsz: Math.floor(Date.now() / 1000) - 432000, // 5 days ago
      name: 'Michael Smith',
      first_line: '123 Pine Avenue',
      second_line: '',
      city: 'Portland',
      state: 'OR',
      zip: '97201',
      country_id: 209, // USA
      payment_method: 'cc',
      payment_email: 'michael.smith@example.com',
      message_from_buyer: '',
      was_paid: true,
      was_shipped: true,
      transactions: [
        {
          transaction_id: 4002,
          title: 'Leather Key Fob',
          description: 'Handmade leather key fob with brass hardware',
          seller_user_id: 12345,
          buyer_user_id: 67891,
          creation_tsz: Math.floor(Date.now() / 1000) - 604800,
          price: {
            amount: 24.5,
            currency_code: 'USD',
          },
          quantity: 2,
          shipping_cost: {
            amount: 4.25,
            currency_code: 'USD',
          },
          variations: [
            {
              property_id: 1,
              value_id: 3,
              formatted_name: 'Color',
              formatted_value: 'Black',
            },
          ],
          sku: 'LKF-002',
          listing_id: 5002,
        },
        {
          transaction_id: 4003,
          title: 'Leather Card Holder',
          description: 'Slim card holder with two pockets',
          seller_user_id: 12345,
          buyer_user_id: 67891,
          creation_tsz: Math.floor(Date.now() / 1000) - 604800,
          price: {
            amount: 35.0,
            currency_code: 'USD',
          },
          quantity: 1,
          shipping_cost: {
            amount: 0, // Combined shipping
            currency_code: 'USD',
          },
          variations: [
            {
              property_id: 1,
              value_id: 3,
              formatted_name: 'Color',
              formatted_value: 'Black',
            },
          ],
          sku: 'LCH-003',
          listing_id: 5003,
        },
      ],
      buyer: {
        user_id: 67891,
        login_name: 'mikesmith',
        first_name: 'Michael',
        last_name: 'Smith',
        email: 'michael.smith@example.com',
      },
      total_price: {
        amount: 84.0, // 24.50*2 + 35.00
        currency_code: 'USD',
      },
      total_shipping_cost: {
        amount: 4.25,
        currency_code: 'USD',
      },
      total_tax_cost: {
        amount: 7.56,
        currency_code: 'USD',
      },
      status: 'completed',
    },
  ];

  // Convert Etsy orders to HideSync Sales
  return mockEtsyOrders.map(convertEtsyOrderToSale);
};

/**
 * Update fulfillment status in Etsy
 * In a real implementation, this would make API calls to Etsy
 * For this demo, we just log the information
 */
export const updateEtsyFulfillment = async (
  orderId: string,
  trackingNumber: string,
  shippingProvider: string,
  config: PlatformAuthConfig
): Promise<boolean> => {
  // In a real implementation, this would make API calls to Etsy
  console.log('Updating Etsy fulfillment for order:', orderId);
  console.log('Tracking number:', trackingNumber);
  console.log('Shipping provider:', shippingProvider);
  console.log('Config:', config);

  // Simulate success
  return true;
};

/**
 * Generate authorization URL for Etsy OAuth flow
 */
export const getEtsyAuthUrl = (
  apiKey: string,
  redirectUri: string,
  scopes: string[]
): string => {
  const scopesParam = scopes.join(' ');
  return `https://www.etsy.com/oauth/connect?response_type=code&client_id=${apiKey}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=${encodeURIComponent(scopesParam)}&state=etsy`;
};

/**
 * Exchange authorization code for access token (OAuth flow)
 * In a real implementation, this would make API calls to Etsy
 * For this demo, we just return a mock token
 */
export const exchangeEtsyAuthCode = async (
  apiKey: string,
  apiSecret: string,
  code: string,
  redirectUri: string
): Promise<PlatformAuthConfig> => {
  // In a real implementation, this would make API calls to Etsy
  console.log('Exchanging auth code for Etsy access token');
  console.log('API Key:', apiKey);
  console.log('Code:', code);
  console.log('Redirect URI:', redirectUri);

  // Return mock access token
  return {
    apiKey,
    apiSecret,
    accessToken: 'mock_etsy_access_token',
    refreshToken: 'mock_etsy_refresh_token',
    scopes: ['transactions_r', 'transactions_w'],
    expiresAt: Date.now() + 3600000, // 1 hour from now
  };
};
