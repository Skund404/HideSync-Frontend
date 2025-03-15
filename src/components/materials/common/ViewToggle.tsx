import { useMaterials } from '@/context/MaterialsContext';
import { MaterialType } from '@/types/materialTypes';
import React from 'react';

const ViewToggle: React.FC = () => {
  const { viewMode, setViewMode, activeTab } = useMaterials();

  // Get color based on active tab
  const getActiveColor = () => {
    switch (activeTab) {
      case MaterialType.LEATHER:
        return 'bg-amber-100 text-amber-900';
      case MaterialType.HARDWARE:
        return 'bg-blue-100 text-blue-800';
      case MaterialType.SUPPLIES:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-stone-100 text-stone-900';
    }
  };

  return (
    <div className='flex items-center space-x-2'>
      <button
        onClick={() => setViewMode('list')}
        className={`px-3 py-2 rounded-md text-sm font-medium ${
          viewMode === 'list'
            ? getActiveColor()
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
        onClick={() => setViewMode('grid')}
        className={`px-3 py-2 rounded-md text-sm font-medium ${
          viewMode === 'grid'
            ? getActiveColor()
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
        onClick={() => setViewMode('storage')}
        className={`px-3 py-2 rounded-md text-sm font-medium ${
          viewMode === 'storage'
            ? getActiveColor()
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
    </div>
  );
};

export default ViewToggle;
