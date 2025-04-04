// src/components/dashboard/RevenueOverview.tsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSales } from '../../context/SalesContext';
import { Sale } from '../../types/salesTypes';
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

const RevenueOverview: React.FC = () => {
  const { sales, completedSales, loading, error } = useSales();
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter'>('month');
  const [revenueData, setRevenueData] = useState<
    Array<{ date: string; revenue: number }>
  >([]);
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    averageOrderValue: 0,
    netRevenue: 0,
    platformFees: 0,
    changePercentage: 0,
  });
  const [processingData, setProcessingData] = useState(false);

  // Helper function to get ISO week number - memoized with useCallback
  const getWeekNumber = useCallback((date: Date): number => {
    const d = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }, []);

  // Helper function to group sales by date format - memoized with useCallback
  const groupSalesByDate = useCallback(
    (
      salesData: Sale[],
      format: 'day' | 'week' | 'month'
    ): Array<{ date: string; revenue: number }> => {
      const grouped: Record<string, number> = {};

      salesData.forEach((sale) => {
        const saleDate = new Date(sale.createdAt);
        let dateKey: string;

        if (format === 'day') {
          dateKey = saleDate.toISOString().slice(0, 10); // YYYY-MM-DD
        } else if (format === 'week') {
          // Get ISO week number
          const weekNumber = getWeekNumber(saleDate);
          dateKey = `Week ${weekNumber}`;
        } else {
          dateKey = `${saleDate.getFullYear()}-${String(
            saleDate.getMonth() + 1
          ).padStart(2, '0')}`;
        }

        grouped[dateKey] = (grouped[dateKey] || 0) + sale.totalAmount;
      });

      // Convert to array format and sort by date
      return Object.entries(grouped)
        .map(([date, revenue]) => ({ date, revenue }))
        .sort((a, b) => a.date.localeCompare(b.date));
    },
    [getWeekNumber]
  );

  useEffect(() => {
    if (loading) return;

    setProcessingData(true);

    try {
      // Combine all sales
      const allSales = [...sales, ...completedSales];

      // Set date range based on selected period
      const endDate = new Date();
      let startDate: Date;
      let previousStartDate: Date;
      let groupByFormat: 'day' | 'week' | 'month' = 'day';

      switch (period) {
        case 'week':
          startDate = new Date(endDate);
          startDate.setDate(endDate.getDate() - 7);
          previousStartDate = new Date(startDate);
          previousStartDate.setDate(startDate.getDate() - 7);
          groupByFormat = 'day';
          break;
        case 'month':
          startDate = new Date(endDate);
          startDate.setMonth(endDate.getMonth() - 1);
          previousStartDate = new Date(startDate);
          previousStartDate.setMonth(startDate.getMonth() - 1);
          groupByFormat = 'day';
          break;
        case 'quarter':
          startDate = new Date(endDate);
          startDate.setMonth(endDate.getMonth() - 3);
          previousStartDate = new Date(startDate);
          previousStartDate.setMonth(startDate.getMonth() - 3);
          groupByFormat = 'week';
          break;
        default:
          startDate = new Date(endDate);
          startDate.setMonth(endDate.getMonth() - 1);
          previousStartDate = new Date(startDate);
          previousStartDate.setMonth(startDate.getMonth() - 1);
          groupByFormat = 'day';
      }

      // Filter sales for current and previous periods - memoized this filtering
      const currentPeriodSales = allSales.filter((sale) => {
        const saleDate = new Date(sale.createdAt);
        return saleDate >= startDate && saleDate <= endDate;
      });

      const previousPeriodSales = allSales.filter((sale) => {
        const saleDate = new Date(sale.createdAt);
        return saleDate >= previousStartDate && saleDate < startDate;
      });

      // Calculate metrics
      const totalRevenue = currentPeriodSales.reduce(
        (sum, sale) => sum + sale.totalAmount,
        0
      );

      const averageOrderValue =
        currentPeriodSales.length > 0
          ? totalRevenue / currentPeriodSales.length
          : 0;

      const platformFees = currentPeriodSales.reduce(
        (sum, sale) => sum + (sale.platformFees || 0),
        0
      );

      const netRevenue = totalRevenue - platformFees;

      // Calculate previous period metrics for comparison
      const previousRevenue = previousPeriodSales.reduce(
        (sum, sale) => sum + sale.totalAmount,
        0
      );

      const changePercentage =
        previousRevenue > 0
          ? ((totalRevenue - previousRevenue) / previousRevenue) * 100
          : 0;

      // Group sales by date format for the chart
      const groupedData = groupSalesByDate(currentPeriodSales, groupByFormat);

      // Update state
      setRevenueData(groupedData);
      setMetrics({
        totalRevenue,
        averageOrderValue,
        netRevenue,
        platformFees,
        changePercentage,
      });
    } catch (err) {
      console.error('Error processing revenue data:', err);
    } finally {
      setProcessingData(false);
    }
  }, [sales, completedSales, period, loading, groupSalesByDate]);

  // Memoize the maximum revenue calculation for chart scaling
  const maxRevenue = useMemo(
    () => Math.max(...revenueData.map((d) => d.revenue), 1),
    [revenueData]
  );

  // Memoize the period display text
  const periodDisplayText = useMemo(() => {
    switch (period) {
      case 'week':
        return 'Last 7 days';
      case 'month':
        return 'Last 30 days';
      case 'quarter':
        return 'Last 3 months';
      default:
        return '';
    }
  }, [period]);

  if (loading) {
    return (
      <div className='bg-white shadow rounded-lg p-4'>
        <LoadingSpinner color='amber' message='Loading revenue data...' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='bg-white shadow rounded-lg p-4'>
        <ErrorMessage
          message={`Failed to load revenue data: ${error}`}
          onRetry={() => {}} // Add a retry function if available in your context
        />
      </div>
    );
  }

  return (
    <div className='bg-white shadow rounded-lg p-4'>
      <div className='flex justify-between items-center mb-4'>
        <div>
          <h3 className='text-lg font-medium text-stone-900'>
            Revenue Overview
          </h3>
          <p className='text-sm text-stone-500'>{periodDisplayText}</p>
        </div>
        <div className='flex space-x-2'>
          <button
            className={`px-2 py-1 text-xs rounded ${
              period === 'week'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-stone-100 text-stone-600'
            }`}
            onClick={() => setPeriod('week')}
          >
            Week
          </button>
          <button
            className={`px-2 py-1 text-xs rounded ${
              period === 'month'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-stone-100 text-stone-600'
            }`}
            onClick={() => setPeriod('month')}
          >
            Month
          </button>
          <button
            className={`px-2 py-1 text-xs rounded ${
              period === 'quarter'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-stone-100 text-stone-600'
            }`}
            onClick={() => setPeriod('quarter')}
          >
            Quarter
          </button>
        </div>
      </div>

      {/* Revenue Summary */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
        <div className='flex flex-col'>
          <span className='text-xs text-stone-500 uppercase'>
            Total Revenue
          </span>
          <span className='text-xl font-bold text-stone-900'>
            {formatCurrency(metrics.totalRevenue)}
          </span>
          <span
            className={`text-xs ${
              metrics.changePercentage >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {metrics.changePercentage >= 0 ? '↑' : '↓'}{' '}
            {Math.abs(metrics.changePercentage).toFixed(1)}%
          </span>
        </div>
        <div className='flex flex-col'>
          <span className='text-xs text-stone-500 uppercase'>Net Revenue</span>
          <span className='text-xl font-bold text-stone-900'>
            {formatCurrency(metrics.netRevenue)}
          </span>
          <span className='text-xs text-stone-500'>After fees</span>
        </div>
        <div className='flex flex-col'>
          <span className='text-xs text-stone-500 uppercase'>
            Avg. Order Value
          </span>
          <span className='text-xl font-bold text-stone-900'>
            {formatCurrency(metrics.averageOrderValue)}
          </span>
          <span className='text-xs text-stone-500'>Per order</span>
        </div>
        <div className='flex flex-col'>
          <span className='text-xs text-stone-500 uppercase'>
            Platform Fees
          </span>
          <span className='text-xl font-bold text-stone-900'>
            {formatCurrency(metrics.platformFees)}
          </span>
          <span className='text-xs text-stone-500'>
            {metrics.totalRevenue > 0
              ? ((metrics.platformFees / metrics.totalRevenue) * 100).toFixed(1)
              : '0'}
            %
          </span>
        </div>
      </div>

      {/* Revenue Chart - Show loading spinner when processing data */}
      <div className='mt-4 h-40 relative'>
        {processingData ? (
          <LoadingSpinner
            size='small'
            color='amber'
            message='Processing data...'
          />
        ) : revenueData.length === 0 ? (
          <div className='absolute inset-0 flex items-center justify-center text-stone-400'>
            No revenue data available for this period
          </div>
        ) : (
          <>
            {/* Y axis label */}
            <div className='absolute -left-2 top-0 bottom-0 w-8 flex flex-col justify-between text-xs text-stone-400'>
              <span>{formatCurrency(maxRevenue)}</span>
              <span>{formatCurrency(maxRevenue / 2)}</span>
              <span>$0</span>
            </div>

            <div className='ml-6 h-full flex items-end space-x-1'>
              {revenueData.map((data, index) => (
                <div
                  key={index}
                  className='group relative flex flex-col items-center'
                  style={{
                    flex: `1 0 ${Math.max(100 / revenueData.length, 8)}%`,
                  }}
                >
                  {/* Tooltip */}
                  <div className='absolute bottom-full mb-2 transition-opacity duration-200 opacity-0 group-hover:opacity-100 bg-stone-800 text-white px-2 py-1 rounded text-xs whitespace-nowrap'>
                    <div className='text-center'>{data.date}</div>
                    <div className='text-center font-medium'>
                      {formatCurrency(data.revenue)}
                    </div>
                  </div>

                  {/* Bar */}
                  <div
                    className='w-full bg-amber-500 hover:bg-amber-600 transition-colors rounded-t'
                    style={{
                      height: `${(data.revenue / maxRevenue) * 100}%`,
                      minHeight: data.revenue > 0 ? '2px' : '0',
                    }}
                  ></div>

                  {/* X axis label */}
                  <div className='text-xs text-stone-400 mt-1 truncate w-full text-center'>
                    {period === 'week' &&
                      new Date(data.date).toLocaleDateString(undefined, {
                        weekday: 'short',
                      })}
                    {period === 'month' && new Date(data.date).getDate()}
                    {period === 'quarter' && data.date.replace('Week ', 'W')}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className='mt-4 flex justify-end'>
        <a
          href='/sales?report=revenue'
          className='text-sm text-amber-600 hover:text-amber-800 font-medium'
        >
          Full Revenue Report →
        </a>
      </div>
    </div>
  );
};

export default RevenueOverview;
