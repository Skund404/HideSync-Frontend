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
 * Shopify API order response structure (simplified version)
 */
interface ShopifyOrder {
  id: number;
  name: string;
  order_number: number;
  created_at: string;
  processed_at: string;
  updated_at: string;
  closed_at: string | null;
  cancelled_at: string | null;
  financial_status: string;
  fulfillment_status: string | null;
  gateway: string;
  line_items: ShopifyLineItem[];
  customer: ShopifyCustomer;
  shipping_address: ShopifyAddress;
  billing_address: ShopifyAddress;
  shipping_lines: ShopifyShippingLine[];
  tags: string;
  note: string | null;
  total_price: string;
  subtotal_price: string;
  total_tax: string;
  total_discounts: string;
  total_shipping_price_set: {
    shop_money: {
      amount: string;
    };
  };
  current_total_price: string;
}

interface ShopifyLineItem {
  id: number;
  title: string;
  price: string;
  quantity: number;
  sku: string;
  variant_id: number;
  product_id: number;
  properties: { name: string; value: string }[];
}

interface ShopifyCustomer {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  default_address: ShopifyAddress;
}

interface ShopifyAddress {
  address1: string;
  address2: string | null;
  city: string;
  province: string;
  province_code: string;
  country: string;
  country_code: string;
  zip: string;
  name: string;
  phone: string | null;
}

interface ShopifyShippingLine {
  code: string;
  price: string;
  title: string;
}

/**
 * Convert Shopify order to HideSync Sale
 */
const convertShopifyOrderToSale = (shopifyOrder: ShopifyOrder): Sale => {
  // Map Shopify financial status to HideSync payment status
  const mapPaymentStatus = (status: string): PaymentStatus => {
    switch (status) {
      case 'paid':
        return PaymentStatus.PAID;
      case 'partially_paid':
        return PaymentStatus.PARTIALLY_PAID;
      case 'pending':
        return PaymentStatus.PENDING;
      case 'refunded':
        return PaymentStatus.REFUNDED;
      case 'partially_refunded':
        return PaymentStatus.PARTIALLY_REFUNDED;
      case 'voided':
        return PaymentStatus.CANCELLED;
      default:
        return PaymentStatus.PENDING;
    }
  };

  // Map Shopify fulfillment status to HideSync fulfillment status
  const mapFulfillmentStatus = (status: string | null): FulfillmentStatus => {
    switch (status) {
      case 'fulfilled':
        return FulfillmentStatus.SHIPPED;
      case 'partial':
        return FulfillmentStatus.READY_TO_SHIP; // Use an existing status that makes sense
      case null:
        return FulfillmentStatus.PENDING;
      default:
        return FulfillmentStatus.PENDING;
    }
  };

  // Convert Shopify address to HideSync address
  const convertAddress = (
    shopifyAddress: ShopifyAddress | null
  ): Address | undefined => {
    if (!shopifyAddress) return undefined;

    return {
      street: [shopifyAddress.address1, shopifyAddress.address2]
        .filter(Boolean)
        .join(', '),
      city: shopifyAddress.city,
      state: shopifyAddress.province,
      postalCode: shopifyAddress.zip,
      country: shopifyAddress.country,
    };
  };

  // Convert line items
  const items: SalesItem[] = shopifyOrder.line_items.map((item) => ({
    id: item.id,
    name: item.title,
    sku: item.sku,
    price: parseFloat(item.price),
    quantity: item.quantity,
    type: 'PRODUCT', // Assume standard product type from Shopify
    notes: item.properties
      ? item.properties.map((prop) => `${prop.name}: ${prop.value}`).join(', ')
      : undefined,
  }));

  // Create customer object
  const customer: Customer = {
    id: shopifyOrder.customer.id,
    name: `${shopifyOrder.customer.first_name} ${shopifyOrder.customer.last_name}`.trim(),
    email: shopifyOrder.customer.email,
    phone: shopifyOrder.customer.phone || '',
    status: CustomerStatus.ACTIVE,
    tier: CustomerTier.STANDARD, // Default tier for marketplace customers
    source: CustomerSource.ONLINE_STORE,
  };

  // Calculate main values
  const total = parseFloat(shopifyOrder.total_price);
  const shipping = shopifyOrder.total_shipping_price_set
    ? parseFloat(shopifyOrder.total_shipping_price_set.shop_money.amount)
    : 0;
  const taxes = parseFloat(shopifyOrder.total_tax);
  const platformFees = 0; // Shopify doesn't provide fee information in the order API

  return {
    id: shopifyOrder.id,
    customer,
    createdAt: shopifyOrder.created_at,
    status: shopifyOrder.cancelled_at
      ? SaleStatus.CANCELLED
      : SaleStatus.IN_PROGRESS,
    paymentStatus: mapPaymentStatus(shopifyOrder.financial_status),
    fulfillmentStatus: mapFulfillmentStatus(shopifyOrder.fulfillment_status),
    total,
    taxes,
    shipping,
    platformFees,
    netRevenue: total - platformFees,
    items,
    channel: SalesChannel.SHOPIFY,
    marketplaceData: {
      externalOrderId: shopifyOrder.order_number.toString(),
      platform: SalesChannel.SHOPIFY,
      orderUrl: `https://${shopifyOrder.gateway}/admin/orders/${shopifyOrder.id}`,
    },
    shippingAddress: convertAddress(shopifyOrder.shipping_address),
    ...(shopifyOrder.billing_address && {
      billingAddress: convertAddress(shopifyOrder.billing_address),
    }),
    shippingMethod:
      shopifyOrder.shipping_lines.length > 0
        ? shopifyOrder.shipping_lines[0].title
        : undefined,
    notes: shopifyOrder.note || undefined,
    communications: [], // Shopify doesn't provide communication history in the order API
    tags: shopifyOrder.tags ? shopifyOrder.tags.split(',') : [],
  } as Sale;
};

