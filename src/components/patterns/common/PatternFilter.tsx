// src/components/patterns/common/PatternFilter.tsx
import React from 'react';
import { usePatterns } from '../../../hooks/usePatterns';
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
    setFilters({
      ...filters,
      skillLevel: e.target.value,
    });
  };

  const handleProjectTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({
      ...filters,
      projectType: e.target.value,
    });
  };

  const handleClearFilters = () => {
    setFilters({
      searchQuery: '',
      skillLevel: '',
      projectType: '',
      tags: [],
    });
  };

  const hasActiveFilters = (): boolean => {
    return !!(
      filters.searchQuery ||
      filters.skillLevel ||
      filters.projectType ||
      (filters.tags && filters.tags.length > 0)
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
              value={filters.skillLevel}
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
              value={filters.projectType}
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
              value={filters.searchQuery}
              onChange={handleSearchChange}
              placeholder='Search patterns...'
              className='w-full bg-stone-100 border border-stone-300 rounded-md py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent'
            />
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-5 w-5 absolute right-3 top-2.5 text-stone-400'
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

          {/* Clear filters button (only appears when filters are active) */}
          {hasActiveFilters() && (
            <button
              onClick={handleClearFilters}
              className='text-sm text-amber-600 hover:text-amber-800 flex items-center mt-6'
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
            onClick={() => setViewMode('grid')}
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              viewMode === 'grid'
                ? 'bg-amber-100 text-amber-900'
                : 'bg-white text-stone-600 hover:bg-stone-50'
            }`}
            aria-label='Grid view'
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
        </div>
      </div>
    </div>
  );
};

export default PatternFilter;
