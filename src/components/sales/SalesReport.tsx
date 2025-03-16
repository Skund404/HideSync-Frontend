import React, { useEffect, useState } from 'react';
import { useSales } from '../../context/SalesContext';
import { FulfillmentStatus, SalesChannel } from '../../types/salesTypes';
// Import PaymentStatus from enums instead of salesTypes
import { PaymentStatus } from '../../types/enums';
import LoadingSpinner from '../common/LoadingSpinner';

interface SalesReportProps {
  startDate: Date;
  endDate: Date;
  channels?: SalesChannel[];
  onExportReport?: (format: 'csv' | 'pdf') => void;
}

interface SalesMetrics {
  totalOrders: number;
  totalRevenue: number;
  totalFees: number;
  netRevenue: number;
  avgOrderValue: number;
  fulfillmentBreakdown: Record<string, number>;
  paymentBreakdown: Record<string, number>;
  channelBreakdown: Record<
    string,
    { count: number; revenue: number; fees: number }
  >;
  dailySales: Array<{
    date: string;
    orders: number;
    revenue: number;
    fees: number;
  }>;
  productSales: Array<{ name: string; quantity: number; revenue: number }>;
}

const SalesReport: React.FC<SalesReportProps> = ({
  startDate,
  endDate,
  channels,
  onExportReport,
}) => {
  const { sales, completedSales, loading, error } = useSales();
  const [metrics, setMetrics] = useState<SalesMetrics | null>(null);
  const [calculatingMetrics, setCalculatingMetrics] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  // Calculate sales metrics when props change
  useEffect(() => {
    if (loading) return;

    setCalculatingMetrics(true);
    setReportError(null);

    try {
      // Get all sales within the date range
      const filteredSales = [...sales, ...completedSales].filter((sale) => {
        const saleDate = new Date(sale.createdAt);
        return (
          saleDate >= startDate &&
          saleDate <= endDate &&
          (!channels ||
            channels.length === 0 ||
            channels.includes(sale.channel))
        );
      });

      // Initialize metrics
      const metrics: SalesMetrics = {
        totalOrders: 0,
        totalRevenue: 0,
        totalFees: 0,
        netRevenue: 0,
        avgOrderValue: 0,
        fulfillmentBreakdown: {},
        paymentBreakdown: {},
        channelBreakdown: {},
        dailySales: [],
        productSales: [],
      };

      // Initialize channel breakdown for all channels
      Object.values(SalesChannel).forEach((channel) => {
        metrics.channelBreakdown[channel] = { count: 0, revenue: 0, fees: 0 };
      });

      // Initialize fulfillment breakdown
      Object.values(FulfillmentStatus).forEach((status) => {
        metrics.fulfillmentBreakdown[status] = 0;
      });

      // Initialize payment breakdown
      Object.values(PaymentStatus).forEach((status) => {
        metrics.paymentBreakdown[status] = 0;
      });

      // Initialize daily sales map
      const dailySalesMap = new Map<
        string,
        { orders: number; revenue: number; fees: number }
      >();
      const dateRange = getDateRange(startDate, endDate);

      dateRange.forEach((date) => {
        dailySalesMap.set(date, { orders: 0, revenue: 0, fees: 0 });
      });

      // Initialize product sales map
      const productSalesMap = new Map<
        string,
        { quantity: number; revenue: number }
      >();

      // Calculate metrics from sales
      filteredSales.forEach((sale) => {
        // Increment total metrics
        metrics.totalOrders++;
        metrics.totalRevenue += sale.total;
        metrics.totalFees += sale.platformFees || 0;

        // Update channel breakdown
        const channel = sale.channel;
        // Fix the type issue by properly checking if the key exists
        const channelMetric = metrics.channelBreakdown[channel];
        if (channelMetric) {
          channelMetric.count++;
          channelMetric.revenue += sale.total;
          channelMetric.fees += sale.platformFees || 0;
        }

        // Update fulfillment breakdown
        metrics.fulfillmentBreakdown[sale.fulfillmentStatus]++;

        // Update payment breakdown
        metrics.paymentBreakdown[sale.paymentStatus]++;

        // Update daily sales
        const saleDate = new Date(sale.createdAt);
        const dateString = saleDate.toISOString().split('T')[0];

        if (dailySalesMap.has(dateString)) {
          const dailyData = dailySalesMap.get(dateString)!;
          dailyData.orders++;
          dailyData.revenue += sale.total;
          dailyData.fees += sale.platformFees || 0;
          dailySalesMap.set(dateString, dailyData);
        }

        // Update product sales
        sale.items.forEach((item) => {
          const key = item.name;
          if (productSalesMap.has(key)) {
            const productData = productSalesMap.get(key)!;
            productData.quantity += item.quantity;
            productData.revenue += item.price * item.quantity;
            productSalesMap.set(key, productData);
          } else {
            productSalesMap.set(key, {
              quantity: item.quantity,
              revenue: item.price * item.quantity,
            });
          }
        });
      });

      // Calculate derived metrics
      metrics.netRevenue = metrics.totalRevenue - metrics.totalFees;
      metrics.avgOrderValue =
        filteredSales.length > 0
          ? metrics.totalRevenue / filteredSales.length
          : 0;

      // Convert daily sales map to array
      metrics.dailySales = Array.from(dailySalesMap).map(([date, data]) => ({
        date,
        ...data,
      }));

      // Convert product sales map to array and sort by revenue
      metrics.productSales = Array.from(productSalesMap)
        .map(([name, data]) => ({
          name,
          ...data,
        }))
        .sort((a, b) => b.revenue - a.revenue);

      // Update metrics state
      setMetrics(metrics);
    } catch (err) {
      console.error('Error calculating metrics:', err);
      setReportError('Failed to calculate sales metrics.');
    } finally {
      setCalculatingMetrics(false);
    }
  }, [sales, completedSales, startDate, endDate, channels, loading]);

  // Helper function to generate a range of dates
  const getDateRange = (start: Date, end: Date): string[] => {
    const dates: string[] = [];
    const current = new Date(start);

    while (current <= end) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }

    return dates;
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Handle export click
  const handleExport = (format: 'csv' | 'pdf') => {
    if (onExportReport) {
      onExportReport(format);
    } else {
      alert(
        `Export to ${format.toUpperCase()} will be implemented in a future version.`
      );
    }
  };

  if (loading || calculatingMetrics) {
    return <LoadingSpinner />;
  }

  if (error || reportError) {
    return (
      <div className='bg-red-50 p-4 rounded-md text-red-800'>
        {error || reportError}
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className='bg-yellow-50 p-4 rounded-md text-yellow-800'>
        No sales data available for the selected period.
      </div>
    );
  }

  // Get channel labels and data for the chart
  const channelLabels = Object.keys(metrics.channelBreakdown).filter(
    (channel) => metrics.channelBreakdown[channel as SalesChannel].count > 0
  );

  const channelData = channelLabels.map(
    (channel) => metrics.channelBreakdown[channel as SalesChannel].revenue
  );

  // Get payment status labels and data
  const paymentLabels = Object.keys(metrics.paymentBreakdown).filter(
    (status) => metrics.paymentBreakdown[status] > 0
  );

  // Get fulfillment status labels and data
  const fulfillmentLabels = Object.keys(metrics.fulfillmentBreakdown).filter(
    (status) => metrics.fulfillmentBreakdown[status] > 0
  );

  return (
    <div className='space-y-8'>
      {/* Report header */}
      <div className='flex justify-between items-center'>
        <div>
          <h2 className='text-xl font-medium text-gray-900'>Sales Report</h2>
          <p className='text-sm text-gray-500'>
            {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
          </p>
        </div>
        <div className='flex space-x-2'>
          <button
            onClick={() => handleExport('csv')}
            className='inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500'
          >
            Export CSV
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className='inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500'
          >
            Export PDF
          </button>
        </div>
      </div>

      {/* Summary metrics */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <div className='bg-white rounded-lg shadow-sm p-6 border border-gray-200'>
          <h3 className='text-sm font-medium text-gray-500'>Total Orders</h3>
          <p className='mt-2 text-3xl font-semibold text-gray-900'>
            {metrics.totalOrders}
          </p>
        </div>
        <div className='bg-white rounded-lg shadow-sm p-6 border border-gray-200'>
          <h3 className='text-sm font-medium text-gray-500'>Total Revenue</h3>
          <p className='mt-2 text-3xl font-semibold text-gray-900'>
            {formatCurrency(metrics.totalRevenue)}
          </p>
        </div>
        <div className='bg-white rounded-lg shadow-sm p-6 border border-gray-200'>
          <h3 className='text-sm font-medium text-gray-500'>Net Revenue</h3>
          <p className='mt-2 text-3xl font-semibold text-gray-900'>
            {formatCurrency(metrics.netRevenue)}
          </p>
          <p className='text-sm text-gray-500 mt-1'>After platform fees</p>
        </div>
        <div className='bg-white rounded-lg shadow-sm p-6 border border-gray-200'>
          <h3 className='text-sm font-medium text-gray-500'>
            Average Order Value
          </h3>
          <p className='mt-2 text-3xl font-semibold text-gray-900'>
            {formatCurrency(metrics.avgOrderValue)}
          </p>
        </div>
      </div>

      {/* Charts and tables */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Sales by channel */}
        <div className='bg-white rounded-lg shadow-sm p-6 border border-gray-200'>
          <h3 className='text-base font-medium text-gray-900 mb-4'>
            Sales by Channel
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
                    Fees
                  </th>
                  <th
                    scope='col'
                    className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                  >
                    Net
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {channelLabels.map((channel) => (
                  <tr key={channel}>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                      {channel}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {metrics.channelBreakdown[channel as SalesChannel].count}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {formatCurrency(
                        metrics.channelBreakdown[channel as SalesChannel]
                          .revenue
                      )}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {formatCurrency(
                        metrics.channelBreakdown[channel as SalesChannel].fees
                      )}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {formatCurrency(
                        metrics.channelBreakdown[channel as SalesChannel]
                          .revenue -
                          metrics.channelBreakdown[channel as SalesChannel].fees
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className='h-64 mt-4'>
            {/* Simple bar chart showing channel revenue */}
            <div className='flex h-full items-end space-x-2'>
              {channelLabels.map((channel, index) => {
                const revenue =
                  metrics.channelBreakdown[channel as SalesChannel].revenue;
                const maxRevenue = Math.max(...channelData);
                const height =
                  maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;

                return (
                  <div
                    key={channel}
                    className='flex-1 flex flex-col items-center'
                  >
                    <div
                      className='w-full bg-amber-500 rounded-t'
                      style={{ height: `${height}%` }}
                    ></div>
                    <div className='text-xs text-gray-500 mt-2 truncate w-full text-center'>
                      {channel}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Daily sales chart */}
        <div className='bg-white rounded-lg shadow-sm p-6 border border-gray-200'>
          <h3 className='text-base font-medium text-gray-900 mb-4'>
            Daily Sales
          </h3>
          <div className='h-80'>
            {/* Simple line chart showing daily revenue */}
            <div className='h-full flex flex-col'>
              <div className='flex-1 relative'>
                {metrics.dailySales.map((day, index) => {
                  const maxRevenue = Math.max(
                    ...metrics.dailySales.map((d) => d.revenue)
                  );
                  const height =
                    maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;
                  const width = 100 / metrics.dailySales.length;

                  return (
                    <div
                      key={day.date}
                      className='absolute bottom-0 bg-amber-500 rounded-t'
                      style={{
                        height: `${height}%`,
                        width: `${width - 1}%`,
                        left: `${index * width}%`,
                      }}
                      title={`${day.date}: ${formatCurrency(day.revenue)}`}
                    ></div>
                  );
                })}
              </div>
              <div className='h-6 flex'>
                {metrics.dailySales.map((day, index) => (
                  <div
                    key={day.date}
                    className='flex-1 text-xs text-gray-500 truncate text-center'
                    style={{
                      transform: 'rotate(-45deg)',
                      transformOrigin: 'top left',
                      marginLeft: '8px',
                    }}
                  >
                    {new Date(day.date).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Fulfillment status breakdown */}
        <div className='bg-white rounded-lg shadow-sm p-6 border border-gray-200'>
          <h3 className='text-base font-medium text-gray-900 mb-4'>
            Fulfillment Status
          </h3>
          <div className='space-y-4'>
            {fulfillmentLabels.map((status) => {
              const count = metrics.fulfillmentBreakdown[status];
              const percentage = (count / metrics.totalOrders) * 100;

              return (
                <div key={status}>
                  <div className='flex justify-between items-center mb-1'>
                    <span className='text-sm font-medium text-gray-700'>
                      {status.replace(/_/g, ' ')}
                    </span>
                    <span className='text-sm text-gray-500'>
                      {count} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className='w-full bg-gray-200 rounded-full h-2.5'>
                    <div
                      className={`rounded-full h-2.5 ${
                        status === FulfillmentStatus.SHIPPED ||
                        status === FulfillmentStatus.DELIVERED
                          ? 'bg-green-500'
                          : status === FulfillmentStatus.CANCELLED
                          ? 'bg-red-500'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment status breakdown */}
        <div className='bg-white rounded-lg shadow-sm p-6 border border-gray-200'>
          <h3 className='text-base font-medium text-gray-900 mb-4'>
            Payment Status
          </h3>
          <div className='space-y-4'>
            {paymentLabels.map((status) => {
              const count = metrics.paymentBreakdown[status];
              const percentage = (count / metrics.totalOrders) * 100;

              return (
                <div key={status}>
                  <div className='flex justify-between items-center mb-1'>
                    <span className='text-sm font-medium text-gray-700'>
                      {status.replace(/_/g, ' ')}
                    </span>
                    <span className='text-sm text-gray-500'>
                      {count} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className='w-full bg-gray-200 rounded-full h-2.5'>
                    <div
                      className={`rounded-full h-2.5 ${
                        status === PaymentStatus.PAID
                          ? 'bg-green-500'
                          : status === PaymentStatus.REFUNDED ||
                            status === PaymentStatus.CANCELLED
                          ? 'bg-red-500'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top-selling products */}
      <div className='bg-white rounded-lg shadow-sm p-6 border border-gray-200'>
        <h3 className='text-base font-medium text-gray-900 mb-4'>
          Top-selling Products
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
                  % of Total Revenue
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {metrics.productSales.slice(0, 10).map((product) => (
                <tr key={product.name}>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                    {product.name}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {product.quantity}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {formatCurrency(product.revenue)}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {((product.revenue / metrics.totalRevenue) * 100).toFixed(
                      1
                    )}
                    %
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesReport;
