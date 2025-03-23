// src/services/revenue-analytics-service.ts
import { SalesChannel } from '../types/salesTypes';
import { apiClient, ApiResponse } from './api-client';

// Define types for the revenue analytics data
export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface RevenueMetrics {
  totalRevenue: number;
  netRevenue: number;
  totalFees: number;
  totalShipping: number;
  totalTax: number;
  averageOrderValue: number;
  orderCount: number;
  byChannel: Record<
    SalesChannel,
    {
      revenue: number;
      orders: number;
      netRevenue: number;
      fees: number;
      averageOrderValue: number;
    }
  >;
  byMonth: Array<{
    month: string;
    revenue: number;
    netRevenue: number;
    orderCount: number;
  }>;
  byProduct: Array<{
    productName: string;
    quantity: number;
    revenue: number;
    averagePrice: number;
  }>;
}

// API endpoints
const ENDPOINTS = {
  REVENUE_METRICS: '/analytics/revenue',
  REVENUE_BY_CHANNEL: '/analytics/revenue/channel',
  REVENUE_BY_MONTH: '/analytics/revenue/month',
  REVENUE_BY_PRODUCT: '/analytics/revenue/product',
};

/**
 * Fetches comprehensive revenue metrics for a date range
 */
export const getRevenueMetrics = async (
  dateRange: DateRange
): Promise<RevenueMetrics> => {
  try {
    const response: ApiResponse<RevenueMetrics> = await apiClient.get(
      ENDPOINTS.REVENUE_METRICS,
      {
        params: {
          startDate: dateRange.startDate.toISOString(),
          endDate: dateRange.endDate.toISOString(),
        },
      }
    );
    return response.data;
  } catch (error) {
    throw formatError(error);
  }
};

/**
 * Fetches revenue metrics broken down by channel for a date range
 */
export const getRevenueByChannel = async (
  dateRange: DateRange
): Promise<
  Record<
    SalesChannel,
    {
      revenue: number;
      orders: number;
      netRevenue: number;
      fees: number;
      averageOrderValue: number;
    }
  >
> => {
  try {
    const response: ApiResponse<
      Record<
        SalesChannel,
        {
          revenue: number;
          orders: number;
          netRevenue: number;
          fees: number;
          averageOrderValue: number;
        }
      >
    > = await apiClient.get(ENDPOINTS.REVENUE_BY_CHANNEL, {
      params: {
        startDate: dateRange.startDate.toISOString(),
        endDate: dateRange.endDate.toISOString(),
      },
    });
    return response.data;
  } catch (error) {
    throw formatError(error);
  }
};

/**
 * Fetches revenue metrics broken down by month for a date range
 */
export const getRevenueByMonth = async (
  dateRange: DateRange
): Promise<
  Array<{
    month: string;
    revenue: number;
    netRevenue: number;
    orderCount: number;
  }>
> => {
  try {
    const response: ApiResponse<
      Array<{
        month: string;
        revenue: number;
        netRevenue: number;
        orderCount: number;
      }>
    > = await apiClient.get(ENDPOINTS.REVENUE_BY_MONTH, {
      params: {
        startDate: dateRange.startDate.toISOString(),
        endDate: dateRange.endDate.toISOString(),
      },
    });
    return response.data;
  } catch (error) {
    throw formatError(error);
  }
};

/**
 * Fetches revenue metrics broken down by product for a date range
 */
export const getRevenueByProduct = async (
  dateRange: DateRange
): Promise<
  Array<{
    productName: string;
    quantity: number;
    revenue: number;
    averagePrice: number;
  }>
> => {
  try {
    const response: ApiResponse<
      Array<{
        productName: string;
        quantity: number;
        revenue: number;
        averagePrice: number;
      }>
    > = await apiClient.get(ENDPOINTS.REVENUE_BY_PRODUCT, {
      params: {
        startDate: dateRange.startDate.toISOString(),
        endDate: dateRange.endDate.toISOString(),
      },
    });
    return response.data;
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
