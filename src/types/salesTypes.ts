// src/types/salesTypes.ts
import {
  CustomerSource,
  CustomerStatus,
  CustomerTier,
  PaymentStatus,
  SaleStatus,
} from './enums';

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

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: CustomerStatus;
  tier: CustomerTier;
  source: CustomerSource;
}

export interface SalesItem {
  id: number;
  name: string;
  type: string; // CUSTOM, PRODUCTION, etc.
  sku?: string;
  price: number;
  quantity: number;
  productId?: number;
  projectId?: number;
  patternId?: number;
  notes?: string;
}

export interface Communication {
  id: number;
  date: string;
  type: string;
  channel: string;
  content: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface PickingListSummary {
  id: number;
  status: string;
  createdAt: string;
}

export interface MarketplaceData {
  externalOrderId: string;
  platform: SalesChannel;
  orderUrl?: string;
  platformFees?: number;
}

export interface Sale {
  id: number;
  customer: Customer;
  createdAt: string;
  dueDate?: string;
  completedDate?: string;
  status: SaleStatus;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  total: number;
  taxes?: number;
  shipping?: number;
  platformFees?: number;
  netRevenue?: number;
  depositAmount?: number;
  balanceDue?: number;
  items: SalesItem[];
  channel: SalesChannel;
  marketplaceData?: MarketplaceData;
  pickingList?: PickingListSummary;
  communications: Communication[];
  shippingAddress?: Address;
  shippingMethod?: string;
  shippingProvider?: string;
  trackingNumber?: string;
  notes?: string;
  customization?: string;
  tags?: string[];
}

export interface SalesFilters {
  status?: string;
  fulfillmentStatus?: string;
  paymentStatus?: string;
  customerId?: string;
  channel?: SalesChannel;
  dateRange?: string;
  dateFrom?: Date;
  dateTo?: Date;
  searchQuery?: string;
}

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
