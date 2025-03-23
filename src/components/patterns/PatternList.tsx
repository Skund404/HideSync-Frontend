// src/components/patterns/PatternList.tsx
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatternContext } from '../../context/PatternContext';
import { handleApiError } from '../../services/error-handler';
import { showError } from '../../services/notification-service';
import { EnumTypes } from '../../types';
import { Pattern, PatternFileType } from '../../types/patternTypes';
import ErrorBoundary from '../common/ErrorBoundary';

interface PatternListProps {
  patterns: Pattern[];
  onPatternClick?: (pattern: Pattern) => void;
  isLoading?: boolean;
  onLoadMore?: (page: number, pageSize: number) => Promise<void>;
  totalCount?: number;
  error?: string | null;
  initialPage?: number;
}

const PatternList: React.FC<PatternListProps> = ({
  patterns,
  onPatternClick,
  isLoading = false,
  onLoadMore,
  totalCount,
  error,
  initialPage = 1,
}) => {
  const { toggleFavorite } = usePatternContext();
  const navigate = useNavigate();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(20);
  const [isPaginationLoading, setIsPaginationLoading] = useState(false);
  const [paginationError, setPaginationError] = useState<string | null>(null);

  // Calculate total pages
  const totalPages = totalCount
    ? Math.ceil(totalCount / pageSize)
    : patterns.length > 0
    ? Math.ceil(patterns.length / pageSize)
    : 1;

  // Handle page change (wrapped in useCallback to prevent infinite loops in useEffect)
  const handlePageChange = useCallback(
    async (newPage: number) => {
      if (
        newPage === currentPage ||
        newPage < 1 ||
        newPage > totalPages ||
        !onLoadMore
      ) {
        return;
      }

      setIsPaginationLoading(true);
      setPaginationError(null);

      try {
        await onLoadMore(newPage, pageSize);
        setCurrentPage(newPage);

        // Update URL with page number for better navigation
        const url = new URL(window.location.href);
        url.searchParams.set('page', newPage.toString());
        window.history.pushState({}, '', url);

        // Scroll to top of list when changing pages
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (err) {
        const errorMessage = handleApiError(
          err,
          'Failed to load more patterns'
        );
        setPaginationError(errorMessage);
        showError(errorMessage);
      } finally {
        setIsPaginationLoading(false);
      }
    },
    [currentPage, totalPages, onLoadMore, pageSize]
  );

  // Use effect for initial data loading
  useEffect(() => {
    // Load initial data if onLoadMore is provided and we have a non-default initial page
    if (onLoadMore && initialPage > 1) {
      handlePageChange(initialPage);
    }

    // Listen for browser back/forward navigation to update pagination
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const page = parseInt(params.get('page') || '1', 10);
      if (page !== currentPage) {
        setCurrentPage(page);
        if (onLoadMore) {
          handlePageChange(page);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [onLoadMore, initialPage, currentPage, handlePageChange]);

  // Get skill level display text
  const getSkillLevelDisplay = (level: EnumTypes.SkillLevel): string => {
    return level
      .toString()
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  // Get color for skill level tag
  const getSkillLevelColor = (level: EnumTypes.SkillLevel): string => {
    switch (level) {
      case EnumTypes.SkillLevel.BEGINNER:
      case EnumTypes.SkillLevel.ABSOLUTE_BEGINNER:
      case EnumTypes.SkillLevel.NOVICE:
        return 'bg-green-100 text-green-800';
      case EnumTypes.SkillLevel.INTERMEDIATE:
      case EnumTypes.SkillLevel.APPRENTICE:
        return 'bg-amber-100 text-amber-800';
      case EnumTypes.SkillLevel.ADVANCED:
      case EnumTypes.SkillLevel.JOURNEYMAN:
        return 'bg-red-100 text-red-800';
      case EnumTypes.SkillLevel.EXPERT:
      case EnumTypes.SkillLevel.MASTER:
      case EnumTypes.SkillLevel.MASTER_CRAFTSMAN:
      case EnumTypes.SkillLevel.PROFESSIONAL:
      case EnumTypes.SkillLevel.SPECIALIST:
      case EnumTypes.SkillLevel.ARTISAN:
      case EnumTypes.SkillLevel.INSTRUCTOR:
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-stone-100 text-stone-800';
    }
  };

  // Format date
  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Handle favorite toggle
  const handleFavoriteToggle = async (
    e: React.MouseEvent,
    patternId: number
  ) => {
    e.stopPropagation();
    try {
      await toggleFavorite(patternId);
    } catch (err) {
      const errorMessage = handleApiError(
        err,
        `Error toggling favorite for pattern ${patternId}`
      );
      console.error(errorMessage);
      showError(errorMessage);
    }
  };

  // Handle row click
  const handleRowClick = (pattern: Pattern) => {
    if (onPatternClick) {
      onPatternClick(pattern);
    } else {
      // Navigate to pattern detail
      navigate(`/patterns/${pattern.id}`);
    }
  };

  // No need to define handlePageChange here as it's been moved up and wrapped in useCallback

  // Handle page size change
  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = parseInt(e.target.value, 10);
    setPageSize(newSize);
    // Reset to first page when changing page size
    if (onLoadMore) {
      handlePageChange(1);
    }
  };

  // Render skeleton row for loading state
  const renderSkeletonRow = (key: number) => (
    <tr key={`skeleton-${key}`} className='animate-pulse'>
      <td className='px-6 py-4 whitespace-nowrap'>
        <div className='flex items-center'>
          <div className='h-10 w-10 rounded-md bg-stone-200'></div>
          <div className='ml-4'>
            <div className='h-4 w-32 bg-stone-200 rounded'></div>
            <div className='h-3 w-48 bg-stone-200 rounded mt-2'></div>
          </div>
        </div>
      </td>
      <td className='px-6 py-4 whitespace-nowrap'>
        <div className='h-6 w-24 bg-stone-200 rounded-full'></div>
      </td>
      <td className='px-6 py-4 whitespace-nowrap'>
        <div className='flex flex-wrap gap-1 max-w-xs'>
          <div className='h-6 w-16 bg-stone-200 rounded-md'></div>
          <div className='h-6 w-20 bg-stone-200 rounded-md'></div>
          <div className='h-6 w-14 bg-stone-200 rounded-md'></div>
        </div>
      </td>
      <td className='px-6 py-4 whitespace-nowrap'>
        <div className='h-4 w-24 bg-stone-200 rounded'></div>
        <div className='h-3 w-16 bg-stone-200 rounded mt-1'></div>
      </td>
      <td className='px-6 py-4 whitespace-nowrap'>
        <div className='h-5 w-16 bg-stone-200 rounded-md'></div>
      </td>
      <td className='px-6 py-4 whitespace-nowrap'>
        <div className='flex space-x-2'>
          <div className='h-5 w-5 bg-stone-200 rounded-full'></div>
          <div className='h-5 w-5 bg-stone-200 rounded-full'></div>
          <div className='h-5 w-5 bg-stone-200 rounded-full'></div>
          <div className='h-5 w-5 bg-stone-200 rounded-full'></div>
        </div>
      </td>
    </tr>
  );

  // Render pagination controls
  const renderPagination = () => {
    const pagesToShow = 5; // Number of page buttons to display

    // Calculate range of pages to display
    let startPage = Math.max(1, currentPage - Math.floor(pagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + pagesToShow - 1);

    // Adjust if we're at the end
    if (endPage - startPage + 1 < pagesToShow) {
      startPage = Math.max(1, endPage - pagesToShow + 1);
    }

    // Generate array of pages to show
    const pages = Array.from(
      { length: endPage - startPage + 1 },
      (_, i) => startPage + i
    );

    return (
      <div className='flex items-center justify-between border-t border-stone-200 bg-white px-4 py-3 sm:px-6'>
        <div className='flex flex-1 justify-between sm:hidden'>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || isPaginationLoading}
            className={`relative inline-flex items-center rounded-md border ${
              currentPage === 1
                ? 'border-stone-300 bg-stone-100 text-stone-400'
                : 'border-stone-300 bg-white text-stone-700 hover:bg-stone-50'
            } px-4 py-2 text-sm font-medium`}
          >
            Previous
          </button>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || isPaginationLoading}
            className={`relative ml-3 inline-flex items-center rounded-md border ${
              currentPage === totalPages
                ? 'border-stone-300 bg-stone-100 text-stone-400'
                : 'border-stone-300 bg-white text-stone-700 hover:bg-stone-50'
            } px-4 py-2 text-sm font-medium`}
          >
            Next
          </button>
        </div>
        <div className='hidden sm:flex sm:flex-1 sm:items-center sm:justify-between'>
          <div>
            <p className='text-sm text-stone-700'>
              Showing{' '}
              <span className='font-medium'>
                {patterns.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
              </span>{' '}
              to{' '}
              <span className='font-medium'>
                {Math.min(
                  currentPage * pageSize,
                  totalCount || patterns.length
                )}
              </span>{' '}
              of{' '}
              <span className='font-medium'>
                {totalCount || patterns.length}
              </span>{' '}
              patterns
            </p>
          </div>
          <div className='flex items-center space-x-4'>
            {/* Page size selector */}
            <div className='flex items-center'>
              <label htmlFor='pageSize' className='mr-2 text-sm text-stone-700'>
                Show
              </label>
              <select
                id='pageSize'
                value={pageSize}
                onChange={handlePageSizeChange}
                disabled={isPaginationLoading}
                className='rounded-md border-stone-300 py-1.5 text-sm font-medium text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500'
              >
                <option value='10'>10</option>
                <option value='20'>20</option>
                <option value='50'>50</option>
                <option value='100'>100</option>
              </select>
            </div>

            {/* Pagination controls */}
            <nav
              className='isolate inline-flex -space-x-px rounded-md shadow-sm'
              aria-label='Pagination'
            >
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || isPaginationLoading}
                className={`relative inline-flex items-center rounded-l-md px-2 py-2 ${
                  currentPage === 1
                    ? 'bg-stone-100 text-stone-400'
                    : 'bg-white text-stone-500 hover:bg-stone-50'
                } focus:z-20 focus:outline-offset-0 focus:ring-2 focus:ring-amber-500`}
                aria-label='Previous page'
              >
                <span className='sr-only'>Previous</span>
                <svg
                  className='h-5 w-5'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                  aria-hidden='true'
                >
                  <path
                    fillRule='evenodd'
                    d='M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z'
                    clipRule='evenodd'
                  />
                </svg>
              </button>

              {/* Show first page button if not visible in current range */}
              {startPage > 1 && (
                <>
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={isPaginationLoading}
                    className='relative inline-flex items-center px-4 py-2 text-sm font-medium text-stone-700 bg-white hover:bg-stone-50 focus:z-20 focus:outline-offset-0 focus:ring-2 focus:ring-amber-500'
                  >
                    1
                  </button>
                  {startPage > 2 && (
                    <span className='relative inline-flex items-center px-4 py-2 text-sm font-medium text-stone-700 bg-white'>
                      ...
                    </span>
                  )}
                </>
              )}

              {/* Page buttons */}
              {pages.map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  disabled={isPaginationLoading}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
                    page === currentPage
                      ? 'z-10 bg-amber-50 border-amber-500 text-amber-600 focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500'
                      : 'text-stone-700 bg-white hover:bg-stone-50 focus:z-20 focus:outline-offset-0 focus:ring-2 focus:ring-amber-500'
                  }`}
                  aria-current={page === currentPage ? 'page' : undefined}
                >
                  {page}
                </button>
              ))}

              {/* Show last page button if not visible in current range */}
              {endPage < totalPages && (
                <>
                  {endPage < totalPages - 1 && (
                    <span className='relative inline-flex items-center px-4 py-2 text-sm font-medium text-stone-700 bg-white'>
                      ...
                    </span>
                  )}
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={isPaginationLoading}
                    className='relative inline-flex items-center px-4 py-2 text-sm font-medium text-stone-700 bg-white hover:bg-stone-50 focus:z-20 focus:outline-offset-0 focus:ring-2 focus:ring-amber-500'
                  >
                    {totalPages}
                  </button>
                </>
              )}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || isPaginationLoading}
                className={`relative inline-flex items-center rounded-r-md px-2 py-2 ${
                  currentPage === totalPages
                    ? 'bg-stone-100 text-stone-400'
                    : 'bg-white text-stone-500 hover:bg-stone-50'
                } focus:z-20 focus:outline-offset-0 focus:ring-2 focus:ring-amber-500`}
                aria-label='Next page'
              >
                <span className='sr-only'>Next</span>
                <svg
                  className='h-5 w-5'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                  aria-hidden='true'
                >
                  <path
                    fillRule='evenodd'
                    d='M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z'
                    clipRule='evenodd'
                  />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    );
  };

  // Empty state
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
            className='bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center transition-colors duration-200'
            onClick={() => navigate('/patterns/new')}
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
    <ErrorBoundary>
      <div className='bg-white shadow-sm rounded-lg border border-stone-200 overflow-hidden'>
        {/* Display error message if there is one */}
        {(error || paginationError) && (
          <div className='bg-red-50 border-l-4 border-red-500 p-4'>
            <div className='flex'>
              <div className='flex-shrink-0'>
                <svg
                  className='h-5 w-5 text-red-500'
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                  aria-hidden='true'
                >
                  <path
                    fillRule='evenodd'
                    d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                    clipRule='evenodd'
                  />
                </svg>
              </div>
              <div className='ml-3'>
                <p className='text-sm text-red-700'>
                  {error || paginationError}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-stone-200'>
            <thead className='bg-stone-50'>
              <tr>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
                >
                  Pattern
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
                >
                  Skill Level
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
                >
                  Tags
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
                >
                  Last Modified
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
                >
                  File Type
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-stone-200'>
              {patterns.map((pattern) => (
                <tr
                  key={pattern.id}
                  className='hover:bg-stone-50 cursor-pointer transition-colors duration-150'
                  onClick={() => handleRowClick(pattern)}
                >
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='flex items-center'>
                      <div className='h-10 w-10 flex-shrink-0'>
                        <img
                          className='h-10 w-10 rounded-md object-cover'
                          src={pattern.thumbnail}
                          alt={`${pattern.name} thumbnail`}
                          onError={(e) => {
                            // Show placeholder on image load error
                            (e.target as HTMLImageElement).src =
                              'https://via.placeholder.com/40?text=...';
                          }}
                        />
                      </div>
                      <div className='ml-4'>
                        <div className='text-sm font-medium text-stone-900'>
                          {pattern.name}
                        </div>
                        <div className='text-xs text-stone-500 truncate max-w-xs'>
                          {pattern.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${getSkillLevelColor(
                        pattern.skillLevel
                      )}`}
                    >
                      {getSkillLevelDisplay(pattern.skillLevel)}
                    </span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='flex flex-wrap gap-1 max-w-xs'>
                      {pattern.tags.map((tag, index) => (
                        <span
                          key={index}
                          className='px-2 py-0.5 bg-stone-100 rounded-md text-xs text-stone-700'
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='text-sm text-stone-900'>
                      {formatDate(pattern.modifiedAt)}
                    </div>
                    <div className='text-xs text-stone-500'>
                      by {pattern.authorName}
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='flex items-center'>
                      {pattern.fileType === PatternFileType.SVG && (
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          className='h-5 w-5 mr-1 text-blue-600'
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
                      )}
                      {pattern.fileType === PatternFileType.PDF && (
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          className='h-5 w-5 mr-1 text-red-600'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z'
                          />
                        </svg>
                      )}
                      {pattern.fileType === PatternFileType.IMAGE && (
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          className='h-5 w-5 mr-1 text-green-600'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
                          />
                        </svg>
                      )}
                      <span className='text-sm text-stone-700'>
                        {pattern.fileType}
                      </span>
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-stone-500'>
                    <div className='flex space-x-2'>
                      <button
                        className='text-amber-600 hover:text-amber-900 transition-colors duration-150'
                        aria-label='View pattern details'
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/patterns/${pattern.id}`);
                        }}
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
                            d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                          />
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                          />
                        </svg>
                      </button>
                      <button
                        className='text-stone-600 hover:text-stone-900 transition-colors duration-150'
                        aria-label='Download pattern'
                        onClick={(e) => e.stopPropagation()}
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
                            d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4'
                          />
                        </svg>
                      </button>
                      <button
                        className={`${
                          pattern.isFavorite
                            ? 'text-amber-500'
                            : 'text-stone-600'
                        } hover:text-amber-600 transition-colors duration-150`}
                        aria-label={
                          pattern.isFavorite
                            ? 'Remove from favorites'
                            : 'Add to favorites'
                        }
                        onClick={(e) => handleFavoriteToggle(e, pattern.id)}
                      >
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          className='h-5 w-5'
                          fill={pattern.isFavorite ? 'currentColor' : 'none'}
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z'
                          />
                        </svg>
                      </button>
                      <button
                        className='text-stone-600 hover:text-stone-900 transition-colors duration-150'
                        aria-label='More options'
                        onClick={(e) => e.stopPropagation()}
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
                            d='M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z'
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {/* Add skeleton rows when loading more patterns */}
              {(isLoading || isPaginationLoading) &&
                [...Array(3)].map((_, index) => renderSkeletonRow(index))}
            </tbody>
          </table>
        </div>

        {/* Pagination component */}
        {onLoadMore && patterns.length > 0 && renderPagination()}

        {/* Loading indicator for pagination */}
        {isPaginationLoading && (
          <div className='flex justify-center py-4 bg-stone-50 border-t border-stone-200'>
            <div className='flex items-center space-x-2 text-sm text-stone-500'>
              <svg
                className='animate-spin h-5 w-5 text-amber-500'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
              >
                <circle
                  className='opacity-25'
                  cx='12'
                  cy='12'
                  r='10'
                  stroke='currentColor'
                  strokeWidth='4'
                ></circle>
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                ></path>
              </svg>
              <span>Loading more patterns...</span>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default PatternList;
