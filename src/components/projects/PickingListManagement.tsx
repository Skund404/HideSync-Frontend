// src/components/projects/PickingListManagement.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePickingLists } from '../../context/PickingListContext';
// Import PickingList type from pickinglist.ts but use PickingListStatus from enums.ts
import { PickingListStatus } from '../../types/enums';
import { PickingList, PickingListFilters } from '../../types/pickinglist';
import ErrorMessage from '../common/ErrorMessage';
import LoadingSpinner from '../common/LoadingSpinner';

// Type to help with the enum mismatch issue
type EnhancedPickingList = Omit<PickingList, 'status'> & {
  status: PickingListStatus;
  items?: Array<{
    quantity_ordered: number;
    quantity_picked: number;
  }>;
};

const PickingListManagement: React.FC = () => {
  const navigate = useNavigate();
  const {
    getFilteredPickingLists,
    updatePickingListStatus,
    assignPickingList,
    loading,
    error,
    pagination,
  } = usePickingLists();

  const [pickingLists, setPickingLists] = useState<EnhancedPickingList[]>([]);
  const [localLoading, setLocalLoading] = useState<boolean>(true);
  const [localError, setLocalError] = useState<string | null>(null);
  const [filters, setFilters] = useState<PickingListFilters>({
    status: undefined,
    projectId: '',
    dateRange: {
      start: undefined,
      end: undefined,
    },
  });
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Load picking lists with filters
  useEffect(() => {
    const fetchPickingLists = async () => {
      setLocalLoading(true);
      try {
        const lists = await getFilteredPickingLists(filters, currentPage);
        setPickingLists(lists as EnhancedPickingList[]);
        setLocalError(null);
      } catch (error) {
        console.error('Error fetching picking lists:', error);
        setLocalError('Failed to load picking lists. Please try again.');
      } finally {
        setLocalLoading(false);
      }
    };

    fetchPickingLists();
  }, [filters, currentPage, getFilteredPickingLists]);

  // Handle status change
  const handleStatusChange = async (
    listId: string,
    newStatus: PickingListStatus
  ) => {
    try {
      await updatePickingListStatus(listId, newStatus);
      // Update local state to reflect the change
      setPickingLists(
        (prevLists) =>
          prevLists.map((list) =>
            list.id === listId ? { ...list, status: newStatus } : list
          ) as EnhancedPickingList[]
      );
    } catch (error) {
      console.error('Error updating picking list status:', error);
      setLocalError('Failed to update status. Please try again.');
    }
  };

  // Handle user assignment - currently not used in UI but kept for future implementation
  const handleAssignUser = async (listId: string, userId: string) => {
    try {
      await assignPickingList(listId, userId);
      // Refresh the list to get updated data
      const lists = await getFilteredPickingLists(filters, currentPage);
      setPickingLists(lists as EnhancedPickingList[]);
    } catch (error) {
      console.error('Error assigning picking list:', error);
      setLocalError('Failed to assign user. Please try again.');
    }
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<PickingListFilters>) => {
    setFilters((prevFilters) => ({ ...prevFilters, ...newFilters }));
    // Reset to first page when changing filters
    setCurrentPage(1);
  };

  // Navigate to create new picking list
  const handleCreateNew = () => {
    navigate('/projects/picking-lists/new');
  };

  // Navigate to picking list details
  const handleViewDetails = (listId: string) => {
    navigate(`/projects/picking-lists/${listId}`);
  };

  // Pagination handlers
  const handleNextPage = () => {
    if (currentPage < pagination.lastPage) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  // Render status badge with appropriate color
  const renderStatusBadge = (status: PickingListStatus) => {
    let bgColor = 'bg-gray-200';

    switch (status) {
      case PickingListStatus.DRAFT:
      case PickingListStatus.PENDING:
        bgColor = 'bg-gray-200';
        break;
      case PickingListStatus.APPROVED:
      case PickingListStatus.ASSIGNED:
        bgColor = 'bg-blue-200';
        break;
      case PickingListStatus.IN_PROGRESS:
      case PickingListStatus.PICKING:
      case PickingListStatus.PARTIALLY_PICKED:
        bgColor = 'bg-yellow-200';
        break;
      case PickingListStatus.PICKED:
      case PickingListStatus.PACKED:
      case PickingListStatus.COMPLETED:
        bgColor = 'bg-green-200';
        break;
      case PickingListStatus.AWAITING_MATERIALS:
      case PickingListStatus.BACK_ORDER:
      case PickingListStatus.HOLD:
      case PickingListStatus.ON_HOLD:
        bgColor = 'bg-orange-200';
        break;
      case PickingListStatus.CANCELLED:
        bgColor = 'bg-red-200';
        break;
      default:
        bgColor = 'bg-gray-200';
    }

    return (
      <span
        className={`${bgColor} text-gray-800 py-1 px-2 rounded-md text-sm font-medium`}
      >
        {status.replace(/_/g, ' ')}
      </span>
    );
  };

  // Filter UI component
  const FilterPanel = () => (
    <div className='bg-white shadow rounded-lg p-4 mb-6'>
      <h3 className='text-lg font-medium text-gray-800 mb-3'>Filters</h3>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        {/* Status filter */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Status
          </label>
          <select
            className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
            value={filters.status || ''}
            onChange={(e) => {
              const selectedValue = e.target.value;
              // Cast to the correct enum type from enums.ts
              const statusValue = selectedValue
                ? (selectedValue as PickingListStatus)
                : undefined;
              handleFilterChange({
                status: statusValue as any, // Use 'any' to bypass the type checking between different enums
              });
            }}
          >
            <option value=''>All Statuses</option>
            {Object.values(PickingListStatus).map((status) => (
              <option key={status} value={status}>
                {status.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>

        {/* Project filter */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Project
          </label>
          <input
            type='text'
            className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
            value={filters.projectId || ''}
            onChange={(e) => handleFilterChange({ projectId: e.target.value })}
            placeholder='Project ID or name'
          />
        </div>

        {/* Date range filter */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Date Range
          </label>
          <div className='grid grid-cols-2 gap-2'>
            <input
              type='date'
              className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
              value={
                filters.dateRange?.start
                  ? new Date(filters.dateRange.start)
                      .toISOString()
                      .substr(0, 10)
                  : ''
              }
              onChange={(e) => {
                const date = e.target.value
                  ? new Date(e.target.value)
                  : undefined;
                handleFilterChange({
                  dateRange: { ...filters.dateRange, start: date },
                });
              }}
              placeholder='Start date'
            />
            <input
              type='date'
              className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
              value={
                filters.dateRange?.end
                  ? new Date(filters.dateRange.end).toISOString().substr(0, 10)
                  : ''
              }
              onChange={(e) => {
                const date = e.target.value
                  ? new Date(e.target.value)
                  : undefined;
                handleFilterChange({
                  dateRange: { ...filters.dateRange, end: date },
                });
              }}
              placeholder='End date'
            />
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className='flex justify-between mt-4'>
        <div className='flex space-x-4'>
          <button
            className='px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
            onClick={() =>
              setFilters({
                status: undefined,
                projectId: '',
                dateRange: { start: undefined, end: undefined },
              })
            }
          >
            Clear Filters
          </button>
        </div>

        <button
          className='px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
          onClick={handleCreateNew}
        >
          Create New Picking List
        </button>
      </div>
    </div>
  );

  // Function to access picking list items safely
  const getListItems = (list: EnhancedPickingList) => {
    // If pickingList has an items property, use it; otherwise return empty array
    return list.items || [];
  };

  // Function to count picked items
  const countPickedItems = (list: EnhancedPickingList) => {
    const items = getListItems(list);
    return items.filter((item) => item.quantity_picked >= item.quantity_ordered)
      .length;
  };

  return (
    <div className='p-6'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold text-gray-900'>
          Picking List Management
        </h1>
      </div>

      <FilterPanel />

      {localLoading || loading ? (
        <div className='flex justify-center my-12'>
          <LoadingSpinner
            size='medium'
            color='amber'
            message='Loading picking lists...'
          />
        </div>
      ) : localError || error ? (
        <ErrorMessage
          message={localError || error || 'An error occurred'}
          onRetry={() => getFilteredPickingLists(filters, currentPage)}
        />
      ) : (
        <div className='bg-white shadow overflow-hidden sm:rounded-md'>
          {pickingLists.length > 0 ? (
            <>
              <ul className='divide-y divide-gray-200'>
                {pickingLists.map((list) => (
                  <li key={list.id}>
                    <div className='block hover:bg-gray-50'>
                      <div className='px-4 py-4 sm:px-6'>
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center'>
                            <p className='text-sm font-medium text-indigo-600 truncate'>
                              {`Picking List #${list.id.substring(0, 8)}`}
                            </p>
                            <p className='ml-2 flex-shrink-0 text-sm text-gray-500'>
                              {new Date(list.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className='ml-2 flex-shrink-0 flex'>
                            {renderStatusBadge(list.status)}
                          </div>
                        </div>

                        <div className='mt-2 sm:flex sm:justify-between'>
                          <div className='sm:flex'>
                            <p className='flex items-center text-sm text-gray-500'>
                              Items: {getListItems(list).length || 0}
                            </p>
                            <p className='mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6'>
                              Picked: {countPickedItems(list)} /{' '}
                              {getListItems(list).length || 0}
                            </p>
                          </div>

                          <div className='mt-2 flex items-center text-sm text-gray-500 sm:mt-0'>
                            <p className='mr-2'>
                              Assigned to: {list.assignedTo || 'Unassigned'}
                            </p>

                            <div className='flex space-x-2'>
                              <button
                                className='inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                                onClick={() => handleViewDetails(list.id)}
                              >
                                View Details
                              </button>

                              {/* Status change dropdown */}
                              <select
                                className='block w-32 px-2 py-1 text-xs border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
                                value={list.status}
                                onChange={(e) =>
                                  handleStatusChange(
                                    list.id,
                                    e.target.value as PickingListStatus
                                  )
                                }
                              >
                                {Object.values(PickingListStatus)
                                  .filter((status) => {
                                    // Logic to determine valid status transitions would go here
                                    return true;
                                  })
                                  .map((status) => (
                                    <option key={status} value={status}>
                                      {status.replace(/_/g, ' ')}
                                    </option>
                                  ))}
                              </select>

                              {/* User assignment dropdown */}
                              <select
                                className='block w-32 px-2 py-1 text-xs border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
                                value={list.assignedTo || ''}
                                onChange={(e) =>
                                  handleAssignUser(list.id, e.target.value)
                                }
                              >
                                <option value=''>Assign to...</option>
                                <option value='user1'>John Doe</option>
                                <option value='user2'>Jane Smith</option>
                                <option value='user3'>Alex Johnson</option>
                                {/* In a real app, you would fetch users from an API */}
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Pagination controls */}
              <div className='bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6'>
                <div className='flex-1 flex justify-between sm:hidden'>
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage >= pagination.lastPage}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                      currentPage >= pagination.lastPage
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Next
                  </button>
                </div>
                <div className='hidden sm:flex-1 sm:flex sm:items-center sm:justify-between'>
                  <div>
                    <p className='text-sm text-gray-700'>
                      Showing{' '}
                      <span className='font-medium'>
                        {(currentPage - 1) * pagination.perPage + 1}
                      </span>{' '}
                      to{' '}
                      <span className='font-medium'>
                        {Math.min(
                          currentPage * pagination.perPage,
                          pagination.total
                        )}
                      </span>{' '}
                      of <span className='font-medium'>{pagination.total}</span>{' '}
                      results
                    </p>
                  </div>
                  <div>
                    <nav
                      className='relative z-0 inline-flex rounded-md shadow-sm -space-x-px'
                      aria-label='Pagination'
                    >
                      <button
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                          currentPage === 1
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className='sr-only'>Previous</span>
                        &larr;
                      </button>

                      <button
                        onClick={handleNextPage}
                        disabled={currentPage >= pagination.lastPage}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                          currentPage >= pagination.lastPage
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className='sr-only'>Next</span>
                        &rarr;
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className='text-center py-12'>
              <p className='text-sm text-gray-500'>
                No picking lists found matching your filters.
              </p>
              <button
                className='mt-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                onClick={handleCreateNew}
              >
                Create Your First Picking List
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PickingListManagement;
