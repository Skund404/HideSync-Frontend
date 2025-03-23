// src/services/dashboard-service.ts
import { DashboardSummary } from '@/types/dashboardTypes';
import { handleApiError } from '@/utils/errorHandler';
import { apiClient } from './api-client';

const BASE_URL = '/dashboard';

/**
 * Get dashboard summary data
 * @returns Dashboard summary data including active projects, pending orders, etc.
 */
export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  try {
    const response = await apiClient.get<DashboardSummary>(
      `${BASE_URL}/summary`
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching dashboard summary: ${handleApiError(error)}`);
    throw error;
  }
};

/**
 * Get recent activity for the dashboard
 * @param limit Maximum number of activities to return
 * @returns List of recent activities
 */
export const getRecentActivity = async (limit: number = 5): Promise<any[]> => {
  try {
    const response = await apiClient.get<any[]>(
      `${BASE_URL}/recent-activity?limit=${limit}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching recent activity: ${handleApiError(error)}`);
    return [];
  }
};

/**
 * Get material stock summary for the dashboard
 * @returns List of materials with stock levels and status
 */
export const getMaterialStockSummary = async (): Promise<any[]> => {
  try {
    const response = await apiClient.get<any[]>(`${BASE_URL}/material-stock`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching material stock: ${handleApiError(error)}`);
    return [];
  }
};

/**
 * Get upcoming project deadlines
 * @param days Number of days to look ahead
 * @returns List of upcoming project deadlines
 */
export const getUpcomingDeadlines = async (
  days: number = 7
): Promise<any[]> => {
  try {
    const response = await apiClient.get<any[]>(
      `${BASE_URL}/upcoming-deadlines?days=${days}`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching upcoming deadlines: ${handleApiError(error)}`
    );
    return [];
  }
};

/**
 * Get supplier activity summary
 * @param limit Maximum number of activities to return
 * @returns List of recent supplier activities
 */
export const getSupplierActivity = async (
  limit: number = 5
): Promise<any[]> => {
  try {
    const response = await apiClient.get<any[]>(
      `${BASE_URL}/supplier-activity?limit=${limit}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching supplier activity: ${handleApiError(error)}`);
    return [];
  }
};

/**
 * Get tools needing maintenance
 * @returns List of tools that need maintenance
 */
export const getToolsMaintenance = async (): Promise<any[]> => {
  try {
    const response = await apiClient.get<any[]>(
      `${BASE_URL}/tools-maintenance`
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching tools maintenance: ${handleApiError(error)}`);
    return [];
  }
};

/**
 * Get storage utilization summary
 * @returns Storage utilization data
 */
export const getStorageUtilization = async (): Promise<any> => {
  try {
    const response = await apiClient.get<any>(
      `${BASE_URL}/storage-utilization`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching storage utilization: ${handleApiError(error)}`
    );
    return { totalLocations: 0, usedLocations: 0, utilizationPercentage: 0 };
  }
};

/**
 * Get purchase timeline data
 * @param days Number of days to look ahead
 * @returns Purchase timeline data
 */
export const getPurchaseTimeline = async (
  days: number = 30
): Promise<any[]> => {
  try {
    const response = await apiClient.get<any[]>(
      `${BASE_URL}/purchase-timeline?days=${days}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching purchase timeline: ${handleApiError(error)}`);
    return [];
  }
};

/**
 * Get top selling products
 * @param limit Maximum number of products to return
 * @returns List of top selling products
 */
export const getTopProducts = async (limit: number = 5): Promise<any[]> => {
  try {
    const response = await apiClient.get<any[]>(
      `${BASE_URL}/top-products?limit=${limit}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching top products: ${handleApiError(error)}`);
    return [];
  }
};

/**
 * Get consolidated dashboard data (all in one request)
 * @returns Complete dashboard data
 */
export const getConsolidatedDashboard = async (): Promise<DashboardSummary> => {
  try {
    const response = await apiClient.get<DashboardSummary>(`${BASE_URL}`);
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching consolidated dashboard: ${handleApiError(error)}`
    );
    throw error;
  }
};
