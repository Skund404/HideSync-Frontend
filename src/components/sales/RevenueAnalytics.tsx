import React, { useEffect, useState } from 'react';
import { useSales } from '../../context/SalesContext';
import * as revenueService from '../../services/revenue-analytics-service';
import {
  DateRange,
  RevenueMetrics,
} from '../../services/revenue-analytics-service';
import ErrorMessage from '../common/ErrorMessage';
import LoadingSpinner from '../common/LoadingSpinner';

// Define the allowed timeframe keys
type TimeFrameKey = '30days' | '90days' | 'year' | 'allTime' | 'custom';

const defaultDateRanges = {
  '30days': { label: 'Last 30 Days', days: 30 },
  '90days': { label: 'Last 90 Days', days: 90 },
  year: { label: 'This Year', days: 365 },
  allTime: { label: 'All Time', days: 0 },
};

const RevenueAnalytics: React.FC = () => {
  const { loading: salesLoading, error: salesError } = useSales();
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(new Date().setDate(new Date().getDate() - 90)), // Default to last 90 days
    endDate: new Date(),
  });
  const [timeFrame, setTimeFrame] = useState<TimeFrameKey>('90days');
  const [metrics, setMetrics] = useState<RevenueMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Update date range when timeframe changes
  useEffect(() => {
    const today = new Date();

    if (timeFrame === 'custom') {
      // Keep existing custom date range
      return;
    }

    // Now TypeScript knows timeFrame can only be a valid key
    const range = defaultDateRanges[timeFrame];

    if (range.days === 0) {
      // All time - use earliest date (we'll default to 5 years back since we don't know)
      const earliestDate = new Date();
      earliestDate.setFullYear(earliestDate.getFullYear() - 5);

      setDateRange({
        startDate: earliestDate,
        endDate: today,
      });
    } else {
      // Specific time frame
      setDateRange({
        startDate: new Date(today.setDate(today.getDate() - range.days)),
        endDate: new Date(),
      });
    }
  }, [timeFrame]);

  // Fetch metrics when date range changes
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        setError(null);

        // Use the revenue analytics service to get metrics
        const revenueMetrics = await revenueService.getRevenueMetrics(
          dateRange
        );
        setMetrics(revenueMetrics);
      } catch (err) {
        console.error('Error fetching revenue metrics:', err);
        setError('Failed to load revenue metrics. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (!salesLoading) {
      fetchMetrics();
    }
  }, [dateRange, salesLoading]);

  // Handle custom date range changes
  const handleDateRangeChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'startDate' | 'endDate'
  ) => {
    setTimeFrame('custom');
    setDateRange({
      ...dateRange,
      [field]: new Date(e.target.value),
    });
  };

  // Format currency amounts
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Format number with commas
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  // Format percentage
  const formatPercent = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value);
  };

  // Format month for display
  const formatMonth = (monthStr: string): string => {
    const [year, month] = monthStr.split('-');
    return `${new Date(parseInt(year), parseInt(month) - 1).toLocaleString(
      'default',
      { month: 'short' }
    )} ${year}`;
  };

  if (salesLoading || loading) {
    return <LoadingSpinner />;
  }

  if (salesError || error) {
    return (
      <ErrorMessage
        message={error || salesError || 'An error occurred'}
        onRetry={() => {
          setDateRange({ ...dateRange }); // Trigger a refresh
        }}
      />
    );
  }

  return (
    <div className='space-y-8'>
      <div className='bg-white shadow-sm rounded-lg p-6 border border-gray-200'>
        <h2 className='text-xl font-semibold text-gray-900 mb-6'>
          Revenue Analytics
        </h2>

        {/* Date Range Controls */}
        <div className='flex flex-wrap items-center gap-4 mb-6'>
          <div className='bg-gray-100 p-1 rounded-md inline-flex'>
            {Object.entries(defaultDateRanges).map(([key, range]) => (
              <button
                key={key}
                className={`px-3 py-1 text-sm rounded-md ${
                  timeFrame === key
                    ? 'bg-amber-600 text-white'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setTimeFrame(key as TimeFrameKey)}
              >
                {range.label}
              </button>
            ))}
            <button
              className={`px-3 py-1 text-sm rounded-md ${
                timeFrame === 'custom'
                  ? 'bg-amber-600 text-white'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setTimeFrame('custom')}
            >
              Custom
            </button>
          </div>

          {timeFrame === 'custom' && (
            <div className='flex gap-4'>
              <div>
                <label
                  htmlFor='startDate'
                  className='block text-sm text-gray-700 mb-1'
                >
                  Start Date
                </label>
                <input
                  type='date'
                  id='startDate'
                  value={dateRange.startDate.toISOString().split('T')[0]}
                  onChange={(e) => handleDateRangeChange(e, 'startDate')}
                  className='px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm'
                />
              </div>
              <div>
                <label
                  htmlFor='endDate'
                  className='block text-sm text-gray-700 mb-1'
                >
                  End Date
                </label>
                <input
                  type='date'
                  id='endDate'
                  value={dateRange.endDate.toISOString().split('T')[0]}
                  onChange={(e) => handleDateRangeChange(e, 'endDate')}
                  className='px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm'
                />
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className='py-10 flex justify-center'>
            <LoadingSpinner />
          </div>
        ) : !metrics ? (
          <div className='py-10 text-center text-gray-500'>
            <p>No sales data found for the selected time period.</p>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
              <div className='bg-white rounded-lg shadow-sm p-4 border border-gray-200'>
                <h3 className='text-sm font-medium text-gray-500'>
                  Total Revenue
                </h3>
                <p className='mt-2 text-3xl font-bold text-gray-900'>
                  {formatCurrency(metrics.totalRevenue)}
                </p>
                <p className='mt-1 text-sm text-gray-500'>
                  {formatNumber(metrics.orderCount)} orders | Avg:{' '}
                  {formatCurrency(metrics.averageOrderValue)}
                </p>
              </div>

              <div className='bg-white rounded-lg shadow-sm p-4 border border-gray-200'>
                <h3 className='text-sm font-medium text-gray-500'>
                  Net Revenue
                </h3>
                <p className='mt-2 text-3xl font-bold text-green-600'>
                  {formatCurrency(metrics.netRevenue)}
                </p>
                <p className='mt-1 text-sm text-gray-500'>
                  After fees: {formatCurrency(metrics.totalFees)}
                </p>
              </div>

              <div className='bg-white rounded-lg shadow-sm p-4 border border-gray-200'>
                <h3 className='text-sm font-medium text-gray-500'>
                  Platform Fees
                </h3>
                <p className='mt-2 text-3xl font-bold text-red-600'>
                  {formatCurrency(metrics.totalFees)}
                </p>
                <p className='mt-1 text-sm text-gray-500'>
                  {formatPercent(metrics.totalFees / metrics.totalRevenue)} of
                  revenue
                </p>
              </div>

              <div className='bg-white rounded-lg shadow-sm p-4 border border-gray-200'>
                <h3 className='text-sm font-medium text-gray-500'>
                  Average Order Value
                </h3>
                <p className='mt-2 text-3xl font-bold text-gray-900'>
                  {formatCurrency(metrics.averageOrderValue)}
                </p>
                <p className='mt-1 text-sm text-gray-500'>
                  From {formatNumber(metrics.orderCount)} orders
                </p>
              </div>
            </div>

            {/* Monthly Revenue Chart */}
            <div className='bg-white rounded-lg shadow-sm p-6 border border-gray-200 mb-8'>
              <h3 className='text-lg font-medium text-gray-900 mb-4'>
                Monthly Revenue Trend
              </h3>

              <div className='h-80'>
                {metrics.byMonth.length > 0 ? (
                  <div className='h-full flex items-end space-x-2'>
                    {metrics.byMonth.map((month) => {
                      const maxRevenue = Math.max(
                        ...metrics.byMonth.map((m) => m.revenue)
                      );
                      const height = `${(month.revenue / maxRevenue) * 100}%`;

                      return (
                        <div
                          key={month.month}
                          className='flex flex-col items-center flex-1'
                        >
                          <div className='w-full flex justify-center items-end h-[90%]'>
                            <div
                              className='w-full bg-amber-500 rounded-t-sm'
                              style={{ height }}
                              title={`${formatCurrency(month.revenue)} from ${
                                month.orderCount
                              } orders`}
                            ></div>
                          </div>
                          <div className='text-xs text-gray-500 mt-2 truncate w-full text-center'>
                            {formatMonth(month.month)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className='h-full flex items-center justify-center'>
                    <p className='text-gray-500'>
                      Not enough data to display monthly trends
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Channel Performance */}
            <div className='bg-white rounded-lg shadow-sm p-6 border border-gray-200 mb-8'>
              <h3 className='text-lg font-medium text-gray-900 mb-4'>
                Revenue by Sales Channel
              </h3>

              <div className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-gray-200'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th
                        scope='col'
                        className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                      >
                        Channel
                      </th>
                      <th
                        scope='col'
                        className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                      >
                        Orders
                      </th>
                      <th
                        scope='col'
                        className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                      >
                        Revenue
                      </th>
                      <th
                        scope='col'
                        className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                      >
                        Average Order
                      </th>
                      <th
                        scope='col'
                        className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                      >
                        Platform Fees
                      </th>
                      <th
                        scope='col'
                        className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                      >
                        Net Revenue
                      </th>
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    {Object.entries(metrics.byChannel)
                      .filter(([_, data]) => data.orders > 0)
                      .sort(([_, a], [__, b]) => b.revenue - a.revenue)
                      .map(([channel, data]) => (
                        <tr key={channel}>
                          <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                            {channel}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                            {formatNumber(data.orders)}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                            {formatCurrency(data.revenue)}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                            {formatCurrency(data.averageOrderValue)}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-red-600'>
                            {formatCurrency(data.fees)}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-green-600'>
                            {formatCurrency(data.netRevenue)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Products */}
            <div className='bg-white rounded-lg shadow-sm p-6 border border-gray-200'>
              <h3 className='text-lg font-medium text-gray-900 mb-4'>
                Top Selling Products
              </h3>

              <div className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-gray-200'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th
                        scope='col'
                        className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                      >
                        Product
                      </th>
                      <th
                        scope='col'
                        className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                      >
                        Quantity Sold
                      </th>
                      <th
                        scope='col'
                        className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                      >
                        Revenue
                      </th>
                      <th
                        scope='col'
                        className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                      >
                        Average Price
                      </th>
                      <th
                        scope='col'
                        className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                      >
                        % of Revenue
                      </th>
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    {metrics.byProduct.slice(0, 10).map((product) => (
                      <tr key={product.productName}>
                        <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                          {product.productName}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                          {formatNumber(product.quantity)}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                          {formatCurrency(product.revenue)}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                          {formatCurrency(product.averagePrice)}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                          {formatPercent(
                            product.revenue / metrics.totalRevenue
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RevenueAnalytics;
