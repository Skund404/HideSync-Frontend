// src/services/inventory-service.ts
import { InventoryAdjustmentType, InventoryStatus } from '@/types/enums';
import {
  Inventory,
  InventoryFilters,
  InventoryTransaction,
  Product,
} from '@/types/models';
import { AxiosResponse } from 'axios';
import * as Papa from 'papaparse';
import { apiClient } from './api-client';

// Pagination and filtering interfaces
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface ProductFilter {
  productType?: string[];
  status?: string[];
  priceRange?: { min?: number; max?: number };
  dateAddedRange?: { from?: string; to?: string };
  searchQuery?: string;
  storageLocation?: string;
}

export const inventoryService = {
  // Get all inventory items with pagination and filtering
  async getInventoryItems(
    pagination?: PaginationParams,
    filters?: InventoryFilters
  ): Promise<{
    data: Inventory[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    try {
      const response = await apiClient.get<{
        data: Inventory[];
        total: number;
        page: number;
        pageSize: number;
      }>('/inventory', {
        params: { ...pagination, ...filters },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching inventory items:', error);
      throw error;
    }
  },

  // Get a single inventory item by ID
  async getInventoryItemById(id: number): Promise<Inventory> {
    try {
      const response = await apiClient.get<Inventory>(`/inventory/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching inventory item with ID ${id}:`, error);
      throw error;
    }
  },

  // Create a new inventory item
  async createInventoryItem(item: Omit<Inventory, 'id'>): Promise<Inventory> {
    try {
      const response = await apiClient.post<Inventory>('/inventory', item);
      return response.data;
    } catch (error) {
      console.error('Error creating inventory item:', error);
      throw error;
    }
  },

  // Update an existing inventory item
  async updateInventoryItem(
    id: number,
    item: Partial<Inventory>
  ): Promise<Inventory> {
    try {
      const response = await apiClient.put<Inventory>(`/inventory/${id}`, item);
      return response.data;
    } catch (error) {
      console.error(`Error updating inventory item with ID ${id}:`, error);
      throw error;
    }
  },

  // Delete an inventory item
  async deleteInventoryItem(id: number): Promise<void> {
    try {
      await apiClient.delete(`/inventory/${id}`);
    } catch (error) {
      console.error(`Error deleting inventory item with ID ${id}:`, error);
      throw error;
    }
  },

  // Get inventory summary statistics
  async getInventorySummary(): Promise<{
    totalProducts: number;
    inStock: number;
    lowStock: number;
    outOfStock: number;
    totalValue: number;
    averageMargin: number;
    needsReorder: number;
  }> {
    try {
      const response = await apiClient.get<any>(`/inventory/summary`);
      return response.data;
    } catch (error) {
      console.error('Error fetching inventory summary:', error);
      throw error;
    }
  },

  // Get inventory items by product type
  async getInventoryByProductType(productType: string): Promise<Inventory[]> {
    try {
      const response = await apiClient.get<Inventory[]>(
        `/inventory/product-type/${productType}`
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching inventory items by product type ${productType}:`,
        error
      );
      throw error;
    }
  },

  // Get inventory items by status
  async getInventoryByStatus(status: InventoryStatus): Promise<Inventory[]> {
    try {
      const response = await apiClient.get<Inventory[]>(
        `/inventory/status/${status}`
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching inventory items by status ${status}:`,
        error
      );
      throw error;
    }
  },

  // Get inventory items by storage location
  async getInventoryByStorageLocation(
    locationId: string
  ): Promise<Inventory[]> {
    try {
      const response = await apiClient.get<Inventory[]>(
        `/inventory/storage-location/${locationId}`
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching inventory items by location ${locationId}:`,
        error
      );
      throw error;
    }
  },

  // Update inventory item quantity
  async updateInventoryQuantity(
    id: number,
    quantity: number,
    adjustmentType: InventoryAdjustmentType = InventoryAdjustmentType.PHYSICAL_COUNT,
    notes?: string
  ): Promise<Inventory> {
    try {
      const response = await apiClient.patch<Inventory>(
        `/inventory/${id}/quantity`,
        {
          quantity,
          adjustmentType,
          notes,
        }
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error updating quantity for inventory item with ID ${id}:`,
        error
      );
      throw error;
    }
  },

  // Get available storage locations
  async getStorageLocations(): Promise<
    {
      id: string;
      type: string;
      products: Product[];
    }[]
  > {
    try {
      const response = await apiClient.get<any>(`/storage-locations`);
      return response.data;
    } catch (error) {
      console.error('Error fetching storage locations:', error);
      throw error;
    }
  },

  // Get recent inventory transactions
  async getRecentTransactions(limit = 10): Promise<InventoryTransaction[]> {
    try {
      const response = await apiClient.get<InventoryTransaction[]>(
        `/inventory/transactions/recent`,
        {
          params: { limit },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching recent inventory transactions:', error);
      throw error;
    }
  },

  // Get low stock items that need reordering
  async getLowStockItems(): Promise<Inventory[]> {
    try {
      const response = await apiClient.get<Inventory[]>(`/inventory/low-stock`);
      return response.data;
    } catch (error) {
      console.error('Error fetching low stock items:', error);
      throw error;
    }
  },

  // Filter inventory items based on multiple criteria
  async filterInventoryItems(filters: InventoryFilters): Promise<Inventory[]> {
    try {
      const response = await apiClient.get<Inventory[]>(`/inventory/filter`, {
        params: filters,
      });
      return response.data;
    } catch (error) {
      console.error('Error filtering inventory items:', error);
      throw error;
    }
  },

  // Batch operations
  async bulkUpdateInventory(
    updates: Array<{ id: number; data: Partial<Inventory> }>
  ): Promise<Inventory[]> {
    try {
      const response = await apiClient.patch<Inventory[]>(
        '/inventory/bulk',
        updates
      );
      return response.data;
    } catch (error) {
      console.error('Error updating multiple inventory items:', error);
      throw error;
    }
  },

  async bulkDeleteInventory(ids: number[]): Promise<void> {
    try {
      await apiClient.delete('/inventory/bulk', { data: { ids } });
    } catch (error) {
      console.error('Error deleting multiple inventory items:', error);
      throw error;
    }
  },

  // Products management
  async getProducts(
    pagination?: PaginationParams,
    filters?: ProductFilter
  ): Promise<{
    data: Product[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    try {
      const response = await apiClient.get<{
        data: Product[];
        total: number;
        page: number;
        pageSize: number;
      }>('/products', {
        params: { ...pagination, ...filters },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  async getProductById(id: number): Promise<Product> {
    try {
      const response = await apiClient.get<Product>(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching product with ID ${id}:`, error);
      throw error;
    }
  },

  async createProduct(product: Omit<Product, 'id'>): Promise<Product> {
    try {
      const response = await apiClient.post<Product>('/products', product);
      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  async updateProduct(id: number, updates: Partial<Product>): Promise<Product> {
    try {
      const response = await apiClient.put<Product>(`/products/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error(`Error updating product with ID ${id}:`, error);
      throw error;
    }
  },

  async deleteProduct(id: number): Promise<void> {
    try {
      await apiClient.delete(`/products/${id}`);
    } catch (error) {
      console.error(`Error deleting product with ID ${id}:`, error);
      throw error;
    }
  },

  // Financial analysis functions
  async getProductProfitability(): Promise<any> {
    try {
      const response = await apiClient.get('/inventory/analysis/profitability');
      return response.data;
    } catch (error) {
      console.error('Error fetching product profitability data:', error);
      throw error;
    }
  },

  async getInventoryValueByType(): Promise<any> {
    try {
      const response = await apiClient.get('/inventory/analysis/value-by-type');
      return response.data;
    } catch (error) {
      console.error('Error fetching inventory value by type:', error);
      throw error;
    }
  },

  // Import/Export Functionality
  async importProductsFromCSV(file: File): Promise<{
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
              // Wrap asynchronous calls in an IIFE
              (async () => {
                try {
                  const response: AxiosResponse<{ imported: number }> =
                    await apiClient.post('/products/import', {
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

  async exportProductsToCSV(filters?: ProductFilter): Promise<Blob> {
    try {
      const response = await apiClient.get<Blob>('/products/export', {
        params: filters,
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting products to CSV:', error);
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

export default inventoryService;
