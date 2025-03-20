import {
  MaterialCostTrend,
  PricingCalculatorInputs,
  PricingCalculatorResults,
  ProductTypeMetric,
  ProjectFinancials,
  RevenueTrend,
} from '../types/financialTypes';

/**
 * Calculates pricing based on cost inputs and target margin
 */
export const calculatePricing = (
  inputs: PricingCalculatorInputs
): PricingCalculatorResults => {
  const materialAndHardware =
    Number(inputs.materialCost) + Number(inputs.hardwareCost);
  const labor = Number(inputs.laborHours) * Number(inputs.laborRate);

  // Calculate additional costs if provided
  const shipping = Number(inputs.shippingCost || 0);
  const packaging = Number(inputs.packagingCost || 0);
  const additionalCosts = shipping + packaging;

  // Calculate direct costs
  const directCosts = materialAndHardware + labor + additionalCosts;

  // Calculate overhead amount
  const overheadAmount = directCosts * (Number(inputs.overhead) / 100);

  // Calculate total cost
  const totalCost = directCosts + overheadAmount;

  // Calculate platform fees if applicable
  const platformFeesPercent = Number(inputs.platformFees || 0);

  // Calculate marketing costs if applicable
  const marketingCostPercent = Number(inputs.marketingCost || 0);

  // Calculate target margin including platform fees and marketing costs
  const combinedMarginAndFees =
    Number(inputs.targetMargin) + platformFeesPercent + marketingCostPercent;

  // Calculate price based on combined margin and fees
  const targetMarginMultiplier = 100 / (100 - combinedMarginAndFees);
  const suggestedPrice = totalCost * targetMarginMultiplier;

  // Calculate actual profit (excluding fees)
  const platformFeesAmount = suggestedPrice * (platformFeesPercent / 100);
  const marketingCostAmount = suggestedPrice * (marketingCostPercent / 100);
  const profit =
    suggestedPrice - totalCost - platformFeesAmount - marketingCostAmount;

  // Calculate actual margin
  const actualMargin = (profit / suggestedPrice) * 100;

  return {
    directCosts: directCosts.toFixed(2),
    overheadAmount: overheadAmount.toFixed(2),
    totalCost: totalCost.toFixed(2),
    suggestedPrice: suggestedPrice.toFixed(2),
    profit: profit.toFixed(2),
    actualMargin: actualMargin.toFixed(1),
  };
};

/**
 * Formats currency values with optional symbol
 */
