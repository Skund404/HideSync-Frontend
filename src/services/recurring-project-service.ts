// src/services/recurring-project-service.ts
import { ProjectType, SkillLevel } from '@/types/enums';
import {
  RecurrenceFrequency,
  RecurrencePattern,
  RecurringProject,
  RecurringProjectFilter,
  RecurringProjectOccurrence,
  RecurringProjectUpdate,
} from '@/types/recurringProject';
import { numberIdToString, stringIdToNumber } from '@/utils/idConversion';
import { apiClient } from './api-client'; // ApiError kept for type reference

/**
 * Helper functions with explicit return types to ensure type safety
 */
function ensureString(value: any): string {
  if (value === undefined || value === null) {
    return '';
  }
  return String(value);
}

function ensureStringId(value: any): string {
  if (value === undefined || value === null) {
    return '0';
  }
  // Fix for line 28: Use nullish coalescing to handle undefined return values
  const result = numberIdToString(typeof value === 'number' ? value : 0);
  return result ?? '0'; // Ensure we always return a string
}

function ensureNumber(value: any): number {
  if (value === undefined || value === null) {
    return 0;
  }
  return Number(value) || 0;
}

function ensureBoolean(value: any): boolean {
  return Boolean(value);
}

function ensureArray<T>(value: any, mapFn?: (item: any) => T): T[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return mapFn ? value.map(mapFn) : value;
}

function ensureDate(value: any): string {
  if (!value) {
    return new Date().toISOString();
  }
  return typeof value === 'string' ? value : new Date(value).toISOString();
}

// Ensure the status is one of the allowed values
function ensureValidStatus(
  status: any
): 'scheduled' | 'generated' | 'skipped' | 'failed' {
  const validValues = ['scheduled', 'generated', 'skipped', 'failed'];
  const normalizedStatus = String(status || '').toLowerCase();

  if (validValues.includes(normalizedStatus)) {
    return normalizedStatus as 'scheduled' | 'generated' | 'skipped' | 'failed';
  }

  return 'scheduled'; // Default value
}

const BASE_URL = '/recurring-projects';

/**
 * Get all recurring projects with optional filtering
 * @param filters Optional filters for recurring projects
 * @returns Promise with array of recurring projects
 */
export const getAllRecurringProjects = async (
  filters?: RecurringProjectFilter
): Promise<RecurringProject[]> => {
  try {
    // Build query parameters for filtering
    const params: Record<string, string | boolean> = {};

    if (filters?.clientId) {
      params.client_id = filters.clientId;
    }

    if (filters?.projectType) {
      params.project_type = filters.projectType.toLowerCase(); // Backend uses lowercase
    }

    if (filters?.isActive !== undefined) {
      params.is_active = filters.isActive;
    }

    if (filters?.createdBy) {
      params.created_by = filters.createdBy;
    }

    if (filters?.searchText) {
      params.search = filters.searchText;
    }

    const response = await apiClient.get<{ data: any[] }>(BASE_URL, { params });
    return response.data.data.map(mapApiToRecurringProject);
  } catch (error) {
    console.error('Error fetching recurring projects:', error);
    throw formatApiError(error);
  }
};

/**
 * Get a recurring project by ID
 * @param id Recurring project ID
 * @returns Promise with recurring project if found
 */
export const getRecurringProjectById = async (
  id: string
): Promise<RecurringProject | null> => {
  try {
    // Convert string ID to number for API
    const numericId = stringIdToNumber(id);

    const response = await apiClient.get<{ data: any }>(
      `${BASE_URL}/${numericId}`
    );
    return mapApiToRecurringProject(response.data.data);
  } catch (error) {
    console.error(`Error fetching recurring project with ID ${id}:`, error);
    throw formatApiError(error);
  }
};

/**
 * Create a new recurring project
 * @param projectData Recurring project data
 * @returns Promise with created recurring project
 */
