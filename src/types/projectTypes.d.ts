// src/types/projectTypes.d.ts
// This file provides TypeScript declarations to fix conflicts between different Project interfaces

import { ProjectStatus } from './projectTimeline';

/**
 * Unified Project interface that should work with components from different parts of the application.
 * It's a superset of all Project interfaces used in the application.
 */
declare global {
  interface UnifiedProject {
    // Common required fields
    id: string;
    name: string;

    // Fields from ProjectTimeline.Project
    status: ProjectStatus;
    startDate: Date | string;
    dueDate: Date | string; // Also used as deadline
    completedDate?: Date | string;
    progress?: number;
    completionPercentage?: number;
    projectType?: string; // Also used as type
    salesId?: string;
    templateId?: string;
    customer?: string; // Also used for client
    notes?: string;
    description?: string;

    // Fields from ProjectDetail.Project
    type?: string; // Alternative to projectType
    client?: { name: string }; // Alternative to customer
    deadline?: Date | string; // Alternative to dueDate
    skillLevel?: string;
    components?: { name?: string }[];
    materials?: { name?: string }[];
  }

  /**
   * Helper function to convert any Project type to a unified representation
   */
  function toUnifiedProject(project: any): UnifiedProject;
}

/**
 * Helper functions to convert between different Project representations
 */
export function convertTimelineProjectToDetailProject(
  timelineProject: import('./projectTimeline').Project
): {
  id: string;
  name: string;
  status: string;
  type: string;
  client?: { name: string };
  startDate?: Date | string;
  deadline?: Date | string;
  completedDate?: Date | string;
  skillLevel?: string;
  progress?: number;
  components?: { name?: string }[];
  materials?: { name?: string }[];
  notes?: string;
};

/**
 * Convert Project from enums.ts ProjectType to projectTimeline.ts ProjectStatus
 */
export function mapProjectTypeStatus(
  status: string,
  sourceEnum: any,
  targetEnum: any
): string;
