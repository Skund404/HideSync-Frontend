// src/pages/PatternManagement.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import PatternFilter from '../components/patterns/common/PatternFilter';
import PatternGrid from '../components/patterns/PatternGrid';
import PatternList from '../components/patterns/PatternList';
import { usePatterns } from '../hooks/usePatterns';
import { Pattern } from '../types/patternTypes';

const PatternManagement: React.FC = () => {
  const navigate = useNavigate();

  const {
    filteredPatterns,
    loading,
    error,
    viewMode,
    setViewMode,
    activeTab,
    setActiveTab,
    filters,
    setFilters,
  } = usePatterns();

  const handlePatternClick = (pattern: Pattern) => {
    // Add logging to verify the correct path
    console.log(`Navigating to pattern detail: /patterns/${pattern.id}`);

    // Navigate to pattern detail page with explicit path
    navigate(`/patterns/${pattern.id}`);
  };

  if (loading) {
    return (
      <div className='flex h-full items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500 mx-auto'></div>
          <p className='mt-4 text-stone-700'>Loading patterns...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex h-full items-center justify-center'>
        <div className='text-center bg-red-50 rounded-lg p-6 max-w-md'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-10 w-10 text-red-500 mx-auto mb-4'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
            />
          </svg>
          <h3 className='text-lg font-medium text-red-800 mb-2'>
            Error Loading Patterns
          </h3>
          <p className='text-red-700'>{error}</p>
          <button
            className='mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium'
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col h-full'>
      {/* Header */}
      <header className='bg-white shadow-sm z-10 p-4 flex items-center justify-between'>
        <div className='flex items-center space-x-4'>
          {/* Page Title and Breadcrumbs */}
          <h1 className='text-xl font-semibold text-stone-900'>
            Pattern Management
          </h1>
          <div className='text-sm hidden md:flex items-center'>
            <span className='text-stone-400 mx-2'>/</span>
            <span className='text-stone-500'>Workshop</span>
            <span className='text-stone-400 mx-2'>/</span>
            <span className='text-amber-600'>Patterns</span>
          </div>
        </div>

        <div className='flex items-center space-x-4'>
          {/* Search */}
          <div className='relative hidden md:block'>
            <input
              type='text'
              value={filters.searchQuery || ''}
              onChange={(e) =>
                setFilters({ ...filters, searchQuery: e.target.value })
              }
              placeholder='Search patterns...'
              className='w-64 bg-stone-100 border border-stone-300 rounded-md py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent'
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

          {/* Quick Actions */}
          <button className='bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center'>
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
            New Pattern
          </button>

          {/* Notifications */}
          <button className='text-stone-500 hover:text-stone-700 p-1 rounded-full'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-6 w-6'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9'
              />
            </svg>
          </button>
        </div>
      </header>

      {/* Pattern Filter Tabs */}
      <div className='bg-white border-b border-stone-200 px-4'>
        <div className='flex space-x-6'>
          <button
            onClick={() => setActiveTab('all')}
            className={`py-4 px-1 text-sm font-medium border-b-2 ${
              activeTab === 'all'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
            }`}
          >
            All Patterns
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`py-4 px-1 text-sm font-medium border-b-2 ${
              activeTab === 'favorites'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
            }`}
          >
            Favorites
          </button>
          <button
            onClick={() => setActiveTab('recent')}
            className={`py-4 px-1 text-sm font-medium border-b-2 ${
              activeTab === 'recent'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
            }`}
          >
            Recently Modified
          </button>
        </div>
      </div>

      {/* Pattern Filter Options */}
      <PatternFilter
        filters={filters}
        setFilters={setFilters}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {/* Pattern List/Grid */}
      <div className='flex-1 overflow-y-auto bg-stone-50 p-6'>
        {viewMode === 'grid' ? (
          <PatternGrid
            patterns={filteredPatterns}
            onPatternClick={handlePatternClick}
          />
        ) : (
          <PatternList
            patterns={filteredPatterns}
            onPatternClick={handlePatternClick}
          />
        )}
      </div>

      {/* Pattern Stats Footer */}
      <div className='bg-white border-t border-stone-200 px-6 py-2'>
        <div className='flex justify-between text-sm text-stone-500'>
          <div>
            {filteredPatterns.length}{' '}
            {filteredPatterns.length === 1 ? 'pattern' : 'patterns'}{' '}
            {filters.searchQuery ? 'found' : 'total'}
          </div>
          <div>
            {activeTab === 'favorites' && 'Showing favorites'}
            {activeTab === 'recent' && 'Showing recently modified'}
            {activeTab === 'all' && 'Showing all patterns'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatternManagement;