export const createRecurringProject = async (
  projectData: Partial<RecurringProject>
): Promise<RecurringProject> => {
  try {
    // Transform the recurring project data to match API expectations
    const apiRecurring = mapRecurringToApiRecurring(projectData);

    const response = await apiClient.post<{ data: any }>(
      BASE_URL,
      apiRecurring
    );
    return mapApiToRecurringProject(response.data.data);
  } catch (error) {
    console.error('Error creating recurring project:', error);
    throw formatApiError(error);
  }
};

/**
 * Update an existing recurring project
 * @param id Recurring project ID
 * @param updates Partial recurring project data to update
 * @returns Promise with updated recurring project
 */
export const updateRecurringProject = async (
  id: string,
  updates: RecurringProjectUpdate
): Promise<RecurringProject> => {
  try {
    // Convert string ID to number for API
    const numericId = stringIdToNumber(id);

    // Transform the update data to match API expectations
    const apiRecurringUpdates = mapRecurringUpdateToApiRecurring(updates);

    const response = await apiClient.patch<{ data: any }>(
      `${BASE_URL}/${numericId}`,
      apiRecurringUpdates
    );
    return mapApiToRecurringProject(response.data.data);
  } catch (error) {
    console.error(`Error updating recurring project with ID ${id}:`, error);
    throw formatApiError(error);
  }
};

/**
 * Delete a recurring project
 * @param id Recurring project ID
 * @returns Promise that resolves when successful
 */
export const deleteRecurringProject = async (id: string): Promise<void> => {
  try {
    // Convert string ID to number for API
    const numericId = stringIdToNumber(id);

    await apiClient.delete(`${BASE_URL}/${numericId}`);
  } catch (error) {
    console.error(`Error deleting recurring project with ID ${id}:`, error);
    throw formatApiError(error);
  }
};

/**
 * Toggle the active state of a recurring project
 * @param id Recurring project ID
 * @param isActive New active state
 * @returns Promise resolving when successful
 */
export const toggleRecurringProjectActive = async (
  id: string,
  isActive: boolean
): Promise<void> => {
  try {
    // Convert string ID to number for API
    const numericId = stringIdToNumber(id);

    await apiClient.patch(`${BASE_URL}/${numericId}/toggle-active`, {
      is_active: isActive,
    });
  } catch (error) {
    console.error(
      `Error toggling active state for recurring project ${id}:`,
      error
    );
    throw formatApiError(error);
  }
};

/**
 * Generate a manual occurrence of a recurring project
 * @param data Occurrence data
 * @returns Promise with ID of the generated project
 */
export const generateManualOccurrence = async (
  data: RecurringProjectOccurrence
): Promise<string> => {
  try {
    // Convert string ID to number for API
    const numericId = stringIdToNumber(data.recurringProjectId);

    // Format the request payload
    const payload = {
      scheduled_date:
        data.scheduledDate instanceof Date
          ? data.scheduledDate.toISOString()
          : data.scheduledDate,
      client_id: data.clientId ? stringIdToNumber(data.clientId) : undefined,
      customizations: data.customizations
        ? {
            name: data.customizations.name,
            description: data.customizations.description,
            components: data.customizations.components,
            duration: data.customizations.duration,
          }
        : undefined,
    };

    const response = await apiClient.post<{ data: any }>(
      `${BASE_URL}/${numericId}/generate`,
      payload
    );

    // Ensure the returned project id is always a valid string
    const projectId = ensureStringId(response.data.data.project_id);
    return projectId;
  } catch (error) {
    console.error('Error generating recurring project occurrence:', error);
    throw formatApiError(error);
  }
};

/**
 * Get upcoming occurrences for active recurring projects
 * @param days Number of days to look ahead
 * @returns Promise with array of recurring projects due in the next X days
 */
export const getUpcomingOccurrences = async (
  days: number
): Promise<RecurringProject[]> => {
  try {
    const response = await apiClient.get<{ data: any[] }>(
      `${BASE_URL}/upcoming`,
      {
        params: { days },
      }
    );

    return response.data.data.map(mapApiToRecurringProject);
  } catch (error) {
    console.error(
      `Error fetching upcoming occurrences for next ${days} days:`,
      error
    );
    throw formatApiError(error);
  }
};

