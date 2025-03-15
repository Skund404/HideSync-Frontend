// src/types/index.ts
// Update your existing index.ts file to include all types

// Import all types at the top of the file
import * as EnumTypes from './enums';
import * as MaterialTypes from './materialTypes';
import * as PatternTypes from './patternTypes';
import * as ToolTypes from './toolType';
// Import new project management types
import * as PickingListTypes from './pickingList';
import * as ProjectTemplateTypes from './projectTemplate';
import * as RecurringProjectTypes from './recurringProject';
// Import supplier and purchase types
import * as PurchaseTypes from './purchaseTypes';
import * as SupplierTypes from './supplierTypes';

// Export enum types directly (not with export type) so they can be used as values
// Export non-conflicting model types
export type { Project, Purchase, Sale } from './models';
export { PatternFileType } from './patternTypes';
// Export pattern types
export type {
  Component,
  ComponentFilters,
  ComponentMaterial,
  Pattern,
  PatternFilters,
} from './patternTypes';
// Export picking list types
export { PickingListStatus } from './pickingList';
export type {
  PickingList,
  PickingListFilters,
  PickingListItem,
} from './pickingList';
// Export project template types - remove types that don't exist
export type { ProjectTemplate } from './projectTemplate';
// Export project timeline specific types
export { ProjectStatus } from './projectTimeline';
export type {
  Project as ProjectTimelineProject,
  ProjectTimelineProps,
  TimelineTask,
} from './projectTimeline';
export type {
  PurchaseOrder,
  PurchaseOrderFilters,
  PurchaseOrderItem,
} from './purchaseTypes';
// Export recurring project types
export { DayOfWeek, RecurrenceFrequency } from './recurringProject';
export type {
  GeneratedProject,
  RecurrencePattern,
  RecurringProject,
  RecurringProjectFilter,
} from './recurringProject';
// Export storage types
export { SectionType, StorageLocationType, StorageStatus } from './storage';
export type {
  ItemStorageHistory,
  StorageAssignment,
  StorageCell,
  StorageLocation,
  StorageMove,
  StorageUtilization,
} from './storage';
export type { Supplier, SupplierFilters } from './supplierTypes';
// Export all types with namespace
export { EnumTypes };
export { MaterialTypes };
export { ToolTypes };
export { PatternTypes };
// Export new namespaces
export { PickingListTypes };
export { ProjectTemplateTypes };
export { RecurringProjectTypes };
// Export supplier and purchase namespaces
export { SupplierTypes };
export { PurchaseTypes };
