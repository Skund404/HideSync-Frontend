// src/services/channel-metrics-service.ts
import { SalesChannel } from '../types/salesTypes';
import { apiClient, ApiResponse } from './api-client';

// Define types for channel metrics
export interface ChannelMetric {
  channel: SalesChannel;
  orderCount: number;
  revenue: number;
  averageOrderValue: number;
  platformFees: number;
  netRevenue: number;
  percentOfTotal: number;
}

export interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

// API endpoints
const ENDPOINTS = {
  CHANNEL_METRICS: '/analytics/channels',
  CHANNEL_INSIGHTS: '/analytics/channels/insights',
};

/**
 * Fetches channel metrics for the given date range
 */
export const getChannelMetrics = async (
  dateRange: DateRange
): Promise<ChannelMetric[]> => {
  try {
    // Build params
    const params: any = {};
    if (dateRange.startDate) {
      params.startDate = dateRange.startDate.toISOString();
    }
    if (dateRange.endDate) {
      params.endDate = dateRange.endDate.toISOString();
    }

    const response: ApiResponse<ChannelMetric[]> = await apiClient.get(
      ENDPOINTS.CHANNEL_METRICS,
      { params }
    );
    return response.data;
  } catch (error) {
    throw formatError(error);
  }
};

/**
 * Fetches summary metrics including total revenue, orders, and fees
 */
export const getChannelSummaryMetrics = async (
  dateRange: DateRange
): Promise<{
  totalRevenue: number;
  totalOrders: number;
  totalFees: number;
}> => {
  try {
    // Build params
    const params: any = {};
    if (dateRange.startDate) {
      params.startDate = dateRange.startDate.toISOString();
    }
    if (dateRange.endDate) {
      params.endDate = dateRange.endDate.toISOString();
    }

    const response: ApiResponse<{
      totalRevenue: number;
      totalOrders: number;
      totalFees: number;
    }> = await apiClient.get(`${ENDPOINTS.CHANNEL_METRICS}/summary`, {
      params,
    });

    return response.data;
  } catch (error) {
    throw formatError(error);
  }
};

/**
 * Fetches channel insights such as highest revenue channel, highest AOV, etc.
 */
export const getChannelInsights = async (
  dateRange: DateRange
): Promise<{
  highestRevenue: ChannelMetric;
  highestAOV: ChannelMetric;
  mostOrders: ChannelMetric;
  lowestFees: ChannelMetric;
}> => {
  try {
    // Build params
    const params: any = {};
    if (dateRange.startDate) {
      params.startDate = dateRange.startDate.toISOString();
    }
    if (dateRange.endDate) {
      params.endDate = dateRange.endDate.toISOString();
    }

    const response: ApiResponse<{
      highestRevenue: ChannelMetric;
      highestAOV: ChannelMetric;
      mostOrders: ChannelMetric;
      lowestFees: ChannelMetric;
    }> = await apiClient.get(ENDPOINTS.CHANNEL_INSIGHTS, { params });

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
