// src/components/sales/OrderList.tsx
import React, { useEffect, useState } from 'react';
import { useSales } from '../../context/SalesContext';
import { FulfillmentStatus, Sale, SalesFilters } from '../../types/salesTypes';
import { formatDate } from '../../utils/formatter';
import LoadingSpinner from '../common/LoadingSpinner';

interface OrderListProps {
  tab: 'pending' | 'processing' | 'shipped' | 'all';
  filters: SalesFilters;
  onFilterChange: (filters: SalesFilters) => void;
  onOrderSelect?: (orderId: number) => void;
  onViewOrder?: (orderId: number) => void;
}

const OrderList: React.FC<OrderListProps> = ({
  tab,
  filters,
  onFilterChange,
  onOrderSelect,
  onViewOrder,
}) => {
  const { sales, loading, error, filterSalesList } = useSales();
  const [filteredSales, setFilteredSales] = useState<Sale[]>([]);

  // Update tab-specific filters
  useEffect(() => {
    let updatedFilters = { ...filters };

    switch (tab) {
      case 'pending':
        updatedFilters.fulfillmentStatus = FulfillmentStatus.PENDING;
        break;
      case 'processing':
        updatedFilters.fulfillmentStatus = FulfillmentStatus.PICKING;
        break;
      case 'shipped':
        updatedFilters.fulfillmentStatus = FulfillmentStatus.SHIPPED;
        break;
      // 'all' tab has no specific fulfillment status filter
      case 'all':
        if ('fulfillmentStatus' in updatedFilters) {
          delete updatedFilters.fulfillmentStatus;
        }
        break;
    }

    onFilterChange(updatedFilters);
  }, [tab, onFilterChange, filters]);

  // Update filtered sales when filters change
  useEffect(() => {
    // This includes our previously set filters like fulfillmentStatus
    const includeCompleted = tab === 'all' || tab === 'shipped';
    const filtered = filterSalesList(filters, includeCompleted);
    setFilteredSales(filtered);
  }, [filters, sales, tab, filterSalesList]);

  const getStatusBadgeClasses = (status: string): string => {
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

  const handleViewOrderClick = (orderId: number) => {
    // Call the provided callbacks
    if (onViewOrder) {
      onViewOrder(orderId);
    }
    if (onOrderSelect) {
      onOrderSelect(orderId);
    }
  };

  if (loading) {
    return (
      <div className='p-6 flex justify-center'>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className='p-6 text-red-500'>Error loading orders: {error}</div>
    );
  }

  return (
    <div className='p-4'>
      {/* Order Count */}
      <div className='mb-4 text-sm text-gray-600'>
        Showing {filteredSales.length} orders
      </div>

      {/* Orders Table */}
      {filteredSales.length > 0 ? (
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                >
                  Order ID
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                >
                  Customer
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                >
                  Date
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                >
                  Status
                </th>
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
                  Total
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {filteredSales.map((sale) => (
                <tr key={sale.id} className='hover:bg-gray-50'>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                    #{sale.id}
                    {sale.marketplaceData && (
                      <span className='block text-xs text-gray-500'>
                        Ext: {sale.marketplaceData.externalOrderId}
                      </span>
                    )}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {sale.customer.name}
                    <span className='block text-xs'>{sale.customer.email}</span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {formatDate(sale.createdAt)}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClasses(
                        sale.fulfillmentStatus
                      )}`}
                    >
                      {sale.fulfillmentStatus}
                    </span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {sale.channel}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium'>
                    ${sale.totalAmount.toFixed(2)}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                    <button
                      onClick={() => handleViewOrderClick(sale.id)}
                      className='text-amber-600 hover:text-amber-900'
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className='py-10 text-center'>
          <svg
            className='mx-auto h-12 w-12 text-gray-400'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={1}
              d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
            />
          </svg>
          <h3 className='mt-2 text-sm font-medium text-gray-900'>
            No orders found
          </h3>
          <p className='mt-1 text-sm text-gray-500'>
            {tab === 'all'
              ? 'No orders match your filter criteria.'
              : `No ${tab} orders found.`}
          </p>
        </div>
      )}
    </div>
  );
};

export default OrderList;
