// src/types/purchaseTypes.ts
import { PaymentStatus, PurchaseStatus } from './enums';

/**
 * Represents a purchase order item.
 * This aligns with the ER diagram for the PurchaseItem entity.
 * ```
 * PurchaseItem {
 *   int id PK
 *   int purchase_id FK
 *   string name
 *   int quantity
 *   float price
 *   float total
 *   string itemType
 *   string materialType
 *   string unit
 *   string notes
 * }
 * ```
 */
export interface PurchaseOrderItem {
  id: number;
  purchase_id?: number; // Foreign key to purchase order (may be omitted when creating new items)
  name: string;
  quantity: number;
  price: number;
  total: number;
  itemType?: string;
  materialType?: string;
  unit?: string;
  notes?: string;
}

/**
 * Represents a purchase order.
 * This aligns with the ER diagram for the Purchase entity.
 * ```
 * Purchase {
 *   string id PK
 *   string supplier FK
 *   int supplierId FK
 *   string date
 *   string deliveryDate
 *   enum status "PLANNING/ORDERED/RECEIVED/etc."
 *   float total
 *   enum paymentStatus
 *   string notes
 *   string invoice
 *   datetime createdAt
 *   datetime updatedAt
 * }
 * ```
 */
export interface PurchaseOrder {
  id: string;
  supplier: string;
  supplierId: number;
  date: string;
  deliveryDate: string;
  status: PurchaseStatus; // Using the same enum as in models to ensure compatibility
  total: number;
  paymentStatus: PaymentStatus;
  items: PurchaseOrderItem[];
  notes?: string;
  invoice?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Represents a date range filter.
 */
export interface DateRange {
  start?: string;
  end?: string;
}

/**
 * Represents filters for purchase orders.
 */
export interface PurchaseOrderFilters {
  supplier?: string;
  status?: string;
  dateRange: DateRange;
  searchQuery?: string;
}

/**
 * Represents a purchase timeline item.
 */
export interface PurchaseTimelineItem {
  id: string;
  supplier: string;
  deliveryDate: string;
  status: string;
  items: Array<{
    name: string;
    quantity: number;
  }>;
  total: number;
}
