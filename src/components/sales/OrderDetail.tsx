// src/components/sales/OrderDetail.tsx
import React, { useState } from 'react';
import { useSales } from '../../context/SalesContext';
import {
  FulfillmentStatus,
  SalesChannel,
  SalesItem,
} from '../../types/salesTypes';
import { formatDate } from '../../utils/formatter';
import LoadingSpinner from '../common/LoadingSpinner';
import OrderActions from './OrderActions';
import OrderWorkflow from './OrderWorkflow';

interface OrderDetailProps {
  orderId: number;
  onClose: () => void;
}

const OrderDetail: React.FC<OrderDetailProps> = ({ orderId, onClose }) => {
  const { getSale, loading, error, updateSale } = useSales();
  const [isEditing, setIsEditing] = useState(false);
  const sale = getSale(orderId);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className='text-red-500'>Error: {error}</div>;
  if (!sale) return <div className='text-red-500'>Order not found</div>;

  const handleStatusUpdate = async (newStatus: FulfillmentStatus) => {
    try {
      await updateSale(orderId, { fulfillmentStatus: newStatus });
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case FulfillmentStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case FulfillmentStatus.PICKING:
        return 'bg-blue-100 text-blue-800';
      case FulfillmentStatus.READY_TO_SHIP:
        return 'bg-green-100 text-green-800';
      case FulfillmentStatus.SHIPPED:
        return 'bg-indigo-100 text-indigo-800';
      case FulfillmentStatus.DELIVERED:
        return 'bg-purple-100 text-purple-800';
      case FulfillmentStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getChannelIcon = (channel: SalesChannel) => {
    switch (channel) {
      case SalesChannel.SHOPIFY:
        return '🛍️';
      case SalesChannel.ETSY:
        return '🧶';
      case SalesChannel.AMAZON:
        return '📦';
      case SalesChannel.EBAY:
        return '🏷️';
      case SalesChannel.DIRECT:
        return '🤝';
      case SalesChannel.WHOLESALE:
        return '🏭';
      default:
        return '🛒';
    }
  };

  return (
    <div className='bg-white shadow overflow-hidden sm:rounded-lg'>
      <div className='px-4 py-5 sm:px-6 flex justify-between items-center'>
        <div>
          <h3 className='text-lg leading-6 font-medium text-gray-900'>
            Order #{sale.id}
            <span className='ml-2 text-sm text-gray-500'>
              {getChannelIcon(sale.channel)} {sale.channel}
            </span>
            {sale.marketplaceData && (
              <span className='ml-2 text-sm text-gray-500'>
                External ID: {sale.marketplaceData.externalOrderId}
              </span>
            )}
          </h3>
          <p className='mt-1 max-w-2xl text-sm text-gray-500'>
            Created on {formatDate(sale.createdAt)}
          </p>
        </div>
        <div className='flex space-x-2'>
          <button
            onClick={onClose}
            className='inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500'
          >
            Back
          </button>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className='inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500'
          >
            {isEditing ? 'View Details' : 'Edit Order'}
          </button>
        </div>
      </div>

      {/* Workflow Progress */}
      <OrderWorkflow sale={sale} onStatusUpdate={handleStatusUpdate} />

      {/* Order Actions */}
      <div className='border-t border-gray-200 px-4 py-5 sm:px-6'>
        <OrderActions sale={sale} />
      </div>

      {/* Order Details in Main/Edit modes */}
      {!isEditing ? (
        <div className='border-t border-gray-200'>
          {/* Order Information */}
          <dl>
            <div className='bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
              <dt className='text-sm font-medium text-gray-500'>Customer</dt>
              <dd className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2'>
                {sale.customer.name} ({sale.customer.email})
              </dd>
            </div>
            <div className='bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
              <dt className='text-sm font-medium text-gray-500'>Status</dt>
              <dd className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2'>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                    sale.fulfillmentStatus
                  )}`}
                >
                  {sale.fulfillmentStatus}
                </span>
                <span className='ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800'>
                  Payment: {sale.paymentStatus}
                </span>
              </dd>
            </div>
            <div className='bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
              <dt className='text-sm font-medium text-gray-500'>
                Shipping Address
              </dt>
              <dd className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2'>
                {sale.shippingAddress ? (
                  <div>
                    <p>{sale.shippingAddress.street}</p>
                    <p>
                      {sale.shippingAddress.city}, {sale.shippingAddress.state}{' '}
                      {sale.shippingAddress.postalCode}
                    </p>
                    <p>{sale.shippingAddress.country}</p>
                  </div>
                ) : (
                  <span className='text-gray-500'>
                    No shipping address provided
                  </span>
                )}
              </dd>
            </div>
            <div className='bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
              <dt className='text-sm font-medium text-gray-500'>
                Shipping Method
              </dt>
              <dd className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2'>
                {sale.shippingMethod || 'Not specified'}
                {sale.trackingNumber && (
                  <span className='ml-2'>
                    Tracking: {sale.trackingNumber} ({sale.shippingProvider})
                  </span>
                )}
              </dd>
            </div>
            <div className='bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
              <dt className='text-sm font-medium text-gray-500'>
                Order Summary
              </dt>
              <dd className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2'>
                <div className='flex justify-between'>
                  <span>Subtotal:</span>
                  <span>
                    $
                    {(
                      sale.totalAmount -
                      (sale.shipping || 0) -
                      (sale.taxes || 0)
                    ).toFixed(2)}
                  </span>
                </div>
                {sale.shipping !== undefined && (
                  <div className='flex justify-between'>
                    <span>Shipping:</span>
                    <span>${sale.shipping.toFixed(2)}</span>
                  </div>
                )}
                {sale.taxes !== undefined && (
                  <div className='flex justify-between'>
                    <span>Taxes:</span>
                    <span>${sale.taxes.toFixed(2)}</span>
                  </div>
                )}
                {sale.platformFees !== undefined && (
                  <div className='flex justify-between'>
                    <span>Platform Fees:</span>
                    <span>-${sale.platformFees.toFixed(2)}</span>
                  </div>
                )}
                <div className='flex justify-between font-bold mt-2 pt-2 border-t'>
                  <span>Total:</span>
                  <span>${sale.totalAmount.toFixed(2)}</span>
                </div>
                {sale.netRevenue !== undefined && (
                  <div className='flex justify-between text-green-600 mt-1'>
                    <span>Net Revenue:</span>
                    <span>${sale.netRevenue.toFixed(2)}</span>
                  </div>
                )}
              </dd>
            </div>
          </dl>

          {/* Order Items */}
          <div className='px-4 py-5 sm:px-6'>
            <h4 className='text-lg font-medium text-gray-900'>Order Items</h4>
            <div className='mt-4 flex flex-col'>
              <div className='-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8'>
                <div className='py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8'>
                  <div className='shadow overflow-hidden border-b border-gray-200 sm:rounded-lg'>
                    <table className='min-w-full divide-y divide-gray-200'>
                      <thead className='bg-gray-50'>
                        <tr>
                          <th
                            scope='col'
                            className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                          >
                            Item
                          </th>
                          <th
                            scope='col'
                            className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                          >
                            SKU
                          </th>
                          <th
                            scope='col'
                            className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                          >
                            Price
                          </th>
                          <th
                            scope='col'
                            className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                          >
                            Quantity
                          </th>
                          <th
                            scope='col'
                            className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                          >
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className='bg-white divide-y divide-gray-200'>
                        {sale.items.map((item: SalesItem) => (
                          <tr key={item.id}>
                            <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                              {item.name}
                              {item.type && (
                                <span className='ml-2 text-xs text-gray-500'>
                                  ({item.type})
                                </span>
                              )}
                            </td>
                            <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                              {item.sku || 'N/A'}
                            </td>
                            <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                              ${item.price.toFixed(2)}
                            </td>
                            <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                              {item.quantity}
                            </td>
                            <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                              ${(item.price * item.quantity).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes and Communications */}
          <div className='px-4 py-5 sm:px-6 border-t border-gray-200'>
            <h4 className='text-lg font-medium text-gray-900'>
              Notes & Communications
            </h4>
            {sale.notes && (
              <div className='mt-2 p-3 bg-gray-50 rounded text-sm'>
                <p className='font-medium text-gray-700'>Order Notes:</p>
                <p className='mt-1 text-gray-600'>{sale.notes}</p>
              </div>
            )}
            {sale.customization && (
              <div className='mt-2 p-3 bg-yellow-50 rounded text-sm'>
                <p className='font-medium text-gray-700'>
                  Customization Details:
                </p>
                <p className='mt-1 text-gray-600'>{sale.customization}</p>
              </div>
            )}
            {sale.communications && sale.communications.length > 0 ? (
              <div className='mt-4'>
                <p className='font-medium text-gray-700 mb-2'>
                  Communication History:
                </p>
                <div className='space-y-4'>
                  {sale.communications.map((comm) => (
                    <div
                      key={comm.id}
                      className='flex p-3 bg-gray-50 rounded text-sm'
                    >
                      <div className='flex-1'>
                        <p className='text-gray-600'>{comm.content}</p>
                        <div className='mt-1 flex text-xs text-gray-500'>
                          <span>{formatDate(comm.date)}</span>
                          <span className='mx-2'>•</span>
                          <span>{comm.channel}</span>
                          <span className='mx-2'>•</span>
                          <span>{comm.type}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className='mt-2 text-sm text-gray-500'>
                No communications recorded
              </p>
            )}
          </div>
        </div>
      ) : (
        /* Edit Mode */
        <div className='border-t border-gray-200 px-4 py-5 sm:px-6'>
          <p className='text-center text-gray-500'>
            Edit mode will be implemented in the next phase
          </p>
        </div>
      )}
    </div>
  );
};

export default OrderDetail;
