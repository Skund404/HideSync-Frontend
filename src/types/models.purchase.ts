// src/types/models.purchase.ts
import { PaymentStatus, PurchaseStatus } from './enums';

/**
 * Represents a supplier entity.
 */
export interface Supplier {
  id: number;
  name: string;
  category?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  rating?: number;
  status?: string;
  notes?: string;
  materialCategories?: string[];
  logo?: string;
  lastOrderDate?: string;
  paymentTerms?: string;
  minOrderAmount?: string;
  leadTime?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Represents a purchase item entity.
 */
export interface PurchaseItem {
  id: number;
  purchaseId: number;
  itemId?: number;
  name: string;
  quantity: number;
  price: number;
  total?: number;
  itemType?: string;
  materialType?: string;
  unit?: string;
  notes?: string;
}

/**
 * Represents a purchase entity.
 */
export interface Purchase {
  id: number;
  supplier: string | Supplier | number;
  supplierId?: number;
  date: string;
  deliveryDate?: string;
  status: PurchaseStatus;
  total: number;
  paymentStatus?: PaymentStatus;
  notes?: string;
  invoice?: string;
  items: PurchaseItem[];
  createdAt?: string;
  updatedAt?: string;
}

// Re-export from models.ts to avoid import conflicts
// Using 'export type' for compatibility with isolatedModules flag
export type {
  HardwareMaterial as HardwareMaterialItem,
  Inventory,
  InventoryTransaction,
  LeatherMaterial,
  Material,
  Product,
  StorageAssignment,
  StorageCell,
  StorageLocation,
  SuppliesMaterial,
  Tool,
} from './models';
