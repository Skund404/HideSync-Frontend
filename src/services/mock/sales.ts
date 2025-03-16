// src/services/mock/sales.ts
import {
  CommunicationChannel,
  CommunicationType,
  CustomerSource,
  CustomerStatus,
  CustomerTier,
  PaymentStatus,
  SaleStatus,
} from '../../types/enums';
import {
  Customer,
  FulfillmentStatus,
  MarketplaceData,
  Sale,
  SalesChannel,
  SalesFilters,
} from '../../types/salesTypes';

// Sample customers
const customers: Customer[] = [
  {
    id: 101,
    name: 'Michael Reynolds',
    email: 'michael.r@example.com',
    phone: '555-123-4567',
    status: CustomerStatus.ACTIVE,
    tier: CustomerTier.STANDARD,
    source: CustomerSource.ONLINE_STORE,
  },
  {
    id: 102,
    name: 'Craft & Co.',
    email: 'orders@craftco.com',
    phone: '555-234-5678',
    status: CustomerStatus.WHOLESALE,
    tier: CustomerTier.WHOLESALE_PREMIUM,
    source: CustomerSource.DIRECT,
  },
  {
    id: 103,
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    phone: '555-345-6789',
    status: CustomerStatus.ACTIVE,
    tier: CustomerTier.PREMIUM,
    source: CustomerSource.REFERRAL,
  },
];

// Sample marketplace data
const marketplaceData: Record<string, MarketplaceData> = {
  shopify1: {
    externalOrderId: 'SHOP-10042',
    platform: SalesChannel.SHOPIFY,
    orderUrl: 'https://admin.shopify.com/orders/10042',
    platformFees: 15.75,
  },
  etsy1: {
    externalOrderId: 'ETSY-58201',
    platform: SalesChannel.ETSY,
    orderUrl: 'https://www.etsy.com/your-shop/orders/58201',
    platformFees: 12.5,
  },
};

