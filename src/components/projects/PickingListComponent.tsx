// src/components/projects/PickingListComponent.tsx
import {
  Calendar,
  CheckSquare,
  Clock,
  Filter,
  Inbox,
  Plus,
  Search,
  Slash,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePickingLists } from '../../context/PickingListContext';
import { PickingListStatus } from '../../types/enums';
import { PickingList, PickingListFilters } from '../../types/pickinglist';
import ErrorMessage from '../common/ErrorMessage';
import LoadingSpinner from '../common/LoadingSpinner';

// Enhanced type for internal component use
interface EnhancedPickingListFilters {
  projectId?: string;
  assignedTo?: string;
  dateRange?: {
    start?: Date;
    end?: Date;
  };
  status?: PickingListStatus | PickingListStatus[];
}

type ActiveTab = 'all' | 'pending' | 'in-progress' | 'completed';

const PickingListComponent: React.FC = () => {
  const navigate = useNavigate();
  const { getFilteredPickingLists, loading, error, pagination } =
    usePickingLists();

  const [pickingLists, setPickingLists] = useState<PickingList[]>([]);
  const [filters, setFilters] = useState<EnhancedPickingListFilters>({});
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<ActiveTab>('all');
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);

  // Fetch picking lists when filters or page changes
  useEffect(() => {
    const fetchPickingLists = async () => {
      try {
        // Convert our enhanced filters to API-compatible filters
        const apiFilters: PickingListFilters = {
          projectId: filters.projectId,
          assignedTo: filters.assignedTo,
          dateRange: filters.dateRange,
          // Force the status to be API-compatible by using type assertion
          status: Array.isArray(filters.status)
            ? (filters.status[0] as any)
            : (filters.status as any),
        };

        const lists = await getFilteredPickingLists(apiFilters, currentPage);

        // If we're using multiple statuses, filter the results client-side
        if (Array.isArray(filters.status) && filters.status.length > 0) {
          setPickingLists(
            lists.filter((list) => filters.status?.includes(list.status as any))
          );
        } else {
          setPickingLists(lists);
        }
      } catch (err) {
        console.error('Error fetching picking lists:', err);
      }
    };

    fetchPickingLists();
  }, [filters, currentPage, getFilteredPickingLists]);

  // Handle filter changes
  const handleFilterChange = (
    newFilters: Partial<EnhancedPickingListFilters>
  ) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    // Reset to first page when changing filters
    setCurrentPage(1);
  };

  // Handle tab changes
  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);

    // Update filters based on tab
    if (tab === 'pending') {
      handleFilterChange({
        status: [PickingListStatus.PENDING, PickingListStatus.APPROVED],
      });
    } else if (tab === 'in-progress') {
      handleFilterChange({
        status: [
          PickingListStatus.IN_PROGRESS,
          PickingListStatus.PICKING,
          PickingListStatus.PARTIALLY_PICKED,
        ],
      });
    } else if (tab === 'completed') {
      handleFilterChange({ status: [PickingListStatus.COMPLETED] });
    } else {
      // 'all' tab - clear status filter
      handleFilterChange({ status: undefined });
    }
  };

  // Navigate to details
  const handleViewList = (id: string) => {
    navigate(`/projects/picking-lists/${id}`);
  };

  // Navigate to create new
  const handleCreateNew = () => {
    navigate('/projects/picking-lists/new');
  };

  // Pagination controls
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

  // Clear all filters
  const handleClearFilters = () => {
    setFilters({});
    setActiveTab('all');
  };

  // Render status badge with appropriate color
  const renderStatusBadge = (status: PickingListStatus) => {
    let bgColor = 'bg-stone-200';
    let textColor = 'text-stone-800';
    let icon = null;

    switch (status) {
      case PickingListStatus.DRAFT:
      case PickingListStatus.PENDING:
        bgColor = 'bg-stone-200';
        icon = <Inbox size={14} className='mr-1' />;
        break;
      case PickingListStatus.APPROVED:
      case PickingListStatus.ASSIGNED:
        bgColor = 'bg-blue-200';
        textColor = 'text-blue-800';
        icon = <CheckSquare size={14} className='mr-1' />;
        break;
      case PickingListStatus.IN_PROGRESS:
      case PickingListStatus.PICKING:
      case PickingListStatus.PARTIALLY_PICKED:
        bgColor = 'bg-amber-200';
        textColor = 'text-amber-800';
        icon = <Clock size={14} className='mr-1' />;
        break;
      case PickingListStatus.PICKED:
      case PickingListStatus.PACKED:
      case PickingListStatus.COMPLETED:
        bgColor = 'bg-green-200';
        textColor = 'text-green-800';
        icon = <CheckSquare size={14} className='mr-1' />;
        break;
      case PickingListStatus.AWAITING_MATERIALS:
      case PickingListStatus.BACK_ORDER:
      case PickingListStatus.HOLD:
      case PickingListStatus.ON_HOLD:
        bgColor = 'bg-red-200';
        textColor = 'text-red-800';
        icon = <Clock size={14} className='mr-1' />;
        break;
      case PickingListStatus.CANCELLED:
        bgColor = 'bg-red-300';
        textColor = 'text-red-800';
        icon = <Slash size={14} className='mr-1' />;
        break;
      default:
        bgColor = 'bg-stone-200';
    }

    return (
      <span
        className={`${bgColor} ${textColor} py-1 px-2 rounded text-xs font-medium inline-flex items-center`}
      >
        {icon}
        {status.replace(/_/g, ' ')}
      </span>
    );
  };

  return (
    <div className='picking-lists-container'>
      {loading && !pickingLists.length ? (
        <div className='flex justify-center p-8'>
          <LoadingSpinner
            size='medium'
            color='amber'
            message='Loading picking lists...'
          />
        </div>
      ) : error ? (
        <ErrorMessage
          message={`Error loading picking lists: ${error}`}
          onRetry={() => {
            // Convert enhanced filters to API-compatible filters
            const apiFilters: PickingListFilters = {
              projectId: filters.projectId,
              assignedTo: filters.assignedTo,
              dateRange: filters.dateRange,
              status: Array.isArray(filters.status)
                ? (filters.status[0] as any)
                : (filters.status as any),
            };
            return getFilteredPickingLists(apiFilters, currentPage);
          }}
        />
      ) : (
        <div className='picking-lists-content'>
          {/* Toggle filter section */}
          <div className='mb-4 flex justify-between items-center'>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className='flex items-center text-sm text-stone-600 hover:text-amber-700 transition-colors'
            >
              <Filter size={16} className='mr-1' />
              {isFilterOpen ? 'Hide Filters' : 'Show Filters'}
            </button>

            {/* Create new button */}
            <button
              onClick={handleCreateNew}
              className='flex items-center px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-sm font-medium transition-colors'
            >
              <Plus size={16} className='mr-1' />
              New Picking List
            </button>
          </div>

          {/* Filters */}
          {isFilterOpen && (
            <div className='bg-white rounded-lg shadow p-4 mb-6'>
              <h3 className='text-sm font-medium mb-4 flex items-center'>
                <Filter size={16} className='mr-2' />
                Filters
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                {/* Project filter */}
                <div>
                  <label
                    htmlFor='projectId'
                    className='block text-xs font-medium text-stone-700 mb-1'
                  >
                    Project
                  </label>
                  <select
                    id='projectId'
                    className='w-full border border-stone-300 rounded p-2 text-sm'
                    value={filters.projectId || ''}
                    onChange={(e) => {
                      handleFilterChange({
                        projectId: e.target.value || undefined,
                      });
                    }}
                  >
                    <option value=''>All Projects</option>
                    {/* Project options would go here */}
                  </select>
                </div>

                {/* Date range filter */}
                <div>
                  <label className='block text-xs font-medium text-stone-700 mb-1'>
                    Date Range
                  </label>
                  <div className='flex space-x-2'>
                    <input
                      type='date'
                      className='w-full border border-stone-300 rounded p-2 text-sm'
                      value={
                        filters.dateRange?.start?.toISOString().split('T')[0] ||
                        ''
                      }
                      onChange={(e) => {
                        const start = e.target.value
                          ? new Date(e.target.value)
                          : undefined;
                        handleFilterChange({
                          dateRange: { ...filters.dateRange, start },
                        });
                      }}
                    />
                    <input
                      type='date'
                      className='w-full border border-stone-300 rounded p-2 text-sm'
                      value={
                        filters.dateRange?.end?.toISOString().split('T')[0] ||
                        ''
                      }
                      onChange={(e) => {
                        const end = e.target.value
                          ? new Date(e.target.value)
                          : undefined;
                        handleFilterChange({
                          dateRange: { ...filters.dateRange, end },
                        });
                      }}
                    />
                  </div>
                </div>

                {/* Filter actions */}
                <div className='flex items-end'>
                  <button
                    className='bg-stone-100 hover:bg-stone-200 text-stone-800 py-2 px-4 rounded text-sm transition-colors'
                    onClick={handleClearFilters}
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab navigation */}
          <div className='border-b border-stone-200 mb-6'>
            <nav className='flex -mb-px'>
              <button
                className={`mr-1 py-2 px-4 text-sm font-medium ${
                  activeTab === 'all'
                    ? 'border-b-2 border-amber-500 text-amber-600'
                    : 'text-stone-500 hover:text-stone-700'
                }`}
                onClick={() => handleTabChange('all')}
              >
                All Lists
              </button>
              <button
                className={`mr-1 py-2 px-4 text-sm font-medium ${
                  activeTab === 'pending'
                    ? 'border-b-2 border-amber-500 text-amber-600'
                    : 'text-stone-500 hover:text-stone-700'
                }`}
                onClick={() => handleTabChange('pending')}
              >
                Pending
              </button>
              <button
                className={`mr-1 py-2 px-4 text-sm font-medium ${
                  activeTab === 'in-progress'
                    ? 'border-b-2 border-amber-500 text-amber-600'
                    : 'text-stone-500 hover:text-stone-700'
                }`}
                onClick={() => handleTabChange('in-progress')}
              >
                In Progress
              </button>
              <button
                className={`mr-1 py-2 px-4 text-sm font-medium ${
                  activeTab === 'completed'
                    ? 'border-b-2 border-amber-500 text-amber-600'
                    : 'text-stone-500 hover:text-stone-700'
                }`}
                onClick={() => handleTabChange('completed')}
              >
                Completed
              </button>
            </nav>
          </div>

          {/* Main content */}
          <div className='bg-white rounded-lg shadow overflow-hidden'>
            <div className='flex justify-between items-center p-4 border-b border-stone-200'>
              <h2 className='text-lg font-medium'>Picking Lists</h2>
              <div className='flex items-center'>
                <div className='relative mr-4'>
                  <input
                    type='text'
                    placeholder='Search lists...'
                    className='pl-8 pr-4 py-1.5 text-sm border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500'
                    onChange={(e) => {
                      // We could add a local search function here
                    }}
                  />
                  <Search className='h-4 w-4 absolute left-2.5 top-2 text-stone-400' />
                </div>
                <button
                  className='bg-amber-600 hover:bg-amber-700 text-white py-2 px-4 rounded flex items-center text-sm font-medium transition-colors'
                  onClick={handleCreateNew}
                >
                  <Plus size={16} className='mr-1' />
                  Create New
                </button>
              </div>
            </div>

            {/* Lists */}
            {pickingLists.length > 0 ? (
              <div>
                <ul className='divide-y divide-stone-200'>
                  {pickingLists.map((list) => (
                    <li
                      key={list.id}
                      className='p-4 hover:bg-stone-50 cursor-pointer transition-colors'
                      onClick={() => handleViewList(list.id)}
                    >
                      <div className='flex justify-between items-center'>
                        <div>
                          <p className='font-medium text-stone-800'>
                            Picking List #{list.id.substring(0, 8)}
                          </p>
                          <p className='text-xs text-stone-500 mt-1 flex items-center'>
                            <Calendar size={12} className='mr-1' />
                            Created:{' '}
                            {new Date(list.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className='flex items-center space-x-4'>
                          {renderStatusBadge(list.status as PickingListStatus)}
                          <span className='text-xs bg-stone-100 px-2 py-1 rounded-full'>
                            {list.items?.length || 0} items
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                {/* Pagination */}
                <div className='flex justify-between items-center px-4 py-3 bg-stone-50 border-t border-stone-200'>
                  <div className='text-xs text-stone-700'>
                    Showing {(currentPage - 1) * pagination.perPage + 1} to{' '}
                    {Math.min(
                      currentPage * pagination.perPage,
                      pagination.total
                    )}{' '}
                    of {pagination.total} items
                  </div>
                  <div className='flex items-center space-x-2'>
                    <button
                      className={`px-3 py-1 rounded text-xs font-medium ${
                        currentPage === 1
                          ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                          : 'bg-stone-200 text-stone-800 hover:bg-stone-300'
                      }`}
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                    <span className='text-xs'>
                      Page {currentPage} of {pagination.lastPage}
                    </span>
                    <button
                      className={`px-3 py-1 rounded text-xs font-medium ${
                        currentPage === pagination.lastPage
                          ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                          : 'bg-stone-200 text-stone-800 hover:bg-stone-300'
                      }`}
                      onClick={handleNextPage}
                      disabled={currentPage === pagination.lastPage}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className='p-8 text-center'>
                <div className='mx-auto w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mb-4'>
                  <Inbox size={24} className='text-stone-400' />
                </div>
                <p className='text-stone-500 mb-4'>No picking lists found</p>
                <button
                  className='bg-amber-600 hover:bg-amber-700 text-white py-2 px-4 rounded flex items-center text-sm font-medium mx-auto transition-colors'
                  onClick={handleCreateNew}
                >
                  <Plus size={16} className='mr-1' />
                  Create Your First Picking List
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PickingListComponent;
