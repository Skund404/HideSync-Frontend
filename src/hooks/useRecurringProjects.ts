// src/hooks/useRecurringProjects.ts
import { useContext } from 'react';
import RecurringProjectContext from '../context/RecurringProjectContext';
import {
  RecurringProject,
  RecurringProjectFilter,
  RecurringProjectOccurrence,
} from '../types/recurringProject';

// Define a proper interface for recurring projects context
export interface RecurringProjectsContextType {
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
}

export function useRecurringProjects() {
  // Cast the context to the correct type
  const context = useContext(
    RecurringProjectContext
  ) as unknown as RecurringProjectsContextType;

  if (!context) {
    throw new Error(
      'useRecurringProjects must be used within a RecurringProjectProvider'
    );
  }

  // Add helper functions for dashboard-specific metrics
  const getDueThisWeek = () => {
    const today = new Date();
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + 7);

    return (
      context.recurringProjects?.filter((project) => {
        const nextOccurrence = project.nextOccurrence
          ? new Date(project.nextOccurrence)
          : null;
        return nextOccurrence && nextOccurrence <= endOfWeek;
      }).length || 0
    );
  };

  return {
    ...context,
    dueThisWeek: getDueThisWeek(),
    totalRecurring: context.recurringProjects?.length || 0,
  };
}
