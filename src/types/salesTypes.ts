// src/types/salesTypes.ts
import {
  CustomerSource,
  CustomerStatus,
  CustomerTier,
  PaymentStatus,
  SaleStatus,
} from './enums';

/**
 * Sales channel enumeration.
 */
export enum SalesChannel {
  SHOPIFY = 'shopify',
  ETSY = 'etsy',
  AMAZON = 'amazon',
  EBAY = 'ebay',
  DIRECT = 'direct',
  WHOLESALE = 'wholesale',
  CUSTOM_ORDER = 'custom_order',
  OTHER = 'other',
}

/**
 * Fulfillment status enumeration.
 */
export enum FulfillmentStatus {
  PENDING = 'pending',
  PICKING = 'picking',
  IN_PRODUCTION = 'in_production',
  READY_TO_SHIP = 'ready_to_ship',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  RETURNED = 'returned',
  CANCELLED = 'cancelled',
}

/**
 * Represents a customer.
 * This interface matches the ER diagram definition.
 */
export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: CustomerStatus;
  tier: CustomerTier;
  source: CustomerSource;
  company_name?: string;
  address?: string;
  createdAt?: string;
  updatedAt?: string;
  notes?: string;
}

/**
 * Represents a line item in a sale.
 */
export interface SalesItem {
  id: number;
  name: string;
  type: string; // e.g., "CUSTOM", "PRODUCTION", etc.
  sku?: string;
  price: number;
  tax?: number;
  quantity: number;
  productId?: number;
  projectId?: number;
  patternId?: number;
  notes?: string;
}

/**
 * Represents a communication record associated with a sale.
 */
export interface Communication {
  id: number;
  date: string; // ISO date string
  type: string;
  channel: string;
  content: string;
}

/**
 * Represents a shipping address.
 */
export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

/**
 * Summary information about a picking list associated with a sale.
 */
export interface PickingListSummary {
  id: number;
  status: string;
  createdAt: string;
}

/**
 * Represents external marketplace data associated with a sale.
 */
export interface MarketplaceData {
  externalOrderId: string;
  platform: SalesChannel;
  orderUrl?: string;
  platformFees?: number;
}

/**
 * Represents a sale.
 * This interface is aligned with the ER diagram and includes:
 *  - subtotal, taxes, shipping, platformFees, totalAmount, netRevenue, depositAmount, and balanceDue.
 *  - A foreign key to the customer, as well as additional optional details.
 */
export interface Sale {
  id: number;
  customer: Customer;
  createdAt: string;
  dueDate?: string;
  completedDate?: string;
  subtotal: number;
  taxes: number;
  shipping: number;
  platformFees: number;
  totalAmount: number; // Matches ER diagram's total_amount
  netRevenue: number;
  depositAmount: number;
  balanceDue: number;
  status: SaleStatus;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  channel: SalesChannel;
  platformOrderId?: string;
  marketplaceData?: MarketplaceData;
  shippingMethod?: string;
  shippingProvider?: string;
  trackingNumber?: string;
  tags?: string[];
  notes?: string;
  customization?: string;
  items: SalesItem[];
  communications: Communication[];
  shippingAddress?: Address;
  billingAddress?: Address;

  // For backward compatibility with existing integration code
  // IMPORTANT: Use totalAmount for new code. This property exists
  // only to maintain compatibility with marketplace integrations.
  total?: number;
}

/**
 * Filters for searching or filtering sales.
 */
export interface SalesFilters {
  status?: SaleStatus | SaleStatus[];
  fulfillmentStatus?: FulfillmentStatus | FulfillmentStatus[];
  paymentStatus?: PaymentStatus | PaymentStatus[];
  customerId?: number;
  channel?: SalesChannel | SalesChannel[];
  dateFrom?: Date | string;
  dateTo?: Date | string;
  searchQuery?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  tags?: string[];
}

/**
 * Metrics displayed on the sales dashboard.
 */
export interface SalesDashboardMetrics {
  totalSales: number;
  pendingFulfillment: number;
  totalRevenue: number;
  averageOrderValue: number;
  salesByChannel: Record<SalesChannel, number>;
  revenueByChannel: Record<SalesChannel, number>;
  pendingByStatus: Record<string, number>;
  dailySales: Array<{ date: string; count: number; revenue: number }>;
}

/**
 * Helper functions for Sales objects
 */
export const SalesHelpers = {
  /**
   * Calculate total amount from subtotal, taxes, and shipping
   */
  calculateTotalAmount: (
    subtotal: number,
    taxes: number,
    shipping: number
  ): number => {
    return subtotal + taxes + shipping;
  },

  /**
   * Calculate net revenue from total amount and platform fees
   */
  calculateNetRevenue: (totalAmount: number, platformFees: number): number => {
    return totalAmount - platformFees;
  },

  /**
   * Calculate balance due from total amount and deposit amount
   */
  calculateBalanceDue: (totalAmount: number, depositAmount: number): number => {
    return totalAmount - depositAmount;
  },
};