/**
 * Fetch orders from Shopify
 * In a real implementation, this would make API calls to Shopify
 * For this demo, we're returning mock data
 */
export const fetchShopifyOrders = async (
  config: PlatformAuthConfig,
  fromDate?: Date
): Promise<Sale[]> => {
  // In a real implementation, this would make API calls to Shopify
  console.log('Fetching Shopify orders with config:', config);
  console.log('From date:', fromDate);

  // For now, return mock data
  const mockShopifyOrders: ShopifyOrder[] = [
    {
      id: 1001,
      name: '#1001',
      order_number: 1001,
      created_at: new Date().toISOString(),
      processed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      closed_at: null,
      cancelled_at: null,
      financial_status: 'paid',
      fulfillment_status: null,
      gateway: config.shopName || 'your-shop',
      line_items: [
        {
          id: 2001,
          title: 'Classic Leather Wallet',
          price: '79.99',
          quantity: 1,
          sku: 'LW-001',
          variant_id: 3001,
          product_id: 4001,
          properties: [
            { name: 'Color', value: 'Brown' },
            { name: 'Personalization', value: 'JD' },
          ],
        },
        {
          id: 2002,
          title: 'Leather Card Holder',
          price: '39.99',
          quantity: 1,
          sku: 'LCH-002',
          variant_id: 3002,
          product_id: 4002,
          properties: [],
        },
      ],
      customer: {
        id: 5001,
        email: 'john.doe@example.com',
        first_name: 'John',
        last_name: 'Doe',
        phone: '+1234567890',
        default_address: {
          address1: '123 Main St',
          address2: 'Apt 4B',
          city: 'New York',
          province: 'NY',
          province_code: 'NY',
          country: 'United States',
          country_code: 'US',
          zip: '10001',
          name: 'John Doe',
          phone: '+1234567890',
        },
      },
      shipping_address: {
        address1: '123 Main St',
        address2: 'Apt 4B',
        city: 'New York',
        province: 'NY',
        province_code: 'NY',
        country: 'United States',
        country_code: 'US',
        zip: '10001',
        name: 'John Doe',
        phone: '+1234567890',
      },
      billing_address: {
        address1: '123 Main St',
        address2: 'Apt 4B',
        city: 'New York',
        province: 'NY',
        province_code: 'NY',
        country: 'United States',
        country_code: 'US',
        zip: '10001',
        name: 'John Doe',
        phone: '+1234567890',
      },
      shipping_lines: [
        {
          code: 'Standard',
          price: '5.00',
          title: 'Standard Shipping',
        },
      ],
      tags: 'new,leather,wallet',
      note: 'Please gift wrap the items.',
      total_price: '124.98',
      subtotal_price: '119.98',
      total_tax: '10.00',
      total_discounts: '0.00',
      total_shipping_price_set: {
        shop_money: {
          amount: '5.00',
        },
      },
      current_total_price: '124.98',
    },
    {
      id: 1002,
      name: '#1002',
      order_number: 1002,
      created_at: new Date().toISOString(),
      processed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      closed_at: null,
      cancelled_at: null,
      financial_status: 'paid',
      fulfillment_status: 'fulfilled',
      gateway: config.shopName || 'your-shop',
      line_items: [
        {
          id: 2003,
          title: 'Leather Belt',
          price: '59.99',
          quantity: 1,
          sku: 'LB-003',
          variant_id: 3003,
          product_id: 4003,
          properties: [
            { name: 'Size', value: '34' },
            { name: 'Color', value: 'Black' },
          ],
        },
      ],
      customer: {
        id: 5002,
        email: 'jane.smith@example.com',
        first_name: 'Jane',
        last_name: 'Smith',
        phone: null,
        default_address: {
          address1: '456 Park Ave',
          address2: null,
          city: 'Boston',
          province: 'MA',
          province_code: 'MA',
          country: 'United States',
          country_code: 'US',
          zip: '02108',
          name: 'Jane Smith',
          phone: null,
        },
      },
      shipping_address: {
        address1: '456 Park Ave',
        address2: null,
        city: 'Boston',
        province: 'MA',
        province_code: 'MA',
        country: 'United States',
        country_code: 'US',
        zip: '02108',
        name: 'Jane Smith',
        phone: null,
      },
      billing_address: {
        address1: '456 Park Ave',
        address2: null,
        city: 'Boston',
        province: 'MA',
        province_code: 'MA',
        country: 'United States',
        country_code: 'US',
        zip: '02108',
        name: 'Jane Smith',
        phone: null,
      },
      shipping_lines: [
        {
          code: 'Express',
          price: '12.00',
          title: 'Express Shipping',
        },
      ],
      tags: 'leather,belt',
      note: null,
      total_price: '71.99',
      subtotal_price: '59.99',
      total_tax: '5.00',
      total_discounts: '0.00',
      total_shipping_price_set: {
        shop_money: {
          amount: '12.00',
        },
      },
      current_total_price: '71.99',
    },
  ];

  // Convert Shopify orders to HideSync Sales
  return mockShopifyOrders.map(convertShopifyOrderToSale);
};

