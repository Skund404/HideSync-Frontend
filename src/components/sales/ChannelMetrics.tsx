// src/components/sales/ChannelMetrics.tsx
import React, { useEffect, useState } from 'react';
import { useSales } from '../../context/SalesContext';
import { SalesChannel } from '../../types/salesTypes';
import LoadingSpinner from '../common/LoadingSpinner';

interface ChannelMetric {
  channel: SalesChannel;
  orderCount: number;
  revenue: number;
  averageOrderValue: number;
  platformFees: number;
  netRevenue: number;
  percentOfTotal: number;
}

interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

const ChannelMetrics: React.FC = () => {
  const { sales, completedSales, loading, error } = useSales();
  const [metrics, setMetrics] = useState<ChannelMetric[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: null,
    endDate: null,
  });
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [totalFees, setTotalFees] = useState<number>(0);

  // Calculate metrics when sales data or date range changes
  useEffect(() => {
    if (loading) return;

    // Filter sales by date range
    const filteredSales = [...sales, ...completedSales].filter((sale) => {
      const saleDate = new Date(sale.createdAt);

      if (dateRange.startDate && saleDate < dateRange.startDate) {
        return false;
      }

      if (dateRange.endDate) {
        // Add one day to make the end date inclusive
        const endDatePlusOne = new Date(dateRange.endDate);
        endDatePlusOne.setDate(endDatePlusOne.getDate() + 1);

        if (saleDate >= endDatePlusOne) {
          return false;
        }
      }

      return true;
    });

    // Calculate total metrics
    const total = filteredSales.reduce(
      (sum, sale) => sum + sale.totalAmount,
      0
    );
    const orders = filteredSales.length;
    const fees = filteredSales.reduce(
      (sum, sale) => sum + (sale.platformFees || 0),
      0
    );

    setTotalRevenue(total);
    setTotalOrders(orders);
    setTotalFees(fees);

    // Group sales by channel
    const channelSales: Record<string, ChannelMetric> = {};

    // Initialize all channels with zero values
    Object.values(SalesChannel).forEach((channel) => {
      channelSales[channel] = {
        channel,
        orderCount: 0,
        revenue: 0,
        averageOrderValue: 0,
        platformFees: 0,
        netRevenue: 0,
        percentOfTotal: 0,
      };
    });

    // Calculate metrics for each channel
    filteredSales.forEach((sale) => {
      const channel = sale.channel;
      channelSales[channel].orderCount += 1;
      channelSales[channel].revenue += sale.totalAmount;
      channelSales[channel].platformFees += sale.platformFees || 0;
    });

    // Calculate derived metrics
    Object.values(channelSales).forEach((metric) => {
      if (metric.orderCount > 0) {
        metric.averageOrderValue = metric.revenue / metric.orderCount;
      }

      metric.netRevenue = metric.revenue - metric.platformFees;
      metric.percentOfTotal = total > 0 ? (metric.revenue / total) * 100 : 0;
    });

    // Sort by revenue (highest first) and filter out channels with no orders
    const sortedMetrics = Object.values(channelSales)
      .filter((metric) => metric.orderCount > 0)
      .sort((a, b) => b.revenue - a.revenue);

    setMetrics(sortedMetrics);
  }, [sales, completedSales, loading, dateRange]);

  // Handle date range changes
  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    setDateRange((prev) => ({
      ...prev,
      [field]: value ? new Date(value) : null,
    }));
  };

  // Format numbers for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Format percentage for display
  const formatPercent = (percent: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(percent / 100);
  };

  // Get color for channel
  const getChannelColor = (channel: SalesChannel): string => {
    switch (channel) {
      case SalesChannel.SHOPIFY:
        return 'bg-green-500';
      case SalesChannel.ETSY:
        return 'bg-orange-500';
      case SalesChannel.AMAZON:
        return 'bg-yellow-500';
      case SalesChannel.EBAY:
        return 'bg-red-500';
      case SalesChannel.DIRECT:
        return 'bg-blue-500';
      case SalesChannel.WHOLESALE:
        return 'bg-purple-500';
      case SalesChannel.CUSTOM_ORDER:
        return 'bg-pink-500';
      case SalesChannel.OTHER:
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Get nice name for channel
  const getChannelName = (channel: SalesChannel): string => {
    return (
      channel.charAt(0).toUpperCase() +
      channel.slice(1).toLowerCase().replace('_', ' ')
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className='bg-red-50 p-4 rounded-md text-red-800'>{error}</div>;
  }

  return (
    <div className='space-y-6'>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0'>
        <h2 className='text-lg font-medium text-gray-900'>
          Sales Channel Performance
        </h2>

        {/* Date range filter */}
        <div className='flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4'>
          <div>
            <label
              htmlFor='startDate'
              className='block text-sm font-medium text-gray-700'
            >
              From
            </label>
            <input
              type='date'
              id='startDate'
              name='startDate'
              className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm'
              value={
                dateRange.startDate
                  ? dateRange.startDate.toISOString().split('T')[0]
                  : ''
              }
              onChange={(e) => handleDateChange('startDate', e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor='endDate'
              className='block text-sm font-medium text-gray-700'
            >
              To
            </label>
            <input
              type='date'
              id='endDate'
              name='endDate'
              className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm'
              value={
                dateRange.endDate
                  ? dateRange.endDate.toISOString().split('T')[0]
                  : ''
              }
              onChange={(e) => handleDateChange('endDate', e.target.value)}
            />
          </div>
          <div className='flex items-end'>
            <button
              type='button'
              className='inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500'
              onClick={() => setDateRange({ startDate: null, endDate: null })}
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Summary metrics */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <div className='bg-white overflow-hidden shadow rounded-lg'>
          <div className='px-4 py-5 sm:p-6'>
            <dt className='text-sm font-medium text-gray-500 truncate'>
              Total Revenue
            </dt>
            <dd className='mt-1 text-3xl font-semibold text-gray-900'>
              {formatCurrency(totalRevenue)}
            </dd>
          </div>
        </div>
        <div className='bg-white overflow-hidden shadow rounded-lg'>
          <div className='px-4 py-5 sm:p-6'>
            <dt className='text-sm font-medium text-gray-500 truncate'>
              Total Orders
            </dt>
            <dd className='mt-1 text-3xl font-semibold text-gray-900'>
              {totalOrders}
            </dd>
          </div>
        </div>
        <div className='bg-white overflow-hidden shadow rounded-lg'>
          <div className='px-4 py-5 sm:p-6'>
            <dt className='text-sm font-medium text-gray-500 truncate'>
              Average Order Value
            </dt>
            <dd className='mt-1 text-3xl font-semibold text-gray-900'>
              {totalOrders > 0
                ? formatCurrency(totalRevenue / totalOrders)
                : '$0.00'}
            </dd>
          </div>
        </div>
      </div>

      {/* Revenue by channel visualization */}
      <div className='bg-white overflow-hidden shadow rounded-lg'>
        <div className='px-4 py-5 sm:p-6'>
          <h3 className='text-lg leading-6 font-medium text-gray-900 mb-4'>
            Revenue by Channel
          </h3>

          {/* Stacked bar chart */}
          <div className='h-8 w-full bg-gray-200 rounded-full overflow-hidden'>
            {metrics.map((metric, index) => (
              <div
                key={metric.channel}
                className={`h-full ${getChannelColor(
                  metric.channel
                )} inline-block`}
                style={{ width: `${metric.percentOfTotal}%` }}
                title={`${getChannelName(metric.channel)}: ${formatCurrency(
                  metric.revenue
                )} (${formatPercent(metric.percentOfTotal)})`}
              ></div>
            ))}
          </div>

          {/* Legend */}
          <div className='mt-4 flex flex-wrap gap-4'>
            {metrics.map((metric) => (
              <div key={metric.channel} className='flex items-center'>
                <div
                  className={`w-4 h-4 rounded ${getChannelColor(
                    metric.channel
                  )} mr-2`}
                ></div>
                <span className='text-sm text-gray-600'>
                  {getChannelName(metric.channel)}:{' '}
                  {formatPercent(metric.percentOfTotal)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed channel metrics table */}
      <div className='bg-white shadow overflow-hidden sm:rounded-lg'>
        <div className='px-4 py-5 sm:px-6'>
          <h3 className='text-lg leading-6 font-medium text-gray-900'>
            Channel Breakdown
          </h3>
          <p className='mt-1 max-w-2xl text-sm text-gray-500'>
            Detailed performance metrics for each sales channel.
          </p>
        </div>
        <div className='border-t border-gray-200'>
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
                    Avg. Order Value
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
                  <th
                    scope='col'
                    className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                  >
                    % of Total
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {metrics.map((metric) => (
                  <tr key={metric.channel}>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='flex items-center'>
                        <div
                          className={`flex-shrink-0 h-4 w-4 rounded ${getChannelColor(
                            metric.channel
                          )}`}
                        ></div>
                        <div className='ml-4'>
                          <div className='text-sm font-medium text-gray-900'>
                            {getChannelName(metric.channel)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {metric.orderCount}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium'>
                      {formatCurrency(metric.revenue)}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {formatCurrency(metric.averageOrderValue)}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-red-600'>
                      -{formatCurrency(metric.platformFees)}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium'>
                      {formatCurrency(metric.netRevenue)}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {formatPercent(metric.percentOfTotal)}
                    </td>
                  </tr>
                ))}

                {/* Totals row */}
                <tr className='bg-gray-50'>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                    Total
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                    {totalOrders}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                    {formatCurrency(totalRevenue)}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                    {totalOrders > 0
                      ? formatCurrency(totalRevenue / totalOrders)
                      : '$0.00'}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600'>
                    -{formatCurrency(totalFees)}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600'>
                    {formatCurrency(totalRevenue - totalFees)}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                    100%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Additional insights */}
      <div className='bg-white shadow overflow-hidden sm:rounded-lg'>
        <div className='px-4 py-5 sm:px-6'>
          <h3 className='text-lg leading-6 font-medium text-gray-900'>
            Channel Insights
          </h3>
        </div>
        <div className='border-t border-gray-200 px-4 py-5 sm:px-6'>
          <dl className='grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2'>
            <div className='sm:col-span-1'>
              <dt className='text-sm font-medium text-gray-500'>
                Highest Revenue Channel
              </dt>
              <dd className='mt-1 text-sm text-gray-900'>
                {metrics.length > 0 ? (
                  <div className='flex items-center'>
                    <div
                      className={`flex-shrink-0 h-4 w-4 rounded ${getChannelColor(
                        metrics[0].channel
                      )}`}
                    ></div>
                    <span className='ml-2'>
                      {getChannelName(metrics[0].channel)} (
                      {formatCurrency(metrics[0].revenue)})
                    </span>
                  </div>
                ) : (
                  'No data available'
                )}
              </dd>
            </div>
            <div className='sm:col-span-1'>
              <dt className='text-sm font-medium text-gray-500'>
                Highest Average Order Value
              </dt>
              <dd className='mt-1 text-sm text-gray-900'>
                {metrics.length > 0 ? (
                  <div className='flex items-center'>
                    <div
                      className={`flex-shrink-0 h-4 w-4 rounded ${getChannelColor(
                        metrics.reduce((prev, current) =>
                          prev.averageOrderValue > current.averageOrderValue
                            ? prev
                            : current
                        ).channel
                      )}`}
                    ></div>
                    <span className='ml-2'>
                      {getChannelName(
                        metrics.reduce((prev, current) =>
                          prev.averageOrderValue > current.averageOrderValue
                            ? prev
                            : current
                        ).channel
                      )}{' '}
                      (
                      {formatCurrency(
                        metrics.reduce((prev, current) =>
                          prev.averageOrderValue > current.averageOrderValue
                            ? prev
                            : current
                        ).averageOrderValue
                      )}
                      )
                    </span>
                  </div>
                ) : (
                  'No data available'
                )}
              </dd>
            </div>
            <div className='sm:col-span-1'>
              <dt className='text-sm font-medium text-gray-500'>Most Orders</dt>
              <dd className='mt-1 text-sm text-gray-900'>
                {metrics.length > 0 ? (
                  <div className='flex items-center'>
                    <div
                      className={`flex-shrink-0 h-4 w-4 rounded ${getChannelColor(
                        metrics.reduce((prev, current) =>
                          prev.orderCount > current.orderCount ? prev : current
                        ).channel
                      )}`}
                    ></div>
                    <span className='ml-2'>
                      {getChannelName(
                        metrics.reduce((prev, current) =>
                          prev.orderCount > current.orderCount ? prev : current
                        ).channel
                      )}{' '}
                      (
                      {
                        metrics.reduce((prev, current) =>
                          prev.orderCount > current.orderCount ? prev : current
                        ).orderCount
                      }{' '}
                      orders)
                    </span>
                  </div>
                ) : (
                  'No data available'
                )}
              </dd>
            </div>
            <div className='sm:col-span-1'>
              <dt className='text-sm font-medium text-gray-500'>
                Lowest Platform Fees
              </dt>
              <dd className='mt-1 text-sm text-gray-900'>
                {metrics.length > 0 ? (
                  <div className='flex items-center'>
                    <div
                      className={`flex-shrink-0 h-4 w-4 rounded ${getChannelColor(
                        metrics
                          .filter((m) => m.orderCount > 0)
                          .reduce((prev, current) =>
                            prev.platformFees / prev.revenue <
                            current.platformFees / current.revenue
                              ? prev
                              : current
                          ).channel
                      )}`}
                    ></div>
                    <span className='ml-2'>
                      {getChannelName(
                        metrics
                          .filter((m) => m.orderCount > 0)
                          .reduce((prev, current) =>
                            prev.platformFees / prev.revenue <
                            current.platformFees / current.revenue
                              ? prev
                              : current
                          ).channel
                      )}{' '}
                      (
                      {formatPercent(
                        (metrics
                          .filter((m) => m.orderCount > 0)
                          .reduce((prev, current) =>
                            prev.platformFees / prev.revenue <
                            current.platformFees / current.revenue
                              ? prev
                              : current
                          ).platformFees /
                          metrics
                            .filter((m) => m.orderCount > 0)
                            .reduce((prev, current) =>
                              prev.platformFees / prev.revenue <
                              current.platformFees / current.revenue
                                ? prev
                                : current
                            ).revenue) *
                          100
                      )}
                      )
                    </span>
                  </div>
                ) : (
                  'No data available'
                )}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Export button */}
      <div className='flex justify-end mt-6'>
        <button
          type='button'
          className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500'
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-5 w-5 mr-2'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4'
            />
          </svg>
          Export Data
        </button>
      </div>
    </div>
  );
};

export default ChannelMetrics;
