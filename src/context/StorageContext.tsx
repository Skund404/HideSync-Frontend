import { api } from '@services/api';
import { StorageCell, StorageLocation } from '@types';
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { StorageMoveRequest } from '../types/storage';

// Define context interface
interface StorageContextType {
  // Storage locations
  storageLocations: StorageLocation[];
  storageCells: StorageCell[];
  selectedLocation: StorageLocation | null;
  fetchStorageLocations: () => Promise<void>;
  selectStorageLocation: (id: string | null) => void;

  // Storage overview for dashboard
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
    recentMoves: any[]; // Replace with proper type if available
    lastUpdated: string;
  } | null;
  fetchStorageOverview: () => Promise<void>;

  // Materials in storage
  materialsInStorage: Record<string, any[]>;
  getItemsForStorage: (storageId: string) => any[];
  getStorageUtilization: (storageId: string) => number;

  // Storage management
  createStorageLocation: (
    location: Omit<StorageLocation, 'id'>
  ) => Promise<StorageLocation>;
  updateStorageLocation: (
    id: string,
    updates: Partial<StorageLocation>
  ) => Promise<StorageLocation>;
  deleteStorageLocation: (id: string) => Promise<boolean>;

  // Material assignments
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
  fetchStorageCells: (storageId: string) => Promise<void>;
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

  // Loading state
  loading: boolean;
  error: string | null;
}

// Create context
const StorageContext = createContext<StorageContextType | undefined>(undefined);

