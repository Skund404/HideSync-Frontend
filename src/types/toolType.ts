// src/types/toolTypes.ts
//
// This file contains type definitions for the Tool Management module of HideSync.
// It defines the data models for tools, tool maintenance records, tool checkout records,
// and tool lists that align with the backend data model from the ER diagram.

// -------------------------------------------------
// Enums
// -------------------------------------------------

/**
 * Enum for tool categories/types.
 * (Values based on the ER diagram: e.g., CUTTING, PUNCHING, STITCHING, etc.)
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
 * Enum for tool status.
 * (ER diagram defines statuses such as IN_STOCK, CHECKED_OUT, MAINTENANCE, etc.)
 */
export enum ToolStatus {
  IN_STOCK = 'IN_STOCK',
  CHECKED_OUT = 'CHECKED_OUT',
  MAINTENANCE = 'MAINTENANCE',
  LOST = 'LOST',
  DAMAGED = 'DAMAGED',
}

/**
 * Enum for tool checkout status.
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
 * Enum for maintenance status.
 */
export enum MaintenanceStatus {
  SCHEDULED = 'Scheduled',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  WAITING_PARTS = 'Waiting for Parts',
}

// -------------------------------------------------
// Interfaces
// -------------------------------------------------

/**
 * Interface for Tool entity.
 *
 * This model follows the ER diagram for Tool, which includes:
 *   - id, name, description, category, brand, model, serialNumber, purchasePrice,
 *     purchaseDate, specifications, status, location, image, lastMaintenance,
 *     nextMaintenance, maintenanceInterval, supplier, supplierId, checkedOutTo,
 *     checkedOutDate, and dueDate.
 *
 * UI-specific properties are included at the end for client-side use.
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
  supplier: string;
  supplierId?: number;
  specifications: string;
  status: ToolStatus;
  location: string;
  image?: string;
  lastMaintenance: string;
  nextMaintenance: string;
  maintenanceInterval: number;
  // Fields below are part of the ER diagram:
  checkedOutTo: string;
  checkedOutDate: string;
  dueDate: string;

  // UI Extensions for additional client-side data (not in backend model, but needed for UI)
  reportedBy?: string;
  damageReport?: string;
  reportedDamagedDate?: string;
  reportedLostDate?: string;
}

/**
 * Interface for ToolMaintenance entity.
 *
 * This model follows the ER diagram:
 *  - id, toolId, toolName, maintenanceType, date, performedBy, cost, internalService,
 *    details, parts, conditionBefore, conditionAfter, status, nextDate, createdAt, updatedAt.
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
 * Interface for ToolCheckout entity.
 *
 * According to the ER diagram this includes:
 *  - id, toolId, toolName, checkedOutBy, checkedOutDate, dueDate, returnedDate,
 *    projectId, projectName, notes, status, conditionBefore, conditionAfter,
 *    issueDescription, createdAt and updatedAt.
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
 * Interface for Tool List entity, used for project planning.
 *
 * While not defined in the core ER diagram, this extension provides a way to group tools for a project.
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
 * Interface for Tool List Item entity.
 */
export interface ToolListItem {
  id: number;
  toolListId: number;
  toolId: number;
  toolName?: string; // For UI display
  quantity: number;
}
