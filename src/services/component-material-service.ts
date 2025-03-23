// src/services/component-service.ts
import { apiClient, ApiError } from './api-client';
import { Component, ComponentFilters } from '../types/patternTypes';

const BASE_URL = '/components';

/**
 * Fetches all components
 * @returns Promise with array of components
 */
export const getComponents = async (): Promise<Component[]> => {
  try {
    const response = await apiClient.get<Component[]>(BASE_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching components:', error);
    throw error;
  }
};

/**
 * Fetches components for a specific pattern
 * @param patternId The pattern ID to fetch components for
 * @returns Promise with array of components
 */
export const getComponentsByPatternId = async (patternId: number): Promise<Component[]> => {
  try {
    const response = await apiClient.get<Component[]>(`${BASE_URL}?pattern_id=${patternId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching components for pattern ${patternId}:`, error);
    throw error;
  }
};

/**
 * Fetches a single component by ID
 * @param id The component ID to fetch
 * @returns Promise with the component or null if not found
 */
export const getComponentById = async (id: number): Promise<Component | null> => {
  try {
    const response = await apiClient.get<Component>(`${BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    // If 404, return null instead of throwing
    if ((error as ApiError).status === 404) {
      return null;
    }
    console.error(`Error fetching component with id ${id}:`, error);
    throw error;
  }
};

/**
 * Creates a new component
 * @param component The component data to create
 * @returns Promise with the created component
 */
export const createComponent = async (component: Omit<Component, 'id'>): Promise<Component> => {
  try {
    const response = await apiClient.post<Component>(BASE_URL, component);
    return response.data;
  } catch (error) {
    console.error('Error creating component:', error);
    throw error;
  }
};

/**
 * Updates an existing component
 * @param id The component ID to update
 * @param component The component data to update
 * @returns Promise with the updated component
 */
export const updateComponent = async (
  id: number,
  component: Partial<Component>
): Promise<Component> => {
  try {
    const response = await apiClient.patch<Component>(`${BASE_URL}/${id}`, component);
    return response.data;
  } catch (error) {
    console.error(`Error updating component with id ${id}:`, error);
    throw error;
  }
};

/**
 * Deletes a component
 * @param id The component ID to delete
 * @returns Promise with a boolean indicating success
 */
export const deleteComponent = async (id: number): Promise<boolean> => {
  try {
    await apiClient.delete(`${BASE_URL}/${id}`);
    return true;
  } catch (error) {
    console.error(`Error deleting component with id ${id}:`, error);
    throw error;
  }
};

/**
 * Filters components based on provided criteria
 * @param filters The filter criteria to apply
 * @returns Promise with filtered components
 */
export const filterComponents = async (filters: ComponentFilters): Promise<Component[]> => {
  try {
    // Convert filters to query parameters
    const params = new URLSearchParams();
    
    if (filters.searchQuery) {
      params.append('search', filters.searchQuery);
    }
    
    if (filters.componentType) {
      params.append('component_type', filters.componentType.toLowerCase());
    }
    
    if (filters.patternId) {
      params.append('pattern_id', filters.patternId.toString());
    }
    
    if (filters.hasMaterials !== undefined) {
      params.append('has_materials', filters.hasMaterials.toString());
    }
    
    const url = `${BASE_URL}?${params.toString()}`;
    const response = await apiClient.get<Component[]>(url);
    return response.data;
  } catch (error) {
    console.error('Error filtering components:', error);
    throw error;
  }
};