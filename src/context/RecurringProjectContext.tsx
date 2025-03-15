// src/context/RecurringProjectContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  calculateNextOccurrence,
  GeneratedProject,
  RecurrencePattern,
  RecurringProject,
  RecurringProjectFilter,
  RecurringProjectOccurrence,
} from '../types/recurringProject';

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
    updates: Partial<RecurringProject>
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
  getUpcomingOccurrences: (days: number) => RecurringProject[];
  getDueThisWeek: () => number;
  getTotalActive: () => number;
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
        // In a real app, this would be an API call
        // For now, we'll load from localStorage if available
        const savedProjects = localStorage.getItem('recurringProjects');
        if (savedProjects) {
          setRecurringProjects(JSON.parse(savedProjects));
        }
      } catch (err) {
        setError('Failed to load recurring projects');
        console.error('Error loading recurring projects:', err);
      } finally {
        setLoading(false);
      }
    };

    loadRecurringProjects();
  }, []);

  // Save to localStorage when projects change
  useEffect(() => {
    if (recurringProjects.length > 0) {
      localStorage.setItem(
        'recurringProjects',
        JSON.stringify(recurringProjects)
      );
    }
  }, [recurringProjects]);

  // Get all recurring projects with optional filters
  const getAllRecurringProjects = async (
    filters?: RecurringProjectFilter
  ): Promise<RecurringProject[]> => {
    setLoading(true);
    try {
      let filteredProjects = [...recurringProjects];

      // Apply filters if provided
      if (filters) {
        if (filters.clientId) {
          filteredProjects = filteredProjects.filter(
            (p) => p.clientId === filters.clientId
          );
        }
        if (filters.projectType) {
          filteredProjects = filteredProjects.filter(
            (p) => p.projectType === filters.projectType
          );
        }
        if (filters.isActive !== undefined) {
          filteredProjects = filteredProjects.filter(
            (p) => p.isActive === filters.isActive
          );
        }
        if (filters.searchText) {
          const searchLower = filters.searchText.toLowerCase();
          filteredProjects = filteredProjects.filter(
            (p) =>
              p.name.toLowerCase().includes(searchLower) ||
              p.description.toLowerCase().includes(searchLower)
          );
        }
      }

      return filteredProjects;
    } catch (err) {
      setError('Failed to fetch recurring projects');
      console.error('Error fetching recurring projects:', err);
      return [];
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
      const project = recurringProjects.find((p) => p.id === id);
      return project || null;
    } catch (err) {
      setError(`Failed to fetch recurring project with ID: ${id}`);
      console.error(`Error fetching recurring project with ID: ${id}`, err);
      return null;
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
      const now = new Date().toISOString();

      // Calculate the next occurrence date
      const nextOccurrence = project.recurrencePattern
        ? calculateNextOccurrence(project.recurrencePattern)?.toISOString()
        : undefined;

      const newProject: RecurringProject = {
        id: `recurring-${Date.now()}`,
        templateId: project.templateId || '',
        name: project.name || 'Untitled Recurring Project',
        description: project.description || '',
        projectType: project.projectType || ('WALLET' as any), // Default to wallet if not specified
        skillLevel: project.skillLevel || ('INTERMEDIATE' as any), // Default to intermediate if not specified
        duration: project.duration || 7, // Default to 7 days
        components: project.components || [],
        recurrencePattern: project.recurrencePattern as RecurrencePattern, // Required
        isActive: project.isActive ?? true, // Default to active
        nextOccurrence,
        totalOccurrences: 0,
        autoGenerate: project.autoGenerate ?? true,
        advanceNoticeDays: project.advanceNoticeDays || 3,
        generatedProjects: [],
        createdBy: project.createdBy || 'user',
        createdAt: now,
        modifiedAt: now,
        clientId: project.clientId,
      };

      setRecurringProjects((prev) => [...prev, newProject]);
      return newProject;
    } catch (err) {
      setError('Failed to create recurring project');
      console.error('Error creating recurring project:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update an existing recurring project
  const updateRecurringProject = async (
    id: string,
    updates: Partial<RecurringProject>
  ): Promise<RecurringProject> => {
    setLoading(true);
    try {
      const existingProject = recurringProjects.find((p) => p.id === id);
      if (!existingProject) {
        throw new Error(`Recurring project with ID ${id} not found`);
      }

      // Calculate the next occurrence date if the recurrence pattern is updated
      const nextOccurrence = updates.recurrencePattern
        ? calculateNextOccurrence(updates.recurrencePattern)?.toISOString()
        : existingProject.nextOccurrence;

      const updatedProject: RecurringProject = {
        ...existingProject,
        ...updates,
        nextOccurrence,
        modifiedAt: new Date().toISOString(),
      };

      setRecurringProjects((prev) =>
        prev.map((p) => (p.id === id ? updatedProject : p))
      );

      return updatedProject;
    } catch (err) {
      setError(`Failed to update recurring project with ID: ${id}`);
      console.error(`Error updating recurring project with ID: ${id}`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete a recurring project
  const deleteRecurringProject = async (id: string): Promise<void> => {
    setLoading(true);
    try {
      setRecurringProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError(`Failed to delete recurring project with ID: ${id}`);
      console.error(`Error deleting recurring project with ID: ${id}`, err);
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
      setRecurringProjects((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, isActive, modifiedAt: new Date().toISOString() }
            : p
        )
      );
    } catch (err) {
      setError(
        `Failed to toggle active state for recurring project with ID: ${id}`
      );
      console.error(
        `Error toggling active state for recurring project with ID: ${id}`,
        err
      );
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
      const recurringProject = recurringProjects.find(
        (p) => p.id === data.recurringProjectId
      );
      if (!recurringProject) {
        throw new Error(
          `Recurring project with ID ${data.recurringProjectId} not found`
        );
      }

      // Create a new generated project instance
      const scheduledDate = new Date(data.scheduledDate);
      const projectId = `project-${Date.now()}`;

      const generatedProject: GeneratedProject = {
        id: `gen-${Date.now()}`,
        projectId,
        recurringProjectId: data.recurringProjectId,
        occurrenceNumber: recurringProject.totalOccurrences + 1,
        scheduledDate: data.scheduledDate,
        actualGenerationDate: new Date().toISOString(),
        status: 'generated',
        // Handle the notes property correctly
        notes:
          data.customizations && 'notes' in data.customizations
            ? (data.customizations as any).notes || ''
            : '',
      };

      // Update the recurring project with the new occurrence
      const updatedRecurringProject: RecurringProject = {
        ...recurringProject,
        totalOccurrences: recurringProject.totalOccurrences + 1,
        lastOccurrence: data.scheduledDate,
        generatedProjects: [
          ...recurringProject.generatedProjects,
          generatedProject,
        ],
        modifiedAt: new Date().toISOString(),
      };

      // Calculate the next occurrence
      updatedRecurringProject.nextOccurrence = calculateNextOccurrence(
        updatedRecurringProject.recurrencePattern,
        scheduledDate
      )?.toISOString();

      // Update recurring projects list
      setRecurringProjects((prev) =>
        prev.map((p) =>
          p.id === data.recurringProjectId ? updatedRecurringProject : p
        )
      );

      // In a real implementation, you would create the actual project in your projects database
      // and return its ID. For now, we just return a mock ID.
      return projectId;
    } catch (err) {
      setError(`Failed to generate project occurrence`);
      console.error(`Error generating project occurrence`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get projects due in the next X days
  const getUpcomingOccurrences = (days: number): RecurringProject[] => {
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + days);

    return recurringProjects.filter((project) => {
      const nextOccurrence = project.nextOccurrence
        ? new Date(project.nextOccurrence)
        : null;
      return project.isActive && nextOccurrence && nextOccurrence <= futureDate;
    });
  };

  // Get count of projects due this week
  const getDueThisWeek = (): number => {
    return getUpcomingOccurrences(7).length;
  };

  // Get count of active recurring projects
  const getTotalActive = (): number => {
    return recurringProjects.filter((p) => p.isActive).length;
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
