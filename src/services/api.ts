// src/services/api.ts
import { StorageCell } from '@types';
import * as storageModule from './mock/storage';

// API client for making requests to the backend
// In development, this uses mock data
// In production, this would connect to a real API
export const api = {
  // Generic GET method
  async get<T>(endpoint: string): Promise<T> {
    // In a real app, this would be a fetch call to an API
    // For development, use mock data
    return new Promise((resolve) => {
      // Simulate network delay
      setTimeout(() => {
        // Handle specific storage endpoints
        if (endpoint === 'storage/storageLocations') {
          return resolve(storageModule.mockStorageLocations as unknown as T);
        } else if (endpoint === 'storage/storageCells') {
          return resolve(storageModule.mockStorageCells as unknown as T);
        } else if (endpoint === 'storage/storageAssignments') {
          return resolve(storageModule.mockStorageAssignments as unknown as T);
        } else if (endpoint === 'storage/storageOverview') {
          return resolve(storageModule.mockStorageOverview as unknown as T);
        } else if (endpoint.startsWith('storage/cells/')) {
          // Handle fetching cells for a specific storage location
          const storageId = endpoint.split('/').pop();
          const cells = storageModule.mockStorageCells.filter(
            (cell: StorageCell) => cell.storageId === storageId
          );
          return resolve(cells as unknown as T);
        } else if (endpoint === 'storage/materials') {
          return resolve(storageModule.mockMaterialsInStorage as unknown as T);
        }

        // Handle other endpoints as needed
        resolve([] as unknown as T);
      }, 300); // 300ms delay to simulate network latency
    });
  },

  // Generic POST method
  async post<T>(endpoint: string, data: any): Promise<T> {
    // In a real app, this would be a fetch call to an API
    // For development, use mock data and simulate success
    return new Promise((resolve) => {
      // Simulate network delay
      setTimeout(() => {
        console.log(`POST to ${endpoint}:`, data);
        // Simulate a successful response
        resolve({
          success: true,
          id: Math.random().toString(36).substr(2, 9),
        } as unknown as T);
      }, 300);
    });
  },

  // Generic PUT method
  async put<T>(endpoint: string, data: any): Promise<T> {
    // In a real app, this would be a fetch call to an API
    // For development, use mock data and simulate success
    return new Promise((resolve) => {
      // Simulate network delay
      setTimeout(() => {
        console.log(`PUT to ${endpoint}:`, data);
        // Simulate a successful response
        resolve({ success: true, ...data } as unknown as T);
      }, 300);
    });
  },

  // Generic DELETE method
  async delete<T>(endpoint: string): Promise<T> {
    // In a real app, this would be a fetch call to an API
    // For development, use mock data and simulate success
    return new Promise((resolve) => {
      // Simulate network delay
      setTimeout(() => {
        console.log(`DELETE to ${endpoint}`);
        // Simulate a successful response
        resolve({ success: true } as unknown as T);
      }, 300);
    });
  },
};

export default api;
