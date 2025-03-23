// src/components/patterns/PatternGrid.tsx
import React from 'react';
import { Pattern } from '../../types/patternTypes';
import PatternCard from './common/PatternCard';

interface PatternGridProps {
  patterns: Pattern[];
  onPatternClick?: (pattern: Pattern) => void;
  isLoading?: boolean;
}

const PatternGrid: React.FC<PatternGridProps> = ({
  patterns,
  onPatternClick,
  isLoading = false,
}) => {
  if (patterns.length === 0 && !isLoading) {
    return (
      <div className='bg-white shadow-sm rounded-lg p-6 border border-stone-200 text-center'>
        <div className='flex flex-col items-center justify-center py-12'>
          <div className='bg-amber-100 p-4 rounded-full mb-4'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-10 w-10 text-amber-600'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01'
              />
            </svg>
          </div>
          <h3 className='text-lg font-medium text-stone-700 mb-2'>
            No Patterns Found
          </h3>
          <p className='text-stone-500 max-w-md mb-6'>
            Try adjusting your filters or create a new pattern.
          </p>
          <button 
            className='bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center'
            onClick={() => window.location.href = '/patterns/new'}
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
            Create New Pattern
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
      {patterns.map((pattern) => (
        <PatternCard
          key={pattern.id}
          pattern={pattern}
          onClick={onPatternClick}
          isLoading={isLoading}
        />
      ))}
      
      {/* Add skeleton placeholders when loading more patterns */}
      {isLoading && patterns.length > 0 && (
        Array(3).fill(0).map((_, index) => (
          <div 
            key={`skeleton-${index}`}
            className='bg-white rounded-lg shadow-sm overflow-hidden border border-stone-200 animate-pulse'
          >
            <div className='h-40 bg-stone-200'></div>
            <div className='p-4'>
              <div className='h-6 bg-stone-200 rounded mb-2 w-3/4'></div>
              <div className='h-4 bg-stone-200 rounded mb-3 w-full'></div>
              <div className='h-4 bg-stone-200 rounded mb-3 w-5/6'></div>
              <div className='mb-3 flex flex-wrap gap-1'>
                {[1, 2, 3].map(i => (
                  <div key={i} className='h-6 w-16 bg-stone-200 rounded-md'></div>
                ))}
              </div>
              <div className='grid grid-cols-2 gap-2 mb-3'>
                <div className='h-4 bg-stone-200 rounded'></div>
                <div className='h-4 bg-stone-200 rounded'></div>
                <div className='h-4 bg-stone-200 rounded'></div>
                <div className='h-4 bg-stone-200 rounded'></div>
              </div>
              <div className='border-t border-stone-100 pt-3'>
                <div className='h-4 bg-stone-200 rounded w-28'></div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default PatternGrid;