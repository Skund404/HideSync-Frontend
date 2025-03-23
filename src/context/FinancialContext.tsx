import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { FinancialExportService } from '../services/export/financial-export-service';
import {
  calculatePricing as apiCalculatePricing,
  getCostOptimizationInsights,
  getFinancialSummary,
  getMaterialCostTrends,
  getPlatformPerformance,
  getProductTypeMetrics,
  getProjectFinancials,
  getRevenueTrends,
} from '../services/financial-service';
import { ExportOptions } from '../types/exportTypes';
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
  loadingState: {
    summary: boolean;
    revenueTrends: boolean;
    productMetrics: boolean;
    materialCosts: boolean;
    projectFinancials: boolean;
    costInsights: boolean;
    platformPerformance: boolean;
  };
  error: string | null;
  filters: FinancialFilterOptions;
  calculatorInputs: PricingCalculatorInputs;
  calculatorResults: PricingCalculatorResults;
  calculatorLoading: boolean;

  // Actions
  setFilters: (filters: Partial<FinancialFilterOptions>) => void;
  refreshData: () => Promise<void>;
  exportData: (
    format: 'csv' | 'excel' | 'pdf',
    options?: Partial<ExportOptions>
  ) => Promise<boolean>;
  updateCalculatorInputs: (inputs: Partial<PricingCalculatorInputs>) => void;
  recalculatePricing: () => Promise<void>;
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

  // Loading states
  const [loadingState, setLoadingState] = useState({
    summary: true,
    revenueTrends: true,
    productMetrics: true,
    materialCosts: true,
    projectFinancials: true,
    costInsights: true,
    platformPerformance: true,
  });

  // Calculate overall loading state
  const loading = Object.values(loadingState).some((state) => state);

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
  const [calculatorLoading, setCalculatorLoading] = useState<boolean>(false);

  // Main data loading function - use useCallback to fix useEffect dependency
  const loadFinancialData = useCallback(async () => {
    // Reset error state at the beginning
    setError(null);

    // Set all loading states to true
    setLoadingState({
      summary: true,
      revenueTrends: true,
      productMetrics: true,
      materialCosts: true,
      projectFinancials: true,
      costInsights: true,
      platformPerformance: true,
    });

    try {
      // Load summary data
      try {
        const summaryData = await getFinancialSummary(filters);
        setSummary(summaryData);
        setLoadingState((prev) => ({ ...prev, summary: false }));
      } catch (err) {
        console.error('Error loading summary data:', err);
        setLoadingState((prev) => ({ ...prev, summary: false }));
        // Don't set a global error for individual component failures
      }

      // Load revenue data
      try {
        const revenueData = await getRevenueTrends(filters);
        setRevenueTrends(revenueData);
        setLoadingState((prev) => ({ ...prev, revenueTrends: false }));
      } catch (err) {
        console.error('Error loading revenue data:', err);
        setLoadingState((prev) => ({ ...prev, revenueTrends: false }));
      }

      // Load product data
      try {
        const productData = await getProductTypeMetrics(filters);
        setProductMetrics(productData);
        setLoadingState((prev) => ({ ...prev, productMetrics: false }));
      } catch (err) {
        console.error('Error loading product data:', err);
        setLoadingState((prev) => ({ ...prev, productMetrics: false }));
      }

      // Load material data
      try {
        const materialData = await getMaterialCostTrends(filters);
        setMaterialCosts(materialData);
        setLoadingState((prev) => ({ ...prev, materialCosts: false }));
      } catch (err) {
        console.error('Error loading material data:', err);
        setLoadingState((prev) => ({ ...prev, materialCosts: false }));
      }

      // Load project data
      try {
        const projectData = await getProjectFinancials(filters);
        setProjectFinancials(projectData);
        setLoadingState((prev) => ({ ...prev, projectFinancials: false }));
      } catch (err) {
        console.error('Error loading project data:', err);
        setLoadingState((prev) => ({ ...prev, projectFinancials: false }));
      }

      // Load insights data
      try {
        const insightsData = await getCostOptimizationInsights();
        setCostInsights(insightsData);
        setLoadingState((prev) => ({ ...prev, costInsights: false }));
      } catch (err) {
        console.error('Error loading cost insights:', err);
        setLoadingState((prev) => ({ ...prev, costInsights: false }));
      }

      // Load platform data
      try {
        const platformData = await getPlatformPerformance(filters);
        setPlatformPerformance(platformData);
        setLoadingState((prev) => ({ ...prev, platformPerformance: false }));
      } catch (err) {
        console.error('Error loading platform data:', err);
        setLoadingState((prev) => ({ ...prev, platformPerformance: false }));
      }
    } catch (err) {
      console.error('Error loading financial data:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to load financial data'
      );

      // Reset all loading states
      setLoadingState({
        summary: false,
        revenueTrends: false,
        productMetrics: false,
        materialCosts: false,
        projectFinancials: false,
        costInsights: false,
        platformPerformance: false,
      });
    }
  }, [filters]); // Include filters in the dependency array

  // Load initial data
  useEffect(() => {
    loadFinancialData();
  }, [loadFinancialData]); // Now loadFinancialData is a dependency

  // Update filters and trigger data reload
  const setFilters = (newFilters: Partial<FinancialFilterOptions>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
  };

  // Manual refresh function
  const refreshData = async () => {
    await loadFinancialData();
  };

  // Export data function
  const exportData = async (
    format: 'csv' | 'excel' | 'pdf',
    options?: Partial<ExportOptions>
  ): Promise<boolean> => {
    try {
      // Convert string array sections to object with boolean properties if needed
      let includeSections = {
        revenueData: false,
        materialCosts: false,
        productMetrics: false,
        projectFinancials: false,
        platformData: false,
        costInsights: false,
        pricingReferences: false,
      };

      // If options include sections, use them
      if (options?.includeSections) {
        includeSections = options.includeSections;
      }

      // Prepare export options with defaults
      const exportOptions: ExportOptions = {
        format,
        timeframe: options?.timeframe || filters.timeFrame,
        includeSections,
      };

      // Prepare export data - handle null summary
      const exportData = {
        summary: summary || undefined,
        revenueTrends,
        productMetrics,
        materialCosts,
        projectFinancials,
        platformPerformance,
        costInsights,
      };

      // Use the export service
      const result = await FinancialExportService.exportFinancialData(
        exportOptions,
        exportData
      );

      return result.success;
    } catch (err) {
      console.error('Error exporting data:', err);
      return false;
    }
  };

  // Update calculator inputs
  const updateCalculatorInputs = (inputs: Partial<PricingCalculatorInputs>) => {
    setCalculatorInputs((prev) => ({ ...prev, ...inputs }));
  };

  // Recalculate pricing using API - use useCallback to fix useEffect dependency
  const recalculatePricing = useCallback(async () => {
    setCalculatorLoading(true);
    try {
      const results = await apiCalculatePricing(calculatorInputs);
      setCalculatorResults(results);
    } catch (err) {
      console.error('Error calculating pricing:', err);
      // Fallback to client-side calculation if API fails
      setCalculatorResults(calculatePricing(calculatorInputs));
    } finally {
      setCalculatorLoading(false);
    }
  }, [calculatorInputs]);

  // Update calculator results when inputs change
  useEffect(() => {
    // Use client-side calculation for immediate feedback
    const clientResults = calculatePricing(calculatorInputs);
    setCalculatorResults(clientResults);

    // Then get more accurate results from the API
    const fetchApiResults = async () => {
      await recalculatePricing();
    };

    // Use a debounce technique to avoid excessive API calls
    const timeoutId = setTimeout(fetchApiResults, 500);
    return () => clearTimeout(timeoutId);
  }, [calculatorInputs, recalculatePricing]); // Add recalculatePricing as dependency

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
    loadingState,
    error,
    filters,
    calculatorInputs,
    calculatorResults,
    calculatorLoading,
    setFilters,
    refreshData,
    exportData,
    updateCalculatorInputs,
    recalculatePricing,
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
