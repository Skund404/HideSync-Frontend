// src/components/inventory/InventoryFilters.tsx
import React from 'react';
import { ProjectType, InventoryStatus } from '@/types/enums';
import { InventoryFilters as FiltersType } from '@/types/models';
import { Search, LayoutGrid, List, Package, DollarSign } from 'lucide-react';

interface InventoryFiltersProps {
  filters: FiltersType;
  setFilters: React.Dispatch<React.SetStateAction<FiltersType>>;
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
  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, searchQuery: e.target.value });
  };

  // Reset all filters
  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      productType: '',
      status: '',
      storageLocation: '',
      dateRange: { from: '', to: '' },
      priceRange: { min: '', max: '' },
    });
  };

  return (
    <div className='bg-white border-b border-stone-200 p-4'>
      <div className='flex flex-col space-y-4'>
        {/* Search Bar */}
        <div className='w-full'>
          <div className='relative'>
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <Search className='h-5 w-5 text-stone-400' />
            </div>
            <input
              type='text'
              value={filters.searchQuery}
              onChange={handleSearchChange}
              placeholder='Search products by name, SKU, or description...'
              className='block w-full pl-10 pr-3 py-2 border border-stone-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent'
            />
          </div>
        </div>

        {/* Filters and View Toggle */}
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
                <option value={InventoryStatus.IN_STOCK}>In Stock</option>
                <option value={InventoryStatus.LOW_STOCK}>Low Stock</option>
                <option value={InventoryStatus.OUT_OF_STOCK}>Out of Stock</option>
                <option value={InventoryStatus.ON_ORDER}>On Order</option>
                <option value={InventoryStatus.RESERVED}>Reserved</option>
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
                <option value='cabinet'>Cabinets</option>
                <option value='drawer'>Drawers</option>
                <option value='shelf'>Shelves</option>
                <option value='rack'>Racks</option>
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
            onClick={handleResetFilters}
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
              title="Grid View"
            >
              <LayoutGrid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                viewMode === 'list'
                  ? 'bg-stone-100 text-stone-900'
                  : 'bg-white text-stone-600 hover:bg-stone-50'
              }`}
              title="List View"
            >
              <List className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('storage')}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                viewMode === 'storage'
                  ? 'bg-amber-100 text-amber-900'
                  : 'bg-white text-stone-600 hover:bg-stone-50'
              }`}
              title="Storage View"
            >
              <Package className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('financial')}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                viewMode === 'financial'
                  ? 'bg-amber-100 text-amber-900'
                  : 'bg-white text-stone-600 hover:bg-stone-50'
              }`}
              title="Financial View"
            >
              <DollarSign className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryFilters;