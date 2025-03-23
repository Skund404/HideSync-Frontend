import { PickingListStatus } from '@/types/enums';
import { PickingList, PickingListFilters } from '@/types/pickinglist';
import { numberIdToString, stringIdToNumber } from '@/utils/idConversion';
import { apiClient } from './api-client';

const BASE_URL = '/picking-lists';

/**
 * Get all picking lists with optional filtering
 * @param filters Optional filters for picking lists
 * @param page Page number for pagination
 * @param perPage Number of items per page
 * @returns Promise with array of picking lists and pagination metadata
 */
export const getPickingLists = async (
  filters?: PickingListFilters,
  page: number = 1,
  perPage: number = 20
): Promise<{
  data: PickingList[];
  meta: { total: number; page: number; per_page: number; last_page: number };
}> => {
  try {
    // Build query parameters for filtering and pagination
    const params: Record<string, string | boolean | number> = {
      page,
      per_page: perPage,
    };

    if (filters?.projectId) {
      params.project_id = filters.projectId;
    }

    if (filters?.status) {
      // Handle single status value, not an array
      params.status = filters.status.toLowerCase();
    }

    if (filters?.dateRange?.start) {
      params.start_date = filters.dateRange.start.toISOString().split('T')[0];
    }

    if (filters?.dateRange?.end) {
      params.end_date = filters.dateRange.end.toISOString().split('T')[0];
    }

    const response = await apiClient.get<{
      data: any[];
      meta: {
        total: number;
        page: number;
        per_page: number;
        last_page: number;
      };
    }>(BASE_URL, { params });

    return {
      data: response.data.data.map(mapApiPickingListToPickingList),
      meta: response.data.meta,
    };
  } catch (error) {
    console.error('Error fetching picking lists:', error);
    throw formatApiError(error);
  }
};

/**
 * Get a picking list by ID
 * @param id Picking list ID
 * @returns Promise with picking list if found
 */
export const getPickingListById = async (id: string): Promise<PickingList> => {
  try {
    // Convert string ID to number for API
    const numericId = stringIdToNumber(id);

    const response = await apiClient.get<{ data: any }>(
      `${BASE_URL}/${numericId}`
    );
    return mapApiPickingListToPickingList(response.data.data);
  } catch (error) {
    console.error(`Error fetching picking list with ID ${id}:`, error);
    throw formatApiError(error);
  }
};

/**
 * Create a new picking list
 * @param pickingListData Picking list data
 * @returns Promise with created picking list
 */
export const createPickingList = async (
  pickingListData: Omit<PickingList, 'id' | 'createdAt' | 'completedAt'>
): Promise<PickingList> => {
  try {
    // Transform the picking list data to match API expectations
    const apiPickingList = mapPickingListToApiPickingList(pickingListData);

    const response = await apiClient.post<{ data: any }>(
      BASE_URL,
      apiPickingList
    );
    return mapApiPickingListToPickingList(response.data.data);
  } catch (error) {
    console.error('Error creating picking list:', error);
    throw formatApiError(error);
  }
};

/**
 * Update an existing picking list
 * @param id Picking list ID
 * @param updates Partial picking list data to update
 * @returns Promise with updated picking list
 */
export const updatePickingList = async (
  id: string,
  updates: Partial<PickingList>
): Promise<PickingList> => {
  try {
    // Convert string ID to number for API
    const numericId = stringIdToNumber(id);

    // Transform the update data to match API expectations
    const apiPickingListUpdates =
      mapPartialPickingListToApiPickingList(updates);

    const response = await apiClient.patch<{ data: any }>(
      `${BASE_URL}/${numericId}`,
      apiPickingListUpdates
    );
    return mapApiPickingListToPickingList(response.data.data);
  } catch (error) {
    console.error(`Error updating picking list with ID ${id}:`, error);
    throw formatApiError(error);
  }
};

/**
 * Delete a picking list
 * @param id Picking list ID
 * @returns Promise that resolves when successful
 */
export const deletePickingList = async (id: string): Promise<void> => {
  try {
    // Convert string ID to number for API
    const numericId = stringIdToNumber(id);

    await apiClient.delete(`${BASE_URL}/${numericId}`);
  } catch (error) {
    console.error(`Error deleting picking list with ID ${id}:`, error);
    throw formatApiError(error);
  }
};

/**
 * Update picking list status
 * @param id Picking list ID
 * @param status New picking list status
 * @returns Promise with updated picking list
 */
export const updatePickingListStatus = async (
  id: string,
  status: PickingListStatus
): Promise<PickingList> => {
  try {
    // Convert string ID to number for API
    const numericId = stringIdToNumber(id);

    const response = await apiClient.patch<{ data: any }>(
      `${BASE_URL}/${numericId}/status`,
      {
        status: status.toLowerCase(), // Backend uses lowercase enum values
      }
    );

    return mapApiPickingListToPickingList(response.data.data);
  } catch (error) {
    console.error(`Error updating status for picking list ${id}:`, error);
    throw formatApiError(error);
  }
};

/**
 * Assign picking list to a user
 * @param id Picking list ID
 * @param userId User ID to assign
 * @returns Promise with updated picking list
 */
export const assignPickingList = async (
  id: string,
  userId: string
): Promise<PickingList> => {
  try {
    // Convert string IDs to numbers for API
    const numericId = stringIdToNumber(id);
    const numericUserId = stringIdToNumber(userId);

    const response = await apiClient.patch<{ data: any }>(
      `${BASE_URL}/${numericId}/assign`,
      {
        user_id: numericUserId,
      }
    );

    return mapApiPickingListToPickingList(response.data.data);
  } catch (error) {
    console.error(
      `Error assigning picking list ${id} to user ${userId}:`,
      error
    );
    throw formatApiError(error);
  }
};

