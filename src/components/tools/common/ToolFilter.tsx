// src/components/tools/common/ToolFilter.tsx
//
// A filter component for the Tool Management module that allows filtering
// by various tool properties such as category, status, and maintenance status.

import { ToolCategory, ToolStatus } from '@/types/toolType';
import { Filter, X } from 'lucide-react';
import React from 'react';

interface FilterState {
  category?: ToolCategory;
  status?: ToolStatus;
  maintenanceStatus?: 'upcoming' | 'overdue' | 'current';
  searchTerm?: string;
}

interface ToolFilterProps {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
}

const ToolFilter: React.FC<ToolFilterProps> = ({ filters, setFilters }) => {
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as ToolCategory | '';
    setFilters({
      ...filters,
      category: value === '' ? undefined : (value as ToolCategory),
    });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as ToolStatus | '';
    setFilters({
      ...filters,
      status: value === '' ? undefined : (value as ToolStatus),
    });
  };

  const handleMaintenanceStatusChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = e.target.value as 'upcoming' | 'overdue' | 'current' | '';
    setFilters({
      ...filters,
      maintenanceStatus:
        value === ''
          ? undefined
          : (value as 'upcoming' | 'overdue' | 'current'),
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({
      ...filters,
      searchTerm: e.target.value === '' ? undefined : e.target.value,
    });
  };

  const clearFilters = () => {
    setFilters({});
  };

  const hasActiveFilters =
    filters.category !== undefined ||
    filters.status !== undefined ||
    filters.maintenanceStatus !== undefined ||
    (filters.searchTerm !== undefined && filters.searchTerm.length > 0);

  return (
    <div className='bg-white p-4 rounded-lg border border-stone-200 shadow-sm mb-6'>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='font-medium text-stone-800 flex items-center'>
          <Filter className='h-4 w-4 mr-2' />
          Filter Tools
        </h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className='text-xs text-stone-500 hover:text-stone-700 flex items-center'
          >
            Clear All Filters
            <X className='h-3 w-3 ml-1' />
          </button>
        )}
      </div>

      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        {/* Search Input */}
        <div>
          <label className='block text-sm font-medium text-stone-700 mb-1'>
            Search
          </label>
          <input
            type='text'
            placeholder='Search by name, brand...'
            className='w-full rounded-md border border-stone-300 py-2 px-3 text-sm'
            value={filters.searchTerm || ''}
            onChange={handleSearchChange}
          />
        </div>

        {/* Category Filter */}
        <div>
          <label className='block text-sm font-medium text-stone-700 mb-1'>
            Category
          </label>
          <select
            className='w-full rounded-md border border-stone-300 py-2 px-3 text-sm'
            value={filters.category || ''}
            onChange={handleCategoryChange}
          >
            <option value=''>All Categories</option>
            {Object.values(ToolCategory).map((category) => (
              <option key={category} value={category}>
                {category.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className='block text-sm font-medium text-stone-700 mb-1'>
            Status
          </label>
          <select
            className='w-full rounded-md border border-stone-300 py-2 px-3 text-sm'
            value={filters.status || ''}
            onChange={handleStatusChange}
          >
            <option value=''>All Statuses</option>
            {Object.values(ToolStatus).map((status) => (
              <option key={status} value={status}>
                {status.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>

        {/* Maintenance Status Filter */}
        <div>
          <label className='block text-sm font-medium text-stone-700 mb-1'>
            Maintenance
          </label>
          <select
            className='w-full rounded-md border border-stone-300 py-2 px-3 text-sm'
            value={filters.maintenanceStatus || ''}
            onChange={handleMaintenanceStatusChange}
          >
            <option value=''>All</option>
            <option value='current'>Current</option>
            <option value='upcoming'>Upcoming</option>
            <option value='overdue'>Overdue</option>
          </select>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className='mt-4 flex flex-wrap gap-2'>
          {filters.category && (
            <div className='bg-stone-100 text-stone-800 px-2 py-1 rounded-full text-xs flex items-center'>
              Category: {filters.category.replace('_', ' ')}
              <button
                onClick={() => setFilters({ ...filters, category: undefined })}
                className='ml-1 text-stone-500 hover:text-stone-700'
              >
                <X className='h-3 w-3' />
              </button>
            </div>
          )}

          {filters.status && (
            <div className='bg-stone-100 text-stone-800 px-2 py-1 rounded-full text-xs flex items-center'>
              Status: {filters.status.replace('_', ' ')}
              <button
                onClick={() => setFilters({ ...filters, status: undefined })}
                className='ml-1 text-stone-500 hover:text-stone-700'
              >
                <X className='h-3 w-3' />
              </button>
            </div>
          )}

          {filters.maintenanceStatus && (
            <div className='bg-stone-100 text-stone-800 px-2 py-1 rounded-full text-xs flex items-center'>
              Maintenance: {filters.maintenanceStatus}
              <button
                onClick={() =>
                  setFilters({ ...filters, maintenanceStatus: undefined })
                }
                className='ml-1 text-stone-500 hover:text-stone-700'
              >
                <X className='h-3 w-3' />
              </button>
            </div>
          )}

          {filters.searchTerm && (
            <div className='bg-stone-100 text-stone-800 px-2 py-1 rounded-full text-xs flex items-center'>
              Search: {filters.searchTerm}
              <button
                onClick={() =>
                  setFilters({ ...filters, searchTerm: undefined })
                }
                className='ml-1 text-stone-500 hover:text-stone-700'
              >
                <X className='h-3 w-3' />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ToolFilter;
