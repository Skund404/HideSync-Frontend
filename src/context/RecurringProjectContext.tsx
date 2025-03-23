// src/context/RecurringProjectContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  RecurringProject,
  RecurringProjectFilter,
  RecurringProjectOccurrence,
  RecurringProjectUpdate
} from '@/types/recurringProject';
import * as recurringService from '@/services/recurring-project-service';
import { ApiError } from '@/services/api-client';

// Define and export the context type
export interface RecurringProjectContextType {
  recurringProjects: RecurringProject[];
  loading: boolean;
  error: string | null;

  // CRUD operations
  getAllRecurringProjects: (
    filters?: RecurringProjectFilter
  ) => Promise<RecurringProject[]>;
  getRecurringProjectById: (id: string) => Promise<RecurringProject | null>;
  createRecurringProject: (
    project: Partial<RecurringProject>
  ) => Promise<RecurringProject>;
  updateRecurringProject: (
    id: string,
    updates: RecurringProjectUpdate
  ) => Promise<RecurringProject>;
  deleteRecurringProject: (id: string) => Promise<void>;

  // Status operations
  toggleRecurringProjectActive: (
    id: string,
    isActive: boolean
  ) => Promise<void>;

  // Generation operations
  generateManualOccurrence: (
    data: RecurringProjectOccurrence
  ) => Promise<string>;

  // Recurrence operations
  getUpcomingOccurrences: (days: number) => Promise<RecurringProject[]>;
  getDueThisWeek: () => Promise<number>;
  getTotalActive: () => Promise<number>;
}

// Create the context with an undefined initial value
const RecurringProjectContext = createContext<
  RecurringProjectContextType | undefined
>(undefined);

// Provider component
export const RecurringProjectProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [recurringProjects, setRecurringProjects] = useState<
    RecurringProject[]
  >([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    const loadRecurringProjects = async () => {
      setLoading(true);
      try {
        // Fetch recurring projects from API
        const fetchedProjects = await recurringService.getAllRecurringProjects();
        setRecurringProjects(fetchedProjects);
        setError(null);
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError.message || 'Failed to load recurring projects');
        console.error('Error loading recurring projects:', err);
      } finally {
        setLoading(false);
      }
    };

    loadRecurringProjects();
  }, []);

  // Get all recurring projects with optional filters
  const getAllRecurringProjects = async (
    filters?: RecurringProjectFilter
  ): Promise<RecurringProject[]> => {
    setLoading(true);
    try {
      const fetchedProjects = await recurringService.getAllRecurringProjects(filters);
      
      // Update local state if no filters were applied
      if (!filters) {
        setRecurringProjects(fetchedProjects);
      }
      
      return fetchedProjects;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to fetch recurring projects');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get a single recurring project by ID
  const getRecurringProjectById = async (
    id: string
  ): Promise<RecurringProject | null> => {
    setLoading(true);
    try {
      const project = await recurringService.getRecurringProjectById(id);
      return project;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || `Failed to fetch recurring project with ID: ${id}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Create a new recurring project
  const createRecurringProject = async (
    project: Partial<RecurringProject>
  ): Promise<RecurringProject> => {
    setLoading(true);
    try {
      const newProject = await recurringService.createRecurringProject(project);
      
      // Update local state
      setRecurringProjects((prev) => [...prev, newProject]);
      
      return newProject;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to create recurring project');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update an existing recurring project
  const updateRecurringProject = async (
    id: string,
    updates: RecurringProjectUpdate
  ): Promise<RecurringProject> => {
    setLoading(true);
    try {
      const updatedProject = await recurringService.updateRecurringProject(id, updates);
      
      // Update local state
      setRecurringProjects((prev) =>
        prev.map((p) => (p.id === id ? updatedProject : p))
      );
      
      return updatedProject;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || `Failed to update recurring project with ID: ${id}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete a recurring project
  const deleteRecurringProject = async (id: string): Promise<void> => {
    setLoading(true);
    try {
      await recurringService.deleteRecurringProject(id);
      
      // Update local state
      setRecurringProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || `Failed to delete recurring project with ID: ${id}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Toggle a project's active state
  const toggleRecurringProjectActive = async (
    id: string,
    isActive: boolean
  ): Promise<void> => {
    setLoading(true);
    try {
      await recurringService.toggleRecurringProjectActive(id, isActive);
      
      // Update local state
      setRecurringProjects((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, isActive, modifiedAt: new Date().toISOString() }
            : p
        )
      );
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 
        `Failed to toggle active state for recurring project with ID: ${id}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Generate a manual occurrence of a recurring project
  const generateManualOccurrence = async (
    data: RecurringProjectOccurrence
  ): Promise<string> => {
    setLoading(true);
    try {
      const projectId = await recurringService.generateManualOccurrence(data);
      
      // Update the recurring project in local state
      const updatedProject = await getRecurringProjectById(data.recurringProjectId);
      if (updatedProject) {
        setRecurringProjects((prev) =>
          prev.map((p) => (p.id === data.recurringProjectId ? updatedProject : p))
        );
      }
      
      return projectId;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || `Failed to generate project occurrence`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get projects due in the next X days
  const getUpcomingOccurrences = async (days: number): Promise<RecurringProject[]> => {
    setLoading(true);
    try {
      return await recurringService.getUpcomingOccurrences(days);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || `Failed to fetch upcoming occurrences`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get count of projects due this week
  const getDueThisWeek = async (): Promise<number> => {
    try {
      return await recurringService.getDueThisWeek();
    } catch (err) {
      const apiError = err as ApiError;
      console.error('Error getting projects due this week:', err);
      return 0; // Return 0 instead of throwing to avoid breaking the UI
    }
  };

  // Get count of active recurring projects
  const getTotalActive = async (): Promise<number> => {
    try {
      return await recurringService.getTotalActive();
    } catch (err) {
      const apiError = err as ApiError;
      console.error('Error getting total active projects:', err);
      return 0; // Return 0 instead of throwing to avoid breaking the UI
    }
  };

  // Value object to be provided to consumers
  const value: RecurringProjectContextType = {
    recurringProjects,
    loading,
    error,
    getAllRecurringProjects,
    getRecurringProjectById,
    createRecurringProject,
    updateRecurringProject,
    deleteRecurringProject,
    toggleRecurringProjectActive,
    generateManualOccurrence,
    getUpcomingOccurrences,
    getDueThisWeek,
    getTotalActive,
  };

  return (
    <RecurringProjectContext.Provider value={value}>
      {children}
    </RecurringProjectContext.Provider>
  );
};

// Export the hook for easy context use
export const useRecurringProjects = () => {
  const context = useContext(RecurringProjectContext);
  if (context === undefined) {
    throw new Error(
      'useRecurringProjects must be used within a RecurringProjectProvider'
    );
  }
  return context;
};

// Export the context as default
export default RecurringProjectContext;