export const formatCurrency = (
  value: number,
  showSymbol: boolean = true
): string => {
  return `${showSymbol ? '$' : ''}${value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Formats percentage values
 */
export const formatPercentage = (value: number): string => {
  return `${value.toLocaleString('en-US', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;
};

/**
 * Calculates month-over-month growth rate
 */
export const calculateGrowthRate = (
  current: number,
  previous: number
): number => {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

/**
 * Calculates running average for a dataset
 */
export const calculateRunningAverage = (
  data: RevenueTrend[],
  property: keyof RevenueTrend
): number[] => {
  const result: number[] = [];
  let sum = 0;

  data.forEach((item, index) => {
    const value = Number(item[property]) || 0;
    sum += value;
    result.push(sum / (index + 1));
  });

  return result;
};

/**
 * Identifies top performing products by selected metric
 */
export const getTopPerformers = (
  products: ProductTypeMetric[],
  metric: 'sales' | 'margin',
  count: number = 3
): ProductTypeMetric[] => {
  return [...products].sort((a, b) => b[metric] - a[metric]).slice(0, count);
};

/**
 * Calculates potential savings from all cost insights
 */
export const calculateTotalPotentialSavings = (
  insights: { savings: string }[]
): number => {
  return insights.reduce((total, insight) => {
    const savingsMatch = insight.savings.match(/\$(\d+)/);
    if (savingsMatch && savingsMatch[1]) {
      return total + parseInt(savingsMatch[1], 10);
    }
    return total;
  }, 0);
};

/**
 * Generates a break-even analysis
 */
export const calculateBreakEven = (
  fixedCosts: number,
  pricePerUnit: number,
  variableCostPerUnit: number
): number => {
  if (pricePerUnit <= variableCostPerUnit) {
    return -1; // Cannot break even if price is less than or equal to variable cost
  }

  return fixedCosts / (pricePerUnit - variableCostPerUnit);
};

/**
 * Calculates contribution margin
 */
export const calculateContributionMargin = (
  pricePerUnit: number,
  variableCostPerUnit: number
): number => {
  return pricePerUnit - variableCostPerUnit;
};

/**
 * Calculates contribution margin ratio
 */
export const calculateContributionMarginRatio = (
  pricePerUnit: number,
  variableCostPerUnit: number
): number => {
  if (pricePerUnit === 0) return 0;
  return ((pricePerUnit - variableCostPerUnit) / pricePerUnit) * 100;
};

/**
 * Calculates project profitability
 */
export const calculateProjectProfitability = (
  projects: ProjectFinancials[]
): {
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  averageMargin: number;
} => {
  if (!projects.length) {
    return { totalRevenue: 0, totalCost: 0, totalProfit: 0, averageMargin: 0 };
  }

  const totalRevenue = projects.reduce(
    (sum, project) => sum + project.revenue,
    0
  );
  const totalCost = projects.reduce((sum, project) => sum + project.costs, 0);
  const totalProfit = projects.reduce(
    (sum, project) => sum + project.profit,
    0
  );
  const averageMargin =
    projects.reduce((sum, project) => sum + project.margin, 0) /
    projects.length;

  return { totalRevenue, totalCost, totalProfit, averageMargin };
};

/**
 * Analyzes material cost distribution
 */
export const analyzeMaterialCostDistribution = (
  materialCosts: MaterialCostTrend[]
): {
  leather: number;
  hardware: number;
  thread: number;
  other: number;
  total: number;
} => {
  if (!materialCosts.length) {
    return { leather: 0, hardware: 0, thread: 0, other: 0, total: 0 };
  }

  // Get the most recent month's data
  const latestMonth = materialCosts[materialCosts.length - 1];

  const leather = latestMonth.leather;
  const hardware = latestMonth.hardware;
  const thread = latestMonth.thread;
  const other = latestMonth.other;
  const total = leather + hardware + thread + other;

  return { leather, hardware, thread, other, total };
};

/**
 * Formats a pricing sheet for printing/export
 */
export const formatPricingSheet = (
  inputs: PricingCalculatorInputs,
  products: ProductTypeMetric[]
): string => {
  const title = 'HideSync Pricing Sheet';
  const date = new Date().toLocaleDateString();

  let content = `${title}\nGenerated on: ${date}\n\n`;

  // Add pricing formula section
  content += '===== Pricing Formula =====\n';
  content += `Base Labor Rate: $${inputs.laborRate}/hour\n`;
  content += `Overhead Rate: ${inputs.overhead}%\n`;
  content += `Target Margin: ${inputs.targetMargin}%\n\n`;

  // Add price calculation example
  content += '===== Example Calculation =====\n';
  content += `Materials: $100\n`;
  content += `Labor (4 hours @ $${inputs.laborRate}): $${
    4 * inputs.laborRate
  }\n`;
  content += `Subtotal: $${100 + 4 * inputs.laborRate}\n`;
  content += `With Overhead (${inputs.overhead}%): $${
    (100 + 4 * inputs.laborRate) * (1 + inputs.overhead / 100)
  }\n`;

  // Add product metrics section if products are provided
  if (products.length > 0) {
    content += '\n===== Product Margins =====\n';
    products.forEach((product) => {
      content += `${product.name}: ${product.margin.toFixed(1)}%\n`;
    });
  }

  return content;
};

/**
 * Generates a simple ROI analysis for pricing optimization
 */
export const calculatePricingOptimizationROI = (
  currentPrice: number,
  currentSalesVolume: number,
  suggestedPrice: number,
  elasticity: number = -1.0 // Price elasticity of demand, default -1.0 (unit elastic)
): {
  projectedSalesVolume: number;
  currentRevenue: number;
  projectedRevenue: number;
  revenueDifference: number;
  percentageChange: number;
} => {
  // Calculate price change percentage
  const priceChangePercent = (suggestedPrice - currentPrice) / currentPrice;

  // Calculate expected volume change based on elasticity
  const volumeChangePercent = priceChangePercent * elasticity;

  // Calculate projected sales volume
  const projectedSalesVolume = currentSalesVolume * (1 + volumeChangePercent);

  // Calculate revenues
  const currentRevenue = currentPrice * currentSalesVolume;
  const projectedRevenue = suggestedPrice * projectedSalesVolume;

  // Calculate difference and percentage change
  const revenueDifference = projectedRevenue - currentRevenue;
  const percentageChange = (revenueDifference / currentRevenue) * 100;

  return {
    projectedSalesVolume,
    currentRevenue,
    projectedRevenue,
    revenueDifference,
    percentageChange,
  };
};
