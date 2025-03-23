// src/services/storage-service.ts
import { StorageLocationType } from '@/types/enums';
import { Material } from '@/types/materialTypes';
import {
  StorageAssignment,
  StorageCell,
  StorageLocation,
  StorageMoveRequest,
} from '@/types/storage'; // Use storage.ts for type definitions
import { AxiosResponse } from 'axios';
import * as Papa from 'papaparse';
import { apiClient } from './api-client';

// Pagination and Filtering Interfaces
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface StorageLocationFilter {
  type?: string[];
  section?: string[];
  status?: string[];
  minUtilization?: number;
  maxUtilization?: number;
}

export interface MaterialFilter {
  category?: string[];
  type?: string[];
  status?: string[];
  minQuantity?: number;
  maxQuantity?: number;
  supplier?: string[];
}

export const storageService = {
  // Pagination and Filtering for Storage Locations
  async getStorageLocations(
    pagination?: PaginationParams,
    filters?: StorageLocationFilter
  ): Promise<{
    data: StorageLocation[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    try {
      const response = await apiClient.get<{
        data: StorageLocation[];
        total: number;
        page: number;
        pageSize: number;
      }>('/storage/locations', {
        params: { ...pagination, ...filters },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching storage locations:', error);
      throw error;
    }
  },

  // Get materials with pagination and filtering
  async getMaterials(
    pagination?: PaginationParams,
    filters?: MaterialFilter
  ): Promise<{
    data: Material[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    try {
      const response = await apiClient.get<{
        data: Material[];
        total: number;
        page: number;
        pageSize: number;
      }>('/materials', {
        params: { ...pagination, ...filters },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching materials:', error);
      throw error;
    }
  },

  // Get all storage locations (simplified version without pagination)
  async getAllStorageLocations(): Promise<StorageLocation[]> {
    try {
      const response = await apiClient.get<StorageLocation[]>(
        '/storage/locations/all'
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching all storage locations:', error);
      throw error;
    }
  },

  // Batch Operations for Storage Locations
  async bulkCreateStorageLocations(
    locations: Omit<StorageLocation, 'id'>[]
  ): Promise<StorageLocation[]> {
    try {
      const response = await apiClient.post<StorageLocation[]>(
        '/storage/locations/bulk',
        locations
      );
      return response.data;
    } catch (error) {
      console.error('Error creating multiple storage locations:', error);
      throw error;
    }
  },

  async bulkUpdateStorageLocations(
    updates: Array<{ id: string; data: Partial<StorageLocation> }>
  ): Promise<StorageLocation[]> {
    try {
      const response = await apiClient.patch<StorageLocation[]>(
        '/storage/locations/bulk',
        updates
      );
      return response.data;
    } catch (error) {
      console.error('Error updating multiple storage locations:', error);
      throw error;
    }
  },

  async bulkDeleteStorageLocations(ids: string[]): Promise<void> {
    try {
      await apiClient.delete('/storage/locations/bulk', { data: { ids } });
    } catch (error) {
      console.error('Error deleting multiple storage locations:', error);
      throw error;
    }
  },

  // Single Storage Location Methods
  async getStorageLocationById(id: string): Promise<StorageLocation> {
    try {
      const response = await apiClient.get<StorageLocation>(
        `/storage/locations/${id}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching storage location with ID ${id}:`, error);
      throw error;
    }
  },

  async createStorageLocation(
    location: Omit<StorageLocation, 'id'>
  ): Promise<StorageLocation> {
    try {
      const response = await apiClient.post<StorageLocation>(
        '/storage/locations',
        location
      );
      return response.data;
    } catch (error) {
      console.error('Error creating storage location:', error);
      throw error;
    }
  },

  async updateStorageLocation(
    id: string,
    updates: Partial<StorageLocation>
  ): Promise<StorageLocation> {
    try {
      const response = await apiClient.patch<StorageLocation>(
        `/storage/locations/${id}`,
        updates
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating storage location with ID ${id}:`, error);
      throw error;
    }
  },

  async deleteStorageLocation(id: string): Promise<void> {
    try {
      await apiClient.delete(`/storage/locations/${id}`);
    } catch (error) {
      console.error(`Error deleting storage location with ID ${id}:`, error);
      throw error;
    }
  },

  // Storage Cells
  async getStorageCells(storageId: string): Promise<StorageCell[]> {
    try {
      const response = await apiClient.get<StorageCell[]>(
        `/storage/cells/${storageId}`
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching cells for storage location ${storageId}:`,
        error
      );
      throw error;
    }
  },

  // Get Storage Overview
  async getStorageOverview(): Promise<{
    totalLocations: number;
    totalCapacity: number;
    usedCapacity: number;
    utilizationPercentage: number;
    locationTypes: Record<StorageLocationType, number>;
    sectionUsage: Record<string, number>;
    itemsByType: {
      materials: number;
      products: number;
      tools: number;
    };
  }> {
    try {
      const response = await apiClient.get('/storage/overview');
      return response.data;
    } catch (error) {
      console.error('Error fetching storage overview:', error);
      throw error;
    }
  },

  // Material Storage Management
  async assignMaterialToStorage(
    materialId: number,
    storageId: string,
    position: { x: number; y: number },
    quantity: number
  ): Promise<StorageAssignment> {
    try {
      const response = await apiClient.post<StorageAssignment>(
        '/storage/assignMaterial',
        {
          materialId,
          storageId,
          position,
          quantity,
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error assigning material to storage:', error);
      throw error;
    }
  },

  async moveMaterialStorage(
    materialId: number,
    fromStorageId: string,
    toStorageId: string,
    newPosition: { x: number; y: number },
    quantity: number
  ): Promise<boolean> {
    try {
      const response = await apiClient.post('/storage/moveMaterial', {
        materialId,
        fromStorageId,
        toStorageId,
        newPosition,
        quantity,
      });
      return response.status === 200;
    } catch (error) {
      console.error('Error moving material:', error);
      throw error;
    }
  },

  async removeMaterialFromStorage(
    materialId: number,
    storageId: string
  ): Promise<boolean> {
    try {
      const response = await apiClient.post('/storage/removeMaterial', {
        materialId,
        storageId,
      });
      return response.status === 200;
    } catch (error) {
      console.error('Error removing material from storage:', error);
      throw error;
    }
  },

  // Generic Item Movement
  async moveItem(
    moveRequest: Omit<StorageMoveRequest, 'id' | 'requestDate' | 'requestedBy'>
  ): Promise<boolean> {
    try {
      const response = await apiClient.post('/storage/moveItem', moveRequest);
      return response.status === 200;
    } catch (error) {
      console.error('Error moving item:', error);
      throw error;
    }
  },

  // Import/Export Materials Functionality
  async importMaterialsFromCSV(file: File): Promise<{
    imported: number;
    errors: any[];
  }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const csvText = event.target?.result as string;

          Papa.parse<any>(csvText, {
            header: true,
            skipEmptyLines: true,
            complete: (parseResults: Papa.ParseResult<any>) => {
              (async () => {
                try {
                  const response: AxiosResponse<{ imported: number }> =
                    await apiClient.post('/materials/import', {
                      data: parseResults.data,
                      errors: parseResults.errors,
                    });
                  resolve({
                    imported:
                      response.data.imported !== undefined
                        ? response.data.imported
                        : parseResults.data.length,
                    errors: parseResults.errors,
                  });
                } catch (apiError) {
                  reject(apiError);
                }
              })();
            },
            error: (error: any) => {
              reject(error);
            },
          });
        } catch (readError) {
          reject(readError);
        }
      };

      reader.onerror = (error) => {
        reject(error);
      };

      reader.readAsText(file);
    });
  },

  async exportMaterialsToCSV(filters?: MaterialFilter): Promise<Blob> {
    try {
      const response = await apiClient.get<Blob>('/materials/export', {
        params: filters,
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting materials to CSV:', error);
      throw error;
    }
  },

  // Import/Export Storage Locations
  async importStorageLocationsFromCSV(file: File): Promise<{
    imported: number;
    errors: any[];
  }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const csvText = event.target?.result as string;

          Papa.parse<any>(csvText, {
            header: true,
            skipEmptyLines: true,
            complete: (parseResults: Papa.ParseResult<any>) => {
              // Wrap asynchronous calls in an IIFE so that this
              // callback returns void as required by Papa Parse.
              (async () => {
                try {
                  const response: AxiosResponse<{ imported: number }> =
                    await apiClient.post('/storage/locations/import', {
                      data: parseResults.data,
                      errors: parseResults.errors,
                    });
                  resolve({
                    imported:
                      response.data.imported !== undefined
                        ? response.data.imported
                        : parseResults.data.length,
                    errors: parseResults.errors,
                  });
                } catch (apiError) {
                  reject(apiError);
                }
              })();
            },
            error: (error: any) => {
              reject(error);
            },
          });
        } catch (readError) {
          reject(readError);
        }
      };

      reader.onerror = (error) => {
        reject(error);
      };

      // Read the file as text
      reader.readAsText(file);
    });
  },

  async exportStorageLocationsToCSV(
    filters?: StorageLocationFilter
  ): Promise<Blob> {
    try {
      const response = await apiClient.get<Blob>('/storage/locations/export', {
        params: filters,
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting storage locations to CSV:', error);
      throw error;
    }
  },

  async exportStorageContentsToCSV(locationId: string): Promise<Blob> {
    try {
      const response = await apiClient.get<Blob>(
        `/storage/locations/${locationId}/contents/export`,
        {
          responseType: 'blob',
        }
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error exporting contents of storage location ${locationId} to CSV:`,
        error
      );
      throw error;
    }
  },

  // Utility Method for Downloading Blobs
  downloadBlob(blob: Blob, filename: string) {
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
};

export default storageService;
