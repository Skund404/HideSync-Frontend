// src/components/purchases/PurchaseOrderListView.tsx
import { PurchaseOrder } from '@/types/purchaseTypes';
import { formatDate, formatPrice, snakeToTitleCase } from '@/utils/formatter';
import React from 'react';

interface PurchaseOrderListViewProps {
  orders: PurchaseOrder[];
  onViewOrder: (order: PurchaseOrder) => void;
}

const PurchaseOrderListView: React.FC<PurchaseOrderListViewProps> = ({
  orders,
  onViewOrder,
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

  if (orders.length === 0) {
    return (
      <div className='bg-white shadow-sm rounded-lg p-6 border border-stone-200 text-center'>
        <div className='flex flex-col items-center justify-center py-12'>
          <div className='bg-amber-100 p-4 rounded-full mb-4'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-10 w-10 text-amber-600'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z'
              />
            </svg>
          </div>
          <h3 className='text-lg font-medium text-stone-700 mb-2'>
            No Purchase Orders Found
          </h3>
          <p className='text-stone-500 max-w-md mb-6'>
            Try adjusting your filters or create a new purchase order.
          </p>
          <button className='bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center'>
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
                d='M12 6v6m0 0v6m0-6h6m-6 0H6'
              />
            </svg>
            Create New Purchase Order
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white shadow-sm rounded-lg border border-stone-200 overflow-hidden'>
      <div className='overflow-x-auto'>
        <table className='min-w-full divide-y divide-stone-200'>
          <thead className='bg-stone-50'>
            <tr>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
              >
                Purchase Order
              </th>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
              >
                Supplier
              </th>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
              >
                Dates
              </th>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
              >
                Status
              </th>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
              >
                Amount
              </th>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
              >
                Payment
              </th>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-stone-200'>
            {orders.map((order) => (
              <tr key={order.id} className='hover:bg-stone-50'>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='text-sm font-medium text-stone-900'>
                    {order.id}
                  </div>
                  <div className='text-xs text-stone-500'>
                    {order.items.length} items
                  </div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='text-sm text-stone-900'>{order.supplier}</div>
                  <div className='text-xs text-stone-500'>
                    {typeof order.invoice === 'string' &&
                    order.invoice !== 'Pending'
                      ? order.invoice
                      : '-'}
                  </div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='text-sm text-stone-900'>
                    Ordered: {formatDate(order.date)}
                  </div>
                  <div className='text-xs text-stone-500'>
                    Delivery:{' '}
                    {order.deliveryDate
                      ? formatDate(order.deliveryDate)
                      : 'TBD'}
                  </div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {snakeToTitleCase(order.status)}
                  </span>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='text-sm font-medium text-stone-900'>
                    {typeof order.total === 'number'
                      ? formatPrice(order.total)
                      : '-'}
                  </div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  {order.paymentStatus && (
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${getStatusColor(
                        order.paymentStatus
                      )}`}
                    >
                      {snakeToTitleCase(order.paymentStatus)}
                    </span>
                  )}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-stone-500'>
                  <div className='flex space-x-2'>
                    <button
                      onClick={() => onViewOrder(order)}
                      className='text-amber-600 hover:text-amber-900'
                      title='View Details'
                    >
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='h-5 w-5'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                        />
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                        />
                      </svg>
                    </button>
                    <button
                      className='text-stone-600 hover:text-stone-900'
                      title='Edit Purchase Order'
                    >
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='h-5 w-5'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                        />
                      </svg>
                    </button>
                    <button
                      className='text-stone-600 hover:text-stone-900'
                      title='Download PDF'
                    >
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='h-5 w-5'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                        />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PurchaseOrderListView;
