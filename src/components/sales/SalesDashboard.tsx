import React, { useState } from 'react';
import { useSales } from '../../context/SalesContext';
import { FulfillmentStatus, SalesFilters } from '../../types/salesTypes';
import LoadingSpinner from '../common/LoadingSpinner';
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

  // Add a loading indicator for the initial load
  if (loading) {
    return <LoadingSpinner color='amber' message='Loading sales data...' />;
  }

  // Check if there are no sales
  const hasSales = sales && sales.length > 0;

  return (
    <div className='space-y-6'>
      {/* Sales summary indicator */}
      {hasSales ? (
        <div className='mb-4 px-4 py-2 bg-green-50 text-green-700 rounded-lg'>
          <div className='flex items-center'>
            <svg
              className='w-5 h-5 mr-2'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
            <span>Total Orders: {sales.length}</span>
          </div>
        </div>
      ) : (
        <div className='mb-4 px-4 py-2 bg-amber-50 text-amber-700 rounded-lg'>
          <div className='flex items-center'>
            <svg
              className='w-5 h-5 mr-2'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
            <span>
              No orders found. Click "Sync Orders" to fetch the latest orders.
            </span>
          </div>
        </div>
      )}

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

        {/* Add a card showing total orders from sales */}
        {hasSales && !Object.keys(channelMetrics).length && (
          <div className='bg-white rounded-lg shadow p-4'>
            <h3 className='font-medium text-stone-800'>All Channels</h3>
            <div className='mt-2 text-2xl font-bold'>{sales.length} orders</div>
          </div>
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
              {/* Add counter badge showing pending orders count */}
              {hasSales && (
                <span className='ml-2 px-2 py-0.5 text-xs bg-amber-100 text-amber-800 rounded-full'>
                  {
                    sales.filter(
                      (sale) =>
                        sale.fulfillmentStatus === FulfillmentStatus.PENDING
                    ).length
                  }
                </span>
              )}
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
              {/* Add counter badge showing processing orders count */}
              {hasSales && (
                <span className='ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full'>
                  {
                    sales.filter(
                      (sale) =>
                        sale.fulfillmentStatus === FulfillmentStatus.PICKING ||
                        sale.fulfillmentStatus ===
                          FulfillmentStatus.IN_PRODUCTION
                    ).length
                  }
                </span>
              )}
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
              {/* Add counter badge showing shipped orders count */}
              {hasSales && (
                <span className='ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full'>
                  {
                    sales.filter(
                      (sale) =>
                        sale.fulfillmentStatus === FulfillmentStatus.SHIPPED ||
                        sale.fulfillmentStatus === FulfillmentStatus.DELIVERED
                    ).length
                  }
                </span>
              )}
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
              {/* Add counter badge showing total orders count */}
              {hasSales && (
                <span className='ml-2 px-2 py-0.5 text-xs bg-stone-100 text-stone-800 rounded-full'>
                  {sales.length}
                </span>
              )}
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
      <div className='flex justify-between'>
        {/* Show a summary of sales status */}
        <div className='text-sm text-stone-600'>
          {hasSales && (
            <div className='flex space-x-4'>
              <span>Total: {sales.length}</span>
              <span>
                Pending:{' '}
                {
                  sales.filter(
                    (sale) =>
                      sale.fulfillmentStatus === FulfillmentStatus.PENDING
                  ).length
                }
              </span>
              <span>
                Processing:{' '}
                {
                  sales.filter(
                    (sale) =>
                      sale.fulfillmentStatus === FulfillmentStatus.PICKING ||
                      sale.fulfillmentStatus === FulfillmentStatus.IN_PRODUCTION
                  ).length
                }
              </span>
              <span>
                Shipped:{' '}
                {
                  sales.filter(
                    (sale) =>
                      sale.fulfillmentStatus === FulfillmentStatus.SHIPPED ||
                      sale.fulfillmentStatus === FulfillmentStatus.DELIVERED
                  ).length
                }
              </span>
            </div>
          )}
        </div>

        <div className='flex space-x-4'>
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
    </div>
  );
};

export default SalesDashboard;
