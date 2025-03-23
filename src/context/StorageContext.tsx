// src/context/StorageContext.tsx
import { storageService } from '@/services/storage-service';
import { StorageLocationType } from '@/types/enums';
import {
  SectionType,
  StorageCell,
  StorageLocation,
  StorageMoveRequest,
  StorageStatus,
} from '@/types/storage'; // Import SectionType and StorageStatus from storage.ts
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

// Pagination and Filtering Interfaces
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface StorageLocationFilter {
  type?: StorageLocationType[];
  section?: SectionType[];
  status?: StorageStatus[];
  minUtilization?: number;
  maxUtilization?: number;
}

export interface MaterialFilter {
  category?: string[];
  type?: string[];
  status?: string[];
  minQuantity?: number;
  maxQuantity?: number;
  supplier?: string[];
}

// Define context interface
interface StorageContextType {
  // Storage locations
  storageLocations: StorageLocation[];
  storageCells: StorageCell[];
  selectedLocation: StorageLocation | null;

  // Pagination and filtering
  pagination: {
    total: number;
    page: number;
    pageSize: number;
  };

  // Fetch methods with pagination and filtering
  fetchStorageLocations: (
    pagination?: PaginationParams,
    filters?: StorageLocationFilter
  ) => Promise<void>;

  fetchMaterials: (
    pagination?: PaginationParams,
    filters?: MaterialFilter
  ) => Promise<{
    data: any[];
    total: number;
    page: number;
    pageSize: number;
  }>;

  // Storage location management
  selectStorageLocation: (id: string | null) => void;
  createStorageLocation: (
    location: Omit<StorageLocation, 'id'>
  ) => Promise<StorageLocation>;
  updateStorageLocation: (
    id: string,
    updates: Partial<StorageLocation>
  ) => Promise<StorageLocation>;
  deleteStorageLocation: (id: string) => Promise<void>;

  // Batch operations
  createMultipleStorageLocations: (
    locations: Omit<StorageLocation, 'id'>[]
  ) => Promise<StorageLocation[]>;
  updateMultipleStorageLocations: (
    updates: Array<{
      id: string;
      data: Partial<StorageLocation>;
    }>
  ) => Promise<StorageLocation[]>;
  deleteMultipleStorageLocations: (ids: string[]) => Promise<void>;

  // Material management
  importMaterialsFromCSV: (file: File) => Promise<{
    imported: number;
    errors: any[];
  }>;
  exportMaterialsToCSV: (filters?: MaterialFilter) => Promise<void>;

  // Storage overview
  storageOverview: {
    totalCapacity: number;
    totalUtilized: number;
    utilizationPercentage: number;
    itemBreakdown: {
      leather: number;
      hardware: number;
      supplies: number;
      other: number;
    };
    lowSpace: Array<{
      id: string;
      name: string;
      capacity: number;
      utilized: number;
      utilizationPercentage: number;
    }>;
    recentMoves: any[];
    lastUpdated: string;
  } | null;

  // Storage methods
  fetchStorageOverview: () => Promise<void>;
  fetchStorageCells: (storageId: string) => Promise<void>;
  getItemsForStorage: (storageId: string) => any[]; // Consider typing
  getStorageUtilization: (storageId: string) => number;

  // Material movement
  assignMaterialToStorage: (
    materialId: number,
    storageId: string,
    position: { x: number; y: number }
  ) => Promise<boolean>;
  moveMaterialStorage: (
    materialId: number,
    fromStorageId: string,
    toStorageId: string,
    newPosition: { x: number; y: number }
  ) => Promise<boolean>;
  removeMaterialFromStorage: (
    materialId: number,
    storageId: string
  ) => Promise<boolean>;
  moveItem: (
    moveRequest: Omit<StorageMoveRequest, 'id' | 'requestDate' | 'requestedBy'>
  ) => Promise<boolean>;

  // Storage stats
  storageStats: {
    totalLocations: number;
    totalCapacity: number;
    totalUtilized: number;
    utilizationPercentage: number;
  };

  // Loading and error states
  loading: boolean;
  error: string | null;
}

