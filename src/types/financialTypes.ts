/**
 * Time frames for financial data
 */
export enum TimeFrame {
  LAST_MONTH = '1m',
  LAST_3_MONTHS = '3m',
  LAST_6_MONTHS = '6m',
  LAST_YEAR = '1y',
  ALL_TIME = 'all',
}

/**
 * Revenue and profitability data for a time period
 */
export interface RevenueTrend {
  month: string;
  revenue: number;
  costs: number;
  profit: number;
  margin?: number;
}

/**
 * Financial metrics by product type
 */
export interface ProductTypeMetric {
  name: string;
  sales: number;
  margin: number;
  quantity?: number;
  profitability?: number;
}

/**
 * Material cost breakdown over time
 */
export interface MaterialCostTrend {
  month: string;
  leather: number;
  hardware: number;
  thread: number;
  other: number;
}

/**
 * Financial data for a specific project
 */
export interface ProjectFinancials {
  id: string;
  name: string;
  customer: string;
  revenue: number;
  costs: number;
  profit: number;
  margin: number;
  date: string;
}

/**
 * Cost optimization insight for a material
 */
export interface CostOptimizationInsight {
  id: number;
  material: string;
  issue: string;
  impact: string;
  suggestion: string;
  savings: string;
}

/**
 * Pricing calculator inputs
 */
export interface PricingCalculatorInputs {
  materialCost: number;
  hardwareCost: number;
  laborHours: number;
  laborRate: number;
  overhead: number;
  targetMargin: number;

  // Advanced options
  shippingCost?: number;
  packagingCost?: number;
  platformFees?: number;
  marketingCost?: number;
}

/**
 * Pricing calculator results
 */
export interface PricingCalculatorResults {
  directCosts: string;
  overheadAmount: string;
  totalCost: string;
  suggestedPrice: string;
  profit: string;
  actualMargin: string;
}

/**
 * Platform-specific sales performance
 */
export interface PlatformPerformance {
  platform: 'shopify' | 'etsy' | 'amazon' | 'website' | 'other';
  sales: number;
  orders: number;
  profit: number;
  margin: number;
  yearOverYearGrowth?: number;
  fees: number;
}

/**
 * Financial summary for dashboard header
 */
export interface FinancialSummary {
  monthlyRevenue: number;
  averageMargin: number;
  materialCosts: number;
  potentialSavings: number;
  revenueGrowth: number;
  marginGrowth: number;
  costGrowth: number;
}

/**
 * Filter options for financial data
 */
export interface FinancialFilterOptions {
  timeFrame: TimeFrame;
  platform?: string;
  productType?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

/**
 * Material cost efficiency metrics
 */
export interface MaterialEfficiencyMetrics {
  materialType: string;
  usageEfficiency: number; // Percentage of material used vs waste
  costPerUnit: number;
  optimalPurchaseQuantity: number;
  recommendedSupplier: string;
  potentialSavings: number;
}

/**
 * Price point analysis for competitive pricing
 */
export interface PricePointAnalysis {
  productType: string;
  lowestMarketPrice: number;
  highestMarketPrice: number;
  averageMarketPrice: number;
  recommendedPriceRange: {
    min: number;
    max: number;
  };
  competitivenessScore: number; // 0-100 scale
}

/**
 * Workshop reference pricing guide configuration
 */
export interface WorkshopPricingGuide {
  baseMaterialCosts: Record<string, number>;
  baseHardwareCosts: Record<string, number>;
  standardProjectHours: Record<string, number>;
  hourlyRate: number;
  overheadRate: number;
  targetMargin: number;
  minimumMargin: number;
  customOptionsUpcharge: Record<string, number>;
}

/**
 * Export configuration options
 */
export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf';
  timeframe: TimeFrame;
  includeSections: string[];
  includeCharts: boolean;
  includeRawData: boolean;
  filename?: string;
  customHeader?: string;
}

/**
 * Material cost efficiency metrics
 */
export interface MaterialEfficiencyMetrics {
  materialType: string;
  usageEfficiency: number; // Percentage of material used vs waste
  costPerUnit: number;
  optimalPurchaseQuantity: number;
  recommendedSupplier: string;
  potentialSavings: number;
}

/**
 * Price point analysis for competitive pricing
 */
export interface PricePointAnalysis {
  productType: string;
  lowestMarketPrice: number;
  highestMarketPrice: number;
  averageMarketPrice: number;
  recommendedPriceRange: {
    min: number;
    max: number;
  };
  competitivenessScore: number; // 0-100 scale
}

/**
 * Workshop reference pricing guide configuration
 */
export interface WorkshopPricingGuide {
  baseMaterialCosts: Record<string, number>;
  baseHardwareCosts: Record<string, number>;
  standardProjectHours: Record<string, number>;
  hourlyRate: number;
  overheadRate: number;
  targetMargin: number;
  minimumMargin: number;
  customOptionsUpcharge: Record<string, number>;
}

/**
 * Export configuration options
 */
export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf';
  timeframe: TimeFrame;
  includeSections: string[];
  includeCharts: boolean;
  includeRawData: boolean;
  filename?: string;
  customHeader?: string;
}

/**
 * Material cost breakdown for a product
 */
export interface ProductMaterialCostBreakdown {
  productName: string;
  totalMaterialCost: number;
  leatherCost: number;
  hardwareCost: number;
  threadCost: number;
  otherMaterialCost: number;
  laborCost: number;
  overheadCost: number;
  totalCost: number;
  sellingPrice: number;
  margin: number;
}

/**
 * Common pricing scenarios for quick reference
 */
export interface CommonPricingScenario {
  name: string;
  description: string;
  basePrice: number;
  options: {
    name: string;
    price: number;
  }[];
  typicalMargin: number;
}
