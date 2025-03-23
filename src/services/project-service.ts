// src/services/project-service.ts
import { ProjectStatus } from '@/types/enums';
import { Project } from '@/types/projectTimeline';
import { safeNumberIdToString, stringIdToNumber } from '@/utils/idConversion';
import { apiClient } from './api-client';

const BASE_URL = '/projects';

/**
 * Get all projects with optional filtering
 * @param filters Optional filters for projects
 * @returns Promise with array of projects
 */
export const getProjects = async (filters?: {
  status?: ProjectStatus;
  customerId?: number;
  searchQuery?: string;
  dateRange?: { start?: Date; end?: Date };
}): Promise<Project[]> => {
  try {
    // Build query parameters for filtering
    const params: Record<string, string> = {};

    if (filters?.status) {
      params.status = filters.status.toLowerCase(); // Backend uses lowercase enum values
    }

    if (filters?.customerId) {
      params.customer_id = filters.customerId.toString();
    }

    if (filters?.searchQuery) {
      params.search = filters.searchQuery;
    }

    if (filters?.dateRange?.start) {
      params.start_date = filters.dateRange.start.toISOString().split('T')[0];
    }

    if (filters?.dateRange?.end) {
      params.end_date = filters.dateRange.end.toISOString().split('T')[0];
    }

    const response = await apiClient.get<{
      data: any[];
      meta: { total: number; page: number; per_page: number };
    }>(BASE_URL, { params });

    // Map response data to Project interface
    return response.data.data.map(mapApiProjectToProject);
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw formatApiError(error);
  }
};

/**
 * Get a project by ID
 * @param id Project ID
 * @returns Promise with project if found
 */
export const getProjectById = async (id: string): Promise<Project> => {
  try {
    // Convert string ID to number for API
    const numericId = stringIdToNumber(id);

    const response = await apiClient.get<{ data: any }>(
      `${BASE_URL}/${numericId}`
    );
    return mapApiProjectToProject(response.data.data);
  } catch (error) {
    console.error(`Error fetching project with ID ${id}:`, error);
    throw formatApiError(error);
  }
};

/**
 * Create a new project
 * @param projectData Project data
 * @returns Promise with created project
 */
export const createProject = async (
  projectData: Omit<Project, 'id'>
): Promise<Project> => {
  try {
    // Transform the project data to match API expectations
    const apiProject = mapProjectToApiProject(projectData);

    const response = await apiClient.post<{ data: any }>(BASE_URL, apiProject);
    return mapApiProjectToProject(response.data.data);
  } catch (error) {
    console.error('Error creating project:', error);
    throw formatApiError(error);
  }
};

/**
 * Update an existing project
 * @param id Project ID
 * @param updates Partial project data to update
 * @returns Promise with updated project
 */
export const updateProject = async (
  id: string,
  updates: Partial<Project>
): Promise<Project> => {
  try {
    // Convert string ID to number for API
    const numericId = stringIdToNumber(id);

    // Transform the update data to match API expectations
    const apiProjectUpdates = mapPartialProjectToApiProject(updates);

    const response = await apiClient.patch<{ data: any }>(
      `${BASE_URL}/${numericId}`,
      apiProjectUpdates
    );
    return mapApiProjectToProject(response.data.data);
  } catch (error) {
    console.error(`Error updating project with ID ${id}:`, error);
    throw formatApiError(error);
  }
};

/**
 * Delete a project
 * @param id Project ID
 * @returns Promise that resolves when successful
 */
export const deleteProject = async (id: string): Promise<void> => {
  try {
    // Convert string ID to number for API
    const numericId = stringIdToNumber(id);

    await apiClient.delete(`${BASE_URL}/${numericId}`);
  } catch (error) {
    console.error(`Error deleting project with ID ${id}:`, error);
    throw formatApiError(error);
  }
};

/**
 * Get all customers for project assignment
 * @returns Promise with array of customers
 */
export const getCustomers = async (): Promise<
  { id: string; name: string }[]
> => {
  try {
    const response = await apiClient.get<{ data: any[] }>('/customers');

    // Map response data to customer interface
    return response.data.data.map((customer) => ({
      id: safeNumberIdToString(customer.id), // Using the new utility function
      name: customer.name || '', // Ensure name is always a string
    }));
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw formatApiError(error);
  }
};

