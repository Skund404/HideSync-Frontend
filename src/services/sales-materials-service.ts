// src/services/sales-materials-service.ts
import { MaterialType, MeasurementUnit } from '../types/enums';
import { apiClient, ApiResponse } from './api-client';

// Types for sale material requirements
export interface SaleMaterial {
  id: number;
  saleId: number;
  materialId?: number;
  materialName: string;
  materialType: MaterialType;
  quantity: number;
  unit: MeasurementUnit;
  available?: number;
  status?: string;
  location?: string;
}

// API endpoints
const ENDPOINTS = {
  SALE_MATERIALS: (saleId: number) => `/sales/${saleId}/materials`,
  RESERVE_MATERIALS: (saleId: number) => `/sales/${saleId}/materials/reserve`,
  GENERATE_PICKING_LIST: (saleId: number) => `/sales/${saleId}/picking-list`,
};

/**
 * Gets material requirements for a sale
 * @param saleId The sale ID to get materials for
 * @returns Promise with array of sale materials
 */
export const getSaleMaterials = async (
  saleId: number
): Promise<SaleMaterial[]> => {
  try {
    const response: ApiResponse<SaleMaterial[]> = await apiClient.get(
      ENDPOINTS.SALE_MATERIALS(saleId)
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching materials for sale ${saleId}:`, error);
    throw formatError(error);
  }
};

/**
 * Reserves materials for a sale in inventory
 * @param saleId The sale ID to reserve materials for
 * @param materialIds Optional specific material IDs to reserve (reserves all if not specified)
 * @returns Promise with success status
 */
export const reserveSaleMaterials = async (
  saleId: number,
  materialIds?: number[]
): Promise<boolean> => {
  try {
    const response: ApiResponse<{ success: boolean }> = await apiClient.post(
      ENDPOINTS.RESERVE_MATERIALS(saleId),
      { materialIds }
    );
    return response.data.success;
  } catch (error) {
    console.error(`Error reserving materials for sale ${saleId}:`, error);
    throw formatError(error);
  }
};

/**
 * Generate a picking list for the sale materials
 * @param saleId The sale ID to generate picking list for
 * @param includeAllMaterials Whether to include all materials or just selected ones
 * @returns Promise with the picking list ID
 */
export const generateSalePickingList = async (
  saleId: number,
  includeAllMaterials: boolean = true
): Promise<string> => {
  try {
    const response: ApiResponse<{ pickingListId: string }> =
      await apiClient.post(ENDPOINTS.GENERATE_PICKING_LIST(saleId), {
        includeAllMaterials,
      });
    return response.data.pickingListId;
  } catch (error) {
    console.error(`Error generating picking list for sale ${saleId}:`, error);
    throw formatError(error);
  }
};

/**
 * Gets material availability status for a sale
 * @param saleId The sale ID to check material availability for
 * @returns Promise with availability status
 */
export const checkMaterialAvailability = async (
  saleId: number
): Promise<{
  allAvailable: boolean;
  missingItems: SaleMaterial[];
}> => {
  try {
    const response: ApiResponse<{
      allAvailable: boolean;
      missingItems: SaleMaterial[];
    }> = await apiClient.get(
      `${ENDPOINTS.SALE_MATERIALS(saleId)}/availability`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error checking material availability for sale ${saleId}:`,
      error
    );
    throw formatError(error);
  }
};

/**
 * Formats API errors into a consistent format
 */
const formatError = (error: any): Error => {
  // Create a new Error with the message from the original error
  const formattedError = new Error(
    error.message || 'An unknown error occurred while processing your request'
  );

  // If the error has a status property, it's likely an ApiError from the interceptor
  if (error.status) {
    // Add ApiError properties as custom properties on the Error
    (formattedError as any).status = error.status;
    if (error.data) (formattedError as any).data = error.data;
  }

  return formattedError;
};