/**
 * Get recurring projects due this week
 * @returns Promise with count of recurring projects due this week
 */
export const getDueThisWeek = async (): Promise<number> => {
  try {
    const response = await apiClient.get<{ data: { count: number } }>(
      `${BASE_URL}/due-this-week`
    );
    return response.data.data.count;
  } catch (error) {
    console.error('Error fetching recurring projects due this week:', error);
    throw formatApiError(error);
  }
};

/**
 * Get count of active recurring projects
 * @returns Promise with count of active recurring projects
 */
export const getTotalActive = async (): Promise<number> => {
  try {
    const response = await apiClient.get<{ data: { count: number } }>(
      `${BASE_URL}/count`,
      {
        params: { is_active: true },
      }
    );
    return response.data.data.count;
  } catch (error) {
    console.error('Error fetching active recurring projects count:', error);
    throw formatApiError(error);
  }
};

// ============ Helper Functions ============

/**
 * Creates a RecurringProject object from API data
 * Ensures all required fields have valid values by using the ensure helper functions
 */
function mapApiToRecurringProject(apiRecurring: any): RecurringProject {
  if (!apiRecurring) {
    throw new Error('Cannot create recurring project from empty data');
  }

  // Create RecurrencePattern with guaranteed non-undefined values
  const recurrencePattern: RecurrencePattern = {
    id: ensureStringId(apiRecurring.recurrence_pattern?.id),
    name: ensureString(apiRecurring.recurrence_pattern?.name),
    frequency: ensureString(
      apiRecurring.recurrence_pattern?.frequency || 'daily'
    ) as RecurrenceFrequency,
    interval: ensureNumber(apiRecurring.recurrence_pattern?.interval || 1),
    startDate: ensureDate(apiRecurring.recurrence_pattern?.start_date),
    endDate: apiRecurring.recurrence_pattern?.end_date,
    endAfterOccurrences: apiRecurring.recurrence_pattern?.end_after_occurrences,
    daysOfWeek: ensureArray(apiRecurring.recurrence_pattern?.days_of_week),
    dayOfMonth: apiRecurring.recurrence_pattern?.day_of_month,
    weekOfMonth: apiRecurring.recurrence_pattern?.week_of_month,
    dayOfWeekMonthly: apiRecurring.recurrence_pattern?.day_of_week_monthly,
    month: apiRecurring.recurrence_pattern?.month,
    customDates: ensureArray(apiRecurring.recurrence_pattern?.custom_dates),
    skipWeekends: ensureBoolean(apiRecurring.recurrence_pattern?.skip_weekends),
    skipHolidays: ensureBoolean(apiRecurring.recurrence_pattern?.skip_holidays),
    holidays: ensureArray(apiRecurring.recurrence_pattern?.holidays),
    disabledDateHandling:
      apiRecurring.recurrence_pattern?.disabled_date_handling,
    customExpression: apiRecurring.recurrence_pattern?.custom_expression,
  };

  // Create components with guaranteed non-undefined values
  const components = ensureArray(apiRecurring.components, (comp: any) => ({
    id: ensureStringId(comp.id),
    name: ensureString(comp.name),
    description: ensureString(comp.description),
  }));

  // Create generated projects with guaranteed non-undefined values and proper status type
  const generatedProjects = ensureArray(
    apiRecurring.generated_projects,
    (gen: any) => ({
      id: ensureStringId(gen.id),
      projectId: ensureStringId(gen.project_id),
      recurringProjectId: ensureStringId(gen.recurring_project_id),
      occurrenceNumber: ensureNumber(gen.occurrence_number),
      scheduledDate: ensureDate(gen.scheduled_date),
      actualGenerationDate: ensureDate(gen.actual_generation_date),
      status: ensureValidStatus(gen.status),
      notes: gen.notes,
    })
  );

  // Create the recurring project with all required fields guaranteed to be non-undefined
  return {
    id: ensureStringId(apiRecurring.id),
    templateId: ensureStringId(apiRecurring.template_id),
    name: ensureString(apiRecurring.name),
    description: ensureString(apiRecurring.description),
    projectType:
      (ensureString(apiRecurring.project_type).toUpperCase() as ProjectType) ||
      ProjectType.OTHER,
    skillLevel:
      (ensureString(apiRecurring.skill_level).toUpperCase() as SkillLevel) ||
      SkillLevel.BEGINNER,
    clientId: apiRecurring.client_id
      ? ensureStringId(apiRecurring.client_id)
      : undefined,
    duration: ensureNumber(apiRecurring.duration),
    components,
    recurrencePattern,
    isActive: ensureBoolean(apiRecurring.is_active),
    nextOccurrence: apiRecurring.next_occurrence,
    lastOccurrence: apiRecurring.last_occurrence,
    totalOccurrences: ensureNumber(apiRecurring.total_occurrences),
    remainingOccurrences: apiRecurring.remaining_occurrences,
    autoGenerate: ensureBoolean(apiRecurring.auto_generate),
    advanceNoticeDays: ensureNumber(apiRecurring.advance_notice_days),
    projectSuffix: apiRecurring.project_suffix,
    generatedProjects,
    createdBy: ensureString(apiRecurring.created_by),
    createdAt: ensureDate(apiRecurring.created_at),
    modifiedAt: ensureDate(apiRecurring.modified_at),
  };
}

