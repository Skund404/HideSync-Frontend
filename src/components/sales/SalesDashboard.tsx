import React, { useState } from 'react';
import { useSales } from '../../context/SalesContext';
import { SalesFilters } from '../../types/salesTypes';
import OrderList from './OrderList';

interface SalesDashboardProps {
  onViewOrder?: (orderId: number) => void;
}

const SalesDashboard: React.FC<SalesDashboardProps> = ({ onViewOrder }) => {
  const { sales, loading, syncOrders, getChannelMetrics } = useSales();
  const [activeTab, setActiveTab] = useState<
    'pending' | 'processing' | 'shipped' | 'all'
  >('pending');
  const [filters, setFilters] = useState<SalesFilters>({});
  const [syncing, setSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  const channelMetrics = getChannelMetrics();

  const handleSync = async () => {
    if (syncing) return;

    setSyncing(true);
    try {
      // Sync orders from the last 7 days
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - 7);

      const newOrdersCount = await syncOrders(fromDate);
      alert(`Synced ${newOrdersCount} new orders`);
      setLastSyncTime(new Date());
    } catch (error) {
      console.error('Sync failed:', error);
      alert('Failed to sync orders');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className='space-y-6'>
      {/* Channel summary cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        {Object.entries(channelMetrics).map(
          ([channel, data]) =>
            data.count > 0 && (
              <div key={channel} className='bg-white rounded-lg shadow p-4'>
                <h3 className='font-medium text-stone-800'>{channel}</h3>
                <div className='mt-2 text-2xl font-bold'>
                  {data.count} orders
                </div>
                <div className='text-sm text-stone-500'>
                  ${data.revenue.toFixed(2)} revenue
                </div>
                {data.fees > 0 && (
                  <div className='text-xs text-red-500'>
                    -${data.fees.toFixed(2)} fees
                  </div>
                )}
              </div>
            )
        )}
      </div>

      {/* Order fulfillment tabs */}
      <div className='bg-white shadow rounded-lg'>
        <div className='border-b border-stone-200'>
          <nav className='-mb-px flex'>
            <button
              onClick={() => setActiveTab('pending')}
              className={`${
                activeTab === 'pending'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
              } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
            >
              Pending Orders
            </button>
            <button
              onClick={() => setActiveTab('processing')}
              className={`${
                activeTab === 'processing'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
              } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
            >
              In Production
            </button>
            <button
              onClick={() => setActiveTab('shipped')}
              className={`${
                activeTab === 'shipped'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
              } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
            >
              Shipped
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`${
                activeTab === 'all'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
              } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
            >
              All Orders
            </button>
          </nav>
        </div>

        {/* Orders list filtered by tab */}
        <OrderList
          tab={activeTab}
          filters={filters}
          onFilterChange={setFilters}
          onViewOrder={onViewOrder}
        />
      </div>

      {/* Action buttons */}
      <div className='flex justify-end space-x-4'>
        <div className='text-sm text-stone-500 self-center'>
          {lastSyncTime && `Last synced: ${lastSyncTime.toLocaleString()}`}
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className='bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center disabled:opacity-50'
        >
          {syncing ? (
            <>
              <svg
                className='animate-spin -ml-1 mr-2 h-5 w-5 text-white'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
              >
                <circle
                  className='opacity-25'
                  cx='12'
                  cy='12'
                  r='10'
                  stroke='currentColor'
                  strokeWidth='4'
                ></circle>
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                ></path>
              </svg>
              Syncing...
            </>
          ) : (
            <>
              <svg
                className='w-5 h-5 mr-2'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
                />
              </svg>
              Sync Orders
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default SalesDashboard;
