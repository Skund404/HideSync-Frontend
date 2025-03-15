// src/services/mock/storage.ts
import {
  SectionType,
  StorageCell,
  StorageLocation,
  StorageLocationType,
  StorageStatus,
  StorageUtilization,
} from '@types';

// Mock storage locations
export const mockStorageLocations: StorageLocation[] = [
  {
    id: 'cab-1',
    name: 'Cabinet A',
    type: StorageLocationType.CABINET,
    section: SectionType.MAIN_WORKSHOP,
    description: 'Main leather storage cabinet',
    dimensions: {
      width: 4,
      height: 4,
    },
    capacity: 16,
    utilized: 12,
    status: StorageStatus.ACTIVE,
    lastModified: '2024-02-15',
    notes: 'Contains primarily veg-tan leather',
  },
  {
    id: 'shelf-1',
    name: 'Shelf B',
    type: StorageLocationType.SHELF,
    section: SectionType.MAIN_WORKSHOP,
    description: 'Open shelving for frequently used items',
    dimensions: {
      width: 6,
      height: 2,
    },
    capacity: 12,
    utilized: 8,
    status: StorageStatus.ACTIVE,
    lastModified: '2024-02-20',
  },
  {
    id: 'drawer-1',
    name: 'Tool Drawer 1',
    type: StorageLocationType.DRAWER,
    section: SectionType.TOOL_ROOM,
    description: 'Small tools and hardware',
    dimensions: {
      width: 3,
      height: 2,
    },
    capacity: 6,
    utilized: 6,
    status: StorageStatus.FULL,
    lastModified: '2024-02-25',
  },
  {
    id: 'rack-1',
    name: 'Leather Rack',
    type: StorageLocationType.RACK,
    section: SectionType.STORAGE_ROOM,
    description: 'Vertical rack for leather hides',
    dimensions: {
      width: 5,
      height: 5,
    },
    capacity: 25,
    utilized: 15,
    status: StorageStatus.ACTIVE,
    lastModified: '2024-03-01',
  },
  {
    id: 'bin-1',
    name: 'Scrap Bin',
    type: StorageLocationType.BIN,
    section: SectionType.MAIN_WORKSHOP,
    description: 'Collection of leather scraps for small projects',
    dimensions: {
      width: 3,
      height: 3,
    },
    capacity: 9,
    utilized: 7,
    status: StorageStatus.ACTIVE,
    lastModified: '2024-03-05',
  },
  {
    id: 'box-1',
    name: 'Dye Box',
    type: StorageLocationType.BOX,
    section: SectionType.SUPPLY_CLOSET,
    description: 'Contains leather dyes and finishes',
    dimensions: {
      width: 2,
      height: 2,
    },
    capacity: 4,
    utilized: 4,
    status: StorageStatus.FULL,
    lastModified: '2024-03-10',
  },
  {
    id: 'safe-1',
    name: 'Tool Safe',
    type: StorageLocationType.SAFE,
    section: SectionType.OFFICE,
    description: 'Secure storage for expensive tools',
    dimensions: {
      width: 3,
      height: 3,
    },
    capacity: 9,
    utilized: 3,
    status: StorageStatus.ACTIVE,
    lastModified: '2024-03-12',
  },
];

// Mock storage cells
export const mockStorageCells: StorageCell[] = [
  // Cabinet A cells
  ...Array.from({ length: 16 }, (_, i) => ({
    storageId: 'cab-1',
    position: {
      x: i % 4,
      y: Math.floor(i / 4),
    },
    occupied: i < 12, // 12 of 16 cells are occupied
    itemId: i < 12 ? 100 + i : undefined, // Mock item IDs
    itemType: i < 12 ? 'leather' : undefined,
  })),

  // Shelf B cells
  ...Array.from({ length: 12 }, (_, i) => ({
    storageId: 'shelf-1',
    position: {
      x: i % 6,
      y: Math.floor(i / 6),
    },
    occupied: i < 8, // 8 of 12 cells are occupied
    itemId: i < 8 ? 200 + i : undefined, // Mock item IDs
    itemType: i < 8 ? 'hardware' : undefined,
  })),

  // Other storage cells would follow similar patterns...
];

