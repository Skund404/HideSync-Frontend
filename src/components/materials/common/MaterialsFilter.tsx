// src/components/materials/common/MaterialsFilter.tsx
import { useMaterials } from '../../../context/MaterialsContext';
import { MaterialType } from '../../../types/materialTypes';
import React from 'react';
import ViewToggle from './ViewToggle';
import { Filter } from 'lucide-react';

// Import specific filter components
import HardwareFilters from '../hardware/HardwareFilters';
import LeatherFilters from '../leather/LeatherFilters';
import SuppliesFilters from '../supplies/SuppliesFilters';

const MaterialsFilter: React.FC = () => {
  const {
    activeTab,
    filterStatus,
    setFilterStatus,
    filterStorage,
    setFilterStorage,
    filterSupplier,
    setFilterSupplier,
    clearFilters,
    storageLocations,
    suppliers,
    loading
  } = useMaterials();

  // Render specific filter component based on active tab
  const renderSpecificFilters = () => {
    switch (activeTab) {
      case MaterialType.LEATHER:
        return <LeatherFilters />;
      case MaterialType.HARDWARE:
        return <HardwareFilters />;
      case MaterialType.SUPPLIES:
        return <SuppliesFilters />;
      default:
        return null; // No specific filters for "all" tab
    }
  };

  return (
    <div className='bg-white border-b border-stone-200 p-4'>
      <div className='flex flex-wrap items-center justify-between gap-4'>
        <div className='flex flex-wrap items-center space-x-4'>
          {/* Specific filters for each tab */}
          {renderSpecificFilters()}

          {/* Common filters for all material types */}
          <div>
            <label
              htmlFor='status'
              className='block text-xs font-medium text-stone-500 mb-1'
            >
              Status
            </label>
            <select
              id='status'
              value={filterStatus || ''}
              onChange={(e) => setFilterStatus(e.target.value || null)}
              className='bg-white border border-stone-300 rounded-md py-1.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500'
            >
              <option value=''>All Statuses</option>
              <option value='IN_STOCK'>In Stock</option>
              <option value='LOW_STOCK'>Low Stock</option>
              <option value='OUT_OF_STOCK'>Out of Stock</option>
              <option value='ON_ORDER'>On Order</option>
              <option value='DISCONTINUED'>Discontinued</option>
            </select>
          </div>

          <div>
            <label
              htmlFor='storage'
              className='block text-xs font-medium text-stone-500 mb-1'
            >
              Storage Location
            </label>
            <select
              id='storage'
              value={filterStorage || ''}
              onChange={(e) => setFilterStorage(e.target.value || null)}
              className='bg-white border border-stone-300 rounded-md py-1.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500'
              disabled={loading}
            >
              <option value=''>All Locations</option>
              {storageLocations.map(location => (
                <option key={location.id} value={location.id.toString()}>
                  {location.name || `${location.type} ${location.id}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor='supplier'
              className='block text-xs font-medium text-stone-500 mb-1'
            >
              Supplier
            </label>
            <select
              id='supplier'
              value={filterSupplier || ''}
              onChange={(e) => setFilterSupplier(e.target.value || null)}
              className='bg-white border border-stone-300 rounded-md py-1.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500'
              disabled={loading}
            >
              <option value=''>All Suppliers</option>
              {suppliers.map(supplier => (
                <option key={supplier.id} value={supplier.id.toString()}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>

          {/* Reset filters button */}
          <button
            onClick={clearFilters}
            className='mt-6 text-sm text-amber-600 hover:text-amber-800 font-medium flex items-center'
          >
            <Filter className="w-4 h-4 mr-1" />
            Reset Filters
          </button>
        </div>

        {/* View toggle */}
        <ViewToggle />
      </div>
    </div>
  );
};

export default MaterialsFilter;