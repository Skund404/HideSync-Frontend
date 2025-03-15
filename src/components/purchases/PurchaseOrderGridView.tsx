// src/components/purchases/PurchaseOrderGridView.tsx
import PurchaseOrderCard from '@/components/purchases/PurchaseOrderCard';
import { PurchaseOrder } from '@/types/purchaseTypes';
import React from 'react';

interface PurchaseOrderGridViewProps {
  orders: PurchaseOrder[];
  onViewOrder: (order: PurchaseOrder) => void;
}

const PurchaseOrderGridView: React.FC<PurchaseOrderGridViewProps> = ({
  orders,
  onViewOrder,
}) => {
  // Validate orders to ensure they have required properties
  const validOrders = orders.filter(
    (order) =>
      order && typeof order.id === 'string' && order.items !== undefined
  );

  if (validOrders.length === 0) {
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
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
      {validOrders.map((order) => (
        <PurchaseOrderCard key={order.id} order={order} onView={onViewOrder} />
      ))}
    </div>
  );
};

export default PurchaseOrderGridView;
