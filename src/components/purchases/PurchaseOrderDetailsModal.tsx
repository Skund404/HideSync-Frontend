// src/components/purchases/PurchaseOrderDetailsModal.tsx
import { PurchaseOrder } from '@/types/purchaseTypes';
import { formatDate, formatPrice, snakeToTitleCase } from '@/utils/formatter';
import React from 'react';

interface PurchaseOrderDetailsModalProps {
  order: PurchaseOrder;
  onClose: () => void;
}

const PurchaseOrderDetailsModal: React.FC<PurchaseOrderDetailsModalProps> = ({
  order,
  onClose,
}) => {
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
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      <div className='flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0'>
        <div className='fixed inset-0 transition-opacity'>
          <div className='absolute inset-0 bg-stone-500 opacity-75'></div>
        </div>

        {/* Modal Content */}
        <div
          className='inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full'
          role='dialog'
          aria-modal='true'
          aria-labelledby='modal-headline'
        >
          {/* Header */}
          <div className='bg-stone-50 px-6 py-4 border-b border-stone-200 flex justify-between items-center'>
            <div>
              <h3
                className='text-xl font-medium text-stone-900'
                id='modal-headline'
              >
                Purchase Order: {order.id}
              </h3>
              <p className='text-sm text-stone-500 mt-1'>
                Supplier: {order.supplier}
              </p>
            </div>
            <button
              onClick={onClose}
              className='text-stone-400 hover:text-stone-500 focus:outline-none'
            >
              <svg
                className='h-6 w-6'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className='px-6 py-4'>
            {/* Purchase Order Summary */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-6'>
              <div className='bg-stone-50 rounded-lg p-4'>
                <h4 className='font-medium text-stone-700 mb-3'>
                  Order Information
                </h4>
                <div className='space-y-2'>
                  <div className='flex justify-between'>
                    <span className='text-stone-500 text-sm'>Order Date:</span>
                    <span className='text-stone-800 text-sm font-medium'>
                      {formatDate(order.date)}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-stone-500 text-sm'>
                      Delivery Date:
                    </span>
                    <span className='text-stone-800 text-sm font-medium'>
                      {formatDate(order.deliveryDate)}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-stone-500 text-sm'>Status:</span>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {snakeToTitleCase(order.status)}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-stone-500 text-sm'>
                      Payment Status:
                    </span>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        order.paymentStatus
                      )}`}
                    >
                      {snakeToTitleCase(order.paymentStatus)}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-stone-500 text-sm'>Invoice:</span>
                    <span className='text-stone-800 text-sm font-medium'>
                      {order.invoice || 'Pending'}
                    </span>
                  </div>
                </div>
              </div>

              <div className='bg-stone-50 rounded-lg p-4'>
                <h4 className='font-medium text-stone-700 mb-3'>
                  Supplier Information
                </h4>
                <div className='space-y-2'>
                  <div className='flex justify-between'>
                    <span className='text-stone-500 text-sm'>
                      Supplier Name:
                    </span>
                    <span className='text-stone-800 text-sm font-medium'>
                      {order.supplier}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-stone-500 text-sm'>Supplier ID:</span>
                    <span className='text-stone-800 text-sm font-medium'>
                      {order.supplierId}
                    </span>
                  </div>
                </div>
              </div>

              <div className='bg-stone-50 rounded-lg p-4'>
                <h4 className='font-medium text-stone-700 mb-3'>
                  Financial Information
                </h4>
                <div className='space-y-2'>
                  <div className='flex justify-between'>
                    <span className='text-stone-500 text-sm'>Subtotal:</span>
                    <span className='text-stone-800 text-sm font-medium'>
                      {formatPrice(
                        order.items.reduce((sum, item) => sum + item.total, 0)
                      )}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-stone-500 text-sm'>Shipping:</span>
                    <span className='text-stone-800 text-sm font-medium'>
                      {formatPrice(
                        order.items.find((item) => item.name === 'Shipping')
                          ?.price || 0
                      )}
                    </span>
                  </div>
                  <div className='flex justify-between font-medium'>
                    <span className='text-stone-600 text-sm'>Total:</span>
                    <span className='text-stone-800 text-sm'>
                      {formatPrice(order.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {order.notes && (
              <div className='bg-stone-50 rounded-lg p-4 mb-6'>
                <h4 className='font-medium text-stone-700 mb-2'>Notes</h4>
                <p className='text-stone-600 text-sm'>{order.notes}</p>
              </div>
            )}

            {/* Order Items */}
            <div className='mb-6'>
              <h4 className='font-medium text-stone-700 mb-3'>Order Items</h4>
              <div className='bg-white rounded-lg border border-stone-200 overflow-hidden'>
                <table className='min-w-full divide-y divide-stone-200'>
                  <thead className='bg-stone-50'>
                    <tr>
                      <th
                        scope='col'
                        className='px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
                      >
                        Item
                      </th>
                      <th
                        scope='col'
                        className='px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
                      >
                        Qty
                      </th>
                      <th
                        scope='col'
                        className='px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
                      >
                        Price
                      </th>
                      <th
                        scope='col'
                        className='px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
                      >
                        Total
                      </th>
                      {order.items.some((item) => item.itemType) && (
                        <th
                          scope='col'
                          className='px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
                        >
                          Type
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-stone-200'>
                    {order.items.map((item, index) => (
                      <tr key={index}>
                        <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-stone-900'>
                          {item.name}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-stone-500'>
                          {item.quantity} {item.unit && `(${item.unit})`}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-stone-500'>
                          {formatPrice(item.price)}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-stone-700'>
                          {formatPrice(item.total)}
                        </td>
                        {order.items.some((item) => item.itemType) && (
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-stone-500'>
                            {item.itemType && (
                              <span className='px-2 py-1 text-xs font-medium rounded-full bg-stone-100 text-stone-800'>
                                {item.itemType}
                              </span>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className='bg-stone-50'>
                    <tr>
                      <td
                        colSpan={3}
                        className='px-6 py-4 text-right text-sm font-medium text-stone-700'
                      >
                        Total:
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-stone-700'>
                        {formatPrice(order.total)}
                      </td>
                      {order.items.some((item) => item.itemType) && <td></td>}
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          {/* Footer/Actions */}
          <div className='bg-stone-50 px-6 py-4 border-t border-stone-200 flex justify-between'>
            <div>
              <button
                onClick={onClose}
                className='bg-white border border-stone-300 text-stone-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-stone-50 focus:outline-none'
              >
                Close
              </button>
            </div>
            <div className='flex space-x-3'>
              <button className='bg-stone-100 text-stone-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-stone-200 focus:outline-none flex items-center'>
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
                    d='M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                  />
                </svg>
                Download PDF
              </button>
              <button className='bg-amber-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-amber-700 focus:outline-none flex items-center'>
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
                    d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                  />
                </svg>
                Edit Order
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrderDetailsModal;
