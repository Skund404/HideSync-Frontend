// src/pages/PickingListPages.tsx
import React, { useEffect, useState } from 'react';
import { Route, Routes, useNavigate, useParams } from 'react-router-dom';
import ErrorMessage from '../components/common/ErrorMessage';
import LoadingSpinner from '../components/common/LoadingSpinner';
import PickingListManagement from '../components/projects/PickingListManagement';
import { usePickingLists } from '../context/PickingListContext';
import { PickingListStatus } from '../types/enums';
import { PickingList } from '../types/pickinglist';

// Define custom interface for picking list items as they appear in the API response
interface ApiPickingListItem {
  id: string;
  pickingListId: string;
  materialId: string;
  componentId?: string;
  quantityPicked: number;
  quantityOrdered: number;
  status: string;
  notes?: string;
}

// Define the type for the picking list with items from API
interface PickingListWithItems extends Omit<PickingList, 'items'> {
  items?: ApiPickingListItem[];
}

const PickingListPages: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(true);
  const [pickingList, setPickingList] = useState<PickingListWithItems | null>(
    null
  );
  const [pickingItems, setPickingItems] = useState<ApiPickingListItem[]>([]);
  const [completedItems, setCompletedItems] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const {
    getPickingListById,
    updatePickingListItemQuantity,
    markPickingListComplete,
    createPickingList,
  } = usePickingLists();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        if (id && id !== 'new') {
          // Get the picking list from API
          const fetchedList = await getPickingListById(id);
          if (fetchedList) {
            // Cast to our type that includes items
            const listWithItems =
              fetchedList as unknown as PickingListWithItems;
            setPickingList(listWithItems);

            // Extract items if they exist
            if (listWithItems.items) {
              setPickingItems(listWithItems.items);

              // Initialize completed items
              const completed = listWithItems.items
                .filter((item) => item.quantityPicked >= item.quantityOrdered)
                .map((item) => item.id);
              setCompletedItems(completed);
            } else {
              setPickingItems([]);
              setCompletedItems([]);
            }
          } else {
            setError(`Picking list with ID ${id} not found`);
            // Navigate away after a delay
            setTimeout(() => navigate('/picking-lists'), 2000);
          }
        }
      } catch (err) {
        console.error('Error loading picking list data:', err);
        setError('Failed to load picking list data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, getPickingListById, navigate]);

  // Handle toggling item completion
  const handleItemToggle = async (itemId: string) => {
    if (!pickingList) return;

    // Find the item to update
    const item = pickingItems.find((item) => item.id === itemId);
    if (!item) return;

    try {
      // Determine new picked quantity
      const newPickedQuantity =
        item.quantityPicked >= item.quantityOrdered
          ? 0 // If already fully picked, set to 0
          : item.quantityOrdered; // Otherwise mark as fully picked

      // Update via API
      const updatedList = await updatePickingListItemQuantity(
        pickingList.id,
        itemId,
        newPickedQuantity
      );

      // Update local state with updated list from API
      if (updatedList) {
        // Cast to our type
        const updatedListWithItems =
          updatedList as unknown as PickingListWithItems;
        setPickingList(updatedListWithItems);

        if (updatedListWithItems.items) {
          setPickingItems(updatedListWithItems.items);
          setCompletedItems(
            updatedListWithItems.items
              .filter((item) => item.quantityPicked >= item.quantityOrdered)
              .map((item) => item.id)
          );
        }
      }
    } catch (err) {
      console.error('Error updating picking list item:', err);
      setError('Failed to update item. Please try again.');
    }
  };

  // Handle completing the entire picking list
  const handleCompletePickingList = async () => {
    if (!pickingList) return;

    try {
      // Mark the picking list as complete via API
      const completedList = await markPickingListComplete(pickingList.id);

      // Update the UI with the completed list (cast to our type)
      setPickingList(completedList as unknown as PickingListWithItems);

      // Show success message and navigate away
      setTimeout(() => {
        navigate('/picking-lists');
      }, 1500);
    } catch (err) {
      console.error('Error completing picking list:', err);
      setError('Failed to complete picking list. Please try again.');
    }
  };

  // Handle creating a new picking list
  const handleCreatePickingList = async (formData: any) => {
    try {
      setLoading(true);

      // Create picking list with only the properties expected by the API
      const newPickingListData = {
        projectId: formData.projectId,
        status: PickingListStatus.PENDING as any, // Type assertion to bypass enum conflict
        notes: formData.notes || '',
      };

      const newPickingList = await createPickingList(newPickingListData);

      // Navigate to the new picking list
      navigate(`/picking-lists/${newPickingList.id}`);
    } catch (err) {
      console.error('Error creating picking list:', err);
      setError('Failed to create picking list. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Determine what to render based on the route
  const renderRoutes = () => {
    return (
      <Routes>
        <Route path='/' element={<PickingListManagement />} />
        <Route
          path='/new'
          element={
            <div>
              <h1 className='text-2xl font-bold mb-6'>Create Picking List</h1>
              {/* Create form would go here */}
              <div className='bg-white shadow-sm rounded-lg p-6'>
                <p className='text-center text-gray-500 italic'>
                  Picking list creation form to be implemented here
                </p>
                <div className='flex justify-end mt-6'>
                  <button
                    onClick={() => navigate('/picking-lists')}
                    className='px-4 py-2 border border-gray-300 text-gray-700 rounded-md mr-2'
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() =>
                      handleCreatePickingList({
                        projectId: 'sample-project-id',
                        items: [],
                        notes: 'Sample picking list',
                      })
                    }
                    className='px-4 py-2 bg-indigo-600 text-white rounded-md'
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          }
        />
        <Route
          path='/:id'
          element={
            loading ? (
              <div className='flex justify-center items-center h-64'>
                <LoadingSpinner
                  size='medium'
                  color='amber'
                  message='Loading picking list...'
                />
              </div>
            ) : error ? (
              <ErrorMessage message={error} />
            ) : pickingList ? (
              <div>
                <div className='flex justify-between items-center mb-6'>
                  <div>
                    <h1 className='text-2xl font-bold'>
                      Picking List {pickingList.id.substring(0, 8)}
                    </h1>
                    {pickingList.notes && (
                      <p className='text-sm text-gray-500 mt-1'>
                        {pickingList.notes}
                      </p>
                    )}
                  </div>
                  <div className='flex space-x-3'>
                    <button
                      onClick={() => navigate('/picking-lists')}
                      className='px-4 py-2 border border-gray-300 text-gray-700 rounded-md'
                    >
                      Back to List
                    </button>
                    <button
                      onClick={handleCompletePickingList}
                      className='px-4 py-2 bg-green-600 text-white rounded-md'
                      disabled={
                        pickingList.status === PickingListStatus.COMPLETED
                      }
                    >
                      Complete List
                    </button>
                  </div>
                </div>

                <div className='bg-white shadow-sm rounded-lg'>
                  {/* Status and info */}
                  <div className='p-4 border-b border-gray-200'>
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                      <div>
                        <span className='text-sm text-gray-500'>Status</span>
                        <div className='mt-1'>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              pickingList.status === PickingListStatus.COMPLETED
                                ? 'bg-green-100 text-green-800'
                                : pickingList.status ===
                                  PickingListStatus.IN_PROGRESS
                                ? 'bg-blue-100 text-blue-800'
                                : pickingList.status ===
                                  PickingListStatus.CANCELLED
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {pickingList.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className='text-sm text-gray-500'>Created</span>
                        <div className='mt-1 text-sm font-medium'>
                          {new Date(pickingList.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <span className='text-sm text-gray-500'>
                          Assigned To
                        </span>
                        <div className='mt-1 text-sm font-medium'>
                          {pickingList.assignedTo
                            ? pickingList.assignedTo
                            : 'Unassigned'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Items section */}
                  <div className='p-4'>
                    <h3 className='text-lg font-medium mb-4'>Items</h3>
                    {pickingItems.length > 0 ? (
                      <div className='space-y-4'>
                        {pickingItems.map((item) => (
                          <div
                            key={item.id}
                            className='flex items-center p-3 border border-gray-200 rounded-md'
                          >
                            <input
                              type='checkbox'
                              checked={
                                item.quantityPicked >= item.quantityOrdered
                              }
                              onChange={() => handleItemToggle(item.id)}
                              disabled={
                                pickingList.status ===
                                PickingListStatus.COMPLETED
                              }
                              className='h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded'
                            />
                            <div className='ml-3 flex-1'>
                              <div className='flex justify-between'>
                                <div>
                                  <p className='text-sm font-medium text-gray-900'>
                                    {item.materialId
                                      ? `Material #${item.materialId}`
                                      : 'Item'}
                                    {item.componentId
                                      ? ` (Component #${item.componentId})`
                                      : ''}
                                  </p>
                                  <p className='text-xs text-gray-500'>
                                    {item.notes}
                                  </p>
                                </div>
                                <div className='text-sm'>
                                  <span
                                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                                    ${
                                      item.quantityPicked >=
                                      item.quantityOrdered
                                        ? 'bg-green-100 text-green-800'
                                        : item.quantityPicked > 0
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-gray-100 text-gray-800'
                                    }`}
                                  >
                                    {item.quantityPicked} /{' '}
                                    {item.quantityOrdered}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className='text-center py-8'>
                        <p className='text-gray-500'>
                          No items in this picking list
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Progress summary */}
                  <div className='border-t border-gray-200 p-4'>
                    <div className='flex justify-between items-center'>
                      <div>
                        <p className='text-sm font-medium text-gray-700'>
                          Progress:{' '}
                          {pickingItems.length > 0
                            ? Math.round(
                                (completedItems.length / pickingItems.length) *
                                  100
                              )
                            : 0}
                          %
                        </p>
                        <div className='w-64 bg-gray-200 rounded-full h-2.5 mt-2'>
                          <div
                            className='bg-blue-600 h-2.5 rounded-full'
                            style={{
                              width: `${
                                pickingItems.length > 0
                                  ? (completedItems.length /
                                      pickingItems.length) *
                                    100
                                  : 0
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <p className='text-sm text-gray-500'>
                          {completedItems.length} of {pickingItems.length} items
                          picked
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div>Picking list not found</div>
            )
          }
        />
      </Routes>
    );
  };

  return <div className='container mx-auto px-4 py-6'>{renderRoutes()}</div>;
};

export default PickingListPages;
