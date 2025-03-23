// src/components/patterns/common/PatternFilter.tsx
import { LayoutGrid, List, Search, X } from 'lucide-react';
import React from 'react';
import { usePatterns } from '../../../hooks/usePatterns';
import { EnumTypes } from '../../../types';
import { PatternFilters } from '../../../types/patternTypes';

interface PatternFilterProps {
  filters: PatternFilters;
  setFilters: (filters: PatternFilters) => void;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
}

const PatternFilter: React.FC<PatternFilterProps> = ({
  filters,
  setFilters,
  viewMode,
  setViewMode,
}) => {
  const { skillLevels, projectTypes } = usePatterns();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({
      ...filters,
      searchQuery: e.target.value,
    });
  };

  const handleSkillLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFilters({
      ...filters,
      skillLevel: value ? (value as EnumTypes.SkillLevel) : undefined,
    });
  };

  const handleProjectTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFilters({
      ...filters,
      projectType: value ? (value as EnumTypes.ProjectType) : undefined,
    });
  };

  const handleClearFilters = () => {
    setFilters({
      searchQuery: '',
      skillLevel: undefined,
      projectType: undefined,
      tags: [],
      favorite: undefined,
    });
  };

  const hasActiveFilters = (): boolean => {
    return !!(
      filters.searchQuery ||
      filters.skillLevel ||
      filters.projectType ||
      (filters.tags && filters.tags.length > 0) ||
      filters.favorite !== undefined
    );
  };

  return (
    <div className='bg-white border-b border-stone-200 p-4'>
      <div className='flex flex-wrap items-center justify-between gap-4'>
        {/* Left side filters */}
        <div className='flex flex-wrap items-center space-x-4'>
          <div>
            <label
              htmlFor='skillLevel'
              className='block text-xs font-medium text-stone-500 mb-1'
            >
              Skill Level
            </label>
            <select
              id='skillLevel'
              value={filters.skillLevel || ''}
              onChange={handleSkillLevelChange}
              className='bg-white border border-stone-300 rounded-md py-1.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 w-36'
            >
              <option value=''>All Levels</option>
              {skillLevels.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor='projectType'
              className='block text-xs font-medium text-stone-500 mb-1'
            >
              Pattern Type
            </label>
            <select
              id='projectType'
              value={filters.projectType || ''}
              onChange={handleProjectTypeChange}
              className='bg-white border border-stone-300 rounded-md py-1.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 w-40'
            >
              <option value=''>All Types</option>
              {projectTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Search box for mobile */}
          <div className='relative md:hidden w-full mt-2'>
            <input
              type='text'
              value={filters.searchQuery || ''}
              onChange={handleSearchChange}
              placeholder='Search patterns...'
              className='w-full bg-stone-100 border border-stone-300 rounded-md py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent'
            />
            <Search className='h-5 w-5 absolute right-3 top-2.5 text-stone-400' />
          </div>

          {/* Clear filters button (only appears when filters are active) */}
          {hasActiveFilters() && (
            <button
              onClick={handleClearFilters}
              className='text-sm text-amber-600 hover:text-amber-800 flex items-center mt-6'
              aria-label='Clear all filters'
            >
              <X className='h-4 w-4 mr-1' />
              Clear Filters
            </button>
          )}
        </div>

        {/* Right side actions */}
        <div className='flex items-center space-x-2'>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              viewMode === 'list'
                ? 'bg-stone-100 text-stone-900'
                : 'bg-white text-stone-600 hover:bg-stone-50'
            }`}
            aria-label='List view'
            aria-pressed={viewMode === 'list'}
          >
            <List className='h-5 w-5' />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              viewMode === 'grid'
                ? 'bg-amber-100 text-amber-900'
                : 'bg-white text-stone-600 hover:bg-stone-50'
            }`}
            aria-label='Grid view'
            aria-pressed={viewMode === 'grid'}
          >
            <LayoutGrid className='h-5 w-5' />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatternFilter;
