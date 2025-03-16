// src/types/pickinglist.ts

// Enum for picking list status
export enum PickingListStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

// Interface for picking list
export interface PickingList {
  id: string;
  projectId: string;
  status: PickingListStatus;
  createdAt: Date;
  assignedTo?: string;
  completedAt?: Date;
  notes?: string;
}

// Interface for picking list items
export interface PickingListItem {
  id: string;
  pickingListId: string;
  materialId: string;
  quantity: number;
  pickedQuantity: number;
  status: 'pending' | 'partial' | 'complete';
  notes?: string;
}

// Interface for filtering picking lists
export interface PickingListFilters {
  projectId?: string;
  status?: PickingListStatus;
  assignedTo?: string;
  dateRange?: {
    start?: Date;
    end?: Date;
  };
}

export interface PickingListSummary {
  id: number | string; // Allow both number and string IDs
  status: string;
  createdAt: string;
}
