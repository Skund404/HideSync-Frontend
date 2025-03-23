// src/types/pickinglist.ts

/**
 * Enum for picking list status as defined in the ER diagram.
 */
export enum PickingListStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

/**
 * Enum for picking list item status as defined in the ER diagram.
 */
export enum PickingListItemStatus {
  PENDING = "pending",
  PARTIAL = "partial",
  COMPLETE = "complete",
}

/**
 * Interface for a picking list.
 *
 * Aligns with the ER diagram fields:
 *  - id (PK)
 *  - project_id (FK)
 *  - status (enum: pending/in_progress/completed/cancelled)
 *  - createdAt (datetime)
 *  - assignedTo (optional)
 *  - completedAt (optional)
 *  - notes (optional)
 */
export interface PickingList {
  id: string;
  projectId: string; // Corresponds to project_id (FK)
  status: PickingListStatus;
  createdAt: Date;
  assignedTo?: string;
  completedAt?: Date;
  notes?: string;
}

/**
 * Interface for a picking list item.
 *
 * Aligns with the ER diagram fields:
 *  - id (PK)
 *  - picking_list_id (FK)
 *  - material_id (FK)
 *  - component_id (FK, optional)
 *  - quantity_ordered (number)
 *  - quantity_picked (number)
 *  - status (enum: pending/partial/complete)
 *  - notes (optional)
 */
export interface PickingListItem {
  id: string;
  pickingListId: string; // Foreign key to PickingList.id
  materialId: string; // Foreign key to Material.id
  componentId?: string; // Optional foreign key to Component.id
  quantityOrdered: number;
  quantityPicked: number;
  status: PickingListItemStatus;
  notes?: string;
}

/**
 * Interface for filtering picking lists.
 */
export interface PickingListFilters {
  projectId?: string;
  status?: PickingListStatus;
  assignedTo?: string;
  dateRange?: {
    start?: Date;
    end?: Date;
  };
}

/**
 * Summary view for a picking list.
 */
export interface PickingListSummary {
  id: string;
  status: PickingListStatus;
  createdAt: string; // ISO date string
}