/**
 * Maps our frontend RecurringProject type to API expected format
 * @param project Recurring project from frontend
 * @returns Formatted recurring project data for API
 */
function mapRecurringToApiRecurring(project: Partial<RecurringProject>): any {
  const apiRecurring: Record<string, any> = {
    template_id: project.templateId
      ? stringIdToNumber(project.templateId)
      : null,
    name: project.name,
    description: project.description || '',
    project_type: project.projectType?.toLowerCase(), // Backend uses lowercase
    skill_level: project.skillLevel?.toLowerCase(), // Backend uses lowercase
    client_id: project.clientId ? stringIdToNumber(project.clientId) : null,
    duration: project.duration,
    is_active: project.isActive,
    auto_generate: project.autoGenerate,
    advance_notice_days: project.advanceNoticeDays,
    project_suffix: project.projectSuffix,
  };

  // Add components if provided
  if (project.components && project.components.length > 0) {
    apiRecurring.components = project.components.map((comp) => ({
      name: comp.name,
      description: comp.description,
    }));
  }

  // Add recurrence pattern if provided
  if (project.recurrencePattern) {
    apiRecurring.recurrence_pattern = {
      name: project.recurrencePattern.name,
      frequency: project.recurrencePattern.frequency.toLowerCase(), // Backend uses lowercase
      interval: project.recurrencePattern.interval,
      start_date: project.recurrencePattern.startDate,
      end_date: project.recurrencePattern.endDate,
      end_after_occurrences: project.recurrencePattern.endAfterOccurrences,
      days_of_week: project.recurrencePattern.daysOfWeek,
      day_of_month: project.recurrencePattern.dayOfMonth,
      week_of_month: project.recurrencePattern.weekOfMonth,
      day_of_week_monthly: project.recurrencePattern.dayOfWeekMonthly,
      month: project.recurrencePattern.month,
      custom_dates: project.recurrencePattern.customDates,
      skip_weekends: project.recurrencePattern.skipWeekends,
      skip_holidays: project.recurrencePattern.skipHolidays,
      holidays: project.recurrencePattern.holidays,
      disabled_date_handling: project.recurrencePattern.disabledDateHandling,
      custom_expression: project.recurrencePattern.customExpression,
    };
  }

  return apiRecurring;
}

/**
 * Maps recurring project update to API format
 * @param updates Recurring project updates from frontend
 * @returns Formatted recurring project update data for API
 */
