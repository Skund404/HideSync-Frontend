import {
  CostOptimizationInsight,
  FinancialFilterOptions,
  FinancialSummary,
  MaterialCostTrend,
  PlatformPerformance,
  ProductTypeMetric,
  ProjectFinancials,
  RevenueTrend,
  TimeFrame,
} from '@/types/financialTypes';

// Sample data for charts
const profitabilityData: RevenueTrend[] = [
  { month: 'Jan', revenue: 5800, costs: 3200, profit: 2600, margin: 44.8 },
  { month: 'Feb', revenue: 6200, costs: 3300, profit: 2900, margin: 46.8 },
  { month: 'Mar', revenue: 6800, costs: 3700, profit: 3100, margin: 45.6 },
  { month: 'Apr', revenue: 7000, costs: 4000, profit: 3000, margin: 42.9 },
  { month: 'May', revenue: 7500, costs: 4200, profit: 3300, margin: 44.0 },
  { month: 'Jun', revenue: 8000, costs: 4500, profit: 3500, margin: 43.8 },
  { month: 'Jul', revenue: 7800, costs: 4400, profit: 3400, margin: 43.6 },
  { month: 'Aug', revenue: 8200, costs: 4600, profit: 3600, margin: 43.9 },
  { month: 'Sep', revenue: 8500, costs: 4700, profit: 3800, margin: 44.7 },
  { month: 'Oct', revenue: 8800, costs: 4900, profit: 3900, margin: 44.3 },
  { month: 'Nov', revenue: 9200, costs: 5100, profit: 4100, margin: 44.6 },
  { month: 'Dec', revenue: 9500, costs: 5300, profit: 4200, margin: 44.2 },
];

const productTypeData: ProductTypeMetric[] = [
  { name: 'Wallets', sales: 28500, margin: 42, quantity: 285 },
  { name: 'Bags', sales: 45800, margin: 38, quantity: 152 },
  { name: 'Belts', sales: 18900, margin: 48, quantity: 210 },
  { name: 'Accessories', sales: 12400, margin: 52, quantity: 310 },
  { name: 'Custom Orders', sales: 32600, margin: 45, quantity: 63 },
];

const materialCostTrends: MaterialCostTrend[] = [
  { month: 'Jan', leather: 1800, hardware: 950, thread: 250, other: 200 },
  { month: 'Feb', leather: 1850, hardware: 920, thread: 230, other: 300 },
  { month: 'Mar', leather: 2100, hardware: 980, thread: 290, other: 330 },
  { month: 'Apr', leather: 2300, hardware: 1050, thread: 310, other: 340 },
  { month: 'May', leather: 2400, hardware: 1030, thread: 320, other: 450 },
  { month: 'Jun', leather: 2500, hardware: 1100, thread: 340, other: 560 },
  { month: 'Jul', leather: 2450, hardware: 1050, thread: 330, other: 570 },
  { month: 'Aug', leather: 2550, hardware: 1150, thread: 350, other: 550 },
  { month: 'Sep', leather: 2600, hardware: 1180, thread: 360, other: 560 },
  { month: 'Oct', leather: 2700, hardware: 1220, thread: 370, other: 610 },
  { month: 'Nov', leather: 2800, hardware: 1300, thread: 390, other: 610 },
  { month: 'Dec', leather: 2950, hardware: 1350, thread: 400, other: 600 },
];

const recentProjects: ProjectFinancials[] = [
  {
    id: 'P-1025',
    name: 'Custom Messenger Bag',
    customer: 'Robert Chen',
    revenue: 950,
    costs: 520,
    profit: 430,
    margin: 45.3,
    date: '2025-03-10',
  },
  {
    id: 'P-1024',
    name: 'Leather Wallet Set',
    customer: 'Emily Johnson',
    revenue: 450,
    costs: 210,
    profit: 240,
    margin: 53.3,
    date: '2025-03-08',
  },
  {
    id: 'P-1023',
    name: 'Belt Collection',
    customer: 'Northside Outfitters',
    revenue: 2800,
    costs: 1450,
    profit: 1350,
    margin: 48.2,
    date: '2025-03-05',
  },
  {
    id: 'P-1022',
    name: 'Leather Notebook Cover',
    customer: 'Michael Smith',
    revenue: 380,
    costs: 180,
    profit: 200,
    margin: 52.6,
    date: '2025-03-02',
  },
  {
    id: 'P-1021',
    name: 'Custom Watch Straps (5)',
    customer: 'Jessica Williams',
    revenue: 750,
    costs: 320,
    profit: 430,
    margin: 57.3,
    date: '2025-02-28',
  },
];