// Sample active sales data
export const salesData: Sale[] = [
  {
    id: 1024,
    customer: customers[0],
    createdAt: '2025-03-10T14:30:00',
    dueDate: '2025-03-23T00:00:00',
    status: SaleStatus.IN_PRODUCTION,
    paymentStatus: PaymentStatus.DEPOSIT_PAID,
    fulfillmentStatus: FulfillmentStatus.IN_PRODUCTION,
    total: 349.99,
    depositAmount: 175.0,
    balanceDue: 174.99,
    items: [
      {
        id: 1,
        name: 'Custom Messenger Bag',
        type: 'CUSTOM',
        price: 349.99,
        quantity: 1,
        projectId: 1,
        patternId: 1,
        notes:
          'Custom messenger bag with laptop pocket and additional zipper compartment',
      },
    ],
    channel: SalesChannel.DIRECT,
    pickingList: {
      id: 201,
      status: 'COMPLETED',
      createdAt: '2025-03-11T09:15:00',
    },
    communications: [
      {
        id: 301,
        date: '2025-03-10T14:35:00',
        type: CommunicationType.ORDER_CONFIRMATION,
        channel: CommunicationChannel.EMAIL,
        content: 'Order confirmation sent with deposit request',
      },
      {
        id: 302,
        date: '2025-03-11T10:20:00',
        type: CommunicationType.STATUS_UPDATE,
        channel: CommunicationChannel.EMAIL,
        content: 'Deposit payment received, production scheduled',
      },
    ],
    shippingAddress: {
      street: '123 Main St',
      city: 'Portland',
      state: 'OR',
      postalCode: '97201',
      country: 'USA',
    },
    shippingMethod: 'Standard Shipping',
    notes: 'Customer prefers amber-colored hardware',
    customization: 'Monogram initials MR on the front flap',
  },
  {
    id: 1025,
    customer: customers[1],
    createdAt: '2025-03-08T10:15:00',
    dueDate: '2025-03-25T00:00:00',
    status: SaleStatus.CUTTING,
    paymentStatus: PaymentStatus.PAYMENT_PLAN,
    fulfillmentStatus: FulfillmentStatus.IN_PRODUCTION,
    total: 1350.0,
    depositAmount: 675.0,
    balanceDue: 675.0,
    items: [
      {
        id: 2,
        name: 'Minimalist Wallet Collection - Wholesale Pack',
        type: 'PRODUCTION',
        price: 1350.0,
        quantity: 10,
        projectId: 2,
        patternId: 2,
        notes: 'Assorted colors: 2 black, 2 brown, 2 tan, 2 burgundy, 2 navy',
      },
    ],
    channel: SalesChannel.WHOLESALE,
    pickingList: {
      id: 202,
      status: 'IN_PROGRESS',
      createdAt: '2025-03-09T08:30:00',
    },
    communications: [
      {
        id: 303,
        date: '2025-03-08T10:20:00',
        type: CommunicationType.ORDER_CONFIRMATION,
        channel: CommunicationChannel.EMAIL,
        content: 'Wholesale order confirmation with terms',
      },
      {
        id: 304,
        date: '2025-03-09T09:15:00',
        type: CommunicationType.STATUS_UPDATE,
        channel: CommunicationChannel.EMAIL,
        content: 'Production update - materials sourced',
      },
    ],
    shippingAddress: {
      street: '456 Commerce Ave',
      city: 'Seattle',
      state: 'WA',
      postalCode: '98101',
      country: 'USA',
    },
    shippingMethod: 'Commercial Freight',
    notes: '30-day payment terms per agreement',
    customization: 'Branded with Craft & Co. logo inside',
  },
  {
    id: 1026,
    customer: customers[2],
    createdAt: '2025-03-12T16:45:00',
    dueDate: '2025-03-26T00:00:00',
    status: SaleStatus.CONFIRMED,
    paymentStatus: PaymentStatus.DEPOSIT_PAID,
    fulfillmentStatus: FulfillmentStatus.PENDING,
    total: 189.95,
    depositAmount: 94.98,
    balanceDue: 94.97,
    items: [
      {
        id: 3,
        name: 'Passport Holder with Card Slots',
        type: 'PRODUCTION',
        sku: 'PH-102',
        price: 89.95,
        quantity: 1,
      },
      {
        id: 4,
        name: 'Leather Luggage Tag',
        type: 'PRODUCTION',
        sku: 'LT-205',
        price: 50.0,
        quantity: 2,
      },
    ],
    channel: SalesChannel.SHOPIFY,
    marketplaceData: marketplaceData.shopify1,
    communications: [
      {
        id: 305,
        date: '2025-03-12T16:50:00',
        type: CommunicationType.ORDER_CONFIRMATION,
        channel: CommunicationChannel.EMAIL,
        content: 'Order confirmation sent automatically',
      },
    ],
    shippingAddress: {
      street: '789 Park Lane',
      city: 'Denver',
      state: 'CO',
      postalCode: '80202',
      country: 'USA',
    },
    shippingMethod: 'Express Shipping',
    notes: 'Customer requested gift wrapping',
  },
  {
    id: 1027,
    customer: {
      id: 104,
      name: 'Maria Garcia',
      email: 'maria.g@example.com',
      phone: '555-456-7890',
      status: CustomerStatus.FIRST_PURCHASE,
      tier: CustomerTier.NEW,
      source: CustomerSource.MARKETPLACE,
    },
    createdAt: '2025-03-13T09:20:00',
    status: SaleStatus.CONFIRMED,
    paymentStatus: PaymentStatus.PAID,
    fulfillmentStatus: FulfillmentStatus.PENDING,
    total: 145.0,
    taxes: 8.7,
    shipping: 12.5,
    platformFees: 15.25,
    netRevenue: 129.75,
    items: [
      {
        id: 5,
        name: 'Personalized Leather Journal Cover',
        type: 'CUSTOM',
        price: 125.0,
        quantity: 1,
        notes: 'A5 size, dark brown with initials MG',
      },
      {
        id: 6,
        name: 'Leather Bookmark',
        type: 'PRODUCTION',
        sku: 'BM-101',
        price: 20.0,
        quantity: 1,
      },
    ],
    channel: SalesChannel.ETSY,
    marketplaceData: marketplaceData.etsy1,
    communications: [
      {
        id: 306,
        date: '2025-03-13T09:25:00',
        type: CommunicationType.ORDER_CONFIRMATION,
        channel: CommunicationChannel.EMAIL,
        content: 'Order confirmation from Etsy',
      },
    ],
    shippingAddress: {
      street: '1010 Maple Avenue',
      city: 'Austin',
      state: 'TX',
      postalCode: '78701',
      country: 'USA',
    },
    shippingMethod: 'Standard Shipping',
    customization: "Embossed initials 'MG' on journal cover",
  },
];