/**
 * Update project status
 * @param id Project ID
 * @param status New project status
 * @returns Promise with updated project
 */
export const updateProjectStatus = async (
  id: string,
  status: ProjectStatus
): Promise<Project> => {
  try {
    // Convert string ID to number for API
    const numericId = stringIdToNumber(id);

    const response = await apiClient.patch<{ data: any }>(
      `${BASE_URL}/${numericId}/status`,
      {
        status: status.toLowerCase(), // Backend uses lowercase enum values
      }
    );

    return mapApiProjectToProject(response.data.data);
  } catch (error) {
    console.error(`Error updating status for project ${id}:`, error);
    throw formatApiError(error);
  }
};

// ============ Helper Functions ============

/**
 * Maps API project data to our frontend Project type
 * @param apiProject Project data from API
 * @returns Project object for frontend
 */
function mapApiProjectToProject(apiProject: any): Project {
  return {
    id: safeNumberIdToString(apiProject.id), // Using the new utility function
    name: apiProject.name,
    description: apiProject.description || '',
    // Using type assertion to ensure compatibility between different ProjectStatus enums
    status: apiProject.status.toUpperCase() as unknown as Project['status'],
    startDate: apiProject.start_date,
    dueDate: apiProject.due_date,
    completedDate: apiProject.completed_date || undefined,
    progress: apiProject.progress || 0,
    completionPercentage: apiProject.completion_percentage || 0,
    projectType: apiProject.project_type,
    customer: apiProject.customer?.name || undefined,
    notes: apiProject.notes || '',
  };
}

/**
 * Maps our frontend Project type to API expected format
 * @param project Project from frontend
 * @returns Formatted project data for API
 */
function mapProjectToApiProject(project: Omit<Project, 'id'>): any {
  return {
    name: project.name,
    description: project.description || '',
    status: project.status.toLowerCase(), // Backend uses lowercase
    start_date:
      project.startDate instanceof Date
        ? project.startDate.toISOString()
        : project.startDate,
    due_date:
      project.dueDate instanceof Date
        ? project.dueDate.toISOString()
        : project.dueDate,
    completed_date: project.completedDate
      ? project.completedDate instanceof Date
        ? project.completedDate.toISOString()
        : project.completedDate
      : null,
    progress: project.progress || 0,
    completion_percentage: project.completionPercentage || 0,
    project_type: project.projectType,
    customer_id: project.customer ? stringIdToNumber(project.customer) : null, // Assuming customer is an ID
    notes: project.notes || '',
  };
}

/**
 * Maps partial project updates to API format
 * @param updates Partial project updates from frontend
 * @returns Formatted partial project data for API
 */
function mapPartialProjectToApiProject(updates: Partial<Project>): any {
  const apiUpdates: Record<string, any> = {};

  if (updates.name !== undefined) apiUpdates.name = updates.name;
  if (updates.description !== undefined)
    apiUpdates.description = updates.description || '';
  if (updates.status !== undefined)
    apiUpdates.status = updates.status.toLowerCase();
  if (updates.startDate !== undefined) {
    apiUpdates.start_date =
      updates.startDate instanceof Date
        ? updates.startDate.toISOString()
        : updates.startDate;
  }
  if (updates.dueDate !== undefined) {
    apiUpdates.due_date =
      updates.dueDate instanceof Date
        ? updates.dueDate.toISOString()
        : updates.dueDate;
  }
  if (updates.completedDate !== undefined) {
    apiUpdates.completed_date = updates.completedDate
      ? updates.completedDate instanceof Date
        ? updates.completedDate.toISOString()
        : updates.completedDate
      : null;
  }
  if (updates.progress !== undefined) apiUpdates.progress = updates.progress;
  if (updates.completionPercentage !== undefined)
    apiUpdates.completion_percentage = updates.completionPercentage;
  if (updates.projectType !== undefined)
    apiUpdates.project_type = updates.projectType;
  if (updates.customer !== undefined) {
    apiUpdates.customer_id = updates.customer
      ? stringIdToNumber(updates.customer)
      : null;
  }
  if (updates.notes !== undefined) apiUpdates.notes = updates.notes || '';

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
