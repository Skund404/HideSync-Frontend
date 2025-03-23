// src/types/models.ts - Inventory related types

import {
  HardwareFinish,
  HardwareMaterial as HardwareMaterialType,
  HardwareType,
  InventoryAdjustmentType,
  InventoryStatus,
  LeatherFinish,
  LeatherType,
  MaterialType,
  MeasurementUnit,
  ProjectType,
  QualityGrade,
  StorageLocationType,
  ToolCategory,
  ToolType,
  TransactionType,
} from './enums';

// Inventory Entity from ER Diagram
export interface Inventory {
  id: number;
  itemType: 'material' | 'product' | 'tool';
  itemId: number;
  quantity: number;
  status: InventoryStatus;
  storageLocation: string;
}

// Product Entity from ER Diagram
export interface Product {
  id: number;
  name: string;
  productType: ProjectType;
  sku: string;
  description: string;
  materials: string[];
  color: string;
  dimensions: string;
  weight: number;
  patternId: number;
  patternName?: string;
  status: InventoryStatus;
  quantity: number;
  reorderPoint: number;
  storageLocation: string;
  dateAdded: string;
  lastUpdated: string;
  thumbnail: string;
  costBreakdown: {
    materials: number;
    labor: number;
    overhead: number;
  };
  totalCost: number;
  sellingPrice: number;
  profitMargin: number;
  lastSold: string | null;
  salesVelocity: number;
  projectId: number | null;
  batchNumber: string | null;
  customizations: string[];
  notes: string;
}

// Basic Material interface
export interface Material {
  id: number;
  name: string;
  materialType: MaterialType;
  status: InventoryStatus;
  quantity: number;
  unit: MeasurementUnit;
  quality: QualityGrade;
  supplierId: number;
  supplier: string;
  sku: string;
  description: string;
  reorderPoint: number;
  supplierSku: string;
  cost: number;
  price: number;
  lastPurchased: string;
  storageLocation: string;
  notes: string;
  thumbnail: string;
}

// Specialized material types
export interface LeatherMaterial extends Material {
  leatherType: LeatherType;
  tannage: string;
  animalSource: string;
  thickness: number;
  area: number;
  isFullHide: boolean;
  color: string;
  finish: LeatherFinish;
  grade: string;
}

export interface HardwareMaterial extends Material {
  hardwareType: HardwareType;
  hardwareMaterial: HardwareMaterialType; // Using renamed import
  finish: HardwareFinish;
  size: string;
  color: string;
}

export interface SuppliesMaterial extends Material {
  suppliesMaterialType: string; // Could be expanded to a proper enum
  color: string;
  threadThickness: string;
  materialComposition: string;
  volume: number;
  length: number;
  dryingTime: string;
  applicationMethod: string;
  finish: string;
}

// Tool Entity
export interface Tool {
  id: number;
  name: string;
  description: string;
  category: ToolCategory;
  type: ToolType;
  brand: string;
  model: string;
  serialNumber: string;
  purchasePrice: number;
  purchaseDate: string;
  specifications: string;
  status: string; // Using string because ToolStatus is not in the enum list anymore
  location: string;
  image: string;
  lastMaintenance: string;
  nextMaintenance: string;
  maintenanceInterval: number;
  supplier: string;
  supplierId: number;
  checkedOutTo: string | null;
  checkedOutDate: string | null;
  dueDate: string | null;
}

// Storage Entities
export interface StorageLocation {
  id: string;
  name: string;
  type: StorageLocationType;
  section: string; // Section is now a string, corresponds to StorageSection enum
  description: string;
  dimensions: { width: number; height: number; depth: number };
  capacity: number;
  utilized: number;
  status: string; // Status is now a string
  lastModified: string;
  notes: string;
  parentStorage: string | null;
}

export interface StorageCell {
  storageId: string;
  position: { row: number; col: number };
  itemId: number | null;
  itemType: string | null;
  occupied: boolean;
  notes: string;
}

export interface StorageAssignment {
  id: string;
  materialId: number;
  materialType: string;
  storageId: string;
  position: { row: number; col: number } | null;
  quantity: number;
  assignedDate: string;
  assignedBy: string;
  notes: string;
}

// Filter interfaces
export interface InventoryFilters {
  searchQuery: string;
  productType: string;
  status: string;
  storageLocation: string;
  dateRange: {
    from: string;
    to: string;
  };
  priceRange: {
    min: string;
    max: string;
  };
}

// Inventory transaction for tracking item movements
export interface InventoryTransaction {
  id: number;
  date: string;
  type: TransactionType;
  adjustmentType?: InventoryAdjustmentType;
  itemType: 'material' | 'product' | 'tool';
  itemId: number;
  itemName: string;
  quantity: number;
  previousQuantity?: number;
  newQuantity: number;
  unit: MeasurementUnit;
  location: string;
  projectId?: number;
  projectName?: string;
  supplierId?: number;
  supplierName?: string;
  fromLocation?: string;
  toLocation?: string;
  performedBy: string;
  notes?: string;
}