// Create context
const StorageContext = createContext<StorageContextType | undefined>(undefined);

// Provider component
export const StorageProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // State management
  const [storageLocations, setStorageLocations] = useState<StorageLocation[]>(
    []
  );
  const [storageCells, setStorageCells] = useState<StorageCell[]>([]);
  const [selectedLocation, setSelectedLocation] =
    useState<StorageLocation | null>(null);
  const [storageOverview, setStorageOverview] =
    useState<StorageContextType['storageOverview']>(null);

  // Pagination and loading states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pageSize: 10,
  });

  // Fetch storage locations with pagination and filtering
  const fetchStorageLocations = useCallback(
    async (
      paginationParams?: PaginationParams,
      filters?: StorageLocationFilter
    ) => {
      setLoading(true);
      setError(null);
      try {
        const response = await storageService.getStorageLocations(
          paginationParams,
          filters
        );

        setStorageLocations(response.data);
        setPagination({
          total: response.total,
          page: response.page,
          pageSize: response.pageSize,
        });
      } catch (err: any) {
        // Explicitly type err as any
        setError('Failed to fetch storage locations: ' + (err.message || err)); // Include error message
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Fetch materials with pagination and filtering
  const fetchMaterials = useCallback(
    async (paginationParams?: PaginationParams, filters?: MaterialFilter) => {
      setLoading(true);
      setError(null);
      try {
        // Added implementation of missing method
        const response = await storageService.getMaterials(
          paginationParams,
          filters
        );
        return response;
      } catch (err: any) {
        // Explicitly type err as any
        setError('Failed to fetch materials: ' + (err.message || err)); // Include error message
        console.error(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Batch create storage locations
  const createMultipleStorageLocations = useCallback(
    async (locations: Omit<StorageLocation, 'id'>[]) => {
      setLoading(true);
      setError(null);
      try {
        const created = await storageService.bulkCreateStorageLocations(
          locations
        );
        await fetchStorageLocations();
        return created;
      } catch (err: any) {
        // Explicitly type err as any
        setError('Failed to create storage locations: ' + (err.message || err)); // Include error message
        console.error(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchStorageLocations]
  );

  // Batch update storage locations
  const updateMultipleStorageLocations = useCallback(
    async (
      updates: Array<{
        id: string;
        data: Partial<StorageLocation>;
      }>
    ) => {
      setLoading(true);
      setError(null);
      try {
        const updated = await storageService.bulkUpdateStorageLocations(
          updates
        );
        await fetchStorageLocations();
        return updated;
      } catch (err: any) {
        // Explicitly type err as any
        setError('Failed to update storage locations: ' + (err.message || err)); // Include error message
        console.error(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchStorageLocations]
  );

  // Batch delete storage locations
  const deleteMultipleStorageLocations = useCallback(
    async (ids: string[]) => {
      setLoading(true);
      setError(null);
      try {
        await storageService.bulkDeleteStorageLocations(ids);
        await fetchStorageLocations();
      } catch (err: any) {
        // Explicitly type err as any
        setError('Failed to delete storage locations: ' + (err.message || err)); // Include error message
        console.error(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchStorageLocations]
  );

  // Import materials from CSV
  const importMaterialsFromCSV = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      // Added implementation of missing method
      return await storageService.importMaterialsFromCSV(file);
    } catch (err: any) {
      // Explicitly type err as any
      setError('Failed to import materials: ' + (err.message || err)); // Include error message
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Export materials to CSV
  const exportMaterialsToCSV = useCallback(async (filters?: MaterialFilter) => {
    setLoading(true);
    setError(null);
    try {
      // Added implementation of missing method
      const blob = await storageService.exportMaterialsToCSV(filters);
      storageService.downloadBlob(blob, 'materials-export.csv');
    } catch (err: any) {
      // Explicitly type err as any
      setError('Failed to export materials: ' + (err.message || err)); // Include error message
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch storage overview
  const fetchStorageOverview = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const overviewData = await storageService.getStorageOverview();

      // Transform the response to match the expected shape
      const formattedOverview = {
        totalCapacity: overviewData.totalCapacity,
        totalUtilized: overviewData.usedCapacity,
        utilizationPercentage: overviewData.utilizationPercentage,
        itemBreakdown: {
          leather: overviewData.itemsByType?.materials || 0,
          hardware: overviewData.itemsByType?.products || 0,
          supplies: overviewData.itemsByType?.tools || 0,
          other: 0,
        },
        lowSpace: [], // You'll need to extract this from the response
        recentMoves: [], // You'll need to fetch this separately
        lastUpdated: new Date().toISOString(),
      };

      setStorageOverview(formattedOverview);
    } catch (err: any) {
      // Explicitly type err as any
      setError('Failed to load storage overview: ' + (err.message || err)); // Include error message
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch storage cells for a specific location
  const fetchStorageCells = useCallback(async (storageId: string) => {
    setLoading(true);
    setError(null);
    try {
      const cells = await storageService.getStorageCells(storageId);

      // Convert cell positions if needed (row/col to x/y)
      const normalizedCells: StorageCell[] = cells.map((cell) => {
        // If the cell has row/col position, convert to x/y
        if (
          'position' in cell &&
          typeof cell.position === 'object' &&
          cell.position !== null &&
          'row' in cell.position &&
          'col' in cell.position &&
          typeof cell.position.row === 'number' &&
          typeof cell.position.col === 'number'
        ) {
          return {
            ...cell,
            position: {
              x: cell.position.col,
              y: cell.position.row,
            },
          } as StorageCell;
        }
        return cell;
      });

      setStorageCells((prev) => [
        ...prev.filter((cell) => cell.storageId !== storageId),
        ...normalizedCells,
      ]);
    } catch (err: any) {
      // Explicitly type err as any
      setError('Failed to fetch storage cells: ' + (err.message || err)); // Include error message
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Select a storage location
  const selectStorageLocation = useCallback(
    (id: string | null) => {
      if (id === null) {
        setSelectedLocation(null);
        return;
      }

      const location = storageLocations.find((loc) => loc.id === id) || null;
      setSelectedLocation(location);
    },
    [storageLocations]
  );

  // Get items for a specific storage
  const getItemsForStorage = useCallback((storageId: string) => {
    // This would typically come from an API call in a real app.  Consider fetching this data.
    return [];
  }, []);

  // Calculate storage utilization
  const getStorageUtilization = useCallback(
    (storageId: string) => {
      const location = storageLocations.find((loc) => loc.id === storageId);
      return location
        ? Math.round((location.utilized / location.capacity) * 100)
        : 0;
    },
    [storageLocations]
  );

  // Create a single storage location
  const createStorageLocation = useCallback(
    async (location: Omit<StorageLocation, 'id'>) => {
      setLoading(true);
      setError(null);
      try {
        const newLocation = await storageService.createStorageLocation(
          location
        );
        await fetchStorageLocations();
        return newLocation;
      } catch (err: any) {
        // Explicitly type err as any
        setError('Failed to create storage location: ' + (err.message || err)); // Include error message
        console.error(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchStorageLocations]
  );

  // Update a single storage location
  const updateStorageLocation = useCallback(
    async (id: string, updates: Partial<StorageLocation>) => {
      setLoading(true);
      setError(null);
      try {
        const updatedLocation = await storageService.updateStorageLocation(
          id,
          updates
        );
        await fetchStorageLocations();
        return updatedLocation;
      } catch (err: any) {
        // Explicitly type err as any
        setError('Failed to update storage location: ' + (err.message || err)); // Include error message
        console.error(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchStorageLocations]
  );

  // Delete a single storage location
  const deleteStorageLocation = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        await storageService.deleteStorageLocation(id);
        await fetchStorageLocations();
      } catch (err: any) {
        // Explicitly type err as any
        setError('Failed to delete storage location: ' + (err.message || err)); // Include error message
        console.error(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchStorageLocations]
  );

  // Material assignment methods
  const assignMaterialToStorage = useCallback(
    async (
      materialId: number,
      storageId: string,
      position: { x: number; y: number }
    ) => {
      setLoading(true);
      setError(null);
      try {
        // Default quantity to 1 if not specified
        const quantity = 1;
        const assignment = await storageService.assignMaterialToStorage(
          materialId,
          storageId,
          position,
          quantity
        );
        return !!assignment; // Convert to boolean
      } catch (err: any) {
        setError(
          'Failed to assign material to storage: ' + (err.message || err)
        );
        console.error(err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Move material between storage locations
  const moveMaterialStorage = useCallback(
    async (
      materialId: number,
      fromStorageId: string,
      toStorageId: string,
      newPosition: { x: number; y: number }
    ) => {
      setLoading(true);
      setError(null);
      try {
        // Default quantity to 1 if not specified
        const quantity = 1;
        const success = await storageService.moveMaterialStorage(
          materialId,
          fromStorageId,
          toStorageId,
          newPosition,
          quantity
        );
        return success;
      } catch (err: any) {
        setError(
          'Failed to move material between storage locations: ' +
            (err.message || err)
        );
        console.error(err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Remove material from storage
  const removeMaterialFromStorage = useCallback(
    async (materialId: number, storageId: string) => {
      setLoading(true);
      setError(null);
      try {
        const success = await storageService.removeMaterialFromStorage(
          materialId,
          storageId
        );
        return success;
      } catch (err: any) {
        setError(
          'Failed to remove material from storage: ' + (err.message || err)
        );
        console.error(err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Move an item between storage locations
  const moveItem = useCallback(
    async (
      moveRequest: Omit<
        StorageMoveRequest,
        'id' | 'requestDate' | 'requestedBy'
      >
    ) => {
      setLoading(true);
      setError(null);
      try {
        const success = await storageService.moveItem(moveRequest);
        return success;
      } catch (err: any) {
        // Explicitly type err as any
        setError('Failed to move item: ' + (err.message || err)); // Include error message
        console.error(err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Calculate overall storage stats
  const calculateStorageStats = useCallback(() => {
    const totalLocations = storageLocations.length;
    const totalCapacity = storageLocations.reduce(
      (sum, loc) => sum + loc.capacity,
      0
    );
    const totalUtilized = storageLocations.reduce(
      (sum, loc) => sum + loc.utilized,
      0
    );
    const utilizationPercentage =
      totalCapacity > 0 ? Math.round((totalUtilized / totalCapacity) * 100) : 0;

    return {
      totalLocations,
      totalCapacity,
      totalUtilized,
      utilizationPercentage,
    };
  }, [storageLocations]);

  // Compute storage stats
  const storageStats = calculateStorageStats();

  // Load initial data on mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        await fetchStorageLocations();
        await fetchStorageOverview();
      } catch (err) {
        console.error('Failed to initialize storage data', err);
        setError('Failed to initialize storage data.'); // Set error state
      }
    };

    initializeData();
  }, [fetchStorageLocations, fetchStorageOverview]);

  // Prepare context value
  const contextValue: StorageContextType = {
    // Storage locations and cells
    storageLocations,
    storageCells,
    selectedLocation,

    // Pagination
    pagination,

    // Fetch methods
    fetchStorageLocations,
    fetchMaterials,

    // Storage location management
    selectStorageLocation,
    createStorageLocation,
    updateStorageLocation,
    deleteStorageLocation,

    // Batch operations
    createMultipleStorageLocations,
    updateMultipleStorageLocations,
    deleteMultipleStorageLocations,

    // Material management
    importMaterialsFromCSV,
    exportMaterialsToCSV,

    // Storage overview
    storageOverview,
    fetchStorageOverview,

    // Storage methods
    fetchStorageCells,
    getItemsForStorage,
    getStorageUtilization,

    // Material movement
    assignMaterialToStorage,
    moveMaterialStorage,
    removeMaterialFromStorage,
    moveItem,

    // Storage stats
    storageStats,

    // Loading and error states
    loading,
    error,
  };

  return (
    <StorageContext.Provider value={contextValue}>
      {children}
    </StorageContext.Provider>
  );
};

// Custom hook for using the storage context
export const useStorage = () => {
  const context = useContext(StorageContext);
  if (context === undefined) {
    throw new Error('useStorage must be used within a StorageProvider');
  }
  return context;
};

export default StorageContext;
