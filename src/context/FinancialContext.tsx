import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  exportFinancialData,
  getCostOptimizationInsights,
  getFinancialSummary,
  getMaterialCostTrends,
  getPlatformPerformance,
  getProductTypeMetrics,
  getProjectFinancials,
  getRevenueTrends,
} from '../services/mock/financial';
import {
  CostOptimizationInsight,
  FinancialFilterOptions,
  FinancialSummary,
  MaterialCostTrend,
  PlatformPerformance,
  PricingCalculatorInputs,
  PricingCalculatorResults,
  ProductTypeMetric,
  ProjectFinancials,
  RevenueTrend,
  TimeFrame,
} from '../types/financialTypes';
import { calculatePricing } from '../utils/financialHelpers';

interface FinancialContextProps {
  // State
  summary: FinancialSummary | null;
  revenueTrends: RevenueTrend[];
  productMetrics: ProductTypeMetric[];
  materialCosts: MaterialCostTrend[];
  projectFinancials: ProjectFinancials[];
  costInsights: CostOptimizationInsight[];
  platformPerformance: PlatformPerformance[];
  loading: boolean;
  error: string | null;
  filters: FinancialFilterOptions;
  calculatorInputs: PricingCalculatorInputs;
  calculatorResults: PricingCalculatorResults;

  // Actions
  setFilters: (filters: Partial<FinancialFilterOptions>) => void;
  refreshData: () => Promise<void>;
  exportData: (format: 'csv' | 'excel' | 'pdf') => Promise<boolean>;
  updateCalculatorInputs: (inputs: Partial<PricingCalculatorInputs>) => void;
}

const defaultCalculatorInputs: PricingCalculatorInputs = {
  materialCost: 75,
  hardwareCost: 25,
  laborHours: 4,
  laborRate: 35,
  overhead: 20,
  targetMargin: 40,
  // Advanced options
  shippingCost: 0,
  packagingCost: 0,
  platformFees: 0,
  marketingCost: 0,
};

const FinancialContext = createContext<FinancialContextProps | undefined>(
  undefined
);

