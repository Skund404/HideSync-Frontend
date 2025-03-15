import React from 'react';
import { ProjectType } from '../../types/enums';

interface InventoryFiltersProps {
  filters: {
    searchQuery: string;
    productType: string;
    status: string;
    storageLocation: string;
    dateRange: {
      from: string;
      to: string;
    };
    priceRange: {
      min: string;
      max: string;
    };
  };
  setFilters: React.Dispatch<React.SetStateAction<any>>;
  viewMode: 'grid' | 'list' | 'storage' | 'financial';
  setViewMode: React.Dispatch<
    React.SetStateAction<'grid' | 'list' | 'storage' | 'financial'>
  >;
}

const InventoryFilters: React.FC<InventoryFiltersProps> = ({
  filters,
  setFilters,
  viewMode,
  setViewMode,
}) => {
  return (
    <div className='bg-white border-b border-stone-200 p-4'>
      <div className='flex flex-wrap items-center justify-between gap-4'>
        <div className='flex flex-wrap items-center space-x-4'>
          {/* Product Type Filter */}
          <div>
            <label
              htmlFor='productType'
              className='block text-xs font-medium text-stone-500 mb-1'
            >
              Product Type
            </label>
            <select
              id='productType'
              value={filters.productType}
              onChange={(e) =>
                setFilters({ ...filters, productType: e.target.value })
              }
              className='bg-white border border-stone-300 rounded-md py-1.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500'
            >
              <option value=''>All Types</option>
              <option value={ProjectType.WALLET}>Wallet</option>
              <option value={ProjectType.BELT}>Belt</option>
              <option value={ProjectType.BAG}>Bag</option>
              <option value={ProjectType.ACCESSORY}>Accessory</option>
              <option value={ProjectType.CASE}>Case</option>
              <option value={ProjectType.CUSTOM}>Custom</option>
              <option value={ProjectType.OTHER}>Other</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label
              htmlFor='status'
              className='block text-xs font-medium text-stone-500 mb-1'
            >
              Status
            </label>
            <select
              id='status'
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className='bg-white border border-stone-300 rounded-md py-1.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500'
            >
              <option value=''>All Statuses</option>
              <option value='IN_STOCK'>In Stock</option>
              <option value='LOW_STOCK'>Low Stock</option>
              <option value='OUT_OF_STOCK'>Out of Stock</option>
            </select>
          </div>

          {/* Storage Location Filter */}
          <div>
            <label
              htmlFor='storageLocation'
              className='block text-xs font-medium text-stone-500 mb-1'
            >
              Storage Location
            </label>
            <select
              id='storageLocation'
              value={filters.storageLocation}
              onChange={(e) =>
                setFilters({ ...filters, storageLocation: e.target.value })
              }
              className='bg-white border border-stone-300 rounded-md py-1.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500'
            >
              <option value=''>All Locations</option>
              <option value='Cabinet'>Cabinets</option>
              <option value='Drawer'>Drawers</option>
              <option value='Shelf'>Shelves</option>
              <option value='Rack'>Racks</option>
            </select>
          </div>

          {/* Price Range Filter */}
          <div className='flex items-center space-x-2'>
            <div>
              <label
                htmlFor='minPrice'
                className='block text-xs font-medium text-stone-500 mb-1'
              >
                Min Price ($)
              </label>
              <input
                type='number'
                id='minPrice'
                value={filters.priceRange.min}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    priceRange: { ...filters.priceRange, min: e.target.value },
                  })
                }
                className='bg-white border border-stone-300 rounded-md py-1.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 w-24'
              />
            </div>
            <div>
              <label
                htmlFor='maxPrice'
                className='block text-xs font-medium text-stone-500 mb-1'
              >
                Max Price ($)
              </label>
              <input
                type='number'
                id='maxPrice'
                value={filters.priceRange.max}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    priceRange: { ...filters.priceRange, max: e.target.value },
                  })
                }
                className='bg-white border border-stone-300 rounded-md py-1.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 w-24'
              />
            </div>
          </div>

          {/* Date Range Filter */}
          <div className='flex items-center space-x-2'>
            <div>
              <label
                htmlFor='dateFrom'
                className='block text-xs font-medium text-stone-500 mb-1'
              >
                Date From
              </label>
              <input
                type='date'
                id='dateFrom'
                value={filters.dateRange.from}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    dateRange: { ...filters.dateRange, from: e.target.value },
                  })
                }
                className='bg-white border border-stone-300 rounded-md py-1.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500'
              />
            </div>
            <div>
              <label
                htmlFor='dateTo'
                className='block text-xs font-medium text-stone-500 mb-1'
              >
                Date To
              </label>
              <input
                type='date'
                id='dateTo'
                value={filters.dateRange.to}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    dateRange: { ...filters.dateRange, to: e.target.value },
                  })
                }
                className='bg-white border border-stone-300 rounded-md py-1.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500'
              />
            </div>
          </div>
        </div>

        {/* Reset Filters Button */}
        <button
          onClick={() =>
            setFilters({
              searchQuery: '',
              productType: '',
              status: '',
              storageLocation: '',
              dateRange: { from: '', to: '' },
              priceRange: { min: '', max: '' },
            })
          }
          className='px-3 py-2 border border-stone-300 rounded-md text-sm font-medium text-stone-600 hover:bg-stone-50'
        >
          Reset Filters
        </button>

        {/* View Mode Toggles */}
        <div className='flex items-center space-x-2'>
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              viewMode === 'grid'
                ? 'bg-amber-100 text-amber-900'
                : 'bg-white text-stone-600 hover:bg-stone-50'
            }`}
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
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              viewMode === 'list'
                ? 'bg-stone-100 text-stone-900'
                : 'bg-white text-stone-600 hover:bg-stone-50'
            }`}
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
          <button
            onClick={() => setViewMode('storage')}
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              viewMode === 'storage'
                ? 'bg-amber-100 text-amber-900'
                : 'bg-white text-stone-600 hover:bg-stone-50'
            }`}
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
                d='M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4'
              />
            </svg>
          </button>
          <button
            onClick={() => setViewMode('financial')}
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              viewMode === 'financial'
                ? 'bg-amber-100 text-amber-900'
                : 'bg-white text-stone-600 hover:bg-stone-50'
            }`}
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
                d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default InventoryFilters;
