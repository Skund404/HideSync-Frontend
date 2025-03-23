// src/services/pattern-service.ts
import { apiClient, ApiError } from './api-client';
import { cachedApiCall, removeCacheItem } from './caching-service';
import { EnumTypes } from '../types';
import { Pattern, PatternFilters } from '../types/patternTypes';

const BASE_URL = '/patterns';

/**
 * Fetches all patterns from the API
 * @returns Promise with array of patterns
 */
export const getPatterns = async (): Promise<Pattern[]> => {
  return cachedApiCall('patterns:all', async () => {
    const response = await apiClient.get<Pattern[]>(BASE_URL);
    return response.data;
  });
};

/**
 * Fetches a single pattern by ID
 * @param id The pattern ID to fetch
 * @returns Promise with the pattern or null if not found
 */
export const getPatternById = async (id: number): Promise<Pattern | null> => {
  return cachedApiCall(`pattern:${id}`, async () => {
    try {
      const response = await apiClient.get<Pattern>(`${BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      // If 404, return null instead of throwing
      if ((error as ApiError).status === 404) {
        return null;
      }
      throw error;
    }
  });
};

/**
 * Creates a new pattern
 * @param pattern The pattern data to create
 * @returns Promise with the created pattern
 */
export const createPattern = async (pattern: Omit<Pattern, 'id'>): Promise<Pattern> => {
  try {
    const response = await apiClient.post<Pattern>(BASE_URL, pattern);
    
    // Invalidate patterns list cache
    removeCacheItem('patterns:all');
    
    return response.data;
  } catch (error) {
    console.error('Error creating pattern:', error);
    throw error;
  }
};

/**
 * Updates an existing pattern
 * @param id The pattern ID to update
 * @param pattern The pattern data to update
 * @returns Promise with the updated pattern
 */
export const updatePattern = async (id: number, pattern: Partial<Pattern>): Promise<Pattern> => {
  try {
    const response = await apiClient.patch<Pattern>(`${BASE_URL}/${id}`, pattern);
    
    // Invalidate specific pattern and patterns list caches
    removeCacheItem(`pattern:${id}`);
    removeCacheItem('patterns:all');
    
    return response.data;
  } catch (error) {
    console.error(`Error updating pattern with id ${id}:`, error);
    throw error;
  }
};

/**
 * Deletes a pattern
 * @param id The pattern ID to delete
 * @returns Promise with a boolean indicating success
 */
export const deletePattern = async (id: number): Promise<boolean> => {
  try {
    await apiClient.delete(`${BASE_URL}/${id}`);
    
    // Invalidate specific pattern and patterns list caches
    removeCacheItem(`pattern:${id}`);
    removeCacheItem('patterns:all');
    
    return true;
  } catch (error) {
    console.error(`Error deleting pattern with id ${id}:`, error);
    throw error;
  }
};

/**
 * Toggles the favorite status of a pattern
 * @param id The pattern ID to toggle favorite status
 * @returns Promise with the updated pattern
 */
export const togglePatternFavorite = async (id: number): Promise<Pattern> => {
  try {
    const response = await apiClient.post<Pattern>(`${BASE_URL}/${id}/toggle-favorite`);
    
    // Invalidate specific pattern and patterns list caches
    removeCacheItem(`pattern:${id}`);
    removeCacheItem('patterns:all');
    
    return response.data;
  } catch (error) {
    console.error(`Error toggling favorite for pattern with id ${id}:`, error);
    throw error;
  }
};

/**
 * Filters patterns based on provided criteria
 * @param filters The filter criteria to apply
 * @returns Promise with filtered patterns
 */
export const filterPatterns = async (filters: PatternFilters): Promise<Pattern[]> => {
  // Create a cache key based on the filters
  const filterKey = JSON.stringify(filters);
  
  return cachedApiCall(`patterns:filter:${filterKey}`, async () => {
    try {
      // Convert filters to query parameters
      const params = new URLSearchParams();
      
      if (filters.searchQuery) {
        params.append('search', filters.searchQuery);
      }
      
      if (filters.skillLevel) {
        params.append('skill_level', filters.skillLevel.toLowerCase());
      }
      
      if (filters.projectType) {
        params.append('project_type', filters.projectType.toLowerCase());
      }
      
      if (filters.tags && filters.tags.length > 0) {
        filters.tags.forEach(tag => params.append('tags', tag));
      }
      
      if (filters.favorite !== undefined) {
        params.append('favorite', filters.favorite.toString());
      }
      
      const url = `${BASE_URL}?${params.toString()}`;
      const response = await apiClient.get<Pattern[]>(url);
      return response.data;
    } catch (error) {
      console.error('Error filtering patterns:', error);
      throw error;
    }
  });
};