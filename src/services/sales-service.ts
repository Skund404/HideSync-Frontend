// src/services/sales-service.ts
import { stringIdToNumber } from '@/utils/idConversion';
import { PaymentStatus, SaleStatus } from '../types/enums';
import {
  FulfillmentStatus,
  PickingListSummary,
  Sale,
} from '../types/salesTypes';
import { apiClient, ApiResponse } from './api-client';

// API endpoints
const ENDPOINTS = {
  SALES: '/sales',
  SALE: (id: number) => `/sales/${id}`,
  COMPLETED_SALES: '/sales/completed',
  SYNC_ORDERS: '/sales/sync',
  FULFILLMENT: (id: number) => `/sales/${id}/fulfillment`,
  PICKING_LIST: (saleId: number) => `/sales/${saleId}/picking-list`,
  MATERIAL_REQUIREMENTS: (saleId: number) =>
    `/sales/${saleId}/material-requirements`,
  RESERVE_MATERIALS: (saleId: number) => `/sales/${saleId}/reserve-materials`,
  UPDATE_INVENTORY: (saleId: number) => `/sales/${saleId}/update-inventory`,
};

/**
 * Convert string ID to number safely, throwing an error if invalid
 * @param id ID to convert
 */
const ensureNumericId = (id: number | string): number => {
  if (typeof id === 'number') return id;

  const numericId = stringIdToNumber(id);
  if (numericId === undefined) {
    throw new Error(`Invalid ID format: ${id}`);
  }

  return numericId;
};

/**
 * Fetches all active sales from the API
 * @param filters Optional filters to apply to the sales list
 */
export const getAllSales = async (
  filters?: Record<string, any>
): Promise<Sale[]> => {
  try {
    const response: ApiResponse<Sale[]> = await apiClient.get(ENDPOINTS.SALES, {
      params: filters,
    });
    return response.data;
  } catch (error) {
    throw formatError(error);
  }
};

/**
 * Fetches all completed sales from the API
 * @param filters Optional filters to apply to the completed sales list
 */
export const getCompletedSales = async (
  filters?: Record<string, any>
): Promise<Sale[]> => {
  try {
    const response: ApiResponse<Sale[]> = await apiClient.get(
      ENDPOINTS.COMPLETED_SALES,
      { params: filters }
    );
    return response.data;
  } catch (error) {
    throw formatError(error);
  }
};

/**
 * Fetches a single sale by ID
 * @param id Sale ID (numeric or string)
 */
export const getSaleById = async (id: number | string): Promise<Sale> => {
  const numericId = ensureNumericId(id);
  try {
    const response: ApiResponse<Sale> = await apiClient.get(
      ENDPOINTS.SALE(numericId)
    );
    return response.data;
  } catch (error) {
    throw formatError(error);
  }
};

/**
 * Creates a new sale
 * @param sale Sale data to create
 */
export const createSale = async (sale: Omit<Sale, 'id'>): Promise<Sale> => {
  try {
    const response: ApiResponse<Sale> = await apiClient.post(
      ENDPOINTS.SALES,
      sale
    );
    return response.data;
  } catch (error) {
    throw formatError(error);
  }
};

/**
 * Updates an existing sale
 * @param id Sale ID (numeric or string)
 * @param updates Partial sale data to update
 */
export const updateSale = async (
  id: number | string,
  updates: Partial<Sale>
): Promise<Sale> => {
  const numericId = ensureNumericId(id);
  try {
    const response: ApiResponse<Sale> = await apiClient.put(
      ENDPOINTS.SALE(numericId),
      updates
    );
    return response.data;
  } catch (error) {
    throw formatError(error);
  }
};

/**
 * Syncs orders from integrated platforms
 * @param fromDate Optional date to sync orders from
 */
export const syncOrders = async (fromDate?: Date): Promise<number> => {
  try {
    const response: ApiResponse<{ count: number }> = await apiClient.post(
      ENDPOINTS.SYNC_ORDERS,
      { fromDate: fromDate ? fromDate.toISOString() : undefined }
    );
    return response.data.count;
  } catch (error) {
    throw formatError(error);
  }
};

