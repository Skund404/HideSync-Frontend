// src/components/dashboard/TopProductsWidget.tsx
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSales } from '../../context/SalesContext';
import { ProjectType } from '../../types/enums';
import ErrorMessage from '../common/ErrorMessage';
import LoadingSpinner from '../common/LoadingSpinner';
// Define local formatting function since it seems to be missing in formatter.ts
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

interface TopProduct {
  id: number;
  name: string;
  type: ProjectType;
  totalSold: number;
  revenue: number;
  profit: number;
  margin: number;
  trend: 'up' | 'down' | 'stable';
  percentChange: number;
}

/**
 * A widget that displays the top-selling products with revenue, margin, and trend information.
 * Optimized with memoization, better error handling, and consistent loading states.
 */
const TopProductsWidget = () => {
  const { sales, completedSales, loading, error } = useSales();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>(
    'month'
  );
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [processingData, setProcessingData] = useState(false);

  // Memoize the time period display text
  const timeRangeText = useMemo(() => {
    switch (timeRange) {
      case 'week':
        return 'Last 7 days';
      case 'month':
        return 'Last 30 days';
      case 'quarter':
        return 'Last 3 months';
      default:
        return '';
    }
  }, [timeRange]);

  // Calculate the top products from sales data
  useEffect(() => {
    if (loading) return;

    setProcessingData(true);

    try {
      // All of this calculation was in the useEffect body, now in a try/catch
      // Get timeframe date range
      const now = new Date();
      let startDate: Date;

      switch (timeRange) {
        case 'week':
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'quarter':
          startDate = new Date(now);
          startDate.setMonth(startDate.getMonth() - 3);
          break;
        case 'month':
        default:
          startDate = new Date(now);
          startDate.setMonth(startDate.getMonth() - 1);
          break;
      }

      // Combine and filter sales by date range
      const allSales = [...sales, ...completedSales];
      const filteredSales = allSales.filter((sale) => {
        const saleDate = new Date(sale.createdAt);
        return saleDate >= startDate;
      });

      // Extract all items from filtered sales
      const allItems = filteredSales.flatMap((sale) => sale.items);

      // Group items by name/type
      const groupedItems: Record<
        string,
        {
          id: number;
          name: string;
          type: string;
          items: any[];
          totalSold: number;
          revenue: number;
          previousRevenue?: number;
        }
      > = {};

      // Calculate current period data
      allItems.forEach((item) => {
        const key = `${item.name}-${item.type}`;
        if (!groupedItems[key]) {
          groupedItems[key] = {
            id: item.id,
            name: item.name,
            type: item.type || 'OTHER',
            items: [],
            totalSold: 0,
            revenue: 0,
          };
        }

        groupedItems[key].items.push(item);
        groupedItems[key].totalSold += item.quantity;
        groupedItems[key].revenue += item.price * item.quantity;
      });

      // Calculate previous period data for trend comparison
      const previousPeriodStartDate = new Date(startDate);
      const periodDays =
        (now.getTime() - startDate.getTime()) / (1000 * 3600 * 24);
      previousPeriodStartDate.setDate(
        previousPeriodStartDate.getDate() - periodDays
      );

      const previousPeriodSales = allSales.filter((sale) => {
        const saleDate = new Date(sale.createdAt);
        return saleDate >= previousPeriodStartDate && saleDate < startDate;
      });

      const previousPeriodItems = previousPeriodSales.flatMap(
        (sale) => sale.items
      );

      // Add previous period revenue to the grouped items
      previousPeriodItems.forEach((item) => {
        const key = `${item.name}-${item.type}`;
        if (groupedItems[key]) {
          // Initialize previousRevenue if it doesn't exist yet
          if (groupedItems[key].previousRevenue === undefined) {
            groupedItems[key].previousRevenue = 0;
          }
          // Use the nullish coalescing operator to handle undefined
          groupedItems[key].previousRevenue =
            (groupedItems[key].previousRevenue ?? 0) +
            item.price * item.quantity;
        }
      });

      // Convert to array, calculate profit/margin, trend, sort by revenue
      const productList = Object.values(groupedItems)
        .map((group) => {
          // Estimate profit based on typical margins if not available directly
          const estimatedProfit = group.revenue * 0.6; // 60% profit margin estimate

          // Calculate trend compared to previous period
          let trend: 'up' | 'down' | 'stable' = 'stable';
          let percentChange = 0;

          if (group.previousRevenue) {
            const change = group.revenue - group.previousRevenue;
            percentChange =
              group.previousRevenue > 0
                ? Math.round((change / group.previousRevenue) * 100)
                : 0;

            if (percentChange > 3) trend = 'up';
            else if (percentChange < -3) trend = 'down';
          }

          return {
            id: group.id,
            name: group.name,
            type: group.type as ProjectType,
            totalSold: group.totalSold,
            revenue: group.revenue,
            profit: estimatedProfit,
            margin: Math.round((estimatedProfit / group.revenue) * 100),
            trend,
            percentChange,
          };
        })
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5); // Get top 5

      setTopProducts(productList);
    } catch (err) {
      console.error('Error processing sales data:', err);
    } finally {
      setProcessingData(false);
    }
  }, [sales, completedSales, timeRange, loading]);

  // Memoize trend arrow components to prevent recreation on every render
  const TrendArrow = useCallback(
    ({
      trend,
      percentChange,
    }: {
      trend: 'up' | 'down' | 'stable';
      percentChange: number;
    }) => {
      if (trend === 'up') {
        return (
          <div className='flex items-center'>
            <svg
              className='h-4 w-4 text-green-500'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M5 10l7-7m0 0l7 7m-7-7v18'
              />
            </svg>
            <span className='ml-1 text-xs text-green-500'>
              +{percentChange}%
            </span>
          </div>
        );
      } else if (trend === 'down') {
        return (
          <div className='flex items-center'>
            <svg
              className='h-4 w-4 text-red-500'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M19 14l-7 7m0 0l-7-7m7 7V3'
              />
            </svg>
            <span className='ml-1 text-xs text-red-500'>{percentChange}%</span>
          </div>
        );
      } else {
        return (
          <div className='flex items-center'>
            <svg
              className='h-4 w-4 text-stone-400'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M5 12h14'
              />
            </svg>
            <span className='ml-1 text-xs text-stone-500'>
              {percentChange}%
            </span>
          </div>
        );
      }
    },
    []
  );

  if (loading) {
    return (
      <div className='bg-white shadow-sm rounded-lg p-4 border border-stone-200'>
        <div className='flex justify-between items-center mb-4'>
          <h3 className='text-lg font-medium text-stone-800'>
            Top Selling Products
          </h3>
        </div>
        <LoadingSpinner message='Loading sales data...' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='bg-white shadow-sm rounded-lg p-4 border border-stone-200'>
        <div className='flex justify-between items-center mb-4'>
          <h3 className='text-lg font-medium text-stone-800'>
            Top Selling Products
          </h3>
        </div>
        <ErrorMessage
          message='Failed to load sales data'
          onRetry={() => {}} // Add a retry function if available in context
        />
      </div>
    );
  }

  return (
    <div className='bg-white shadow-sm rounded-lg p-4 border border-stone-200'>
      <div className='flex justify-between items-center mb-4'>
        <div>
          <h3 className='text-lg font-medium text-stone-800'>
            Top Selling Products
          </h3>
          <p className='text-sm text-stone-500'>{timeRangeText}</p>
        </div>
        <div className='flex space-x-2'>
          <button
            onClick={() => setTimeRange('week')}
            className={`px-2 py-1 text-xs rounded-md ${
              timeRange === 'week'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-2 py-1 text-xs rounded-md ${
              timeRange === 'month'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setTimeRange('quarter')}
            className={`px-2 py-1 text-xs rounded-md ${
              timeRange === 'quarter'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Quarter
          </button>
        </div>
      </div>

      {processingData ? (
        <LoadingSpinner message='Processing sales data...' />
      ) : topProducts.length === 0 ? (
        <div className='p-8 text-center text-stone-500'>
          <p>No product sales data available for this period</p>
        </div>
      ) : (
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-stone-200'>
            <thead className='bg-stone-50'>
              <tr>
                <th
                  scope='col'
                  className='px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
                >
                  Product
                </th>
                <th
                  scope='col'
                  className='px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
                >
                  Sold
                </th>
                <th
                  scope='col'
                  className='px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
                >
                  Revenue
                </th>
                <th
                  scope='col'
                  className='px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
                >
                  Margin
                </th>
                <th
                  scope='col'
                  className='px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
                >
                  Trend
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-stone-200'>
              {topProducts.map((product) => (
                <tr key={product.id} className='hover:bg-stone-50'>
                  <td className='px-4 py-3 whitespace-nowrap'>
                    <div className='flex items-center'>
                      <div className='h-8 w-8 flex-shrink-0 bg-stone-200 rounded-md overflow-hidden'>
                        {/* Product image would go here */}
                        <div className='h-full w-full flex items-center justify-center text-xs text-stone-500'>
                          {product.name.charAt(0)}
                        </div>
                      </div>
                      <div className='ml-3'>
                        <div className='text-sm font-medium text-stone-900'>
                          {product.name}
                        </div>
                        <div className='text-xs text-stone-500'>
                          {product.type.replace(/_/g, ' ').toLowerCase()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className='px-4 py-3 whitespace-nowrap text-sm text-stone-600'>
                    {product.totalSold}
                  </td>
                  <td className='px-4 py-3 whitespace-nowrap text-sm text-stone-600'>
                    {formatCurrency(product.revenue)}
                  </td>
                  <td className='px-4 py-3 whitespace-nowrap text-sm text-stone-600'>
                    {product.margin}%
                  </td>
                  <td className='px-4 py-3 whitespace-nowrap'>
                    <TrendArrow
                      trend={product.trend}
                      percentChange={product.percentChange}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className='mt-4 border-t border-stone-200 pt-3 flex justify-center'>
        <a
          href='/sales/products'
          className='text-sm text-amber-600 hover:text-amber-800 font-medium flex items-center'
        >
          View all products
          <svg
            className='ml-1 h-4 w-4'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M9 5l7 7-7 7'
            />
          </svg>
        </a>
      </div>
    </div>
  );
};

export default TopProductsWidget;
