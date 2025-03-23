// src/components/sales/SalesReport.tsx
import React, { useEffect, useState } from 'react';
import { FulfillmentStatus, SalesChannel } from '../../types/salesTypes';
// Import PaymentStatus from enums instead of salesTypes
import * as salesReportService from '../../services/sales-report-service';
import {
  SalesMetrics,
  SalesReportFilters,
} from '../../services/sales-report-service';
import { PaymentStatus } from '../../types/enums';
import ErrorMessage from '../common/ErrorMessage';
import LoadingSpinner from '../common/LoadingSpinner';

interface SalesReportProps {
  startDate: Date;
  endDate: Date;
  channels?: SalesChannel[];
  onExportReport?: (format: 'csv' | 'pdf') => void;
}

const SalesReport: React.FC<SalesReportProps> = ({
  startDate,
  endDate,
  channels,
  onExportReport,
}) => {
  const [metrics, setMetrics] = useState<SalesMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  // Fetch report data when props change
  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        setError(null);

        const filters: SalesReportFilters = {
          startDate,
          endDate,
          channels,
        };

        const reportMetrics = await salesReportService.getSalesReportMetrics(
          filters
        );
        setMetrics(reportMetrics);
      } catch (err) {
        console.error('Error fetching report data:', err);
        setError('Failed to load sales report data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [startDate, endDate, channels]);

  // Handle export click
  const handleExport = async (format: 'csv' | 'pdf') => {
    if (onExportReport) {
      // Use provided export handler if available
      onExportReport(format);
      return;
    }

    try {
      setExporting(true);
      setError(null);

      const filters: SalesReportFilters = {
        startDate,
        endDate,
        channels,
      };

      const downloadUrl = await salesReportService.exportSalesReport(
        filters,
        format
      );

      // Open the download URL in a new tab
      window.open(downloadUrl, '_blank');
    } catch (err) {
      console.error('Error exporting report:', err);
      setError(`Failed to export report as ${format.toUpperCase()}`);
    } finally {
      setExporting(false);
    }
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <ErrorMessage
        message={error}
        onRetry={() => {
          // Trigger a refresh by re-fetching with the same parameters
          setLoading(true);
        }}
      />
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

  // Get payment status labels and data
  const paymentLabels = Object.keys(metrics.paymentBreakdown).filter(
    (status) => metrics.paymentBreakdown[status as PaymentStatus] > 0
  );

  // Get fulfillment status labels and data
  const fulfillmentLabels = Object.keys(metrics.fulfillmentBreakdown).filter(
    (status) => metrics.fulfillmentBreakdown[status as FulfillmentStatus] > 0
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
            disabled={exporting}
            className='inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50'
          >
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
          <button
            onClick={() => handleExport('pdf')}
            disabled={exporting}
            className='inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50'
          >
            {exporting ? 'Exporting...' : 'Export PDF'}
          </button>
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
        </div>

        {/* Fulfillment status breakdown */}
        <div className='bg-white rounded-lg shadow-sm p-6 border border-gray-200'>
          <h3 className='text-base font-medium text-gray-900 mb-4'>
            Fulfillment Status
          </h3>
          <div className='space-y-4'>
            {fulfillmentLabels.map((status) => {
              const count =
                metrics.fulfillmentBreakdown[status as FulfillmentStatus];
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
              const count = metrics.paymentBreakdown[status as PaymentStatus];
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
