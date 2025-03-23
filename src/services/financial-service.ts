// src/services/financial-service.ts
import { apiClient, ApiError, ApiResponse } from './api-client';
import {
  FinancialFilterOptions,
  FinancialSummary,
  MaterialCostTrend,
  PlatformPerformance,
  ProductTypeMetric,
  ProjectFinancials,
  RevenueTrend,
  TimeFrame,
  CostOptimizationInsight,
  PricingCalculatorInputs,
  PricingCalculatorResults
} from '../types/financialTypes';

const BASE_URL = '/financial';

/**
 * Get financial summary with optional filters
 */
export const getFinancialSummary = async (
  filters: FinancialFilterOptions
): Promise<FinancialSummary> => {
  try {
    const response = await apiClient.get<FinancialSummary>(
      `${BASE_URL}/summary`,
      { params: convertFiltersToParams(filters) }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching financial summary:', error);
    throw formatApiError(error);
  }
};

/**
 * Get revenue trends with optional filters
 */
export const getRevenueTrends = async (
  filters: FinancialFilterOptions
): Promise<RevenueTrend[]> => {
  try {
    const response = await apiClient.get<RevenueTrend[]>(
      `${BASE_URL}/revenue-trends`,
      { params: convertFiltersToParams(filters) }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching revenue trends:', error);
    throw formatApiError(error);
  }
};

/**
 * Get product type metrics with optional filters
 */
export const getProductTypeMetrics = async (
  filters: FinancialFilterOptions
): Promise<ProductTypeMetric[]> => {
  try {
    const response = await apiClient.get<ProductTypeMetric[]>(
      `${BASE_URL}/product-metrics`,
      { params: convertFiltersToParams(filters) }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching product metrics:', error);
    throw formatApiError(error);
  }
};

/**
 * Get material cost trends with optional filters
 */
export const getMaterialCostTrends = async (
  filters: FinancialFilterOptions
): Promise<MaterialCostTrend[]> => {
  try {
    const response = await apiClient.get<MaterialCostTrend[]>(
      `${BASE_URL}/material-costs`,
      { params: convertFiltersToParams(filters) }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching material costs:', error);
    throw formatApiError(error);
  }
};

/**
 * Get project financials with optional filters
 */
export const getProjectFinancials = async (
  filters: FinancialFilterOptions
): Promise<ProjectFinancials[]> => {
  try {
    const response = await apiClient.get<ProjectFinancials[]>(
      `${BASE_URL}/project-financials`,
      { params: convertFiltersToParams(filters) }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching project financials:', error);
    throw formatApiError(error);
  }
};

/**
 * Get cost optimization insights
 */
export const getCostOptimizationInsights = async (): Promise<
  CostOptimizationInsight[]
> => {
  try {
    const response = await apiClient.get<CostOptimizationInsight[]>(
      `${BASE_URL}/cost-insights`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching cost insights:', error);
    throw formatApiError(error);
  }
};

/**
 * Get platform performance metrics with optional filters
 */
export const getPlatformPerformance = async (
  filters: FinancialFilterOptions
): Promise<PlatformPerformance[]> => {
  try {
    const response = await apiClient.get<PlatformPerformance[]>(
      `${BASE_URL}/platform-performance`,
      { params: convertFiltersToParams(filters) }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching platform performance:', error);
    throw formatApiError(error);
  }
};

/**
 * Calculate pricing based on provided inputs
 */
export const calculatePricing = async (
  inputs: PricingCalculatorInputs
): Promise<PricingCalculatorResults> => {
  try {
    const response = await apiClient.post<PricingCalculatorResults>(
      `${BASE_URL}/calculate-pricing`,
      inputs
    );
    return response.data;
  } catch (error) {
    console.error('Error calculating pricing:', error);
    throw formatApiError(error);
  }
};

/**
 * Export financial data in specified format
 */
export const exportFinancialData = async (
  format: string,
  filters: FinancialFilterOptions,
  sections: string[]
): Promise<Blob> => {
  try {
    const response = await apiClient.get(`${BASE_URL}/export`, {
      params: {
        format,
        ...convertFiltersToParams(filters),
        sections: sections.join(',')
      },
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Error exporting financial data:', error);
    throw formatApiError(error);
  }
};

// Helper functions

/**
 * Convert filter options to API parameters
 */
const convertFiltersToParams = (filters: FinancialFilterOptions): Record<string, string> => {
  const params: Record<string, string> = {};
  
  if (filters.timeFrame) {
    params.timeFrame = filters.timeFrame;
  }
  
  if (filters.platform) {
    params.platform = filters.platform;
  }
  
  if (filters.productType) {
    params.productType = filters.productType;
  }
  
  if (filters.dateRange) {
    params.startDate = filters.dateRange.start.toISOString();
    params.endDate = filters.dateRange.end.toISOString();
  }
  
  return params;
};

/**
 * Format API error for consistent error handling
 */
const formatApiError = (error: unknown): Error => {
  if (error instanceof Error) {
    return error;
  }
  
  if (typeof error === 'string') {
    return new Error(error);
  }
  
  return new Error('An unknown error occurred');
};