// Sample completed sales data
export const completedSalesData: Sale[] = [
  {
    id: 1020,
    customer: customers[0],
    createdAt: '2025-02-15T11:30:00',
    dueDate: '2025-02-28T00:00:00',
    completedDate: '2025-02-26T14:20:00',
    status: SaleStatus.COMPLETED,
    paymentStatus: PaymentStatus.PAID,
    fulfillmentStatus: FulfillmentStatus.DELIVERED,
    total: 265.0,
    items: [
      {
        id: 7,
        name: 'Classic Bifold Wallet',
        type: 'PRODUCTION',
        sku: 'BW-101',
        price: 85.0,
        quantity: 1,
      },
      {
        id: 8,
        name: 'Key Fob Set',
        type: 'PRODUCTION',
        sku: 'KF-202',
        price: 45.0,
        quantity: 4,
      },
    ],
    channel: SalesChannel.DIRECT,
    pickingList: {
      id: 198,
      status: 'COMPLETED',
      createdAt: '2025-02-16T09:00:00',
    },
    communications: [
      {
        id: 295,
        date: '2025-02-15T11:35:00',
        type: CommunicationType.ORDER_CONFIRMATION,
        channel: CommunicationChannel.EMAIL,
        content: 'Order confirmation sent',
      },
      {
        id: 296,
        date: '2025-02-26T14:25:00',
        type: CommunicationType.DELIVERY_CONFIRMATION,
        channel: CommunicationChannel.EMAIL,
        content: 'Delivery confirmation sent',
      },
    ],
    shippingAddress: {
      street: '123 Main St',
      city: 'Portland',
      state: 'OR',
      postalCode: '97201',
      country: 'USA',
    },
    shippingMethod: 'Standard Shipping',
    shippingProvider: 'USPS',
    trackingNumber: '9400123456789012345678',
  },
  {
    id: 1021,
    customer: {
      id: 105,
      name: 'James Wilson',
      email: 'james.w@example.com',
      phone: '555-567-8901',
      status: CustomerStatus.RETURNING,
      tier: CustomerTier.STANDARD,
      source: CustomerSource.WEBSITE,
    },
    createdAt: '2025-02-20T13:45:00',
    dueDate: '2025-03-05T00:00:00',
    completedDate: '2025-03-03T16:10:00',
    status: SaleStatus.COMPLETED,
    paymentStatus: PaymentStatus.PAID,
    fulfillmentStatus: FulfillmentStatus.DELIVERED,
    total: 425.0,
    taxes: 25.5,
    shipping: 15.0,
    platformFees: 42.5,
    netRevenue: 382.5,
    items: [
      {
        id: 9,
        name: 'Leather Laptop Sleeve',
        type: 'PRODUCTION',
        sku: 'LS-301',
        price: 175.0,
        quantity: 1,
      },
      {
        id: 10,
        name: 'Leather Cable Organizer Set',
        type: 'PRODUCTION',
        sku: 'CO-105',
        price: 45.0,
        quantity: 1,
      },
      {
        id: 11,
        name: 'Leather Mouse Pad',
        type: 'PRODUCTION',
        sku: 'MP-201',
        price: 60.0,
        quantity: 1,
      },
    ],
    channel: SalesChannel.SHOPIFY,
    marketplaceData: {
      externalOrderId: 'SHOP-10035',
      platform: SalesChannel.SHOPIFY,
      orderUrl: 'https://admin.shopify.com/orders/10035',
      platformFees: 42.5,
    },
    communications: [
      {
        id: 297,
        date: '2025-02-20T13:50:00',
        type: CommunicationType.ORDER_CONFIRMATION,
        channel: CommunicationChannel.EMAIL,
        content: 'Order confirmation sent',
      },
      {
        id: 298,
        date: '2025-03-03T16:15:00',
        type: CommunicationType.DELIVERY_CONFIRMATION,
        channel: CommunicationChannel.EMAIL,
        content: 'Delivery confirmation sent',
      },
      {
        id: 299,
        date: '2025-03-05T10:30:00',
        type: CommunicationType.FEEDBACK_REQUEST,
        channel: CommunicationChannel.EMAIL,
        content: 'Feedback request sent',
      },
    ],
    shippingAddress: {
      street: '567 Oak Street',
      city: 'Chicago',
      state: 'IL',
      postalCode: '60601',
      country: 'USA',
    },
    shippingMethod: 'Express Shipping',
    shippingProvider: 'FedEx',
    trackingNumber: '794583927465',
  },
];

