// Import all types at the top of the file
import * as DocumentationTypes from './documentationTypes';
import * as EnumTypes from './enums';
import * as MaterialTypes from './materialTypes';
import * as PatternTypes from './patternTypes';
import * as PickingListTypes from './pickinglist';
import * as ProjectTemplateTypes from './projectTemplate';
import * as PurchaseTypes from './purchaseTypes';
import * as RecurringProjectTypes from './recurringProject';
import * as SupplierTypes from './supplierTypes';
import * as ToolTypes from './toolType';

// Export additional sidebar types
export type { NavItem, NavSection } from '../components/layout/Sidebar';
// Export documentation types
export {
  DocumentationCategory,
  ResourceType,
  SkillLevel,
} from './documentationTypes';
export type {
  CategoryDefinition,
  DocumentationResource,
  DocumentationSearchQuery,
  DocumentationSearchResult,
  DocumentationTag,
  VideoResource,
  WorkflowGuide,
  WorkflowStep,
} from './documentationTypes';
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
export { PickingListStatus } from './pickinglist';
export type {
  PickingList,
  PickingListFilters,
  PickingListItem,
} from './pickinglist';
// Export project template types
export type { ProjectTemplate } from './projectTemplate';
// Export project timeline specific types
export { ProjectStatus } from './projectTimeline';
export type {
  Project as ProjectTimelineProject,
  ProjectTimelineProps,
  TimelineTask,
} from './projectTimeline';
// Export purchase order types
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
// Export supplier types
export type { Supplier, SupplierFilters } from './supplierTypes';
// Export namespaces
export {
  EnumTypes,
  MaterialTypes,
  ToolTypes,
  PatternTypes,
  PickingListTypes,
  ProjectTemplateTypes,
  RecurringProjectTypes,
  SupplierTypes,
  PurchaseTypes,
  DocumentationTypes,
};
