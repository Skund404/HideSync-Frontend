import React, { useEffect, useState } from 'react';
import { useSales } from '../../context/SalesContext';
import { PaymentStatus } from '../../types/enums';
import { FulfillmentStatus } from '../../types/salesTypes';

const SalesAnalyticsWidget: React.FC = () => {
  const { sales, completedSales, loading } = useSales();
  const [timeframe, setTimeframe] = useState<
    'today' | 'week' | 'month' | 'quarter'
  >('week');
  const [stats, setStats] = useState({
    totalSales: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    pendingFulfillment: 0,
    pendingPayment: 0,
    fulfilledOrders: 0,
    paidOrders: 0,
  });

  useEffect(() => {
    // Skip calculation if data is still loading
    if (loading) return;

    // Combine active and completed sales
    const allSales = [...sales, ...completedSales];

    // Calculate date range based on selected timeframe
    const now = new Date();
    let startDate: Date;

    switch (timeframe) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      default:
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
    }

    // Filter sales by date range
    const filteredSales = allSales.filter((sale) => {
      const saleDate = new Date(sale.createdAt);
      return saleDate >= startDate;
    });

    // Calculate statistics
    const totalSales = filteredSales.length;
    const totalRevenue = filteredSales.reduce(
      (sum, sale) => sum + sale.total,
      0
    );
    const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;

    const pendingFulfillment = filteredSales.filter(
      (sale) => sale.fulfillmentStatus === FulfillmentStatus.PENDING
    ).length;

    const pendingPayment = filteredSales.filter(
      (sale) => sale.paymentStatus === PaymentStatus.PENDING
    ).length;

    const fulfilledOrders = filteredSales.filter(
      (sale) =>
        sale.fulfillmentStatus === FulfillmentStatus.SHIPPED ||
        sale.fulfillmentStatus === FulfillmentStatus.DELIVERED
    ).length;

    const paidOrders = filteredSales.filter(
      (sale) => sale.paymentStatus === PaymentStatus.PAID
    ).length;

    // Update stats
    setStats({
      totalSales,
      totalRevenue,
      averageOrderValue,
      pendingFulfillment,
      pendingPayment,
      fulfilledOrders,
      paidOrders,
    });
  }, [sales, completedSales, timeframe, loading]);

  // Helper function to format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className='bg-white shadow rounded-lg p-4 animate-pulse'>
        <div className='h-6 bg-stone-200 rounded mb-4 w-1/3'></div>
        <div className='space-y-3'>
          <div className='h-4 bg-stone-200 rounded w-full'></div>
          <div className='h-4 bg-stone-200 rounded w-full'></div>
          <div className='h-4 bg-stone-200 rounded w-3/4'></div>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white shadow rounded-lg p-4'>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-lg font-medium text-stone-900'>Sales Analytics</h3>
        <div className='flex space-x-2'>
          <button
            className={`px-2 py-1 text-xs rounded ${
              timeframe === 'today'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-stone-100 text-stone-600'
            }`}
            onClick={() => setTimeframe('today')}
          >
            Today
          </button>
          <button
            className={`px-2 py-1 text-xs rounded ${
              timeframe === 'week'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-stone-100 text-stone-600'
            }`}
            onClick={() => setTimeframe('week')}
          >
            Week
          </button>
          <button
            className={`px-2 py-1 text-xs rounded ${
              timeframe === 'month'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-stone-100 text-stone-600'
            }`}
            onClick={() => setTimeframe('month')}
          >
            Month
          </button>
          <button
            className={`px-2 py-1 text-xs rounded ${
              timeframe === 'quarter'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-stone-100 text-stone-600'
            }`}
            onClick={() => setTimeframe('quarter')}
          >
            Quarter
          </button>
        </div>
      </div>

      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
        <div className='flex flex-col'>
          <span className='text-xs text-stone-500 uppercase'>Orders</span>
          <span className='text-2xl font-bold text-stone-900'>
            {stats.totalSales}
          </span>
        </div>
        <div className='flex flex-col'>
          <span className='text-xs text-stone-500 uppercase'>Revenue</span>
          <span className='text-2xl font-bold text-stone-900'>
            {formatCurrency(stats.totalRevenue)}
          </span>
        </div>
        <div className='flex flex-col'>
          <span className='text-xs text-stone-500 uppercase'>Avg. Order</span>
          <span className='text-2xl font-bold text-stone-900'>
            {formatCurrency(stats.averageOrderValue)}
          </span>
        </div>
        <div className='flex flex-col'>
          <span className='text-xs text-stone-500 uppercase'>
            Fulfillment Rate
          </span>
          <span className='text-2xl font-bold text-stone-900'>
            {stats.totalSales > 0
              ? Math.round((stats.fulfilledOrders / stats.totalSales) * 100)
              : 0}
            %
          </span>
        </div>
      </div>

      <div className='space-y-3'>
        {/* Pending Fulfillment Progress Bar */}
        <div>
          <div className='flex justify-between items-center mb-1'>
            <span className='text-xs text-stone-500'>Pending Fulfillment</span>
            <span className='text-xs font-medium text-amber-700'>
              {stats.pendingFulfillment} of {stats.totalSales} Orders
            </span>
          </div>
          <div className='w-full bg-stone-200 rounded-full h-2'>
            <div
              className='bg-amber-500 h-2 rounded-full'
              style={{
                width: `${
                  stats.totalSales > 0
                    ? (stats.pendingFulfillment / stats.totalSales) * 100
                    : 0
                }%`,
              }}
            ></div>
          </div>
        </div>

        {/* Pending Payment Progress Bar */}
        <div>
          <div className='flex justify-between items-center mb-1'>
            <span className='text-xs text-stone-500'>Pending Payment</span>
            <span className='text-xs font-medium text-blue-700'>
              {stats.pendingPayment} of {stats.totalSales} Orders
            </span>
          </div>
          <div className='w-full bg-stone-200 rounded-full h-2'>
            <div
              className='bg-blue-500 h-2 rounded-full'
              style={{
                width: `${
                  stats.totalSales > 0
                    ? (stats.pendingPayment / stats.totalSales) * 100
                    : 0
                }%`,
              }}
            ></div>
          </div>
        </div>
      </div>

      <div className='mt-4 flex justify-end'>
        <a
          href='/sales'
          className='text-sm text-amber-600 hover:text-amber-800 font-medium'
        >
          View Sales Dashboard →
        </a>
      </div>
    </div>
  );
};

export default SalesAnalyticsWidget;
