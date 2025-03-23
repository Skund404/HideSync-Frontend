// src/services/integrations/integration-service.ts
import { Sale, SalesChannel } from '../../types/salesTypes';
import { apiClient, ApiError } from '../api-client';

/**
 * PlatformIntegration interface that aligns with the ER diagram
 */
export interface PlatformIntegration {
  id: string;
  platform: SalesChannel;
  shop_name?: string;
  api_key?: string;
  api_secret?: string;
  access_token?: string;
  refresh_token?: string;
  token_expires_at?: Date;
  active: boolean;
  settings?: Record<string, any>;
  lastSyncAt?: Date;
}

/**
 * SyncEvent interface that aligns with the ER diagram
 */
export interface SyncEvent {
  id: string;
  platform_integration_id: string;
  created_at: Date;
  event_type: 'order_import' | 'inventory_update' | string;
  status: 'success' | 'error';
  items_processed: number;
  message: string;
}

/**
 * OAuth configuration for platform authentication
 */
export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
  state?: string;
  platform: SalesChannel;
}

/**
 * Integration filters for fetching integrations
 */
export interface IntegrationFilters {
  platform?: SalesChannel;
  active?: boolean;
}

/**
 * Pagination parameters for API requests
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

const BASE_URL = '/integrations';

/**
 * Format the error for consistent error handling
 * @param error The caught error
 * @param context Additional context information
 */
const formatError = (error: unknown, context: string): ApiError => {
  const apiError = error as ApiError;
  console.error(`Error ${context}:`, apiError);
  return apiError;
};

/**
 * Get all platform integrations
 * @param filters Optional filters to apply
 * @param pagination Optional pagination parameters
 */
export const getIntegrations = async (
  filters?: IntegrationFilters,
  pagination?: PaginationParams
): Promise<PlatformIntegration[]> => {
  try {
    const response = await apiClient.get<PlatformIntegration[]>(BASE_URL, {
      params: { ...filters, ...pagination },
    });
    return response.data;
  } catch (error) {
    throw formatError(error, 'fetching integrations');
  }
};

/**
 * Get a specific platform integration by ID
 * @param id The integration ID
 */
export const getIntegrationById = async (
  id: string
): Promise<PlatformIntegration> => {
  try {
    const response = await apiClient.get<PlatformIntegration>(
      `${BASE_URL}/${id}`
    );
    return response.data;
  } catch (error) {
    throw formatError(error, `fetching integration with id ${id}`);
  }
};

/**
 * Create a new platform integration
 * @param integration The integration data to create
 */
export const createIntegration = async (
  integration: Partial<PlatformIntegration>
): Promise<PlatformIntegration> => {
  try {
    const response = await apiClient.post<PlatformIntegration>(
      BASE_URL,
      integration
    );
    return response.data;
  } catch (error) {
    throw formatError(error, 'creating integration');
  }
};

/**
 * Update an existing platform integration
 * @param id The integration ID to update
 * @param integration The updated integration data
 */
export const updateIntegration = async (
  id: string,
  integration: Partial<PlatformIntegration>
): Promise<PlatformIntegration> => {
  try {
    const response = await apiClient.put<PlatformIntegration>(
      `${BASE_URL}/${id}`,
      integration
    );
    return response.data;
  } catch (error) {
    throw formatError(error, `updating integration with id ${id}`);
  }
};

/**
 * Delete a platform integration
 * @param id The integration ID to delete
 */
export const deleteIntegration = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`${BASE_URL}/${id}`);
  } catch (error) {
    throw formatError(error, `deleting integration with id ${id}`);
  }
};

/**
 * Generate an OAuth URL for platform authorization
 * @param config OAuth configuration
 */
export const generateAuthUrl = async (config: OAuthConfig): Promise<string> => {
  try {
    const response = await apiClient.post<{ url: string }>(
      `${BASE_URL}/auth-url`,
      config
    );
    return response.data.url;
  } catch (error) {
    throw formatError(error, 'generating auth URL');
  }
};

/**
 * Exchange an OAuth code for an access token
 * @param platform The marketplace platform
 * @param code The authorization code
 * @param redirectUri The redirect URI used during authorization
 */
export const exchangeAuthCode = async (
  platform: SalesChannel,
  code: string,
  redirectUri: string
): Promise<PlatformIntegration> => {
  try {
    const response = await apiClient.post<PlatformIntegration>(
      `${BASE_URL}/exchange-token`,
      {
        platform,
        code,
        redirectUri,
      }
    );
    return response.data;
  } catch (error) {
    throw formatError(error, 'exchanging auth code');
  }
};

/**
 * Sync orders from a platform
 * @param integrationId The integration ID
 * @param fromDate Optional date to sync from
 */
export const syncOrders = async (
  integrationId: string,
  fromDate?: Date
): Promise<SyncEvent> => {
  try {
    const response = await apiClient.post<SyncEvent>(
      `${BASE_URL}/${integrationId}/sync-orders`,
      {
        fromDate: fromDate?.toISOString(),
      }
    );
    return response.data;
  } catch (error) {
    throw formatError(error, `syncing orders for integration ${integrationId}`);
  }
};

/**
 * Get sync events for an integration
 * @param integrationId The integration ID
 * @param pagination Optional pagination parameters
 */
export const getSyncEvents = async (
  integrationId: string,
  pagination?: PaginationParams
): Promise<SyncEvent[]> => {
  try {
    const response = await apiClient.get<SyncEvent[]>(
      `${BASE_URL}/${integrationId}/sync-events`,
      { params: pagination }
    );
    return response.data;
  } catch (error) {
    throw formatError(
      error,
      `fetching sync events for integration ${integrationId}`
    );
  }
};

/**
 * Get recent orders from a platform integration
 * @param integrationId The integration ID
 * @param limit Maximum number of orders to return
 */
export const getRecentOrders = async (
  integrationId: string,
  limit: number = 10
): Promise<Sale[]> => {
  try {
    const response = await apiClient.get<Sale[]>(
      `${BASE_URL}/${integrationId}/recent-orders`,
      {
        params: { limit },
      }
    );
    return response.data;
  } catch (error) {
    throw formatError(
      error,
      `fetching recent orders for integration ${integrationId}`
    );
  }
};

/**
 * Update fulfillment for an order in the platform
 * @param integrationId The integration ID
 * @param orderId The order ID to update
 * @param trackingNumber The tracking number
 * @param shippingProvider The shipping provider
 */
export const updateOrderFulfillment = async (
  integrationId: string,
  orderId: string,
  trackingNumber: string,
  shippingProvider: string
): Promise<boolean> => {
  try {
    const response = await apiClient.post<{ success: boolean }>(
      `${BASE_URL}/${integrationId}/update-fulfillment`,
      {
        orderId,
        trackingNumber,
        shippingProvider,
      }
    );
    return response.data.success;
  } catch (error) {
    throw formatError(error, `updating fulfillment for order ${orderId}`);
  }
};

/**
 * Test a platform integration connection
 * @param integrationId The integration ID to test
 */
export const testIntegrationConnection = async (
  integrationId: string
): Promise<boolean> => {
  try {
    const response = await apiClient.post<{ success: boolean }>(
      `${BASE_URL}/${integrationId}/test-connection`
    );
    return response.data.success;
  } catch (error) {
    // Don't throw here, just log and return false
    const apiError = error as ApiError;
    console.error(
      `Error testing connection for integration ${integrationId}:`,
      apiError
    );
    return false;
  }
};