function mapRecurringUpdateToApiRecurring(
  updates: RecurringProjectUpdate
): any {
  const apiUpdates: Record<string, any> = {};

  if (updates.name !== undefined) apiUpdates.name = updates.name;
  if (updates.description !== undefined)
    apiUpdates.description = updates.description;
  if (updates.isActive !== undefined) apiUpdates.is_active = updates.isActive;
  if (updates.autoGenerate !== undefined)
    apiUpdates.auto_generate = updates.autoGenerate;
  if (updates.advanceNoticeDays !== undefined)
    apiUpdates.advance_notice_days = updates.advanceNoticeDays;
  if (updates.projectSuffix !== undefined)
    apiUpdates.project_suffix = updates.projectSuffix;

  // Handle partial recurrence pattern updates
  if (updates.recurrencePattern) {
    apiUpdates.recurrence_pattern = {};

    if (updates.recurrencePattern.name !== undefined) {
      apiUpdates.recurrence_pattern.name = updates.recurrencePattern.name;
    }

    if (updates.recurrencePattern.frequency !== undefined) {
      apiUpdates.recurrence_pattern.frequency =
        updates.recurrencePattern.frequency.toLowerCase();
    }

    if (updates.recurrencePattern.interval !== undefined) {
      apiUpdates.recurrence_pattern.interval =
        updates.recurrencePattern.interval;
    }

    if (updates.recurrencePattern.startDate !== undefined) {
      apiUpdates.recurrence_pattern.start_date =
        updates.recurrencePattern.startDate;
    }

    if (updates.recurrencePattern.endDate !== undefined) {
      apiUpdates.recurrence_pattern.end_date =
        updates.recurrencePattern.endDate;
    }

    if (updates.recurrencePattern.endAfterOccurrences !== undefined) {
      apiUpdates.recurrence_pattern.end_after_occurrences =
        updates.recurrencePattern.endAfterOccurrences;
    }

    if (updates.recurrencePattern.daysOfWeek !== undefined) {
      apiUpdates.recurrence_pattern.days_of_week =
        updates.recurrencePattern.daysOfWeek;
    }

    if (updates.recurrencePattern.dayOfMonth !== undefined) {
      apiUpdates.recurrence_pattern.day_of_month =
        updates.recurrencePattern.dayOfMonth;
    }

    if (updates.recurrencePattern.weekOfMonth !== undefined) {
      apiUpdates.recurrence_pattern.week_of_month =
        updates.recurrencePattern.weekOfMonth;
    }

    if (updates.recurrencePattern.dayOfWeekMonthly !== undefined) {
      apiUpdates.recurrence_pattern.day_of_week_monthly =
        updates.recurrencePattern.dayOfWeekMonthly;
    }

    if (updates.recurrencePattern.month !== undefined) {
      apiUpdates.recurrence_pattern.month = updates.recurrencePattern.month;
    }

    if (updates.recurrencePattern.customDates !== undefined) {
      apiUpdates.recurrence_pattern.custom_dates =
        updates.recurrencePattern.customDates;
    }

    if (updates.recurrencePattern.skipWeekends !== undefined) {
      apiUpdates.recurrence_pattern.skip_weekends =
        updates.recurrencePattern.skipWeekends;
    }

    if (updates.recurrencePattern.skipHolidays !== undefined) {
      apiUpdates.recurrence_pattern.skip_holidays =
        updates.recurrencePattern.skipHolidays;
    }

    if (updates.recurrencePattern.holidays !== undefined) {
      apiUpdates.recurrence_pattern.holidays =
        updates.recurrencePattern.holidays;
    }

    if (updates.recurrencePattern.disabledDateHandling !== undefined) {
      apiUpdates.recurrence_pattern.disabled_date_handling =
        updates.recurrencePattern.disabledDateHandling;
    }

    if (updates.recurrencePattern.customExpression !== undefined) {
      apiUpdates.recurrence_pattern.custom_expression =
        updates.recurrencePattern.customExpression;
    }
  }

  return apiUpdates;
}

/**
 * Format API error into a consistent structure
 * @param error Error from API request
 * @returns Formatted error
 */
function formatApiError(error: any): Error {
  if (error.message) {
    return new Error(error.message);
  }
  return new Error('An error occurred while communicating with the server');
}
