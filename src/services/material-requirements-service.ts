// src/services/material-requirements-service.ts
import { MaterialType, MeasurementUnit } from '../types/enums';
import { apiClient, ApiError } from './api-client';
import { SaleMaterial } from './sales-materials-service';

// API endpoints for pattern material requirements
const ENDPOINTS = {
  PATTERN_MATERIALS: (patternId: number) => `/patterns/${patternId}/materials`,
  MATERIAL_AVAILABILITY: (patternId: number) =>
    `/patterns/${patternId}/materials/availability`,
};

/**
 * Gets material requirements for a pattern
 * @param patternId The pattern ID to get materials for
 * @returns Promise with array of materials required for the pattern
 */
export const getPatternMaterials = async (
  patternId: number
): Promise<SaleMaterial[]> => {
  try {
    const response = await apiClient.get(
      ENDPOINTS.PATTERN_MATERIALS(patternId)
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching materials for pattern ${patternId}:`, error);
    throw formatError(error);
  }
};

/**
 * Checks material availability for a pattern
 * @param patternId The pattern ID to check material availability for
 * @returns Promise with availability status
 */
export const checkPatternMaterialAvailability = async (
  patternId: number
): Promise<{
  allAvailable: boolean;
  // Match the shape from sales-materials-service
  missingItems: SaleMaterial[];
}> => {
  try {
    const response = await apiClient.get(
      ENDPOINTS.MATERIAL_AVAILABILITY(patternId)
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error checking material availability for pattern ${patternId}:`,
      error
    );
    throw formatError(error);
  }
};

/**
 * Gets estimated material costs for a pattern
 * @param patternId The pattern ID to get costs for
 * @returns Promise with cost breakdown
 */
export const getPatternMaterialCosts = async (
  patternId: number
): Promise<{
  totalCost: number;
  materialBreakdown: {
    materialId: number;
    materialName: string;
    materialType: MaterialType;
    quantity: number;
    unit: MeasurementUnit;
    cost: number;
  }[];
}> => {
  try {
    const response = await apiClient.get(
      `${ENDPOINTS.PATTERN_MATERIALS(patternId)}/costs`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching material costs for pattern ${patternId}:`,
      error
    );
    throw formatError(error);
  }
};

/**
 * Gets a picking list for a pattern (for preparing materials)
 * @param patternId The pattern ID to generate a picking list for
 * @returns Promise with picking list data
 */
export const generatePatternPickingList = async (
  patternId: number
): Promise<{
  pickingListId: string;
  items: {
    materialId: number;
    materialName: string;
    materialType: MaterialType;
    quantity: number;
    unit: MeasurementUnit;
    location?: string;
  }[];
}> => {
  try {
    const response = await apiClient.post(
      `${ENDPOINTS.PATTERN_MATERIALS(patternId)}/picking-list`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error generating picking list for pattern ${patternId}:`,
      error
    );
    throw formatError(error);
  }
};

/**
 * Gets similar patterns based on material usage
 * @param patternId The pattern ID to find similar patterns for
 * @returns Promise with similar patterns data
 */
export const getSimilarPatternsByMaterials = async (
  patternId: number,
  limit: number = 5
): Promise<
  {
    patternId: number;
    patternName: string;
    similarity: number; // 0-100 percentage
    sharedMaterials: number;
    totalMaterials: number;
  }[]
> => {
  try {
    const response = await apiClient.get(
      `${ENDPOINTS.PATTERN_MATERIALS(
        patternId
      )}/similar-patterns?limit=${limit}`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error finding similar patterns for pattern ${patternId}:`,
      error
    );
    throw formatError(error);
  }
};

/**
 * Formats API errors into a consistent format
 */
const formatError = (error: any): Error => {
  if (error.status && error.message) {
    // Already formatted by api-client interceptor
    // Add the name property required by Error interface
    const apiError = error as ApiError;
    const enhancedError = new Error(apiError.message);
    enhancedError.name = `ApiError(${apiError.status})`;

    // Copy other properties from the original error
    Object.assign(enhancedError, apiError);

    return enhancedError;
  }

  return new Error(
    error.message || 'An unknown error occurred while processing your request'
  );
};
