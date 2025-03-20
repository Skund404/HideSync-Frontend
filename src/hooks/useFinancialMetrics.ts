import { useMemo } from 'react';
import { useFinancial } from '../context/FinancialContext';
import {
  calculateRunningAverage,
  getTopPerformers,
} from '../utils/financialHelpers';

/**
 * Custom hook providing computed financial metrics
 */
export const useFinancialMetrics = () => {
  const {
    revenueTrends,
    productMetrics,
    materialCosts,
    projectFinancials,
    loading,
  } = useFinancial();

  // Calculate running profit margin average
  const averageProfitMargin = useMemo(() => {
    if (!revenueTrends.length) return [];
    return calculateRunningAverage(revenueTrends, 'margin');
  }, [revenueTrends]);

  // Calculate total revenue trends
  const totalRevenue = useMemo(() => {
    return revenueTrends.reduce((sum, item) => sum + item.revenue, 0);
  }, [revenueTrends]);

  // Calculate total costs
  const totalCosts = useMemo(() => {
    return revenueTrends.reduce((sum, item) => sum + item.costs, 0);
  }, [revenueTrends]);

  // Calculate total profit
  const totalProfit = useMemo(() => {
    return revenueTrends.reduce((sum, item) => sum + item.profit, 0);
  }, [revenueTrends]);

  // Calculate overall profit margin
  const overallMargin = useMemo(() => {
    if (totalRevenue === 0) return 0;
    return (totalProfit / totalRevenue) * 100;
  }, [totalProfit, totalRevenue]);

  // Get top performing products by sales
  const topSellingProducts = useMemo(() => {
    return getTopPerformers(productMetrics, 'sales', 3);
  }, [productMetrics]);

  // Get top performing products by margin
  const topMarginProducts = useMemo(() => {
    return getTopPerformers(productMetrics, 'margin', 3);
  }, [productMetrics]);

  // Calculate material cost distribution
  const materialCostDistribution = useMemo(() => {
    if (!materialCosts.length)
      return { leather: 0, hardware: 0, thread: 0, other: 0 };

    const latest = materialCosts[materialCosts.length - 1];
    const total =
      latest.leather + latest.hardware + latest.thread + latest.other;

    return {
      leather: (latest.leather / total) * 100,
      hardware: (latest.hardware / total) * 100,
      thread: (latest.thread / total) * 100,
      other: (latest.other / total) * 100,
    };
  }, [materialCosts]);

  // Calculate average project margins
  const averageProjectMargin = useMemo(() => {
    if (!projectFinancials.length) return 0;

    const sum = projectFinancials.reduce(
      (acc, project) => acc + project.margin,
      0
    );
    return sum / projectFinancials.length;
  }, [projectFinancials]);

  // Calculate month-over-month revenue growth
  const monthlyGrowthRates = useMemo(() => {
    if (revenueTrends.length < 2) return [];

    return revenueTrends.slice(1).map((current, index) => {
      const previous = revenueTrends[index];
      const growthRate =
        ((current.revenue - previous.revenue) / previous.revenue) * 100;
      return {
        month: current.month,
        growthRate: parseFloat(growthRate.toFixed(1)),
      };
    });
  }, [revenueTrends]);

  return {
    averageProfitMargin,
    totalRevenue,
    totalCosts,
    totalProfit,
    overallMargin,
    topSellingProducts,
    topMarginProducts,
    materialCostDistribution,
    averageProjectMargin,
    monthlyGrowthRates,
    isLoading: loading,
  };
};