// Mock materials in storage
export const mockMaterialsInStorage = [
  // Items in Cabinet A
  ...Array.from({ length: 12 }, (_, i) => ({
    id: 100 + i,
    name: `Veg Tan Side ${i + 1}`,
    category: 'leather',
    subcategory: 'veg-tan',
    quantity: 1,
    unit: 'piece',
    storageId: 'cab-1',
    position: {
      x: i % 4,
      y: Math.floor(i / 4),
    },
    status: i < 10 ? 'IN_STOCK' : 'LOW_STOCK',
    color: ['natural', 'brown', 'black'][i % 3],
    thickness: [2, 3, 4, 5][i % 4],
    supplier: 'Wickett & Craig',
    lastUpdated: '2024-02-15',
  })),

  // Items in Shelf B
  ...Array.from({ length: 8 }, (_, i) => ({
    id: 200 + i,
    name: `Buckle Set ${i + 1}`,
    category: 'hardware',
    subcategory: 'buckles',
    quantity: 5 + i,
    unit: 'pcs',
    storageId: 'shelf-1',
    position: {
      x: i % 6,
      y: Math.floor(i / 6),
    },
    status: 'IN_STOCK',
    size: ['10mm', '15mm', '20mm', '25mm'][i % 4],
    supplier: 'Buckleguy',
    lastUpdated: '2024-02-20',
  })),

  // Add more items for other storage locations as needed
];

// Mock storage assignments
export const mockStorageAssignments = [
  // Add mock storage assignments here
  {
    id: 'assign-1',
    materialId: 100,
    materialType: 'leather',
    storageId: 'cab-1',
    position: { x: 0, y: 0 },
    quantity: 1,
    assignedDate: '2024-02-10',
    assignedBy: 'user1',
  },
  {
    id: 'assign-2',
    materialId: 101,
    materialType: 'leather',
    storageId: 'cab-1',
    position: { x: 1, y: 0 },
    quantity: 1,
    assignedDate: '2024-02-10',
    assignedBy: 'user1',
  },
  // Add more as needed
];

// Mock storage moves for history
export const mockStorageMoves = [
  {
    id: 'move-1',
    materialId: 101,
    materialType: 'leather',
    fromStorageId: 'shelf-1',
    toStorageId: 'cab-1',
    quantity: 1,
    moveDate: '2024-02-10',
    movedBy: 'user1',
    reason: 'Reorganization',
  },
  {
    id: 'move-2',
    materialId: 202,
    materialType: 'hardware',
    fromStorageId: 'drawer-1',
    toStorageId: 'shelf-1',
    quantity: 5,
    moveDate: '2024-02-12',
    movedBy: 'user1',
    reason: 'Better accessibility',
  },
  {
    id: 'move-3',
    materialId: 105,
    materialType: 'leather',
    fromStorageId: 'rack-1',
    toStorageId: 'cab-1',
    quantity: 1,
    moveDate: '2024-02-18',
    movedBy: 'user2',
    reason: 'Storage optimization',
  },
];

// Mock storage overview data for the dashboard
export const mockStorageOverview = {
  totalCapacity: 81, // Sum of all storage capacities
  totalUtilized: 55, // Sum of all utilized spaces
  utilizationPercentage: 68, // (totalUtilized / totalCapacity) * 100
  itemBreakdown: {
    leather: 35,
    hardware: 15,
    supplies: 5,
    other: 0,
  },
  lowSpace: [
    {
      id: 'drawer-1',
      name: 'Tool Drawer 1',
      capacity: 6,
      utilized: 6,
      utilizationPercentage: 100,
    },
    {
      id: 'box-1',
      name: 'Dye Box',
      capacity: 4,
      utilized: 4,
      utilizationPercentage: 100,
    },
    {
      id: 'bin-1',
      name: 'Scrap Bin',
      capacity: 9,
      utilized: 7,
      utilizationPercentage: 78,
    },
  ],
  recentMoves: mockStorageMoves.slice(0, 3), // Show last 3 moves
  lastUpdated: '2024-03-14',
};

// Mock storage utilization stats for analytics
export const mockStorageUtilization: StorageUtilization[] = [
  {
    storageId: 'cab-1',
    storageName: 'Cabinet A',
    storageType: StorageLocationType.CABINET,
    section: SectionType.MAIN_WORKSHOP,
    capacity: 16,
    utilized: 12,
    utilizationPercentage: 75,
    itemBreakdown: {
      leather: 12,
      hardware: 0,
      supplies: 0,
      other: 0,
    },
    lastUpdated: '2024-03-14',
  },
  {
    storageId: 'shelf-1',
    storageName: 'Shelf B',
    storageType: StorageLocationType.SHELF,
    section: SectionType.MAIN_WORKSHOP,
    capacity: 12,
    utilized: 8,
    utilizationPercentage: 67,
    itemBreakdown: {
      leather: 0,
      hardware: 8,
      supplies: 0,
      other: 0,
    },
    lastUpdated: '2024-03-14',
  },
  // Other storage utilization stats...
];

// For backwards compatibility with the rest of the codebase
export const storageLocations = mockStorageLocations;
export const storageCells = mockStorageCells;
export const storageAssignments = mockStorageAssignments;
export const storageOverview = mockStorageOverview;

// Default export for easy importing
export default {
  locations: mockStorageLocations,
  cells: mockStorageCells,
  materials: mockMaterialsInStorage,
  moves: mockStorageMoves,
  assignments: mockStorageAssignments,
  overview: mockStorageOverview,
  utilization: mockStorageUtilization,
};
