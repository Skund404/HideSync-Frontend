// src/components/purchases/PurchaseOrderFilterBar.tsx
import { useSuppliers } from '@/context/SupplierContext';
import { PurchaseOrderFilters } from '@/types/purchaseTypes';
import React from 'react';

interface PurchaseOrderFilterBarProps {
  filters: PurchaseOrderFilters;
  setFilters: React.Dispatch<React.SetStateAction<PurchaseOrderFilters>>;
  viewMode: 'list' | 'grid';
  setViewMode: React.Dispatch<React.SetStateAction<'list' | 'grid'>>;
  onCreateOrder: () => void;
}

const PurchaseOrderFilterBar: React.FC<PurchaseOrderFilterBarProps> = ({
  filters,
  setFilters,
  viewMode,
  setViewMode,
  onCreateOrder,
}) => {
  const { suppliers } = useSuppliers();

  // Handle input changes for filters
  const handleFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    if (name === 'dateStart' || name === 'dateEnd') {
      setFilters((prev) => ({
        ...prev,
        dateRange: {
          ...prev.dateRange,
          [name === 'dateStart' ? 'start' : 'end']: value,
        },
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setFilters({
      supplier: '',
      status: '',
      dateRange: {},
      searchQuery: '',
    });
  };

  return (
    <div className='bg-white p-4 rounded-lg border border-stone-200 shadow-sm mb-6'>
      <div className='flex flex-col md:flex-row items-start md:items-center justify-between mb-4'>
        <h2 className='text-lg font-medium text-stone-900 mb-2 md:mb-0'>
          Purchase Orders
        </h2>

        {/* Search Bar */}
        <div className='w-full md:w-64 relative'>
          <input
            type='text'
            name='searchQuery'
            placeholder='Search purchase orders...'
            value={filters.searchQuery}
            onChange={handleFilterChange}
            className='w-full pl-10 pr-4 py-2 border border-stone-300 rounded-md focus:ring-amber-500 focus:border-amber-500 text-sm'
          />
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-5 w-5 text-stone-400 absolute left-3 top-2.5'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
            />
          </svg>
        </div>
      </div>

      <div className='flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 items-start sm:items-center justify-between'>
        <div className='flex flex-wrap items-center gap-3'>
          {/* Supplier Filter */}
          <div>
            <select
              name='supplier'
              value={filters.supplier}
              onChange={handleFilterChange}
              className='border border-stone-300 rounded-md p-2 pr-8 text-sm focus:ring-amber-500 focus:border-amber-500'
            >
              <option value=''>All Suppliers</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id.toString()}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              name='status'
              value={filters.status}
              onChange={handleFilterChange}
              className='border border-stone-300 rounded-md p-2 pr-8 text-sm focus:ring-amber-500 focus:border-amber-500'
            >
              <option value=''>All Statuses</option>
              <option value='PLANNING'>Planning</option>
              <option value='PENDING_APPROVAL'>Pending Approval</option>
              <option value='APPROVED'>Approved</option>
              <option value='PROCESSING'>Processing</option>
              <option value='SHIPPED'>Shipped</option>
              <option value='IN_TRANSIT'>In Transit</option>
              <option value='DELIVERED'>Delivered</option>
              <option value='CANCELLED'>Cancelled</option>
            </select>
          </div>

          {/* Date Range Filter */}
          <div className='flex gap-2 items-center'>
            <input
              type='date'
              name='dateStart'
              value={filters.dateRange.start || ''}
              onChange={handleFilterChange}
              className='border border-stone-300 rounded-md p-2 text-sm focus:ring-amber-500 focus:border-amber-500'
              placeholder='From'
            />
            <span className='text-stone-500'>to</span>
            <input
              type='date'
              name='dateEnd'
              value={filters.dateRange.end || ''}
              onChange={handleFilterChange}
              className='border border-stone-300 rounded-md p-2 text-sm focus:ring-amber-500 focus:border-amber-500'
              placeholder='To'
            />
          </div>

          {/* Reset Filters */}
          <button
            onClick={handleResetFilters}
            className='text-amber-600 hover:text-amber-800 text-sm font-medium flex items-center'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-4 w-4 mr-1'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
            Reset Filters
          </button>
        </div>

        <div className='flex items-center space-x-3'>
          {/* View Mode Toggle */}
          <div className='flex items-center space-x-1 bg-stone-100 rounded-md p-1'>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md ${
                viewMode === 'grid'
                  ? 'bg-white shadow-sm'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
              title='Grid View'
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
                  d='M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z'
                />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md ${
                viewMode === 'list'
                  ? 'bg-white shadow-sm'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
              title='List View'
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
                  d='M4 6h16M4 10h16M4 14h16M4 18h16'
                />
              </svg>
            </button>
          </div>

          {/* Create Purchase Order Button */}
          <button
            onClick={onCreateOrder}
            className='bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center'
          >
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
            Create Purchase Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrderFilterBar;
