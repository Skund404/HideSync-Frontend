// src/components/dashboard/SupplierActivityWidget.tsx
import { useSupplierMetrics } from '@/hooks/useSupplierMetrics';
import React from 'react';

const SupplierActivityWidget: React.FC = () => {
  const metrics = useSupplierMetrics();

  // Local currency formatter
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className='bg-white rounded-lg shadow-sm p-4 border border-stone-200'>
      <h3 className='font-medium text-lg text-stone-800 mb-4'>Top Suppliers</h3>

      {metrics.topSuppliersByAmount.length > 0 ? (
        <div className='space-y-4'>
          {metrics.topSuppliersByAmount.map((supplier) => (
            <div
              key={supplier.id}
              className='flex items-center justify-between'
            >
              <div className='flex items-center'>
                <div className='w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-800 mr-3'>
                  {supplier.name.charAt(0)}
                </div>
                <div>
                  <div className='font-medium text-stone-800'>
                    {supplier.name}
                  </div>
                  <div className='text-xs text-stone-500'>
                    {supplier.purchaseCount} orders
                  </div>
                </div>
              </div>
              <div className='text-right'>
                <div className='font-medium text-stone-800'>
                  {formatCurrency(supplier.totalAmount)}
                </div>
                <div className='text-xs text-stone-500'>
                  Avg: {formatCurrency(supplier.averageAmount)}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className='p-4 text-center text-stone-500'>
          No supplier activity to display
        </div>
      )}

      <div className='mt-4 pt-4 border-t border-stone-100'>
        <div className='flex justify-between text-sm'>
          <div className='text-stone-500'>Suppliers with no orders (90d)</div>
          <div className='font-medium text-stone-700'>
            {metrics.suppliersWithNoRecentPurchases}
          </div>
        </div>
      </div>

      <div className='mt-4'>
        <a
          href='/suppliers'
          className='text-sm text-amber-600 hover:text-amber-800 font-medium flex items-center'
        >
          View All Suppliers
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-4 w-4 ml-1'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M9 5l7 7-7 7'
            />
          </svg>
        </a>
      </div>
    </div>
  );
};

export default SupplierActivityWidget;
