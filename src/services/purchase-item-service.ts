// src/services/purchase-item-service.ts
import { apiClient, ApiError } from './api-client';
import { MaterialType, HardwareType, MeasurementUnit } from '@/types/enums';
import { PurchaseOrderItem } from '@/types/purchaseTypes';

const BASE_URL = '/purchase-items';

/**
 * Get all items for a purchase order
 */
export const getPurchaseItems = async (purchaseId: string | number): Promise<PurchaseOrderItem[]> => {
  try {
    const response = await apiClient.get<PurchaseOrderItem[]>(`/purchases/${purchaseId}/items`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching items for purchase ${purchaseId}:`, error);
    throw error;
  }
};

/**
 * Get a specific purchase item
 */
export const getPurchaseItemById = async (itemId: number): Promise<PurchaseOrderItem> => {
  try {
    const response = await apiClient.get<PurchaseOrderItem>(`${BASE_URL}/${itemId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching purchase item ${itemId}:`, error);
    throw error;
  }
};

/**
 * Create a new purchase item
 */
export const createPurchaseItem = async (
  purchaseId: string | number,
  item: Omit<PurchaseOrderItem, 'id' | 'purchase_id'>
): Promise<PurchaseOrderItem> => {
  try {
    const response = await apiClient.post<PurchaseOrderItem>(`/purchases/${purchaseId}/items`, {
      ...item,
      purchase_id: typeof purchaseId === 'string' ? parseInt(purchaseId) : purchaseId
    });
    return response.data;
  } catch (error) {
    console.error('Error creating purchase item:', error);
    throw error;
  }
};

/**
 * Update an existing purchase item
 */
export const updatePurchaseItem = async (
  itemId: number,
  item: Partial<PurchaseOrderItem>
): Promise<PurchaseOrderItem> => {
  try {
    const response = await apiClient.put<PurchaseOrderItem>(`${BASE_URL}/${itemId}`, item);
    return response.data;
  } catch (error) {
    console.error(`Error updating purchase item ${itemId}:`, error);
    throw error;
  }
};

/**
 * Delete a purchase item
 */
export const deletePurchaseItem = async (itemId: number): Promise<void> => {
  try {
    await apiClient.delete(`${BASE_URL}/${itemId}`);
  } catch (error) {
    console.error(`Error deleting purchase item ${itemId}:`, error);
    throw error;
  }
};

/**
 * Bulk create items for a purchase order
 */
export const bulkCreatePurchaseItems = async (
  purchaseId: string | number,
  items: Array<Omit<PurchaseOrderItem, 'id' | 'purchase_id'>>
): Promise<PurchaseOrderItem[]> => {
  try {
    const formattedItems = items.map(item => ({
      ...item,
      purchase_id: typeof purchaseId === 'string' ? parseInt(purchaseId) : purchaseId
    }));
    
    const response = await apiClient.post<PurchaseOrderItem[]>(
      `/purchases/${purchaseId}/items/bulk`,
      formattedItems
    );
    return response.data;
  } catch (error) {
    console.error(`Error bulk creating items for purchase ${purchaseId}:`, error);
    throw error;
  }
};