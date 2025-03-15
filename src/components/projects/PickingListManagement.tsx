import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Define types explicitly since imports are not working
enum PickingListStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  PICKING = 'PICKING',
  PARTIALLY_PICKED = 'PARTIALLY_PICKED',
  PICKED = 'PICKED',
  PACKED = 'PACKED',
  COMPLETED = 'COMPLETED',
  AWAITING_MATERIALS = 'AWAITING_MATERIALS',
  BACK_ORDER = 'BACK_ORDER',
  HOLD = 'HOLD',
  ON_HOLD = 'ON_HOLD',
  CANCELLED = 'CANCELLED',
}

interface PickingListItem {
  id: string;
  quantityRequired: number;
  quantityPicked: number;
}

interface PickingList {
  id: string;
  status: PickingListStatus;
  createdAt: string | Date;
  assignedUserId?: string;
  items: PickingListItem[];
}

interface PickingListFilters {
  status?: PickingListStatus[];
  projectId?: string;
  dateRange?: {
    start?: Date | null;
    end?: Date | null;
  };
}

interface PickingListContextType {
  getAllPickingLists: (filters: PickingListFilters) => Promise<PickingList[]>;
  updatePickingListStatus: (
    listId: string,
    status: PickingListStatus
  ) => Promise<void>;
  assignPickingList: (listId: string, userId: string) => Promise<void>;
}

// Mock LoadingSpinner component
const LoadingSpinner: React.FC = () => <div>Loading...</div>;

const PickingListManagement: React.FC = () => {
  const navigate = useNavigate();

  // Use type assertion for the context
  const { getAllPickingLists, updatePickingListStatus, assignPickingList } =
    React.useContext(
      React.createContext<PickingListContextType>({} as PickingListContextType)
    );

  const [pickingLists, setPickingLists] = useState<PickingList[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filters, setFilters] = useState<PickingListFilters>({
    status: [],
    projectId: '',
    dateRange: { start: null, end: null },
  });

  // Load picking lists with initial filters
  useEffect(() => {
    const fetchPickingLists = async () => {
      setLoading(true);
      try {
        const lists = await getAllPickingLists(filters);
        setPickingLists(lists);
      } catch (error) {
        console.error('Error fetching picking lists:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPickingLists();
  }, [filters, getAllPickingLists]);

  // Handle status change
  const handleStatusChange = async (
    listId: string,
    newStatus: PickingListStatus
  ) => {
    try {
      await updatePickingListStatus(listId, newStatus);
      // Update local state to reflect the change
      setPickingLists((prevLists) =>
        prevLists.map((list) =>
          list.id === listId ? { ...list, status: newStatus } : list
        )
      );
    } catch (error) {
      console.error('Error updating picking list status:', error);
    }
  };

  // Handle user assignment
  const handleAssignUser = async (listId: string, userId: string) => {
    try {
      await assignPickingList(listId, userId);
      // Update local state to reflect the assignment
      setPickingLists((prevLists) =>
        prevLists.map((list) =>
          list.id === listId ? { ...list, assignedUserId: userId } : list
        )
      );
    } catch (error) {
      console.error('Error assigning picking list:', error);
    }
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<PickingListFilters>) => {
    setFilters((prevFilters) => ({ ...prevFilters, ...newFilters }));
  };

  // Navigate to create new picking list
  const handleCreateNew = () => {
    navigate('/projects/picking-lists/new');
  };

  // Navigate to picking list details
  const handleViewDetails = (listId: string) => {
    navigate(`/projects/picking-lists/${listId}`);
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
            multiple
            value={filters.status || []}
            onChange={(e) => {
              const options = e.target.options;
              const selectedValues: PickingListStatus[] = [];
              for (let i = 0; i < options.length; i++) {
                if (options[i].selected) {
                  selectedValues.push(options[i].value as PickingListStatus);
                }
              }
              handleFilterChange({ status: selectedValues });
            }}
          >
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

        {/* User filter */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Assigned User
          </label>
          <input
            type='text'
            className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
            placeholder='User ID or name'
          />
        </div>
      </div>

      {/* Date range filter and buttons */}
      <div className='flex justify-between mt-4'>
        <div className='flex space-x-4'>
          <button
            className='px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
            onClick={() =>
              setFilters({
                status: [],
                projectId: '',
                dateRange: { start: null, end: null },
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

  return (
    <div className='p-6'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold text-gray-900'>
          Picking List Management
        </h1>
      </div>

      <FilterPanel />

      {loading ? (
        <div className='flex justify-center my-12'>
          <LoadingSpinner />
        </div>
      ) : (
        <div className='bg-white shadow overflow-hidden sm:rounded-md'>
          {pickingLists.length > 0 ? (
            <ul className='divide-y divide-gray-200'>
              {pickingLists.map((list) => (
                <li key={list.id}>
                  <div className='block hover:bg-gray-50'>
                    <div className='px-4 py-4 sm:px-6'>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center'>
                          <p className='text-sm font-medium text-indigo-600 truncate'>
                            {`Picking List #${list.id}`}
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
                            Items: {list.items.length}
                          </p>
                          <p className='mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6'>
                            Picked:{' '}
                            {
                              list.items.filter(
                                (item) =>
                                  item.quantityPicked >= item.quantityRequired
                              ).length
                            }{' '}
                            / {list.items.length}
                          </p>
                        </div>

                        <div className='mt-2 flex items-center text-sm text-gray-500 sm:mt-0'>
                          <p className='mr-2'>
                            Assigned to: {list.assignedUserId || 'Unassigned'}
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
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
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
