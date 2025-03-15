// src/components/suppliers/SupplierGridView.tsx
import { Supplier } from '@/types/supplierTypes';
import React from 'react';
import SupplierCard from './SupplierCard';

interface SupplierGridViewProps {
  suppliers: Supplier[];
  onViewSupplier: (supplier: Supplier) => void;
  onCreatePurchase: (supplier: Supplier) => void;
}

const SupplierGridView: React.FC<SupplierGridViewProps> = ({
  suppliers,
  onViewSupplier,
  onCreatePurchase,
}) => {
  if (suppliers.length === 0) {
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
                d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
              />
            </svg>
          </div>
          <h3 className='text-lg font-medium text-stone-700 mb-2'>
            No Suppliers Found
          </h3>
          <p className='text-stone-500 max-w-md mb-6'>
            Try adjusting your filters or add new suppliers to your directory.
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
            Add New Supplier
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
      {suppliers.map((supplier) => (
        <SupplierCard
          key={supplier.id}
          supplier={supplier}
          onView={onViewSupplier}
          onCreatePurchase={onCreatePurchase}
        />
      ))}
    </div>
  );
};

export default SupplierGridView;
