// src/components/suppliers/SupplierListView.tsx
import { Supplier } from '@/types/supplierTypes';
import React from 'react';

interface SupplierListViewProps {
  suppliers: Supplier[];
  onViewSupplier: (supplier: Supplier) => void;
  onCreatePurchase: (supplier: Supplier) => void;
}

const SupplierListView: React.FC<SupplierListViewProps> = ({
  suppliers,
  onViewSupplier,
  onCreatePurchase,
}) => {
  // Helper function to format text (replace underscores with spaces)
  const formatText = (text: string) => {
    return text.replace(/_/g, ' ');
  };

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
    <div className='bg-white shadow-sm rounded-lg border border-stone-200 overflow-hidden'>
      <div className='overflow-x-auto'>
        <table className='min-w-full divide-y divide-stone-200'>
          <thead className='bg-stone-50'>
            <tr>
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
                Category
              </th>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
              >
                Contact
              </th>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
              >
                Rating
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
                Last Order
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
            {suppliers.map((supplier) => (
              <tr key={supplier.id} className='hover:bg-stone-50'>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='flex items-center'>
                    <div className='h-10 w-10 flex-shrink-0'>
                      <img
                        className='h-10 w-10 rounded-md object-cover'
                        src={supplier.logo}
                        alt={supplier.name}
                      />
                    </div>
                    <div className='ml-4'>
                      <div className='text-sm font-medium text-stone-900'>
                        {supplier.name}
                      </div>
                      <div className='text-xs text-stone-500'>
                        {supplier.materialCategories.join(', ')}
                      </div>
                    </div>
                  </div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='text-sm text-stone-900'>
                    {formatText(supplier.category)}
                  </div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='text-sm text-stone-900'>
                    {supplier.contactName}
                  </div>
                  <div className='text-xs text-stone-500'>{supplier.email}</div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  {renderRating(supplier.rating)}
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${getStatusColor(
                      supplier.status
                    )}`}
                  >
                    {formatText(supplier.status)}
                  </span>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='text-sm text-stone-900'>
                    {supplier.lastOrderDate || 'N/A'}
                  </div>
                  <div className='text-xs text-stone-500'>
                    {supplier.paymentTerms}
                  </div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-stone-500'>
                  <div className='flex space-x-2'>
                    <button
                      onClick={() => onViewSupplier(supplier)}
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
                      title='Create Purchase Order'
                      onClick={() => onCreatePurchase(supplier)}
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
                          d='M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z'
                        />
                      </svg>
                    </button>
                    <button
                      className='text-stone-600 hover:text-stone-900'
                      title='Edit Supplier'
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

export default SupplierListView;
