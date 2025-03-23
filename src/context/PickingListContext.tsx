// src/context/PickingListContext.tsx
import { ApiError } from '@/services/api-client';
import * as pickingListService from '@/services/picking-list-service';
import { PickingListStatus } from '@/types/enums';
import { PickingList, PickingListFilters } from '@/types/pickinglist';
import React, { createContext, useContext, useEffect, useState } from 'react';

// Define the context interface
interface PickingListContextType {
  pickingLists: PickingList[];
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    perPage: number;
    lastPage: number;
  };

  // CRUD operations
  getFilteredPickingLists: (
    filters?: PickingListFilters,
    page?: number,
    perPage?: number
  ) => Promise<PickingList[]>;
  getPickingListById: (id: string) => Promise<PickingList | undefined>;
  getPickingListsByProject: (projectId: string) => PickingList[];
  createPickingList: (
    pickingList: Omit<PickingList, 'id' | 'createdAt' | 'completedAt'>
  ) => Promise<PickingList>;
  updatePickingList: (
    id: string,
    updates: Partial<PickingList>
  ) => Promise<PickingList>;
  deletePickingList: (id: string) => Promise<void>;

  // Specialized operations
  updatePickingListStatus: (
    id: string,
    status: PickingListStatus
  ) => Promise<PickingList>;
  assignPickingList: (id: string, userId: string) => Promise<PickingList>;
  markPickingListComplete: (id: string) => Promise<PickingList>;
  updatePickingListItemQuantity: (
    listId: string,
    itemId: string,
    pickedQuantity: number
  ) => Promise<PickingList>;
  generatePickingListFromProject: (projectId: string) => Promise<PickingList>;
}

// Create the context
const PickingListContext = createContext<PickingListContextType | undefined>(
  undefined
);

