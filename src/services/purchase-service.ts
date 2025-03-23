// src/services/purchase-service.ts
import { apiClient, ApiResponse, ApiError } from './api-client';
import { PurchaseOrder, PurchaseOrderFilters, PurchaseOrderItem } from '@/types/purchaseTypes';

const BASE_URL = '/purchases';

// Get all purchase orders
export const getPurchaseOrders = async (): Promise<PurchaseOrder[]> => {
  try {
    const response = await apiClient.get<PurchaseOrder[]>(BASE_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    throw error;
  }
};

// Get a purchase order by ID
export const getPurchaseOrderById = async (id: string): Promise<PurchaseOrder> => {
  try {
    const response = await apiClient.get<PurchaseOrder>(`${BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching purchase order ${id}:`, error);
    throw error;
  }
};

// Get purchase orders for a specific supplier
export const getSupplierPurchaseOrders = async (supplierId: number): Promise<PurchaseOrder[]> => {
  try {
    const response = await apiClient.get<PurchaseOrder[]>(`${BASE_URL}/supplier/${supplierId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching purchase orders for supplier ${supplierId}:`, error);
    throw error;
  }
};

// Create a new purchase order
export const createPurchaseOrder = async (
  purchaseOrder: Omit<PurchaseOrder, 'id'>,
  items: PurchaseOrderItem[]
): Promise<PurchaseOrder> => {
  try {
    const response = await apiClient.post<PurchaseOrder>(BASE_URL, {
      ...purchaseOrder,
      items
    });
    return response.data;
  } catch (error) {
    console.error('Error creating purchase order:', error);
    throw error;
  }
};

// Update a purchase order
export const updatePurchaseOrder = async (purchaseOrder: PurchaseOrder): Promise<PurchaseOrder> => {
  try {
    const response = await apiClient.put<PurchaseOrder>(
      `${BASE_URL}/${purchaseOrder.id}`,
      purchaseOrder
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating purchase order ${purchaseOrder.id}:`, error);
    throw error;
  }
};

// Update purchase order status
export const updatePurchaseOrderStatus = async (
  id: string,
  status: string
): Promise<PurchaseOrder> => {
  try {
    const response = await apiClient.patch<PurchaseOrder>(`${BASE_URL}/${id}/status`, { status });
    return response.data;
  } catch (error) {
    console.error(`Error updating purchase order ${id} status:`, error);
    throw error;
  }
};

// Delete a purchase order
export const deletePurchaseOrder = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`${BASE_URL}/${id}`);
  } catch (error) {
    console.error(`Error deleting purchase order ${id}:`, error);
    throw error;
  }
};

// Filter purchase orders
export const filterPurchaseOrders = async (
  filters: PurchaseOrderFilters
): Promise<PurchaseOrder[]> => {
  try {
    // Convert filters object to query params
    const params = new URLSearchParams();
    if (filters.supplier) params.append('supplier', filters.supplier);
    if (filters.status) params.append('status', filters.status);
    if (filters.dateRange.start) params.append('dateStart', filters.dateRange.start);
    if (filters.dateRange.end) params.append('dateEnd', filters.dateRange.end);
    if (filters.searchQuery) params.append('search', filters.searchQuery);

    const response = await apiClient.get<PurchaseOrder[]>(BASE_URL, { params });
    return response.data;
  } catch (error) {
    console.error('Error filtering purchase orders:', error);
    throw error;
  }
};