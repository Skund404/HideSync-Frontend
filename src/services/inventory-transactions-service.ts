// src/services/inventory-transactions-service.ts
import { apiClient, ApiError } from './api-client';
import { InventoryTransaction } from '@/types/models';
import { TransactionType, InventoryAdjustmentType } from '@/types/enums';

// Pagination and filtering interfaces
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface TransactionFilter {
  type?: TransactionType[];
  dateRange?: { from: string; to: string };
  itemType?: string;
  itemId?: number;
  storageLocation?: string;
  performedBy?: string;
}

export const transactionService = {
  // Get all inventory transactions with pagination and filtering
  async getInventoryTransactions(
    pagination?: PaginationParams,
    filters?: TransactionFilter
  ): Promise<{
    data: InventoryTransaction[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    try {
      const response = await apiClient.get<{
        data: InventoryTransaction[];
        total: number;
        page: number;
        pageSize: number;
      }>('/inventory/transactions', {
        params: { ...pagination, ...filters }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching inventory transactions:', error);
      throw error;
    }
  },

  // Get a single inventory transaction by ID
  async getInventoryTransactionById(id: number): Promise<InventoryTransaction> {
    try {
      const response = await apiClient.get<InventoryTransaction>(`/inventory/transactions/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching inventory transaction with ID ${id}:`, error);
      throw error;
    }
  },

  // Create a new inventory transaction
  async createInventoryTransaction(
    transaction: Omit<InventoryTransaction, 'id' | 'date'>
  ): Promise<InventoryTransaction> {
    try {
      const response = await apiClient.post<InventoryTransaction>('/inventory/transactions', transaction);
      return response.data;
    } catch (error) {
      console.error('Error creating inventory transaction:', error);
      throw error;
    }
  },

  // Create a usage transaction for a project
  async createUsageTransaction(
    materialId: number,
    quantity: number,
    projectId: number,
    notes?: string
  ): Promise<InventoryTransaction> {
    try {
      const response = await apiClient.post<InventoryTransaction>(`/inventory/transactions/usage`, {
        materialId,
        quantity,
        projectId,
        type: TransactionType.PROJECT_USAGE,
        notes
      });
      return response.data;
    } catch (error) {
      console.error('Error creating usage transaction:', error);
      throw error;
    }
  },

  // Create a restock transaction
  async createRestockTransaction(
    materialId: number,
    quantity: number,
    supplierId?: number,
    purchaseOrderId?: number,
    notes?: string
  ): Promise<InventoryTransaction> {
    try {
      const response = await apiClient.post<InventoryTransaction>(`/inventory/transactions/restock`, {
        materialId,
        quantity,
        supplierId,
        purchaseOrderId,
        type: TransactionType.PURCHASE,
        notes
      });
      return response.data;
    } catch (error) {
      console.error('Error creating restock transaction:', error);
      throw error;
    }
  },

  // Create an adjustment transaction
  async createAdjustmentTransaction(
    materialId: number,
    quantity: number,
    adjustmentType: InventoryAdjustmentType,
    notes?: string
  ): Promise<InventoryTransaction> {
    try {
      const response = await apiClient.post<InventoryTransaction>(`/inventory/transactions/adjustment`, {
        materialId,
        quantity,
        adjustmentType,
        type: TransactionType.ADJUSTMENT,
        notes
      });
      return response.data;
    } catch (error) {
      console.error('Error creating adjustment transaction:', error);
      throw error;
    }
  },

  // Create a transfer transaction between storage locations
  async createTransferTransaction(
    materialId: number,
    quantity: number,
    fromLocationId: string,
    toLocationId: string,
    notes?: string
  ): Promise<InventoryTransaction> {
    try {
      const response = await apiClient.post<InventoryTransaction>(`/inventory/transactions/transfer`, {
        materialId,
        quantity,
        fromLocationId,
        toLocationId,
        type: TransactionType.LOCATION_TRANSFER,
        notes
      });
      return response.data;
    } catch (error) {
      console.error('Error creating transfer transaction:', error);
      throw error;
    }
  },

  // Get recent inventory transactions
  async getRecentTransactions(limit: number = 10): Promise<InventoryTransaction[]> {
    try {
      const response = await apiClient.get<InventoryTransaction[]>(`/inventory/transactions/recent`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
      throw error;
    }
  },

  // Get inventory transaction history for a specific item
  async getItemTransactionHistory(
    itemType: 'material' | 'product' | 'tool',
    itemId: number,
    pagination?: PaginationParams
  ): Promise<{
    data: InventoryTransaction[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    try {
      const response = await apiClient.get<{
        data: InventoryTransaction[];
        total: number;
        page: number;
        pageSize: number;
      }>(`/inventory/transactions/history/${itemType}/${itemId}`, {
        params: pagination
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching transaction history for ${itemType} ID ${itemId}:`, error);
      throw error;
    }
  },

  // Get summary of transaction activity
  async getTransactionSummary(
    timeframe: 'day' | 'week' | 'month' | 'year' = 'month'
  ): Promise<{
    totalTransactions: number;
    transactionsByType: Record<string, number>;
    inventoryChanges: {
      additions: number;
      removals: number;
      net: number;
    };
    topItems: Array<{
      itemId: number;
      itemType: string;
      itemName: string;
      transactionCount: number;
    }>;
  }> {
    try {
      const response = await apiClient.get(`/inventory/transactions/summary`, {
        params: { timeframe }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching transaction summary:', error);
      throw error;
    }
  },

  // Batch operations for transactions
  async bulkCreateTransactions(
    transactions: Array<Omit<InventoryTransaction, 'id' | 'date'>>
  ): Promise<InventoryTransaction[]> {
    try {
      const response = await apiClient.post<InventoryTransaction[]>(
        '/inventory/transactions/bulk',
        transactions
      );
      return response.data;
    } catch (error) {
      console.error('Error creating multiple transactions:', error);
      throw error;
    }
  },

  // Export transactions to CSV
  async exportTransactionsToCSV(filters?: TransactionFilter): Promise<Blob> {
    try {
      const response = await apiClient.get<Blob>('/inventory/transactions/export', {
        params: filters,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting transactions to CSV:', error);
      throw error;
    }
  },

  // Utility Method for Downloading Blobs
  downloadBlob(blob: Blob, filename: string) {
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

export default transactionService;