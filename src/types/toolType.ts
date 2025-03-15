// src/types/toolTypes.ts
//
// This file contains type definitions for the Tool Management module of HideSync.
// It defines the data models for tools, tool maintenance records, and tool checkout records
// that align with the backend data model from the ER diagram.
//
// These types support the Tool Management UI components and context.

/**
 * Enum for tool categories/types
 */
export enum ToolCategory {
  CUTTING = 'CUTTING',
  WORK_HOLDING = 'WORK_HOLDING',
  STITCHING = 'STITCHING',
  EDGE_WORK = 'EDGE_WORK',
  MACHINE = 'MACHINE',
  OTHER = 'OTHER',
}

/**
 * Enum for tool status
 */
export enum ToolStatus {
  IN_STOCK = 'IN_STOCK',
  CHECKED_OUT = 'CHECKED_OUT',
  MAINTENANCE = 'MAINTENANCE',
  LOST = 'LOST',
  DAMAGED = 'DAMAGED',
}

/**
 * Enum for tool checkout status
 */
export enum ToolCheckoutStatus {
  CHECKED_OUT = 'Checked Out',
  RETURNED = 'Returned',
  RETURNED_WITH_ISSUES = 'Returned with Issues',
  OVERDUE = 'Overdue',
  LOST = 'Lost',
  DAMAGED = 'Damaged',
}

/**
 * Enum for maintenance status
 */
export enum MaintenanceStatus {
  SCHEDULED = 'Scheduled',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  WAITING_PARTS = 'Waiting for Parts',
}

/**
 * Interface for Tool entity
 */
export interface Tool {
  id: number;
  name: string;
  description: string;
  category: ToolCategory;
  brand: string;
  model: string;
  serialNumber: string;
  purchasePrice: number;
  purchaseDate: string;
  supplier?: string;
  supplierId?: number;
  specifications: string;
  status: ToolStatus;
  lastMaintenance: string;
  nextMaintenance: string;
  maintenanceInterval: number; // in days
  location: string;
  image?: string;

  // UI-specific properties (not in backend model)
  checkedOutTo?: string;
  checkedOutDate?: string;
  dueDate?: string;
  reportedLostDate?: string;
  reportedBy?: string;
  damageReport?: string;
  reportedDamagedDate?: string;
}

/**
 * Interface for ToolMaintenance entity
 */
export interface ToolMaintenance {
  id: number;
  toolId: number;
  toolName?: string; // For UI display
  maintenanceType: string;
  performedBy: string;
  date: string;
  cost: number;
  internalService: boolean;
  details: string;
  parts: string;
  conditionBefore: string;
  conditionAfter: string;
  status: MaintenanceStatus;
  nextDate?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface for ToolCheckout entity
 */
export interface ToolCheckout {
  id: number;
  toolId: number;
  toolName?: string; // For UI display
  checkedOutBy: string;
  checkedOutDate: string;
  dueDate: string;
  returnedDate?: string;
  projectId?: number;
  projectName?: string; // For UI display
  notes: string;
  status: ToolCheckoutStatus;
  conditionBefore: string;
  conditionAfter?: string;
  issueDescription?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface for Tool List entity, used for project planning
 */
export interface ToolList {
  id: number;
  projectId: number;
  projectName?: string; // For UI display
  status: string;
  createdAt: string;
  items: ToolListItem[];
}

/**
 * Interface for Tool List Item entity
 */
export interface ToolListItem {
  id: number;
  toolListId: number;
  toolId: number;
  toolName?: string; // For UI display
  quantity: number;
}
