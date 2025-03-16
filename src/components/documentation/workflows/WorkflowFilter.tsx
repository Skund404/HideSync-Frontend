// src/components/documentation/workflows/WorkflowFilter.tsx

import { Clock, Filter, Sliders, Users, Video } from 'lucide-react';
import React from 'react';
import { SkillLevel } from '../../../types/documentationTypes';

interface WorkflowFiltersState {
  category: string;
  skillLevel: string;
  duration: string;
  hasVideo: boolean;
}

interface WorkflowFilterProps {
  filters: WorkflowFiltersState;
  onFilterChange: (filters: Partial<WorkflowFiltersState>) => void;
  categories: { id: string; name: string }[];
  onReset: () => void;
}

const WorkflowFilter: React.FC<WorkflowFilterProps> = ({
  filters,
  onFilterChange,
  categories,
  onReset,
}) => {
  // Update individual filter
  const updateFilter = <K extends keyof WorkflowFiltersState>(
    key: K,
    value: WorkflowFiltersState[K]
  ) => {
    onFilterChange({ [key]: value } as Partial<WorkflowFiltersState>);
  };

  return (
    <div className='bg-white p-4 rounded-lg border mb-6'>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='font-medium flex items-center'>
          <Sliders size={18} className='mr-2' />
          Filter Workflows
        </h3>

        <button
          onClick={onReset}
          className='text-sm text-amber-600 hover:text-amber-800'
        >
          Reset Filters
        </button>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        {/* Category filter */}
        <div>
          <label className='flex items-center text-sm font-medium text-gray-700 mb-1'>
            <Filter size={16} className='mr-1' />
            Category
          </label>
          <select
            value={filters.category}
            onChange={(e) => updateFilter('category', e.target.value)}
            className='w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm'
          >
            <option value=''>All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Skill Level filter */}
        <div>
          <label className='flex items-center text-sm font-medium text-gray-700 mb-1'>
            <Users size={16} className='mr-1' />
            Skill Level
          </label>
          <select
            value={filters.skillLevel}
            onChange={(e) => updateFilter('skillLevel', e.target.value)}
            className='w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm'
          >
            <option value=''>All Levels</option>
            <option value={SkillLevel.BEGINNER}>Beginner</option>
            <option value={SkillLevel.INTERMEDIATE}>Intermediate</option>
            <option value={SkillLevel.ADVANCED}>Advanced</option>
          </select>
        </div>

        {/* Duration filter */}
        <div>
          <label className='flex items-center text-sm font-medium text-gray-700 mb-1'>
            <Clock size={16} className='mr-1' />
            Duration
          </label>
          <select
            value={filters.duration}
            onChange={(e) => updateFilter('duration', e.target.value)}
            className='w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm'
          >
            <option value=''>Any Duration</option>
            <option value='short'>Quick (&lt; 30 mins)</option>
            <option value='medium'>Medium (30-60 mins)</option>
            <option value='long'>Long (&gt; 60 mins)</option>
          </select>
        </div>

        {/* Has Video filter */}
        <div className='flex items-end'>
          <label className='flex items-center w-full'>
            <input
              type='checkbox'
              checked={filters.hasVideo}
              onChange={(e) => updateFilter('hasVideo', e.target.checked)}
              className='h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded'
            />
            <span className='ml-2 flex items-center text-sm text-gray-700'>
              <Video size={16} className='mr-1' />
              Includes Video
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default WorkflowFilter;
