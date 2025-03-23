// src/services/sales-report-service.ts
import { PaymentStatus } from '../types/enums';
import { FulfillmentStatus, SalesChannel } from '../types/salesTypes';
import { apiClient, ApiResponse } from './api-client';

// Types for report data
export interface SalesReportFilters {
  startDate: Date;
  endDate: Date;
  channels?: SalesChannel[];
}

export interface SalesMetrics {
  totalOrders: number;
  totalRevenue: number;
  totalFees: number;
  netRevenue: number;
  avgOrderValue: number;
  fulfillmentBreakdown: Record<FulfillmentStatus, number>;
  paymentBreakdown: Record<PaymentStatus, number>;
  channelBreakdown: Record<
    SalesChannel,
    { count: number; revenue: number; fees: number }
  >;
  dailySales: Array<{
    date: string;
    orders: number;
    revenue: number;
    fees: number;
  }>;
  productSales: Array<{ name: string; quantity: number; revenue: number }>;
}

// API endpoints
const ENDPOINTS = {
  SALES_REPORT: '/reports/sales',
  EXPORT_REPORT: (format: string) => `/reports/sales/export/${format}`,
};

/**
 * Fetches sales report metrics based on the provided filters
 */
export const getSalesReportMetrics = async (
  filters: SalesReportFilters
): Promise<SalesMetrics> => {
  try {
    const response: ApiResponse<SalesMetrics> = await apiClient.get(
      ENDPOINTS.SALES_REPORT,
      {
        params: {
          startDate: filters.startDate.toISOString(),
          endDate: filters.endDate.toISOString(),
          channels: filters.channels ? filters.channels.join(',') : undefined,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw formatError(error);
  }
};

/**
 * Exports a sales report in the specified format
 * Returns a URL to the downloadable file
 */
export const exportSalesReport = async (
  filters: SalesReportFilters,
  format: 'csv' | 'pdf'
): Promise<string> => {
  try {
    const response: ApiResponse<{ downloadUrl: string }> = await apiClient.post(
      ENDPOINTS.EXPORT_REPORT(format),
      {
        ...filters,
        startDate: filters.startDate.toISOString(),
        endDate: filters.endDate.toISOString(),
      }
    );
    return response.data.downloadUrl;
  } catch (error) {
    throw formatError(error);
  }
};

/**
 * Formats API errors into a consistent format
 */
const formatError = (error: any): Error => {
  if (error.status && error.message) {
    // Already formatted by api-client interceptor
    return new Error(error.message);
  }

  return new Error(
    error.message || 'An unknown error occurred while processing your request'
  );
};
