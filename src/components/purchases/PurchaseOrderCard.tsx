// src/components/purchases/PurchaseOrderCard.tsx
import { PurchaseOrder } from '@/types/purchaseTypes';
import { formatDate, formatPrice, snakeToTitleCase } from '@/utils/formatter';
import React from 'react';

interface PurchaseOrderCardProps {
  order: PurchaseOrder;
  onView: (order: PurchaseOrder) => void;
}

const PurchaseOrderCard: React.FC<PurchaseOrderCardProps> = ({
  order,
  onView,
}) => {
  // Helper function to get color for status tag
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
    <div className='bg-white rounded-lg shadow-sm border border-stone-200 overflow-hidden hover:shadow-md transition-shadow'>
      <div className='p-4 border-b border-stone-100'>
        <div className='flex justify-between items-start'>
          <div>
            <h3 className='font-medium text-stone-900'>{order.id}</h3>
            <p className='text-sm text-stone-500 mt-1'>{order.supplier}</p>
          </div>
          <span
            className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(
              order.status
            )}`}
          >
            {snakeToTitleCase(order.status)}
          </span>
        </div>
      </div>

      <div className='p-4'>
        <div className='grid grid-cols-2 gap-4 mb-4'>
          <div>
            <div className='text-xs text-stone-500 mb-1'>Order Date</div>
            <div className='text-sm font-medium text-stone-700'>
              {formatDate(order.date)}
            </div>
          </div>
          <div>
            <div className='text-xs text-stone-500 mb-1'>Delivery Date</div>
            <div className='text-sm font-medium text-stone-700'>
              {order.deliveryDate ? formatDate(order.deliveryDate) : 'TBD'}
            </div>
          </div>
          <div>
            <div className='text-xs text-stone-500 mb-1'>Total Amount</div>
            <div className='text-sm font-medium text-stone-700'>
              {typeof order.total === 'number' ? formatPrice(order.total) : '-'}
            </div>
          </div>
          <div>
            <div className='text-xs text-stone-500 mb-1'>Payment Status</div>
            {order.paymentStatus && (
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                  order.paymentStatus
                )}`}
              >
                {snakeToTitleCase(order.paymentStatus)}
              </span>
            )}
          </div>
        </div>

        <div className='border-t border-stone-100 pt-4 mb-4'>
          <div className='text-xs text-stone-500 mb-2'>
            Items ({order.items.length})
          </div>
          <ul className='space-y-2'>
            {order.items.slice(0, 3).map((item, index) => (
              <li key={index} className='text-sm'>
                <div className='flex justify-between'>
                  <span className='text-stone-700'>{item.name}</span>
                  <span className='text-stone-600'>
                    {item.quantity} ×{' '}
                    {typeof item.price === 'number'
                      ? formatPrice(item.price)
                      : '-'}
                  </span>
                </div>
              </li>
            ))}
            {order.items.length > 3 && (
              <li className='text-xs text-amber-600 font-medium'>
                + {order.items.length - 3} more items
              </li>
            )}
          </ul>
        </div>

        <button
          onClick={() => onView(order)}
          className='w-full bg-amber-600 hover:bg-amber-700 text-white px-3 py-2 rounded-md text-sm font-medium'
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default PurchaseOrderCard;
