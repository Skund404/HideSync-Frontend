// src/types/projectTypes.ts

import { ProjectType } from './enums';
import { ProjectStatus } from './projectTimeline';

/**
 * Interface for a Project as used in the application.
 * Acts as a common base for other Project implementations.
 */
export interface BaseProject {
  id: string;
  name: string;
  description?: string;
}

/**
 * Interface for project filtering capabilities
 */
export interface ProjectFilter {
  projectType?: ProjectType;
  status?: ProjectStatus;
  searchQuery?: string;
  dateRange?: {
    start?: Date;
    end?: Date;
  };
  clientId?: string;
}

/**
 * Helper function to convert between different Project formats
 * @param source The source project object
 * @param sourceType The format of the source project ('timeline', 'detail', etc.)
 * @param targetType The desired format of the result ('timeline', 'detail', etc.)
 * @returns A converted project in the target format
 */
export function convertProjectFormat(
  source: any,
  sourceType: string,
  targetType: string
): any {
  // Implementation for timeline -> detail conversion
  if (sourceType === 'timeline' && targetType === 'detail') {
    return {
      id: source.id,
      name: source.name,
      status: source.status,
      type: source.projectType || 'OTHER',
      client: source.customer ? { name: source.customer } : undefined,
      startDate: source.startDate,
      deadline: source.dueDate,
      completedDate: source.completedDate,
      skillLevel: 'INTERMEDIATE', // Default value
      progress: source.progress || 0,
      components: [], // Would need to be populated from elsewhere
      materials: [], // Would need to be populated from elsewhere
      notes: source.notes,
    };
  }

  // Implementation for detail -> timeline conversion
  if (sourceType === 'detail' && targetType === 'timeline') {
    return {
      id: source.id,
      name: source.name,
      status: source.status,
      projectType: source.type,
      startDate: source.startDate,
      dueDate: source.deadline,
      completedDate: source.completedDate,
      progress: source.progress || 0,
      completionPercentage: source.progress || 0,
      customer: source.client?.name,
      notes: source.notes,
    };
  }

  // Default case - return the source unchanged
  return source;
}

/**
 * Safely compares two project status values, even if they come from different enum types
 * @param value1 First status value
 * @param value2 Second status value
 * @returns True if the status values match
 */
export function compareProjectStatus(
  value1: string | ProjectStatus,
  value2: string | ProjectStatus
): boolean {
  // Normalize both values to uppercase strings for comparison
  return String(value1).toUpperCase() === String(value2).toUpperCase();
}
