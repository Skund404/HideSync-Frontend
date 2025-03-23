// src/types/supplierTypes.ts
import { SupplierStatus } from './enums';

/**
 * Represents a supplier entity.
 *
 * This interface aligns with the ER diagram for Supplier:
 * ```
 * Supplier {
 *   int id PK
 *   string name
 *   string category "LEATHER/HARDWARE/SUPPLIES/MIXED"
 *   string contactName
 *   string email
 *   string phone
 *   string address
 *   string website
 *   int rating
 *   enum status "ACTIVE/PREFERRED/INACTIVE/etc."
 *   string notes
 *   string[] materialCategories
 *   string logo
 *   string lastOrderDate
 *   string paymentTerms
 *   string minOrderAmount
 *   string leadTime
 *   datetime createdAt
 *   datetime updatedAt
 * }
 * ```
 */
export interface Supplier {
  id: number;
  name: string;
  category: string; // "LEATHER/HARDWARE/SUPPLIES/MIXED"
  contactName: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  rating: number; // 1-5 rating
  status: SupplierStatus;  // Now lowercase values like 'active', 'preferred' 
  notes?: string;
  materialCategories: string[];
  logo: string;
  lastOrderDate?: string;
  paymentTerms: string;
  minOrderAmount: string;
  leadTime: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Represents the criteria for filtering supplier records.
 * All properties are optional for flexible filtering.
 */
export interface SupplierFilters {
  category?: string;
  status?: SupplierStatus | string;
  rating?: number | string; // Support both number and string for form inputs
  searchQuery?: string;
}

/**
 * Represents a purchase from a supplier.
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
export interface Purchase {
  id: string;
  supplier: string;
  supplierId: number;
  date: string;
  deliveryDate: string;
  status: string; // "PLANNING/ORDERED/RECEIVED/etc."
  total: number;
  paymentStatus: string;
  notes?: string;
  invoice?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Represents an item in a purchase.
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
export interface PurchaseItem {
  id: number;
  purchase_id: number;
  name: string;
  quantity: number;
  price: number;
  total: number;
  itemType: string;
  materialType: string;
  unit: string;
  notes?: string;
}