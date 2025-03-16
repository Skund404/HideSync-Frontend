// src/context/PickingListContext.tsx

import React, { createContext, useContext, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid'; // You need to run: npm i --save-dev @types/uuid

// Import directly from the models/enums file if available
import { PickingList, PickingListFilters } from '../types/pickinglist';
// Either import from where it's actually defined, or define it here

// Mock function since getPickingLists is not exported from projects
const mockGetPickingLists = (): PickingList[] => {
  return []; // Return empty array as a starting point
};

// Define PickingListStatus if not exported from pickingList.ts
enum PickingListStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

interface PickingListContextType {
  pickingLists: PickingList[];
  loading: boolean;
  error: string | null;
  getPickingListById: (id: string) => PickingList | undefined;
  getPickingListsByProject: (projectId: string) => PickingList[];
  createPickingList: (
    data: Omit<PickingList, 'id' | 'createdAt' | 'status'>
  ) => Promise<PickingList>;
  updatePickingList: (
    id: string,
    updates: Partial<PickingList>
  ) => Promise<PickingList>;
  deletePickingList: (id: string) => Promise<void>;
  assignPickingList: (
    id: string,
    userId: string,
    userName: string
  ) => Promise<PickingList>;
  markPickingListComplete: (id: string) => Promise<PickingList>;
  getFilteredPickingLists: (filters: PickingListFilters) => PickingList[];
}

// Use type assertions instead of extending the interface
type PickingListWithItemsType = PickingList & {
  items?: Array<{
    id: string;
    materialId: string;
    quantity: number;
    pickedQuantity: number;
    status: 'pending' | 'partial' | 'complete';
  }>;
};

const PickingListContext = createContext<PickingListContextType | undefined>(
  undefined
);

export const PickingListProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [pickingLists, setPickingLists] = useState<PickingList[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    const fetchPickingLists = async () => {
      setLoading(true);
      try {
        // Use the mock function instead
        const lists = mockGetPickingLists();
        setPickingLists(lists);
      } catch (err) {
        setError('Failed to load picking lists');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPickingLists();
  }, []);

  // Create a new picking list
  const createPickingList = async (
    data: Omit<PickingList, 'id' | 'createdAt' | 'status'>
  ): Promise<PickingList> => {
    try {
      setLoading(true);

      // Create new picking list using type assertion
      const newPickingList = {
        ...data,
        id: uuidv4(),
        status: PickingListStatus.PENDING,
        createdAt: new Date(),
      } as PickingList;

      // Add to state
      setPickingLists((prev) => [...prev, newPickingList]);

      setLoading(false);
      return newPickingList;
    } catch (err) {
      setError('Failed to create picking list');
      setLoading(false);
      throw err;
    }
  };

  // Assign a picking list to a user
  const assignPickingList = async (
    id: string,
    userId: string,
    userName: string
  ): Promise<PickingList> => {
    try {
      setLoading(true);

      // Find the picking list
      const pickingList = pickingLists.find((list) => list.id === id);
      if (!pickingList) {
        throw new Error('Picking list not found');
      }

      // Update the picking list with assignment using type assertion
      const updatedList = {
        ...pickingList,
        assignedTo: userId,
      } as PickingList;

      // Update in state
      setPickingLists((prev) =>
        prev.map((list) => (list.id === id ? updatedList : list))
      );

      setLoading(false);
      return updatedList;
    } catch (err) {
      setError('Failed to assign picking list');
      setLoading(false);
      throw err;
    }
  };

  // Update a picking list
  const updatePickingList = async (
    id: string,
    updates: Partial<PickingList>
  ): Promise<PickingList> => {
    try {
      setLoading(true);

      // Find the picking list
      const pickingList = pickingLists.find((list) => list.id === id);
      if (!pickingList) {
        throw new Error('Picking list not found');
      }

      // Type assertion to handle items or other properties
      const pickingListWithItems = pickingList as PickingListWithItemsType;
      const updatesWithItems = updates as Partial<PickingListWithItemsType>;

      // Keep items if they exist in the original and not being updated
      const items =
        updatesWithItems.items !== undefined
          ? updatesWithItems.items
          : pickingListWithItems.items;

      // Update the picking list
      const updatedList = {
        ...pickingList,
        ...updates,
        // Only include items if they exist
        ...(items && { items }),
      } as PickingList;

      // Update in state
      setPickingLists((prev) =>
        prev.map((list) => (list.id === id ? updatedList : list))
      );

      setLoading(false);
      return updatedList;
    } catch (err) {
      setError('Failed to update picking list');
      setLoading(false);
      throw err;
    }
  };

  // Mark a picking list as complete
  const markPickingListComplete = async (id: string): Promise<PickingList> => {
    try {
      setLoading(true);

      // Find the picking list
      const pickingList = pickingLists.find((list) => list.id === id);
      if (!pickingList) {
        throw new Error('Picking list not found');
      }

      // Update the picking list
      const updatedList = {
        ...pickingList,
        status: PickingListStatus.COMPLETED,
        completedAt: new Date(),
      } as PickingList;

      // Update in state
      setPickingLists((prev) =>
        prev.map((list) => (list.id === id ? updatedList : list))
      );

      setLoading(false);
      return updatedList;
    } catch (err) {
      setError('Failed to mark picking list as complete');
      setLoading(false);
      throw err;
    }
  };

  // Delete a picking list
  const deletePickingList = async (id: string): Promise<void> => {
    try {
      setLoading(true);

      // Remove from state
      setPickingLists((prev) => prev.filter((list) => list.id !== id));

      setLoading(false);
    } catch (err) {
      setError('Failed to delete picking list');
      setLoading(false);
      throw err;
    }
  };

  // Get all picking lists for a project
  const getPickingListsByProject = (projectId: string): PickingList[] => {
    return pickingLists.filter((list) => list.projectId === projectId);
  };

  // Get a picking list by ID
  const getPickingListById = (id: string): PickingList | undefined => {
    return pickingLists.find((list) => list.id === id);
  };

  // Get filtered picking lists
  const getFilteredPickingLists = (
    filters: PickingListFilters
  ): PickingList[] => {
    let filtered = [...pickingLists];

    // Filter by status
    if (filters.status !== undefined) {
      filtered = filtered.filter((list) => list.status === filters.status);
    }

    // Filter by project
    if (filters.projectId !== undefined) {
      filtered = filtered.filter(
        (list) => list.projectId === filters.projectId
      );
    }

    // Filter by assigned user
    if (filters.assignedTo !== undefined) {
      filtered = filtered.filter((list) => {
        if (filters.assignedTo === 'unassigned') {
          return !list.assignedTo;
        } else {
          return list.assignedTo === filters.assignedTo;
        }
      });
    }

    // Filter by creation date range
    if (filters.dateRange?.start) {
      filtered = filtered.filter(
        (list) =>
          new Date(list.createdAt) >= new Date(filters.dateRange?.start || '')
      );
    }

    // Filter by creation date range (end)
    if (filters.dateRange?.end) {
      filtered = filtered.filter(
        (list) =>
          new Date(list.createdAt) <= new Date(filters.dateRange?.end || '')
      );
    }

    // Sort by date (newest first by default)
    filtered = filtered.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return filtered;
  };

  // Context value
  const value: PickingListContextType = {
    pickingLists,
    loading,
    error,
    getPickingListById,
    getPickingListsByProject,
    createPickingList,
    updatePickingList,
    deletePickingList,
    assignPickingList,
    markPickingListComplete,
    getFilteredPickingLists,
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