export const FinancialProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // State
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [revenueTrends, setRevenueTrends] = useState<RevenueTrend[]>([]);
  const [productMetrics, setProductMetrics] = useState<ProductTypeMetric[]>([]);
  const [materialCosts, setMaterialCosts] = useState<MaterialCostTrend[]>([]);
  const [projectFinancials, setProjectFinancials] = useState<
    ProjectFinancials[]
  >([]);
  const [costInsights, setCostInsights] = useState<CostOptimizationInsight[]>(
    []
  );
  const [platformPerformance, setPlatformPerformance] = useState<
    PlatformPerformance[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<FinancialFilterOptions>({
    timeFrame: TimeFrame.LAST_6_MONTHS,
  });
  const [calculatorInputs, setCalculatorInputs] =
    useState<PricingCalculatorInputs>(defaultCalculatorInputs);
  const [calculatorResults, setCalculatorResults] =
    useState<PricingCalculatorResults>(
      calculatePricing(defaultCalculatorInputs)
    );

  // Load initial data
  useEffect(() => {
    loadFinancialData();
  }, [filters]);

  // Update calculator results when inputs change
  useEffect(() => {
    setCalculatorResults(calculatePricing(calculatorInputs));
  }, [calculatorInputs]);

  // Main data loading function
  const loadFinancialData = async () => {
    try {
      setLoading(true);

      // Load all data in parallel
      const [
        summaryData,
        revenueData,
        productData,
        materialData,
        projectData,
        insightsData,
        platformData,
      ] = await Promise.all([
        getFinancialSummary(filters),
        getRevenueTrends(filters),
        getProductTypeMetrics(filters),
        getMaterialCostTrends(filters),
        getProjectFinancials(filters),
        getCostOptimizationInsights(),
        getPlatformPerformance(filters),
      ]);

      // Update state with fetched data
      setSummary(summaryData);
      setRevenueTrends(revenueData);
      setProductMetrics(productData);
      setMaterialCosts(materialData);
      setProjectFinancials(projectData);
      setCostInsights(insightsData);
      setPlatformPerformance(platformData);
      setError(null);
    } catch (err) {
      console.error('Error loading financial data:', err);
      setError('Failed to load financial data');
    } finally {
      setLoading(false);
    }
  };

  // Update filters and trigger data reload
  const setFilters = (newFilters: Partial<FinancialFilterOptions>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
  };

  // Manual refresh function
  const refreshData = async () => {
    await loadFinancialData();
  };

  // Export data function
  // Updated export method to support more detailed options
  const exportData = async (
    format: 'csv' | 'excel' | 'pdf',
    options?: {
      timeframe?: TimeFrame;
      includeSections?: {
        revenueData?: boolean;
        materialCosts?: boolean;
        productMetrics?: boolean;
        projectFinancials?: boolean;
        platformData?: boolean;
        costInsights?: boolean;
        pricingReferences?: boolean;
      };
    }
  ): Promise<boolean> => {
    try {
      // Generate a timestamped filename
      const timestamp = new Date()
        .toISOString()
        .replace(/[-:]/g, '')
        .substring(0, 15);
      const filename = `hidesync_financial_export_${timestamp}`;

      // Use the current filters or override with provided options
      const exportFilters = {
        ...filters,
        ...(options?.timeframe ? { timeFrame: options.timeframe } : {}),
      };

      // Determine which sections to include
      const includeSections = {
        revenueData: true,
        materialCosts: true,
        productMetrics: true,
        projectFinancials: true,
        platformData: true,
        costInsights: false,
        pricingReferences: false,
        ...options?.includeSections,
      };

      // Fetch all data
      const [
        summaryData,
        revenueData,
        productData,
        materialData,
        projectData,
        platformData,
        costInsightsData,
      ] = await Promise.all([
        getFinancialSummary(exportFilters),
        includeSections.revenueData
          ? getRevenueTrends(exportFilters)
          : Promise.resolve([]),
        includeSections.productMetrics
          ? getProductTypeMetrics(exportFilters)
          : Promise.resolve([]),
        includeSections.materialCosts
          ? getMaterialCostTrends(exportFilters)
          : Promise.resolve([]),
        includeSections.projectFinancials
          ? getProjectFinancials(exportFilters)
          : Promise.resolve([]),
        includeSections.platformData
          ? getPlatformPerformance(exportFilters)
          : Promise.resolve([]),
        includeSections.costInsights
          ? getCostOptimizationInsights()
          : Promise.resolve([]),
      ]);

      // Prepare export data
      const exportData = {
        summary: summaryData,
        revenueTrends: revenueData,
        productMetrics: productData,
        materialCosts: materialData,
        projectFinancials: projectData,
        platformPerformance: platformData,
        costInsights: costInsightsData,
      };

      // Use the existing export function with prepared data
      const blob = await exportFinancialData(format, exportData);

      // Create download link and trigger the download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      return true;
    } catch (err) {
      console.error('Error exporting data:', err);
      return false;
    }
  };
  // Update calculator inputs
  const updateCalculatorInputs = (inputs: Partial<PricingCalculatorInputs>) => {
    setCalculatorInputs((prev) => ({ ...prev, ...inputs }));
  };

  // Context value
  const value = {
    summary,
    revenueTrends,
    productMetrics,
    materialCosts,
    projectFinancials,
    costInsights,
    platformPerformance,
    loading,
    error,
    filters,
    calculatorInputs,
    calculatorResults,
    setFilters,
    refreshData,
    exportData,
    updateCalculatorInputs,
  };

  return (
    <FinancialContext.Provider value={value}>
      {children}
    </FinancialContext.Provider>
  );
};

export const useFinancial = () => {
  const context = useContext(FinancialContext);
  if (context === undefined) {
    throw new Error('useFinancial must be used within a FinancialProvider');
  }
  return context;
};