// Provider component
export const PickingListProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [pickingLists, setPickingLists] = useState<PickingList[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    total: number;
    page: number;
    perPage: number;
    lastPage: number;
  }>({
    total: 0,
    page: 1,
    perPage: 20,
    lastPage: 1,
  });

  // Load initial data
  useEffect(() => {
    const fetchPickingLists = async () => {
      setLoading(true);
      try {
        const response = await pickingListService.getPickingLists();
        setPickingLists(response.data);
        // Convert response.meta to match our pagination structure
        setPagination({
          total: response.meta.total,
          page: response.meta.page,
          perPage: response.meta.per_page,
          lastPage: response.meta.last_page,
        });
        setError(null);
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError.message || 'Failed to load picking lists');
        console.error('Error loading picking lists:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPickingLists();
  }, []);

  // Get filtered picking lists with pagination
  const getFilteredPickingLists = async (
    filters?: PickingListFilters,
    page: number = 1,
    perPage: number = 20
  ): Promise<PickingList[]> => {
    setLoading(true);
    try {
      const response = await pickingListService.getPickingLists(
        filters,
        page,
        perPage
      );

      // Update local state if no filters were applied
      if (!filters && page === 1) {
        setPickingLists(response.data);
        // Convert response.meta to match our pagination structure
        setPagination({
          total: response.meta.total,
          page: response.meta.page,
          perPage: response.meta.per_page,
          lastPage: response.meta.last_page,
        });
      }

      return response.data;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to fetch picking lists');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get a picking list by ID
  const getPickingListById = async (
    id: string
  ): Promise<PickingList | undefined> => {
    setLoading(true);
    try {
      const pickingList = await pickingListService.getPickingListById(id);
      return pickingList;
    } catch (err) {
      const apiError = err as ApiError;
      setError(
        apiError.message || `Failed to fetch picking list with ID: ${id}`
      );
      return undefined;
    } finally {
      setLoading(false);
    }
  };

  // Get all picking lists for a project
  const getPickingListsByProject = (projectId: string): PickingList[] => {
    return pickingLists.filter((list) => list.projectId === projectId);
  };

  // Create a new picking list
  const createPickingList = async (
    pickingListData: Omit<PickingList, 'id' | 'createdAt' | 'completedAt'>
  ): Promise<PickingList> => {
    setLoading(true);
    try {
      const newPickingList = await pickingListService.createPickingList(
        pickingListData
      );

      // Update local state
      setPickingLists((prev) => [...prev, newPickingList]);

      return newPickingList;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to create picking list');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update a picking list
  const updatePickingList = async (
    id: string,
    updates: Partial<PickingList>
  ): Promise<PickingList> => {
    setLoading(true);
    try {
      const updatedPickingList = await pickingListService.updatePickingList(
        id,
        updates
      );

      // Update local state
      setPickingLists((prev) =>
        prev.map((list) => (list.id === id ? updatedPickingList : list))
      );

      return updatedPickingList;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to update picking list');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete a picking list
  const deletePickingList = async (id: string): Promise<void> => {
    setLoading(true);
    try {
      await pickingListService.deletePickingList(id);

      // Update local state
      setPickingLists((prev) => prev.filter((list) => list.id !== id));
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to delete picking list');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update picking list status
  const updatePickingListStatus = async (
    id: string,
    status: PickingListStatus
  ): Promise<PickingList> => {
    setLoading(true);
    try {
      const updatedPickingList =
        await pickingListService.updatePickingListStatus(id, status);

      // Update local state
      setPickingLists((prev) =>
        prev.map((list) => (list.id === id ? updatedPickingList : list))
      );

      return updatedPickingList;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to update picking list status');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Assign a picking list to a user
  const assignPickingList = async (
    id: string,
    userId: string
  ): Promise<PickingList> => {
    setLoading(true);
    try {
      const updatedPickingList = await pickingListService.assignPickingList(
        id,
        userId
      );

      // Update local state
      setPickingLists((prev) =>
        prev.map((list) => (list.id === id ? updatedPickingList : list))
      );

      return updatedPickingList;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to assign picking list');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Mark a picking list as complete
  const markPickingListComplete = async (id: string): Promise<PickingList> => {
    return updatePickingListStatus(id, PickingListStatus.COMPLETED);
  };

  // Update picking list item quantity
  const updatePickingListItemQuantity = async (
    listId: string,
    itemId: string,
    pickedQuantity: number
  ): Promise<PickingList> => {
    setLoading(true);
    try {
      const updatedPickingList =
        await pickingListService.updatePickingListItemQuantity(
          listId,
          itemId,
          pickedQuantity
        );

      // Update local state
      setPickingLists((prev) =>
        prev.map((list) => (list.id === listId ? updatedPickingList : list))
      );

      return updatedPickingList;
    } catch (err) {
      const apiError = err as ApiError;
      setError(
        apiError.message || 'Failed to update picking list item quantity'
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Generate a picking list from a project
  const generatePickingListFromProject = async (
    projectId: string
  ): Promise<PickingList> => {
    setLoading(true);
    try {
      const newPickingList =
        await pickingListService.generatePickingListFromProject(projectId);

      // Update local state
      setPickingLists((prev) => [...prev, newPickingList]);

      return newPickingList;
    } catch (err) {
      const apiError = err as ApiError;
      setError(
        apiError.message || 'Failed to generate picking list from project'
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Context value
  const value: PickingListContextType = {
    pickingLists,
    loading,
    error,
    pagination,
    getFilteredPickingLists,
    getPickingListById,
    getPickingListsByProject,
    createPickingList,
    updatePickingList,
    deletePickingList,
    updatePickingListStatus,
    assignPickingList,
    markPickingListComplete,
    updatePickingListItemQuantity,
    generatePickingListFromProject,
  };

  return (
    <PickingListContext.Provider value={value}>
      {children}
    </PickingListContext.Provider>
  );
};

// Hook for using the context
export const usePickingLists = (): PickingListContextType => {
  const context = useContext(PickingListContext);
  if (context === undefined) {
    throw new Error(
      'usePickingLists must be used within a PickingListProvider'
    );
  }
  return context;
};

export default PickingListContext;
