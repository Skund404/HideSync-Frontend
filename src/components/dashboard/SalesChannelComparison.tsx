// src/components/dashboard/SalesChannelComparison.tsx
import React, { useMemo, useState } from 'react';
import { useSales } from '../../context/SalesContext';
import { SalesChannel } from '../../types/salesTypes';
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

// Define the type for channel metrics data
interface ChannelMetricData {
  count: number;
  revenue: number;
  fees: number;
}

type ChannelMetrics = Record<string, ChannelMetricData>;

const SalesChannelComparison: React.FC = () => {
  const { getChannelMetrics, loading, error } = useSales();
  const [view, setView] = useState<'revenue' | 'orders' | 'fees'>('revenue');

  // Memoize channel metrics to ensure stable reference
  const channelMetrics = useMemo(() => {
    return !loading ? getChannelMetrics() : ({} as ChannelMetrics);
  }, [loading, getChannelMetrics]);

  // Memoize the filtered and sorted active channels
  const activeChannels = useMemo(() => {
    if (loading || Object.keys(channelMetrics).length === 0) return [];

    return Object.entries(channelMetrics)
      .filter(([_, data]) => (data as ChannelMetricData).count > 0)
      .sort((a, b) => {
        // Sort based on the current view
        const dataA = a[1] as ChannelMetricData;
        const dataB = b[1] as ChannelMetricData;

        if (view === 'revenue') {
          return dataB.revenue - dataA.revenue;
        } else if (view === 'orders') {
          return dataB.count - dataA.count;
        } else {
          return dataB.fees - dataA.fees;
        }
      }) as [string, ChannelMetricData][];
  }, [channelMetrics, view, loading]);

  // Memoize the total calculations
  const totals = useMemo(() => {
    const totalOrders = activeChannels.reduce(
      (sum, [_, data]) => sum + data.count,
      0
    );
    const totalRevenue = activeChannels.reduce(
      (sum, [_, data]) => sum + data.revenue,
      0
    );
    const totalFees = activeChannels.reduce(
      (sum, [_, data]) => sum + data.fees,
      0
    );

    return { totalOrders, totalRevenue, totalFees };
  }, [activeChannels]);

  // Memoize the maximum value for scaling bars correctly
  const maxValue = useMemo(
    () =>
      Math.max(
        ...activeChannels.map(([_, data]) =>
          view === 'revenue'
            ? data.revenue
            : view === 'orders'
            ? data.count
            : data.fees
        ),
        0.1 // Prevent division by zero
      ),
    [activeChannels, view]
  );

  // Define a type for channel config to avoid type errors
  type ChannelIconConfig = {
    icon: string;
    color: string;
  };

  type ChannelConfigType = {
    [key in SalesChannel]: ChannelIconConfig;
  };

  // Memoize channel configuration with proper typing
  const channelConfig = useMemo<ChannelConfigType>(
    () => ({
      [SalesChannel.SHOPIFY]: { icon: '🛍️', color: 'bg-green-500' },
      [SalesChannel.ETSY]: { icon: '🧶', color: 'bg-orange-500' },
      [SalesChannel.AMAZON]: { icon: '📦', color: 'bg-yellow-500' },
      [SalesChannel.EBAY]: { icon: '🏷️', color: 'bg-red-500' },
      [SalesChannel.DIRECT]: { icon: '🤝', color: 'bg-blue-500' },
      [SalesChannel.WHOLESALE]: { icon: '🏭', color: 'bg-purple-500' },
      [SalesChannel.CUSTOM_ORDER]: { icon: '✨', color: 'bg-indigo-500' },
      [SalesChannel.OTHER]: { icon: '🛒', color: 'bg-stone-500' },
    }),
    []
  );

  // Format channel name for display
  const formatChannelName = (channel: string): string => {
    return channel
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  if (loading) {
    return (
      <div className='bg-white shadow rounded-lg p-4'>
        <LoadingSpinner color='amber' message='Loading channel data...' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='bg-white shadow rounded-lg p-4'>
        <ErrorMessage
          message={`Failed to load sales channel data: ${error}`}
          onRetry={() => {}} // Add a retry function if available in context
        />
      </div>
    );
  }

  if (activeChannels.length === 0) {
    return (
      <div className='bg-white shadow rounded-lg p-4'>
        <h3 className='text-lg font-medium text-stone-900 mb-3'>
          Sales Channels
        </h3>
        <div className='text-center py-8 text-stone-500'>
          <p>No sales data available for any channels.</p>
          <p className='text-sm mt-2'>
            Sales will appear here once orders are created.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white shadow rounded-lg p-4'>
      <div className='flex justify-between items-center mb-4'>
        <h3 className='text-lg font-medium text-stone-900'>Sales Channels</h3>
        <div className='flex space-x-2'>
          <button
            className={`px-2 py-1 text-xs rounded ${
              view === 'revenue'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-stone-100 text-stone-600'
            }`}
            onClick={() => setView('revenue')}
          >
            Revenue
          </button>
          <button
            className={`px-2 py-1 text-xs rounded ${
              view === 'orders'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-stone-100 text-stone-600'
            }`}
            onClick={() => setView('orders')}
          >
            Orders
          </button>
          <button
            className={`px-2 py-1 text-xs rounded ${
              view === 'fees'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-stone-100 text-stone-600'
            }`}
            onClick={() => setView('fees')}
          >
            Fees
          </button>
        </div>
      </div>

      <div className='space-y-4'>
        {activeChannels.map(([channel, data]) => {
          // Calculate percentage based on current view
          const percentage =
            view === 'revenue'
              ? (data.revenue / totals.totalRevenue) * 100
              : view === 'orders'
              ? (data.count / totals.totalOrders) * 100
              : (data.fees / totals.totalFees) * 100;

          // Calculate width percentage for the bar with a max of 100%
          const barWidth =
            view === 'revenue'
              ? (data.revenue / maxValue) * 100
              : view === 'orders'
              ? (data.count / maxValue) * 100
              : (data.fees / maxValue) * 100;

          // Get channel configuration with type safety
          // Use type assertion to tell TypeScript this is a valid SalesChannel
          const validChannel = channel as SalesChannel;
          const config = channelConfig[validChannel] || {
            icon: '🛒',
            color: 'bg-stone-500',
          };

          return (
            <div key={channel} className='space-y-1'>
              <div className='flex justify-between items-center mb-1'>
                <div className='flex items-center'>
                  <span className='mr-2'>{config.icon}</span>
                  <span className='text-sm font-medium text-stone-800'>
                    {formatChannelName(channel)}
                  </span>
                </div>
                <div className='text-sm font-medium'>
                  {view === 'revenue' && formatCurrency(data.revenue)}
                  {view === 'orders' && `${data.count} orders`}
                  {view === 'fees' && formatCurrency(data.fees)}
                  <span className='ml-2 text-xs text-stone-500'>
                    ({percentage.toFixed(1)}%)
                  </span>
                </div>
              </div>
              <div className='w-full bg-stone-100 rounded-full h-3'>
                <div
                  className={`${config.color} h-3 rounded-full`}
                  style={{ width: `${barWidth}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      <div className='mt-4 text-sm text-stone-500 flex justify-between items-center'>
        <div>
          {view === 'revenue' &&
            `Total: ${formatCurrency(totals.totalRevenue)}`}
          {view === 'orders' && `Total: ${totals.totalOrders} orders`}
          {view === 'fees' && `Total: ${formatCurrency(totals.totalFees)}`}
        </div>
        <a
          href='/sales?view=settings'
          className='text-amber-600 hover:text-amber-800 font-medium'
        >
          Manage Integrations →
        </a>
      </div>
    </div>
  );
};

export default SalesChannelComparison;
