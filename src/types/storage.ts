// src/types/storage.ts

/**
 * Storage Location Types
 * Enumeration of different types of storage locations.
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
 * Different areas within the workshop where storage may be located.
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
 * Current operational status of a storage location.
 */
export enum StorageStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  FULL = 'FULL',
  MAINTENANCE = 'MAINTENANCE',
}

/**
 * Storage Location
 * Represents a physical storage location within the workshop.
 *
 * Aligns with the ER diagram:
 *   - id, name, type, section, description, dimensions (as JSON), capacity,
 *     utilized, status, lastModified, notes, and parentStorage.
 */
export interface StorageLocation {
  id: string;
  name: string;
  type: StorageLocationType;
  section: SectionType;
  description?: string;
  dimensions: {
    width: number;  // Number of cells wide
    height: number; // Number of cells tall
    depth?: number; // Optional depth for 3D storage
  };
  capacity: number; // Maximum number of items (or volume)
  utilized: number; // Current usage (number of items or used volume)
  status: StorageStatus;
  lastModified: string; // ISO date string
  notes?: string;
  parentStorage?: string; // ID of a parent storage location, if nested
}

/**
 * Storage Cell
 * Represents a designated cell or slot within a storage location.
 *
 * According to the ER diagram, a storage cell records:
 *   - The storage location it belongs to (storageId)
 *   - Its position (as JSON data)
 *   - Optionally, the item stored and its type, plus occupancy status and notes.
 */
export interface StorageCell {
  storageId: string;
  position: {
    x: number;
    y: number;
    z?: number; // Optional for 3D layouts
  };
  itemId?: number; // ID of the stored item (if any)
  itemType?: string; // The type of item (e.g., leather, hardware, supplies)
  occupied: boolean;
  notes?: string;
}

/**
 * Storage Assignment
 * Represents the assignment of a material to a specific storage location and cell.
 *
 * From the ER diagram, this includes:
 *   - id, materialId, materialType, storageId, position (JSON),
 *   - quantity, assignedDate, assignedBy, and notes.
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
  assignedDate: string; // ISO date string
  assignedBy: string;
  notes?: string;
}

/**
 * Storage Move
 * Records a move of material from one storage location to another.
 *
 * In the ER diagram, this entity stores:
 *   - id, materialId, materialType, fromStorageId, toStorageId, quantity,
 *     moveDate, movedBy, and optional reason and notes.
 */
export interface StorageMove {
  id: string;
  materialId: number;
  materialType: string;
  fromStorageId: string;
  toStorageId: string;
  quantity: number;
  moveDate: string; // ISO date string
  movedBy: string;
  reason?: string;
  notes?: string;
}

/**
 * Storage Utilization
 * Provides summary analytics for a specific storage location.
 *
 * Expected fields include:
 *   - storageId, storageName, storageType, section, capacity, utilized,
 *     calculated utilizationPercentage, a breakdown of items, and lastUpdated.
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
  lastUpdated: string; // ISO date string
}

/**
 * Item Storage History
 * Tracks the history for an item, including each storage location it was assigned to.
 *
 * The ER diagram suggests tracking:
 *   - itemId, itemType, itemName, and an array of storage assignments with
 *     storageId, storageName, assignedDate, removedDate, and duration (in days).
 */
export interface ItemStorageHistory {
  itemId: number;
  itemType: string;
  itemName: string;
  storageLocations: {
    storageId: string;
    storageName: string;
    assignedDate: string; // ISO date string
    removedDate?: string; // ISO date string (optional)
    duration?: number; // Duration in days
  }[];
}

/**
 * Storage Move Request
 * Represents a request to move material from one storage location (and cell) to another.
 *
 * Following the ER diagram, this includes:
 *   - id, itemId, itemType, quantity,
 *     fromStorageId and fromPosition, toStorageId and toPosition,
 *     requestDate, requestedBy, optionally completedDate and completedBy,
 *     notes, and a status (pending/completed/cancelled).
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
  requestDate: string; // ISO date string
  requestedBy: string;
  completedDate?: string; // ISO date string, if completed
  completedBy?: string;
  notes?: string;
  status: 'pending' | 'completed' | 'cancelled';
}