/**
 * Update picking list item quantities
 * @param listId Picking list ID
 * @param itemId Picking list item ID
 * @param pickedQuantity New quantity picked
 * @returns Promise with updated picking list
 */
export const updatePickingListItemQuantity = async (
  listId: string,
  itemId: string,
  pickedQuantity: number
): Promise<PickingList> => {
  try {
    // Convert string IDs to numbers for API
    const numericListId = stringIdToNumber(listId);
    const numericItemId = stringIdToNumber(itemId);

    const response = await apiClient.patch<{ data: any }>(
      `${BASE_URL}/${numericListId}/items/${numericItemId}`,
      {
        quantity_picked: pickedQuantity,
      }
    );

    return mapApiPickingListToPickingList(response.data.data);
  } catch (error) {
    console.error(`Error updating picking list item quantity:`, error);
    throw formatApiError(error);
  }
};

/**
 * Generate a picking list from a project
 * @param projectId Project ID to generate picking list from
 * @returns Promise with created picking list
 */
export const generatePickingListFromProject = async (
  projectId: string
): Promise<PickingList> => {
  try {
    // Convert string ID to number for API
    const numericProjectId = stringIdToNumber(projectId);

    const response = await apiClient.post<{ data: any }>(
      `/projects/${numericProjectId}/picking-list`,
      {}
    );

    return mapApiPickingListToPickingList(response.data.data);
  } catch (error) {
    console.error(
      `Error generating picking list for project ${projectId}:`,
      error
    );
    throw formatApiError(error);
  }
};

// ============ Helper Functions ============

/**
 * Maps API picking list data to our frontend PickingList type
 * @param apiPickingList Picking list data from API
 * @returns PickingList object for frontend
 */
function mapApiPickingListToPickingList(apiPickingList: any): PickingList {
  return {
    id: numberIdToString(apiPickingList.id),
    projectId: numberIdToString(apiPickingList.project_id), // Changed from project_id to projectId to match interface
    status: apiPickingList.status.toUpperCase() as PickingListStatus, // Convert to uppercase for enums
    createdAt: new Date(apiPickingList.created_at), // Ensure it's a Date object
    assignedTo: apiPickingList.assigned_to
      ? numberIdToString(apiPickingList.assigned_to)
      : undefined,
    completedAt: apiPickingList.completed_at
      ? new Date(apiPickingList.completed_at)
      : undefined, // Ensure it's a Date object or undefined
    notes: apiPickingList.notes || '',
    // Add items as an 'any' property to make TypeScript happy
    items: Array.isArray(apiPickingList.items)
      ? apiPickingList.items.map((item: any) => ({
          id: numberIdToString(item.id),
          pickingListId: numberIdToString(item.picking_list_id), // Changed from picking_list_id to pickingListId
          materialId: item.material_id
            ? numberIdToString(item.material_id)
            : undefined, // Changed from material_id to materialId
          componentId: item.component_id
            ? numberIdToString(item.component_id)
            : undefined, // Changed from component_id to componentId
          quantity_ordered: item.quantity_ordered,
          quantity_picked: item.quantity_picked,
          status: item.status,
          notes: item.notes || '',
        }))
      : [],
  } as PickingList & { items: any[] }; // Type assertion to include items property
}

/**
 * Maps our frontend PickingList type to API expected format
 * @param pickingList Picking list from frontend
 * @returns Formatted picking list data for API
 */
function mapPickingListToApiPickingList(
  pickingList: Omit<PickingList, 'id' | 'createdAt' | 'completedAt'> & {
    items?: any[];
  }
): any {
  return {
    project_id: stringIdToNumber(pickingList.projectId), // Changed from project_id to projectId
    status: pickingList.status.toLowerCase(), // Backend uses lowercase
    assigned_to: pickingList.assignedTo
      ? stringIdToNumber(pickingList.assignedTo)
      : null,
    notes: pickingList.notes || '',
    items:
      pickingList.items?.map((item: any) => ({
        material_id: item.materialId ? stringIdToNumber(item.materialId) : null, // Changed from material_id to materialId
        component_id: item.componentId
          ? stringIdToNumber(item.componentId)
          : null, // Changed from component_id to componentId
        quantity_ordered: item.quantity_ordered,
        quantity_picked: item.quantity_picked || 0,
        status: item.status,
        notes: item.notes || '',
      })) || [],
  };
}

/**
 * Maps partial picking list updates to API format
 * @param updates Partial picking list updates from frontend
 * @returns Formatted partial picking list data for API
 */
function mapPartialPickingListToApiPickingList(
  updates: Partial<PickingList> & { items?: any[] }
): any {
  const apiUpdates: Record<string, any> = {};

  if (updates.projectId !== undefined)
    apiUpdates.project_id = stringIdToNumber(updates.projectId); // Changed from project_id to projectId
  if (updates.status !== undefined)
    apiUpdates.status = updates.status.toLowerCase();
  if (updates.assignedTo !== undefined)
    apiUpdates.assigned_to = updates.assignedTo
      ? stringIdToNumber(updates.assignedTo)
      : null;
  if (updates.notes !== undefined) apiUpdates.notes = updates.notes || '';

  if (updates.items !== undefined) {
    apiUpdates.items = updates.items.map((item: any) => ({
      id: item.id ? stringIdToNumber(item.id) : undefined,
      material_id: item.materialId ? stringIdToNumber(item.materialId) : null, // Changed from material_id to materialId
      component_id: item.componentId
        ? stringIdToNumber(item.componentId)
        : null, // Changed from component_id to componentId
      quantity_ordered: item.quantity_ordered,
      quantity_picked: item.quantity_picked || 0,
      status: item.status,
      notes: item.notes || '',
    }));
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