const materialCostInsights: CostOptimizationInsight[] = [
  {
    id: 1,
    material: 'Vegetable Tanned Leather',
    issue: 'Price increase of 8% in last quarter',
    impact: '$325 additional cost per month',
    suggestion: 'Consider bulk purchase from Supplier B at 5% discount',
    savings: '$180 per month',
  },
  {
    id: 2,
    material: 'Brass Hardware',
    issue: '12% of units wasted in production',
    impact: '$120 additional cost per month',
    suggestion: 'Implement hardware pre-check process',
    savings: '$90 per month',
  },
  {
    id: 3,
    material: 'Waxed Thread',
    issue: 'Using premium thread for non-visible areas',
    impact: '$75 additional cost per month',
    suggestion: 'Use standard thread for internal stitching',
    savings: '$60 per month',
  },
];

const platformPerformanceData: PlatformPerformance[] = [
  {
    platform: 'shopify',
    sales: 45200,
    orders: 218,
    profit: 19800,
    margin: 43.8,
    yearOverYearGrowth: 15.3,
    fees: 1245,
  },
  {
    platform: 'etsy',
    sales: 32800,
    orders: 185,
    profit: 14100,
    margin: 43.0,
    yearOverYearGrowth: 22.7,
    fees: 3930,
  },
  {
    platform: 'amazon',
    sales: 18500,
    orders: 94,
    profit: 7200,
    margin: 38.9,
    yearOverYearGrowth: 5.8,
    fees: 2775,
  },
  {
    platform: 'website',
    sales: 12800,
    orders: 58,
    profit: 6400,
    margin: 50.0,
    yearOverYearGrowth: 28.4,
    fees: 384,
  },
  {
    platform: 'other',
    sales: 4900,
    orders: 22,
    profit: 2200,
    margin: 44.9,
    yearOverYearGrowth: -2.1,
    fees: 98,
  },
];

// Financial summary for the dashboard
const financialSummary: FinancialSummary = {
  monthlyRevenue: 7500,
  averageMargin: 43.8,
  materialCosts: 4200,
  potentialSavings: 330,
  revenueGrowth: 8.2,
  marginGrowth: 2.1,
  costGrowth: 5.2,
};

// Helper function to filter data by timeframe
const filterDataByTimeFrame = <T extends { month: string }>(
  data: T[],
  timeFrame: TimeFrame
): T[] => {
  const months = {
    [TimeFrame.LAST_MONTH]: 1,
    [TimeFrame.LAST_3_MONTHS]: 3,
    [TimeFrame.LAST_6_MONTHS]: 6,
    [TimeFrame.LAST_YEAR]: 12,
    [TimeFrame.ALL_TIME]: data.length,
  };

  const count = months[timeFrame];
  return data.slice(-count);
};

// Mock API functions
export const getFinancialSummary = (
  filters: FinancialFilterOptions
): Promise<FinancialSummary> => {
  // In a real implementation, this would be adjusted based on filters
  return Promise.resolve(financialSummary);
};

export const getRevenueTrends = (
  filters: FinancialFilterOptions
): Promise<RevenueTrend[]> => {
  const filteredData = filterDataByTimeFrame(
    profitabilityData,
    filters.timeFrame
  );
  return Promise.resolve(filteredData);
};

export const getProductTypeMetrics = (
  filters: FinancialFilterOptions
): Promise<ProductTypeMetric[]> => {
  // In a real implementation, this would be adjusted based on filters
  return Promise.resolve(productTypeData);
};

export const getMaterialCostTrends = (
  filters: FinancialFilterOptions
): Promise<MaterialCostTrend[]> => {
  const filteredData = filterDataByTimeFrame(
    materialCostTrends,
    filters.timeFrame
  );
  return Promise.resolve(filteredData);
};

export const getProjectFinancials = (
  filters: FinancialFilterOptions
): Promise<ProjectFinancials[]> => {
  // In a real implementation, this would filter by date range and other criteria
  return Promise.resolve(recentProjects);
};

export const getCostOptimizationInsights = (): Promise<
  CostOptimizationInsight[]
> => {
  return Promise.resolve(materialCostInsights);
};

export const getPlatformPerformance = (
  filters: FinancialFilterOptions
): Promise<PlatformPerformance[]> => {
  // In a real implementation, this would be adjusted based on filters
  return Promise.resolve(platformPerformanceData);
};

