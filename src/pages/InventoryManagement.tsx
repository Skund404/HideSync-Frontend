import React, { useEffect, useState } from 'react';
import InventoryFilters from '../components/inventory/InventoryFilters';
import { InventoryFinancialView } from '../components/inventory/InventoryFinancialView';
import InventoryGridView from '../components/inventory/InventoryGridView';
import InventoryListView from '../components/inventory/InventoryListView';
import InventoryStorageView from '../components/inventory/InventoryStorageView';
import {
  getInventorySummary,
  inventoryProducts,
} from '../services/mock/inventoryProducts';

const InventoryManagement: React.FC = () => {
  // State for view mode
  const [viewMode, setViewMode] = useState<
    'grid' | 'list' | 'storage' | 'financial'
  >('grid');

  // State for filtered products
  const [filteredProducts, setFilteredProducts] = useState(inventoryProducts);

  // State for filters
  const [filters, setFilters] = useState({
    searchQuery: '',
    productType: '',
    status: '',
    storageLocation: '',
    dateRange: {
      from: '',
      to: '',
    },
    priceRange: {
      min: '',
      max: '',
    },
  });

  // State for inventory summary
  const [summary, setSummary] = useState(getInventorySummary());

  // Apply filters when they change
  useEffect(() => {
    let results = inventoryProducts;

    // Apply search query filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      results = results.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.sku.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query)
      );
    }

    // Apply product type filter
    if (filters.productType) {
      results = results.filter(
        (product) => product.productType === filters.productType
      );
    }

    // Apply status filter
    if (filters.status) {
      results = results.filter((product) => product.status === filters.status);
    }

    // Apply storage location filter
    if (filters.storageLocation) {
      results = results.filter((product) =>
        product.storageLocation.includes(filters.storageLocation)
      );
    }

    // Apply date filters if present
    if (filters.dateRange.from) {
      results = results.filter(
        (product) =>
          new Date(product.dateAdded) >= new Date(filters.dateRange.from)
      );
    }

    if (filters.dateRange.to) {
      results = results.filter(
        (product) =>
          new Date(product.dateAdded) <= new Date(filters.dateRange.to)
      );
    }

    // Apply price range filters
    if (filters.priceRange.min) {
      results = results.filter(
        (product) => product.sellingPrice >= parseFloat(filters.priceRange.min)
      );
    }

    if (filters.priceRange.max) {
      results = results.filter(
        (product) => product.sellingPrice <= parseFloat(filters.priceRange.max)
      );
    }

    setFilteredProducts(results);
  }, [filters]);

  return (
    <div>
      {/* Summary Cards */}
      <div className='bg-white border-b border-stone-200 p-4'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          <div className='bg-white shadow-sm rounded-lg p-4 border border-stone-200 flex-1 min-w-[200px]'>
            <div className='flex justify-between'>
              <div>
                <h3 className='text-sm font-medium text-stone-500'>
                  Total Products
                </h3>
                <p className='text-2xl font-bold text-stone-800 mt-1'>
                  {summary.totalProducts}
                </p>
              </div>
              <div className='bg-blue-100 p-3 rounded-md'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-6 w-6 text-blue-600'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z'
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className='bg-white shadow-sm rounded-lg p-4 border border-stone-200 flex-1 min-w-[200px]'>
            <div className='flex justify-between'>
              <div>
                <h3 className='text-sm font-medium text-stone-500'>
                  Needs Reorder
                </h3>
                <p className='text-2xl font-bold text-stone-800 mt-1'>
                  {summary.needsReorder}
                </p>
              </div>
              <div className='bg-amber-100 p-3 rounded-md'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-6 w-6 text-amber-600'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className='bg-white shadow-sm rounded-lg p-4 border border-stone-200 flex-1 min-w-[200px]'>
            <div className='flex justify-between'>
              <div>
                <h3 className='text-sm font-medium text-stone-500'>
                  Total Value
                </h3>
                <p className='text-2xl font-bold text-stone-800 mt-1'>
                  ${summary.totalValue.toFixed(2)}
                </p>
              </div>
              <div className='bg-green-100 p-3 rounded-md'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-6 w-6 text-green-600'
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
              </div>
            </div>
          </div>

          <div className='bg-white shadow-sm rounded-lg p-4 border border-stone-200 flex-1 min-w-[200px]'>
            <div className='flex justify-between'>
              <div>
                <h3 className='text-sm font-medium text-stone-500'>
                  Avg. Profit Margin
                </h3>
                <p className='text-2xl font-bold text-stone-800 mt-1'>
                  {summary.averageMargin.toFixed(1)}%
                </p>
              </div>
              <div className='bg-purple-100 p-3 rounded-md'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-6 w-6 text-purple-600'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and View Toggle */}
      <InventoryFilters
        filters={filters}
        setFilters={setFilters}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {/* Content Area */}
      <div className='p-6'>
        {viewMode === 'grid' && (
          <InventoryGridView products={filteredProducts} />
        )}
        {viewMode === 'list' && (
          <InventoryListView products={filteredProducts} />
        )}
        {viewMode === 'storage' && (
          <InventoryStorageView products={filteredProducts} />
        )}
        {viewMode === 'financial' && (
          <InventoryFinancialView products={filteredProducts} />
        )}
      </div>
    </div>
  );
};

export default InventoryManagement;
