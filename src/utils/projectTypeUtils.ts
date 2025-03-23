// src/utils/projectTypeUtils.ts

import { ProjectType } from '../types/enums';
import {
  Project as TimelineProject,
  ProjectStatus,
} from '../types/projectTimeline';

/**
 * Adapter interface that matches what ProjectDetail.tsx expects
 */
export interface DetailProject {
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
}

/**
 * Converts a TimelineProject to a DetailProject
 * @param project The source project from projectTimeline.ts
 * @returns A project matching the interface expected by ProjectDetail.tsx
 */
export function convertToDetailProject(
  project: TimelineProject
): DetailProject {
  return {
    id: project.id,
    name: project.name,
    status: project.status,
    type: project.projectType || 'OTHER',
    client: project.customer ? { name: project.customer } : undefined,
    startDate: project.startDate,
    deadline: project.dueDate,
    completedDate: project.completedDate,
    skillLevel: 'INTERMEDIATE', // Default since not in TimelineProject
    progress: project.progress || 0,
    components: [], // Would need to populate from elsewhere
    materials: [], // Would need to populate from elsewhere
    notes: project.notes,
  };
}

/**
 * Match project status enum values regardless of source
 * @param statusValue The status value to check
 * @param targetStatus The target status to compare against
 * @returns True if the statuses match by string value
 */
export function matchProjectStatus(
  statusValue: string | ProjectStatus,
  targetStatus: ProjectStatus
): boolean {
  return (
    String(statusValue).toUpperCase() === String(targetStatus).toUpperCase()
  );
}

/**
 * Match project type enum values regardless of source
 * @param typeValue The type value to check
 * @param targetType The target type to compare against
 * @returns True if the types match by string value
 */
export function matchProjectType(
  typeValue: string | ProjectType,
  targetType: ProjectType
): boolean {
  return String(typeValue).toUpperCase() === String(targetType).toUpperCase();
}

/**
 * Safely convert a ProjectType enum to a string
 * @param type The project type to format
 * @returns A formatted string with spaces instead of underscores
 */
export function formatProjectType(type?: string | ProjectType): string {
  if (!type) return 'Other';

  return String(type)
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Safely convert a ProjectStatus enum to a string
 * @param status The project status to format
 * @returns A formatted string with spaces instead of underscores
 */
export function formatProjectStatus(status?: string | ProjectStatus): string {
  if (!status) return 'Unknown';

  return String(status)
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
