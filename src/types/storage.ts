// src/types/storage.ts

/**
 * Storage Location Types
 * Enumeration of different types of storage locations
 */
export enum StorageLocationType {
  CABINET = 'CABINET',
  SHELF = 'SHELF',
  DRAWER = 'DRAWER',
  RACK = 'RACK',
  BIN = 'BIN',
  BOX = 'BOX',
  SAFE = 'SAFE',
  OTHER = 'OTHER',
}

/**
 * Section Types
 * Areas within the workshop where storage can be located
 */
export enum SectionType {
  MAIN_WORKSHOP = 'MAIN_WORKSHOP',
  TOOL_ROOM = 'TOOL_ROOM',
  SUPPLY_CLOSET = 'SUPPLY_CLOSET',
  STORAGE_ROOM = 'STORAGE_ROOM',
  OFFICE = 'OFFICE',
  OTHER = 'OTHER',
}

/**
 * Storage Status
 * Current operational status of a storage location
 */
export enum StorageStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  FULL = 'FULL',
  MAINTENANCE = 'MAINTENANCE',
}

/**
 * Storage Location
 * Represents a physical storage location within the workshop
 */
export interface StorageLocation {
  id: string;
  name: string;
  type: StorageLocationType;
  section: SectionType;
  description?: string;
  dimensions: {
    width: number; // Number of cells wide
    height: number; // Number of cells tall
    depth?: number; // Optional 3D representation
  };
  capacity: number; // Maximum number of items or volume
  utilized: number; // Current utilization
  status: StorageStatus;
  lastModified: string;
  notes?: string;
  parentStorage?: string; // ID of parent storage (for nested storage)
}

/**
 * Storage Cell
 * Represents a position within a storage location
 */
export interface StorageCell {
  storageId: string;
  position: {
    x: number;
    y: number;
    z?: number; // Optional for 3D representation
  };
  itemId?: number; // ID of the item stored in this cell, if any
  itemType?: string; // Type of the item (leather, hardware, supply)
  occupied: boolean;
  notes?: string;
}

/**
 * Storage Assignment
 * Represents the assignment of a material to a storage location
 */
export interface StorageAssignment {
  id: string;
  materialId: number;
  materialType: string;
  storageId: string;
  position: {
    x: number;
    y: number;
    z?: number;
  };
  quantity: number;
  assignedDate: string;
  assignedBy: string;
  notes?: string;
}

/**
 * Storage Move
 * Represents a record of material being moved from one storage to another
 */
export interface StorageMove {
  id: string;
  materialId: number;
  materialType: string;
  fromStorageId: string;
  toStorageId: string;
  quantity: number;
  moveDate: string;
  movedBy: string;
  reason?: string;
  notes?: string;
}

/**
 * Storage Utilization
 * Summary data for storage analytics
 */
export interface StorageUtilization {
  storageId: string;
  storageName: string;
  storageType: StorageLocationType;
  section: SectionType;
  capacity: number;
  utilized: number;
  utilizationPercentage: number;
  itemBreakdown: {
    leather: number;
    hardware: number;
    supplies: number;
    other: number;
  };
  lastUpdated: string;
}

/**
 * Item Storage History
 * Track the history of where an item has been stored
 */
export interface ItemStorageHistory {
  itemId: number;
  itemType: string;
  itemName: string;
  storageLocations: {
    storageId: string;
    storageName: string;
    assignedDate: string;
    removedDate?: string;
    duration?: number; // In days
  }[];
}

// Add this to src/types/storage.ts after the StorageMove interface

/**
 * Storage Move Request
 * Represents a request to move material from one storage location to another
 */
export interface StorageMoveRequest {
  id: string;
  itemId: number;
  itemType: string;
  quantity: number;
  fromStorageId: string;
  fromPosition: {
    x: number;
    y: number;
    z?: number;
  };
  toStorageId: string;
  toPosition: {
    x: number;
    y: number;
    z?: number;
  };
  requestDate: string;
  requestedBy: string;
  completedDate?: string;
  completedBy?: string;
  notes?: string;
  status: 'pending' | 'completed' | 'cancelled';
}
