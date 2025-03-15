import { useMaterials } from '@/context/MaterialsContext';
import { MaterialType } from '@/types/materialTypes';
import React from 'react';
import ViewToggle from './ViewToggle';

// Import specific filter components
import HardwareFilters from '@/components/materials/hardware/HardwareFilters';
import LeatherFilters from '@/components/materials/leather/LeatherFilters';
import SuppliesFilters from '@/components/materials/supplies/SuppliesFilters';

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
            >
              <option value=''>All Locations</option>
              <option value='Shelf'>Shelves</option>
              <option value='Drawer'>Drawers</option>
              <option value='Bin'>Bins</option>
              <option value='Cabinet'>Cabinets</option>
              <option value='Rack'>Racks</option>
              <option value='Safe'>Safe Storage</option>
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
            >
              <option value=''>All Suppliers</option>
              <option value='Horween Leather'>Horween Leather</option>
              <option value='Wickett & Craig'>Wickett & Craig</option>
              <option value='Sedgwick'>Sedgwick</option>
              <option value='Tandy Leather'>Tandy Leather</option>
              <option value='Rocky Mountain Leather'>
                Rocky Mountain Leather
              </option>
              <option value='Buckle Guy'>Buckle Guy</option>
              <option value='Ohio Travel Bag'>Ohio Travel Bag</option>
              <option value='Wawak'>Wawak</option>
              <option value='Craft & Lore'>Craft & Lore</option>
              <option value="Fiebing's">Fiebing's</option>
              <option value='Vernis Edge'>Vernis Edge</option>
              <option value='Badalassi Carlo'>Badalassi Carlo</option>
              <option value='Quality Leather Supply'>
                Quality Leather Supply
              </option>
              <option value='Craft Supplies Inc.'>Craft Supplies Inc.</option>
              <option value='Hardware Emporium'>Hardware Emporium</option>
              <option value='Fine Leatherworking'>Fine Leatherworking</option>
            </select>
          </div>

          {/* Reset filters button */}
          <button
            onClick={clearFilters}
            className='mt-6 text-sm text-amber-600 hover:text-amber-800 font-medium'
          >
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