// Helper functions for sales data
export const getSaleById = (id: number): Sale | undefined => {
  return [...salesData, ...completedSalesData].find((sale) => sale.id === id);
};

export const filterSales = (
  filters: SalesFilters,
  salesList: Sale[]
): Sale[] => {
  return salesList.filter((sale) => {
    // Filter by status
    if (filters.status && sale.status !== filters.status) {
      return false;
    }

    // Filter by fulfillment status
    if (
      filters.fulfillmentStatus &&
      sale.fulfillmentStatus !== filters.fulfillmentStatus
    ) {
      return false;
    }

    // Filter by payment status
    if (filters.paymentStatus && sale.paymentStatus !== filters.paymentStatus) {
      return false;
    }

    // Filter by customer ID
    if (
      filters.customerId &&
      sale.customer.id.toString() !== filters.customerId
    ) {
      return false;
    }

    // Filter by channel
    if (filters.channel && sale.channel !== filters.channel) {
      return false;
    }

    // Filter by date range
    if (filters.dateFrom || filters.dateTo) {
      const createdAt = new Date(sale.createdAt);

      if (filters.dateFrom && createdAt < filters.dateFrom) {
        return false;
      }

      if (filters.dateTo) {
        const dateTo = new Date(filters.dateTo);
        dateTo.setHours(23, 59, 59, 999); // Set to end of day
        if (createdAt > dateTo) {
          return false;
        }
      }
    }

    // Filter by search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const matchesId = sale.id.toString().includes(query);
      const matchesCustomer = sale.customer.name.toLowerCase().includes(query);
      const matchesItems = sale.items.some(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          (item.sku && item.sku.toLowerCase().includes(query))
      );

      if (!matchesId && !matchesCustomer && !matchesItems) {
        return false;
      }
    }

    return true;
  });
};

export const getSalesSummary = () => {
  const allSales = [...salesData, ...completedSalesData];

  return {
    totalSales: allSales.length,
    activeSales: salesData.length,
    completedSales: completedSalesData.length,
    totalRevenue: allSales.reduce((sum, sale) => sum + sale.total, 0),
    averageOrderValue:
      allSales.length > 0
        ? allSales.reduce((sum, sale) => sum + sale.total, 0) / allSales.length
        : 0,
  };
};

export const getChannelMetrics = () => {
  const allSales = [...salesData, ...completedSalesData];

  // Create an object with all possible channels initialized to zero values
  const metrics: Record<
    SalesChannel,
    { count: number; revenue: number; fees: number }
  > = Object.values(SalesChannel).reduce((acc, channel) => {
    acc[channel] = { count: 0, revenue: 0, fees: 0 };
    return acc;
  }, {} as Record<SalesChannel, { count: number; revenue: number; fees: number }>);

  // Populate with actual data
  allSales.forEach((sale) => {
    metrics[sale.channel].count += 1;
    metrics[sale.channel].revenue += sale.total;
    metrics[sale.channel].fees += sale.platformFees || 0;
  });

  return metrics;
};
