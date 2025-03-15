// src/components/suppliers/SupplierCard.tsx
import { Supplier } from '@/types/supplierTypes';
import React from 'react';

interface SupplierCardProps {
  supplier: Supplier;
  onView: (supplier: Supplier) => void;
  onCreatePurchase: (supplier: Supplier) => void;
}

const SupplierCard: React.FC<SupplierCardProps> = ({
  supplier,
  onView,
  onCreatePurchase,
}) => {
  // Helper function to get color for status tag
  const getStatusColor = (status: string) => {
    if (
      [
        'ACTIVE',
        'PREFERRED',
        'STRATEGIC',
        'PRIMARY',
        'APPROVED',
        'QUALIFIED',
      ].includes(status)
    ) {
      return 'bg-green-100 text-green-800';
    }

    if (
      [
        'SECONDARY',
        'BACKUP',
        'OCCASIONAL',
        'NEW',
        'PROBATIONARY',
        'PENDING',
        'PENDING_APPROVAL',
        'PENDING_REVIEW',
        'UNDER_EVALUATION',
      ].includes(status)
    ) {
      return 'bg-amber-100 text-amber-800';
    }

    if (['INACTIVE', 'SUSPENDED', 'ON_HOLD'].includes(status)) {
      return 'bg-stone-100 text-stone-800';
    }

    if (['BLACKLISTED', 'BANNED', 'DISPUTED', 'TERMINATED'].includes(status)) {
      return 'bg-red-100 text-red-800';
    }

    return 'bg-stone-100 text-stone-800';
  };

  // Helper function to render star rating
  const renderRating = (rating: number) => {
    return (
      <div className='flex items-center'>
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            xmlns='http://www.w3.org/2000/svg'
            className={`h-4 w-4 ${
              star <= rating ? 'text-amber-500' : 'text-stone-300'
            }`}
            viewBox='0 0 20 20'
            fill='currentColor'
          >
            <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
          </svg>
        ))}
      </div>
    );
  };

  // Format text for display (replace underscores with spaces)
  const formatText = (text: string) => {
    return text.replace(/_/g, ' ');
  };

  return (
    <div className='bg-white rounded-lg shadow-sm overflow-hidden border border-stone-200 hover:shadow-md transition-shadow'>
      <div className='p-6 border-b border-stone-100 flex justify-between items-center'>
        <div className='flex items-center'>
          <img
            src={supplier.logo}
            alt={supplier.name}
            className='h-12 w-12 rounded-lg object-cover'
          />
          <div className='ml-4'>
            <h3 className='font-medium text-stone-900'>{supplier.name}</h3>
            <div className='flex items-center mt-1'>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                  supplier.status
                )}`}
              >
                {formatText(supplier.status)}
              </span>
              <span className='mx-2 text-stone-300'>•</span>
              <span className='text-xs text-stone-500'>
                {formatText(supplier.category)}
              </span>
            </div>
          </div>
        </div>
        <div className='flex'>
          <button
            className='text-stone-400 hover:text-amber-600 p-1'
            onClick={() => onView(supplier)}
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
                d='M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z'
              />
            </svg>
          </button>
        </div>
      </div>
      <div className='p-6'>
        <div className='mb-4'>
          <div className='text-sm text-stone-500 mb-1'>Contact</div>
          <div className='text-sm'>
            <div className='font-medium text-stone-700'>
              {supplier.contactName}
            </div>
            <div className='text-stone-600'>{supplier.email}</div>
            <div className='text-stone-600'>{supplier.phone}</div>
          </div>
        </div>

        <div className='mb-4'>
          <div className='text-sm text-stone-500 mb-1'>Materials</div>
          <div className='flex flex-wrap gap-1'>
            {supplier.materialCategories.map((category, index) => (
              <span
                key={index}
                className='px-2 py-1 bg-stone-100 text-stone-700 rounded text-xs'
              >
                {category}
              </span>
            ))}
          </div>
        </div>

        <div className='grid grid-cols-2 gap-4 mb-4'>
          <div>
            <div className='text-sm text-stone-500 mb-1'>Last Order</div>
            <div className='text-sm font-medium text-stone-700'>
              {supplier.lastOrderDate || 'N/A'}
            </div>
          </div>
          <div>
            <div className='text-sm text-stone-500 mb-1'>Rating</div>
            <div>{renderRating(supplier.rating)}</div>
          </div>
          <div>
            <div className='text-sm text-stone-500 mb-1'>Terms</div>
            <div className='text-sm font-medium text-stone-700'>
              {supplier.paymentTerms}
            </div>
          </div>
          <div>
            <div className='text-sm text-stone-500 mb-1'>Lead Time</div>
            <div className='text-sm font-medium text-stone-700'>
              {supplier.leadTime}
            </div>
          </div>
        </div>

        {supplier.notes && (
          <div className='text-xs text-stone-500 italic mb-4'>
            "{supplier.notes}"
          </div>
        )}

        <div className='flex space-x-3'>
          <button
            onClick={() => onCreatePurchase(supplier)}
            className='flex-1 bg-amber-600 hover:bg-amber-700 text-white px-3 py-2 rounded-md text-sm font-medium'
          >
            New Purchase
          </button>
          <button
            onClick={() => onView(supplier)}
            className='flex-1 bg-stone-100 hover:bg-stone-200 text-stone-700 px-3 py-2 rounded-md text-sm font-medium'
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupplierCard;