// Additional helper functions for real implementations
// Updated export function to handle more detailed export
export const exportFinancialData = async (
  format: string,
  data?: {
    summary?: FinancialSummary;
    revenueTrends?: RevenueTrend[];
    productMetrics?: ProductTypeMetric[];
    projectFinancials?: ProjectFinancials[];
    platformPerformance?: PlatformPerformance[];
    materialCosts?: MaterialCostTrend[];
    costInsights?: CostOptimizationInsight[];
  }
): Promise<Blob> => {
  // Prepare the data to export, using mock data if not provided
  const exportData = {
    summary: data?.summary || financialSummary,
    revenueTrends: data?.revenueTrends || profitabilityData,
    productMetrics: data?.productMetrics || productTypeData,
    projectFinancials: data?.projectFinancials || recentProjects,
    platformPerformance: data?.platformPerformance || platformPerformanceData,
    materialCosts: data?.materialCosts || materialCostTrends,
    costInsights: data?.costInsights || materialCostInsights,
  };

  // Convert data to CSV
  const convertToCSV = () => {
    let csvContent = '';

    // Revenue Trends
    csvContent += 'Revenue Trends\n';
    csvContent += 'Month,Revenue,Costs,Profit,Margin\n';
    exportData.revenueTrends.forEach((trend) => {
      csvContent += `${trend.month},${trend.revenue},${trend.costs},${trend.profit},${trend.margin}\n`;
    });

    // Product Metrics
    csvContent += '\nProduct Metrics\n';
    csvContent += 'Product,Sales,Margin,Quantity\n';
    exportData.productMetrics.forEach((product) => {
      csvContent += `${product.name},${product.sales},${product.margin},${product.quantity}\n`;
    });

    // Project Financials
    csvContent += '\nProject Financials\n';
    csvContent += 'Project,Customer,Revenue,Costs,Profit,Margin,Date\n';
    exportData.projectFinancials.forEach((project) => {
      csvContent += `${project.name},${project.customer},${project.revenue},${project.costs},${project.profit},${project.margin},${project.date}\n`;
    });

    // Platform Performance
    csvContent += '\nPlatform Performance\n';
    csvContent +=
      'Platform,Sales,Orders,Profit,Margin,Year-over-Year Growth,Fees\n';
    exportData.platformPerformance.forEach((platform) => {
      csvContent += `${platform.platform},${platform.sales},${platform.orders},${platform.profit},${platform.margin},${platform.yearOverYearGrowth},${platform.fees}\n`;
    });

    // Cost Insights
    csvContent += '\nCost Optimization Insights\n';
    csvContent += 'Material,Issue,Impact,Suggestion,Savings\n';
    exportData.costInsights.forEach((insight) => {
      csvContent += `${insight.material},${insight.issue},${insight.impact},${insight.suggestion},${insight.savings}\n`;
    });

    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  };

  // Convert data to Excel (JSON representation)
  const convertToExcel = () => {
    const workbook = {
      Sheets: {
        'Revenue Trends': exportData.revenueTrends,
        'Product Metrics': exportData.productMetrics,
        'Project Financials': exportData.projectFinancials,
        'Platform Performance': exportData.platformPerformance,
        'Cost Insights': exportData.costInsights,
      },
      SheetNames: [
        'Revenue Trends',
        'Product Metrics',
        'Project Financials',
        'Platform Performance',
        'Cost Insights',
      ],
    };

    return new Blob([JSON.stringify(workbook)], {
      type: 'application/json;charset=utf-8;',
    });
  };

  // Convert data to PDF-like text
  const convertToPDF = () => {
    let pdfContent = 'HideSync Financial Export\n\n';

    // Revenue Trends
    pdfContent += 'Revenue Trends\n';
    exportData.revenueTrends.forEach((trend) => {
      pdfContent += `${trend.month}: Revenue $${trend.revenue}, Costs $${trend.costs}, Profit $${trend.profit}, Margin ${trend.margin}%\n`;
    });

    // Product Metrics
    pdfContent += '\nProduct Metrics\n';
    exportData.productMetrics.forEach((product) => {
      pdfContent += `${product.name}: Sales $${product.sales}, Margin ${product.margin}%, Quantity ${product.quantity}\n`;
    });

    // Project Financials
    pdfContent += '\nProject Financials\n';
    exportData.projectFinancials.forEach((project) => {
      pdfContent += `${project.name} (${project.customer}): Revenue $${project.revenue}, Costs $${project.costs}, Profit $${project.profit}, Margin ${project.margin}%, Date: ${project.date}\n`;
    });

    // Platform Performance
    pdfContent += '\nPlatform Performance\n';
    exportData.platformPerformance.forEach((platform) => {
      pdfContent += `${platform.platform.toUpperCase()}: Sales $${
        platform.sales
      }, Orders ${platform.orders}, Profit $${platform.profit}, Margin ${
        platform.margin
      }%, YoY Growth ${platform.yearOverYearGrowth}%, Fees $${platform.fees}\n`;
    });

    // Cost Insights
    pdfContent += '\nCost Optimization Insights\n';
    exportData.costInsights.forEach((insight) => {
      pdfContent += `${insight.material}: ${insight.issue}, Impact ${insight.impact}, Suggestion: ${insight.suggestion}, Potential Savings ${insight.savings}\n`;
    });

    return new Blob([pdfContent], { type: 'application/pdf;charset=utf-8;' });
  };

  // Choose export format
  switch (format.toLowerCase()) {
    case 'csv':
      return convertToCSV();
    case 'excel':
      return convertToExcel();
    case 'pdf':
      return convertToPDF();
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
};