// Provider component
export const StorageProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // State for storage locations and cells
  const [storageLocations, setStorageLocations] = useState<StorageLocation[]>(
    []
  );
  const [storageCells, setStorageCells] = useState<StorageCell[]>([]);
  const [selectedLocation, setSelectedLocation] =
    useState<StorageLocation | null>(null);

  // State for storage overview
  const [storageOverview, setStorageOverview] =
    useState<StorageContextType['storageOverview']>(null);

  // State for materials in storage
  const [materialsInStorage, setMaterialsInStorage] = useState<
    Record<string, any[]>
  >({});

  // Loading and error states
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all materials and organize by storage location
  const fetchMaterialsInStorage = useCallback(async () => {
    try {
      // In a real app, this would be an API call to get materials with their storage locations
      // For now, using mock data
      const materials = await api.get<any[]>('storage/materials');

      // Group materials by storage location
      const materialsByStorage: Record<string, any[]> = {};

      materials.forEach((material) => {
        if (material.storageId) {
          if (!materialsByStorage[material.storageId]) {
            materialsByStorage[material.storageId] = [];
          }
          materialsByStorage[material.storageId].push(material);
        }
      });

      setMaterialsInStorage(materialsByStorage);
    } catch (err) {
      console.error('Error fetching materials in storage:', err);
    }
  }, []);

  // Fetch storage locations
  const fetchStorageLocations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const locations = await api.get<StorageLocation[]>(
        'storage/storageLocations'
      );
      const cells = await api.get<StorageCell[]>('storage/storageCells');
      setStorageLocations(locations);
      setStorageCells(cells);

      // Also fetch materials in storage
      await fetchMaterialsInStorage();
    } catch (err) {
      console.error('Error fetching storage data:', err);
      setError('Failed to load storage data. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [fetchMaterialsInStorage]);

  // Fetch storage overview data for dashboard
  const fetchStorageOverview = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const overview = await api.get('storage/storageOverview');
      setStorageOverview(overview as StorageContextType['storageOverview']);
    } catch (err) {
      console.error('Error fetching storage overview:', err);
      setError('Failed to load storage overview data. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch cells for a specific storage location
  const fetchStorageCells = useCallback(
    async (storageId: string): Promise<void> => {
      try {
        const cells = await api.get<StorageCell[]>(
          `storage/cells/${storageId}`
        );
        setStorageCells((prev) => [
          ...prev.filter((cell) => cell.storageId !== storageId),
          ...cells,
        ]);
      } catch (err) {
        console.error(`Error fetching storage cells for ${storageId}:`, err);
        throw new Error('Failed to load storage cells');
      }
    },
    []
  );

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
  const getItemsForStorage = useCallback(
    (storageId: string) => {
      return materialsInStorage[storageId] || [];
    },
    [materialsInStorage]
  );

  // Calculate storage utilization percentage
  const getStorageUtilization = useCallback(
    (storageId: string) => {
      const location = storageLocations.find((loc) => loc.id === storageId);
      if (!location) return 0;

      return Math.round((location.utilized / location.capacity) * 100);
    },
    [storageLocations]
  );

  // Create a new storage location
  const createStorageLocation = useCallback(
    async (location: Omit<StorageLocation, 'id'>): Promise<StorageLocation> => {
      // In a real app, this would be an API call
      // For now, simulate creating a new location
      const newLocation: StorageLocation = {
        id: `storage-${Date.now()}`,
        ...location,
        lastModified: new Date().toISOString(),
      };

      setStorageLocations((prev) => [...prev, newLocation]);
      return newLocation;
    },
    []
  );

  // Update a storage location
  const updateStorageLocation = useCallback(
    async (
      id: string,
      updates: Partial<StorageLocation>
    ): Promise<StorageLocation> => {
      const index = storageLocations.findIndex((loc) => loc.id === id);
      if (index === -1) throw new Error('Storage location not found');

      const updatedLocation = {
        ...storageLocations[index],
        ...updates,
        lastModified: new Date().toISOString(),
      };

      const newLocations = [...storageLocations];
      newLocations[index] = updatedLocation;
      setStorageLocations(newLocations);

      if (selectedLocation?.id === id) {
        setSelectedLocation(updatedLocation);
      }

      return updatedLocation;
    },
    [storageLocations, selectedLocation]
  );

  // Delete a storage location
  const deleteStorageLocation = useCallback(
    async (id: string): Promise<boolean> => {
      // In a real app, this would be an API call
      setStorageLocations((prev) => prev.filter((loc) => loc.id !== id));

      if (selectedLocation?.id === id) {
        setSelectedLocation(null);
      }

      return true;
    },
    [selectedLocation]
  );

  // Assign material to storage
  const assignMaterialToStorage = useCallback(
    async (
      materialId: number,
      storageId: string,
      position: { x: number; y: number }
    ): Promise<boolean> => {
      // In a real app, this would be an API call
      // Update the storage cells
      const newCell: StorageCell = {
        storageId,
        position,
        itemId: materialId,
        itemType: 'material',
        occupied: true,
      };

      setStorageCells((prev) => [
        ...prev.filter(
          (cell) =>
            !(
              cell.storageId === storageId &&
              cell.position.x === position.x &&
              cell.position.y === position.y
            )
        ),
        newCell,
      ]);

      // Update storage utilization
      const locationIndex = storageLocations.findIndex(
        (loc) => loc.id === storageId
      );
      if (locationIndex !== -1) {
        const newLocations = [...storageLocations];
        newLocations[locationIndex] = {
          ...newLocations[locationIndex],
          utilized: newLocations[locationIndex].utilized + 1,
          lastModified: new Date().toISOString(),
        };
        setStorageLocations(newLocations);
      }

      return true;
    },
    [storageLocations]
  );

  // Remove material from storage
  const removeMaterialFromStorage = useCallback(
    async (materialId: number, storageId: string): Promise<boolean> => {
      // In a real app, this would be an API call
      // Update the storage cells
      setStorageCells((prev) =>
        prev.filter(
          (cell) =>
            !(cell.storageId === storageId && cell.itemId === materialId)
        )
      );

      // Update storage utilization
      const locationIndex = storageLocations.findIndex(
        (loc) => loc.id === storageId
      );
      if (locationIndex !== -1) {
        const newLocations = [...storageLocations];
        newLocations[locationIndex] = {
          ...newLocations[locationIndex],
          utilized: Math.max(0, newLocations[locationIndex].utilized - 1),
          lastModified: new Date().toISOString(),
        };
        setStorageLocations(newLocations);
      }

      return true;
    },
    [storageLocations]
  );

  // Move material from one storage to another
  const moveMaterialStorage = useCallback(
    async (
      materialId: number,
      fromStorageId: string,
      toStorageId: string,
      newPosition: { x: number; y: number }
    ): Promise<boolean> => {
      // Remove from old location
      await removeMaterialFromStorage(materialId, fromStorageId);

      // Add to new location
      await assignMaterialToStorage(materialId, toStorageId, newPosition);

      return true;
    },
    [removeMaterialFromStorage, assignMaterialToStorage]
  );

  // Move an item from one storage location to another
  const moveItem = useCallback(
    async (
      moveRequest: Omit<
        StorageMoveRequest,
        'id' | 'requestDate' | 'requestedBy'
      >
    ): Promise<boolean> => {
      try {
        // In a real app, this would call an API
        // For now, update local state directly

        // 1. Remove item from current location (if it exists)
        if (moveRequest.fromStorageId) {
          await removeMaterialFromStorage(
            moveRequest.itemId,
            moveRequest.fromStorageId
          );
        }

        // 2. Add item to new location
        if (moveRequest.toStorageId) {
          await assignMaterialToStorage(
            moveRequest.itemId,
            moveRequest.toStorageId,
            moveRequest.toPosition
          );
        }

        return true;
      } catch (err) {
        console.error('Error moving item:', err);
        throw new Error('Failed to move item');
      }
    },
    [assignMaterialToStorage, removeMaterialFromStorage]
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

  const storageStats = calculateStorageStats();

  // Load data on initial mount
  useEffect(() => {
    fetchStorageLocations();
  }, [fetchStorageLocations]);

  // Context value
  const contextValue: StorageContextType = {
    storageLocations,
    storageCells,
    selectedLocation,
    fetchStorageLocations,
    selectStorageLocation,

    storageOverview,
    fetchStorageOverview,

    materialsInStorage,
    getItemsForStorage,
    getStorageUtilization,

    createStorageLocation,
    updateStorageLocation,
    deleteStorageLocation,

    assignMaterialToStorage,
    moveMaterialStorage,
    removeMaterialFromStorage,
    fetchStorageCells,
    moveItem,

    storageStats,

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