/**
 * Update fulfillment status in Shopify
 * In a real implementation, this would make API calls to Shopify
 * For this demo, we just log the information
 */
export const updateShopifyFulfillment = async (
  orderId: string,
  trackingNumber: string,
  shippingProvider: string,
  config: PlatformAuthConfig
): Promise<boolean> => {
  // In a real implementation, this would make API calls to Shopify
  console.log('Updating Shopify fulfillment for order:', orderId);
  console.log('Tracking number:', trackingNumber);
  console.log('Shipping provider:', shippingProvider);
  console.log('Config:', config);

  // Simulate success
  return true;
};

/**
 * Generate authorization URL for Shopify OAuth flow
 */
export const getShopifyAuthUrl = (
  shopName: string,
  apiKey: string,
  redirectUri: string,
  scopes: string[]
): string => {
  const scopesParam = scopes.join(',');
  return `https://${shopName}.myshopify.com/admin/oauth/authorize?client_id=${apiKey}&scope=${scopesParam}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}`;
};

/**
 * Exchange authorization code for access token (OAuth flow)
 * In a real implementation, this would make API calls to Shopify
 * For this demo, we just return a mock token
 */
export const exchangeShopifyAuthCode = async (
  shopName: string,
  apiKey: string,
  apiSecret: string,
  code: string
): Promise<PlatformAuthConfig> => {
  // In a real implementation, this would make API calls to Shopify
  console.log('Exchanging auth code for Shopify access token');
  console.log('Shop:', shopName);
  console.log('API Key:', apiKey);
  console.log('Code:', code);

  // Return mock access token
  return {
    shopName,
    apiKey,
    apiSecret,
    accessToken: 'mock_shopify_access_token',
    scopes: ['read_orders', 'write_orders'],
  };
};
