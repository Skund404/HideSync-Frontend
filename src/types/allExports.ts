// src/types/allExports.ts

// Gather all imports at the top of the file
import {
  CommunicationChannel,
  CommunicationType,
  ComponentType,
  CustomerSource,
  CustomerStatus,
  CustomerTier,
  EdgeFinishType,
  HardwareFinish,
  HardwareMaterial as HardwareMaterialEnum,
  HardwareType,
  InventoryAdjustmentType,
  InventoryStatus,
  LeatherFinish,
  LeatherType,
  MaterialQualityGrade,
  MaterialType,
  MeasurementUnit,
  PaymentStatus,
  PickingListStatus,
  ProjectStatus,
  ProjectType,
  PurchaseStatus,
  QualityGrade,
  SaleStatus,
  SkillLevel,
  StorageLocationType,
  SupplierStatus,
  ToolCategory,
  ToolListStatus,
  ToolType,
  TransactionType,
} from './enums';

// Utility functions for enums
export function getEnumValues<T extends Record<string, string>>(
  enumObj: T
): Array<string> {
  return Object.values(enumObj);
}

export function isValidEnumValue<T extends Record<string, string>>(
  enumObj: T,
  value: string
): value is T[keyof T] {
  return Object.values(enumObj).includes(value as T[keyof T]);
}

// Enum Exports - available at runtime
export {
  SaleStatus,
  PaymentStatus,
  PurchaseStatus,

  // Customer-related
  CustomerStatus,
  CustomerTier,
  CustomerSource,

  // Inventory and Material Management
  InventoryStatus,
  MaterialType,
  MaterialQualityGrade,
  HardwareType,
  HardwareMaterialEnum,
  HardwareFinish,
  LeatherType,
  LeatherFinish,

  // Project Management
  ProjectType,
  ProjectStatus,
  SkillLevel,
  ComponentType,

  // Tools and Crafting
  ToolCategory,
  ToolType,
  EdgeFinishType,

  // Transactions and Inventory
  TransactionType,
  InventoryAdjustmentType,
  SupplierStatus,
  StorageLocationType,
  MeasurementUnit,
  QualityGrade,
  PickingListStatus,
  ToolListStatus,

  // Communication
  CommunicationChannel,
  CommunicationType,
};

// Types and Interfaces (to be defined based on your specific requirements)
export interface Material {
  type: MaterialType;
  quality: MaterialQualityGrade;
  // Add other relevant properties
}

export interface LeatherMaterial extends Material {
  leatherType: LeatherType;
  finish: LeatherFinish;
  // Add leather-specific properties
}

export interface HardwareMaterial extends Material {
  hardwareType: HardwareType;
  materialType: HardwareMaterialEnum; // Fixed to use the enum rather than self-reference
  finish: HardwareFinish;
  // Add hardware-specific properties
}

export interface SuppliesMaterial extends Material {
  // Add supplies-specific properties
}

// Storage-related types (placeholders - modify as needed)
export interface StorageLocation {
  id: string;
  type: StorageLocationType;
  // Add other relevant properties
}

export interface StorageCell {
  location: StorageLocation;
  // Add other relevant properties
}

export interface StorageAssignment {
  material: Material;
  location: StorageLocation;
  // Add other relevant properties
}

export interface StorageMove {
  from: StorageLocation;
  to: StorageLocation;
  material: Material;
  // Add other relevant properties
}

export interface StorageUtilization {
  location: StorageLocation;
  occupiedSpace: number;
  totalSpace: number;
  // Add other relevant properties
}

export interface ItemStorageHistory {
  material: Material;
  locations: StorageLocation[];
  // Add other relevant properties
}

// Placeholder interfaces for core business models
export interface Project {
  id: string;
  type: ProjectType;
  status: ProjectStatus;
  // Add other relevant properties
}

export interface Purchase {
  id: string;
  status: PurchaseStatus;
  // Add other relevant properties
}

export interface Sale {
  id: string;
  status: SaleStatus;
  // Add other relevant properties
}
