import {
  CustomerStatus,
  HardwareFinish,
  HardwareMaterial as HardwareMaterialEnum,
  HardwareType,
  InventoryStatus,
  LeatherFinish,
  LeatherType,
  MaterialQualityGrade,
  MaterialType,
  // TransactionType, // Removed unused import
  MeasurementUnit,
  PaymentStatus,
  ProjectStatus,
  ProjectType,
  PurchaseStatus,
  SaleStatus,
  SupplierStatus, // Added missing import
  ToolListStatus,
} from './enums';

export interface Material {
  id: number;
  name: string;
  materialType: MaterialType;
  description?: string;
  unit: MeasurementUnit;
  quantity: number;
  quality: MaterialQualityGrade;
  status: InventoryStatus;
  supplierId?: number; // FK to Supplier
  supplier?: string; // For display purposes
  reorderPoint?: number;
  sku?: string;
  imageUrl?: string;
  thumbnail?: string;
  supplierSku?: string;
  cost?: number;
  price?: number;
  lastPurchased?: string; // Date
  storageLocation?: string;
  notes?: string;
}

/**
 * Leather subtype of Material
 */
export interface LeatherMaterial extends Material {
  leatherType: LeatherType;
  thickness: number; // In ounces
  area?: number; // Square footage
  isFullHide: boolean;

  // Additional leather properties
  color?: string;
  finish?: LeatherFinish;
  origin?: string;
}

/**
 * Hardware subtype of Material
 */
export interface HardwareMaterial extends Material {
  hardwareType: HardwareType;
  hardwareMaterial: HardwareMaterialEnum;
  finish: HardwareFinish;
  size: string; // Dimensions or standard size
  color?: string;
  plating?: string;
}

/**
 * Supplies subtype of Material
 */
export interface SuppliesMaterial extends Material {
  suppliesMaterialType: MaterialType;
  color?: string;
  threadThickness?: string;
  materialComposition?: string;
  volume?: number; // For dyes, adhesives, etc.
  dryingTime?: string; // For adhesives
  applicationMethod?: string; // For adhesives, dyes
  length?: number; // For thread
  strength?: string; // For thread
  finish?: string; // For finishes
}

export interface Project {
  id: number;
  name: string;
  type: ProjectType;
  description?: string;
  customer: string;
  startDate: string;
  dueDate: string;
  status: ProjectStatus;
  completionPercentage: number;
  notes?: string;
}

export interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  status: CustomerStatus;
}

export interface Supplier {
  id: number;
  name: string;
  contactName?: string;
  email: string;
  phone?: string;
  website?: string;
  status: SupplierStatus;
}

export interface Inventory {
  id: number;
  itemType: MaterialType;
  itemId: number;
  itemName: string;
  quantity: number;
  storageLocation?: string;
  status: InventoryStatus;
}

export interface Sale {
  id: number;
  date: string;
  customer: Customer | number;
  totalAmount: number;
  status: SaleStatus;
  paymentStatus: PaymentStatus;
  items: SaleItem[];
}

export interface SaleItem {
  id: number;
  saleId: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
}

export interface Purchase {
  id: number;
  date: string;
  supplier: Supplier | number;
  totalAmount: number;
  status: PurchaseStatus;
  items: PurchaseItem[];
}

export interface PurchaseItem {
  id: number;
  purchaseId: number;
  itemId: number;
  itemType: MaterialType;
  itemName: string;
  quantity: number;
  price: number;
}

export interface Tool {
  id: number;
  name: string;
  type: string;
  description?: string;
  status: ToolListStatus;
  location?: string;
  lastMaintenance?: string;
  nextMaintenance?: string;
}

export interface DashboardSummary {
  activeProjects: number;
  pendingOrders: number;
  materialsToReorder: number;
  upcomingDeadlines: Project[];
  recentActivity: any[];
  materialStockSummary: {
    name: string;
    percentage: number;
    status: 'low' | 'medium' | 'good';
  }[];
}
