// src/types/allExports.ts
/**
 * This file consolidates and re-exports all types from multiple modules
 * for easier importing across the application.
 */

import {
  HardwareMaterial,
  HardwareSubtype,
  isHardwareMaterial,
  isLeatherMaterial,
  isSuppliesMaterial,
  LeatherMaterial,
  LeatherSubtype,
  Material,
  MaterialCreatePayload,
  MaterialQuality,
  MaterialStatus,
  MaterialType,
  MeasurementUnit,
  SuppliesMaterial,
} from './materialTypes';

import {
  SectionType as StorageSectionType,
  StorageLocation,
  StorageLocationType,
  StorageUtilization,
} from './storage';

import {
  Component,
  ComponentMaterial,
  PatternFileType,
  PatternFilters,
} from './patternTypes';

import { ProjectFilter } from './projectTypes';

import { ProjectTemplate, TemplateCategory } from './projectTemplate';

import {
  DayOfWeek,
  RecurrenceFrequency,
  RecurringProject,
} from './recurringProject';

import { Tool, ToolCategory, ToolStatus } from './toolType';

import {
  ComponentType,
  CustomerStatus,
  CustomerTier,
  InventoryStatus,
  PaymentStatus,
  PickingListStatus,
  ProjectStatus,
  ProjectType,
  SaleStatus,
  ToolListStatus,
} from './enums';

import {
  PickingList,
  PickingListFilters,
  PickingListItem,
  PickingListItemStatus,
} from './pickingListTypes';

import {
  PurchaseOrder,
  PurchaseOrderFilters,
  PurchaseOrderItem,
} from './purchaseTypes';

import { Supplier, SupplierFilters } from './supplierTypes';

import { Customer, Sale, SalesFilters, SalesItem } from './salesTypes';

// Material Types
export { MaterialType };
export { MaterialStatus };
export { LeatherSubtype };
export { HardwareSubtype };
export { isLeatherMaterial };
export { isHardwareMaterial };
export { isSuppliesMaterial };
export type { Material };
export type { LeatherMaterial };
export type { HardwareMaterial };
export type { SuppliesMaterial };
export type { MaterialQuality };
export type { MaterialCreatePayload };
export { MeasurementUnit };
// Storage Types
export type { StorageLocation };
export type { StorageUtilization };
export { StorageLocationType };
export { StorageSectionType };
// Pattern Types
export type { Component };
export { PatternFileType };
export type { PatternFilters };
export type { ComponentMaterial };
export { ComponentType };
// Project Types
export { ProjectStatus };
export { ProjectType };
export type { ProjectFilter };
export type { ProjectTemplate };
export { TemplateCategory };
export type { RecurringProject };
export { RecurrenceFrequency };
export { DayOfWeek };
// Tool Types
export type { Tool };
export { ToolCategory };
export { ToolStatus };
export { ToolListStatus };
// Status Enums
export { SaleStatus };
export { PaymentStatus };
export { CustomerStatus };
export { CustomerTier };
export { InventoryStatus };
export { PickingListStatus };
export { PickingListItemStatus };
// Picking List Types
export type { PickingList };
export type { PickingListItem };
export type { PickingListFilters };
// Purchase Types
export type { PurchaseOrder };
export type { PurchaseOrderItem };
export type { PurchaseOrderFilters };
// Supplier Types
export type { Supplier };
export type { SupplierFilters };
// Sales Types
export type { SalesItem };
export type { SalesFilters };
export type { Sale };
export type { Customer };

// Additional utility types
export interface ApiResponse<T = any> {
  data: T;
  status: string;
  message?: string;
  pagination?: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface ApiError {
  status: number;
  message: string;
  details?: any;
}

// Type for component props that include a refresh callback
export interface RefreshableProps {
  onRefresh?: () => void;
}

// Common filter interfaces
export interface DateRangeFilter {
  startDate?: string;
  endDate?: string;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface CommonFilters extends PaginationParams, DateRangeFilter {
  search?: string;
  status?: string;
}

// Tagged template types
export interface TemplateTag {
  id: string;
  name: string;
  color: string;
}

// Template material type
export interface TemplateMaterial {
  id: string | number;
  materialId: string | number;
  templateId: string | number;
  name: string;
  materialType: MaterialType;
  quantity: number;
  unit: MeasurementUnit;
  notes?: string;
  isRequired: boolean;
  // Note: alternatives property missing from interface
  // If needed, add: alternatives?: TemplateMaterialAlternative[];
}

// Type for material alternatives (if implemented)
export interface TemplateMaterialAlternative {
  id: string | number;
  templateMaterialId: string | number;
  materialId: string | number;
  name: string;
  materialType: MaterialType;
  priority: number;
}

// Type for form elements that can have validation errors
export interface FormValidation {
  isValid: boolean;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
}

// Type for select options
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
}
