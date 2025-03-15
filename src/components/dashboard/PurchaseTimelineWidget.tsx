// src/components/dashboard/PurchaseTimelineWidget.tsx
import { usePurchaseOrders } from '@/context/PurchaseContext';
import { formatDate, formatPrice } from '@/utils/formatter';
import React from 'react';
import { Link } from 'react-router-dom';

const PurchaseTimelineWidget: React.FC = () => {
  const { purchaseOrders } = usePurchaseOrders();

  // Get upcoming deliveries (next 14 days)
  const currentDate = new Date();
  const twoWeeksLater = new Date();
  twoWeeksLater.setDate(twoWeeksLater.getDate() + 14);

  const upcomingDeliveries = purchaseOrders
    .filter((order) => {
      const deliveryDate = new Date(order.deliveryDate);
      return deliveryDate >= currentDate && deliveryDate <= twoWeeksLater;
    })
    .sort(
      (a, b) =>
        new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime()
    )
    .slice(0, 5); // Limit to 5 items

  // Helper function to get color for status badge
  const getStatusColor = (status: string) => {
    if (status.includes('DELIVERED') || status.includes('COMPLETE')) {
      return 'bg-green-100 text-green-800';
    }
    if (status.includes('TRANSIT') || status.includes('SHIPPED')) {
      return 'bg-purple-100 text-purple-800';
    }
    if (status.includes('PROCESSING') || status.includes('APPROVED')) {
      return 'bg-blue-100 text-blue-800';
    }
    return 'bg-amber-100 text-amber-800';
  };

  return (
    <div className='bg-white rounded-lg shadow p-4 h-full'>
      <div className='flex justify-between items-center mb-4'>
        <h3 className='text-lg font-medium text-stone-900'>
          Upcoming Deliveries
        </h3>
        <Link
          to='/purchases'
          className='text-amber-600 hover:text-amber-700 text-sm font-medium'
        >
          View All
        </Link>
      </div>

      {upcomingDeliveries.length > 0 ? (
        <div className='space-y-4'>
          {upcomingDeliveries.map((order) => (
            <div
              key={order.id}
              className='flex items-start border-l-4 border-amber-500 pl-4 py-1'
            >
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-medium text-stone-900 truncate'>
                  {order.supplier}
                </p>
                <p className='text-xs text-stone-500 truncate'>
                  {order.id} · {formatPrice(order.total)} · {order.items.length}{' '}
                  items
                </p>
              </div>
              <div className='ml-4 flex flex-col items-end'>
                <span
                  className={`px-2 py-1 inline-flex text-xs leading-4 font-medium rounded-full ${getStatusColor(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>
                <span className='text-xs text-stone-500 mt-1'>
                  Due: {formatDate(order.deliveryDate)}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className='text-center py-12 bg-stone-50 rounded'>
          <div className='mx-auto h-12 w-12 text-stone-400 mb-4'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-12 w-12'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={1}
                d='M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4'
              />
            </svg>
          </div>
          <h3 className='text-base font-medium text-stone-700'>
            No Upcoming Deliveries
          </h3>
          <p className='mt-1 text-sm text-stone-500'>
            There are no purchase orders due in the next 14 days.
          </p>
        </div>
      )}
    </div>
  );
};

export default PurchaseTimelineWidget;