/**
 * Updates the fulfillment status and shipping details of a sale
 * @param id Sale ID (numeric or string)
 * @param trackingNumber Shipping tracking number
 * @param shippingProvider Shipping provider name
 */
export const updateFulfillment = async (
  id: number | string,
  trackingNumber: string,
  shippingProvider: string
): Promise<Sale> => {
  const numericId = ensureNumericId(id);
  try {
    const response: ApiResponse<Sale> = await apiClient.put(
      ENDPOINTS.FULFILLMENT(numericId),
      {
        trackingNumber,
        shippingProvider,
        fulfillmentStatus: FulfillmentStatus.SHIPPED,
      }
    );
    return response.data;
  } catch (error) {
    throw formatError(error);
  }
};

/**
 * Creates a picking list for a sale
 * @param saleId Sale ID (numeric or string)
 */
export const createPickingList = async (
  saleId: number | string
): Promise<number> => {
  const numericId = ensureNumericId(saleId);
  try {
    const response: ApiResponse<PickingListSummary> = await apiClient.post(
      ENDPOINTS.PICKING_LIST(numericId),
      {}
    );
    return response.data.id;
  } catch (error) {
    throw formatError(error);
  }
};

/**
 * Gets material requirements for a sale
 * @param saleId Sale ID (numeric or string)
 */
export const getMaterialRequirements = async (
  saleId: number | string
): Promise<any[]> => {
  const numericId = ensureNumericId(saleId);
  try {
    const response: ApiResponse<any[]> = await apiClient.get(
      ENDPOINTS.MATERIAL_REQUIREMENTS(numericId)
    );
    return response.data;
  } catch (error) {
    throw formatError(error);
  }
};

/**
 * Reserves materials for a sale
 * @param saleId Sale ID (numeric or string)
 */
export const reserveMaterials = async (
  saleId: number | string
): Promise<boolean> => {
  const numericId = ensureNumericId(saleId);
  try {
    const response: ApiResponse<{ success: boolean }> = await apiClient.post(
      ENDPOINTS.RESERVE_MATERIALS(numericId),
      {}
    );
    return response.data.success;
  } catch (error) {
    throw formatError(error);
  }
};

/**
 * Updates inventory when a sale is fulfilled
 * @param saleId Sale ID (numeric or string)
 */
export const updateInventoryOnFulfillment = async (
  saleId: number | string
): Promise<boolean> => {
  const numericId = ensureNumericId(saleId);
  try {
    const response: ApiResponse<{ success: boolean }> = await apiClient.post(
      ENDPOINTS.UPDATE_INVENTORY(numericId),
      {}
    );
    return response.data.success;
  } catch (error) {
    throw formatError(error);
  }
};

/**
 * Bulk update sale status
 * @param saleIds Array of sale IDs
 * @param status New sale status
 */
export const bulkUpdateSaleStatus = async (
  saleIds: (number | string)[],
  status: SaleStatus
): Promise<Sale[]> => {
  const numericIds = saleIds.map((id) => ensureNumericId(id));

  try {
    const response: ApiResponse<Sale[]> = await apiClient.post(
      `${ENDPOINTS.SALES}/bulk-status-update`,
      {
        saleIds: numericIds,
        status,
      }
    );
    return response.data;
  } catch (error) {
    throw formatError(error);
  }
};

/**
 * Bulk update payment status
 * @param saleIds Array of sale IDs
 * @param paymentStatus New payment status
 */
export const bulkUpdatePaymentStatus = async (
  saleIds: (number | string)[],
  paymentStatus: PaymentStatus
): Promise<Sale[]> => {
  const numericIds = saleIds.map((id) => ensureNumericId(id));

  try {
    const response: ApiResponse<Sale[]> = await apiClient.post(
      `${ENDPOINTS.SALES}/bulk-payment-update`,
      {
        saleIds: numericIds,
        paymentStatus,
      }
    );
    return response.data;
  } catch (error) {
    throw formatError(error);
  }
};

/**
 * Formats API errors into a consistent format
 * @param error Original error object
 */
const formatError = (error: any): Error => {
  if (error.status && error.message) {
    // Already formatted by api-client interceptor
    return error;
  }

  return new Error(
    error.message || 'An unknown error occurred while processing your request'
  );
};
