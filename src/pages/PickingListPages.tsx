import React, { useContext, useEffect, useState } from 'react';
import { Route, Routes, useNavigate, useParams } from 'react-router-dom';
import PickingListManagement from '../components/projects/PickingListManagement';
import PickingListContext from '../context/PickingListContext';
import {
  PickingList,
  PickingListItem,
  PickingListStatus,
} from '../types/pickinglist';

// Define the extended type to match the context implementation
type PickingListWithItems = PickingList & {
  items?: PickingListItem[];
};

const PickingListPages: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(true);
  const [pickingList, setPickingList] = useState<PickingListWithItems | null>(
    null
  );
  const [pickingItems, setPickingItems] = useState<PickingListItem[]>([]);
  const [completedItems, setCompletedItems] = useState<string[]>([]);

  const pickingListContext = useContext(PickingListContext);

  useEffect(() => {
    if (!pickingListContext) {
      console.error('Picking List Context not available');
      return;
    }

    const loadData = async () => {
      setLoading(true);

      try {
        if (id && id !== 'new') {
          // Get the picking list
          const fetchedList = pickingListContext.getPickingListById(id);
          if (fetchedList) {
            // Save the basic list data
            setPickingList(fetchedList as PickingListWithItems);

            // Get items if they exist (using the type assertion pattern from your context)
            const listWithItems = fetchedList as PickingListWithItems;
            if (listWithItems.items) {
              setPickingItems(listWithItems.items);

              // Initialize completed items
              const completed = listWithItems.items
                .filter((item) => item.status === 'complete')
                .map((item) => item.id);
              setCompletedItems(completed);
            } else {
              // Handle the case where items might need to be loaded separately
              setPickingItems([]);
              setCompletedItems([]);
            }
          } else {
            console.error(`Picking list with ID ${id} not found`);
            navigate('/picking-lists');
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, pickingListContext, navigate]);

  if (!pickingListContext) {
    return <div>Error: Picking List Context not available</div>;
  }

  // Handle toggling item completion
  const handleItemToggle = (itemId: string) => {
    // Find the item to update
    const item = pickingItems.find((item) => item.id === itemId);
    if (!item || !pickingList) return;

    // Update completed items state
    setCompletedItems((prev) => {
      if (prev.includes(itemId)) {
        return prev.filter((id) => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });

    // Determine new status with correct typing
    const newStatus =
      item.status === 'complete' ? ('pending' as const) : ('complete' as const);
    const newPickedQuantity = newStatus === 'complete' ? item.quantity : 0;

    // Create updated items array with proper typing
    const updatedItems = pickingItems.map((i) =>
      i.id === itemId
        ? { ...i, status: newStatus, pickedQuantity: newPickedQuantity }
        : i
    );

    // Update local state
    setPickingItems(updatedItems);

    // Since 'items' isn't in the PickingList type, we need a different approach
    try {
      // For now, we'll just update the picking list status if all items are complete
      const allComplete = updatedItems.every(
        (item) => item.status === 'complete'
      );
      if (allComplete) {
        pickingListContext.updatePickingList(pickingList.id, {
          status: PickingListStatus.COMPLETED,
        });
      }
    } catch (error) {
      console.error('Error toggling item status:', error);
    }
  };

  // Handle completing the entire picking list
  const handleCompletePickingList = async () => {
    if (!pickingList) return;

    try {
      // Use the markPickingListComplete method from your context
      await pickingListContext.markPickingListComplete(pickingList.id);
      navigate('/picking-lists');
    } catch (error) {
      console.error('Error completing picking list:', error);
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
            </div>
          }
        />
        <Route
          path='/:id'
          element={
            loading ? (
              <div className='flex justify-center items-center h-64'>
                <div className='spinner'></div>
              </div>
            ) : pickingList ? (
              <div>
                <div className='flex justify-between items-center mb-6'>
                  <h1 className='text-2xl font-bold'>
                    Picking List {pickingList.id.substring(0, 8)}
                    {pickingList.notes && (
                      <span className='text-sm ml-2 text-gray-500'>
                        ({pickingList.notes})
                      </span>
                    )}
                  </h1>
                  <div className='flex space-x-3'>
                    <button
                      onClick={handleCompletePickingList}
                      className='px-4 py-2 bg-green-600 text-white rounded'
                      disabled={
                        pickingList.status === PickingListStatus.COMPLETED
                      }
                    >
                      Complete List
                    </button>
                  </div>
                </div>

                <div className='bg-white shadow rounded p-4'>
                  <h3 className='text-lg font-medium mb-4'>Items</h3>
                  {pickingItems.length > 0 ? (
                    <ul className='space-y-2'>
                      {pickingItems.map((item: PickingListItem) => (
                        <li key={item.id} className='flex items-center'>
                          <input
                            type='checkbox'
                            checked={
                              item.status === 'complete' ||
                              completedItems.includes(item.id)
                            }
                            onChange={() => handleItemToggle(item.id)}
                            disabled={
                              pickingList.status === PickingListStatus.COMPLETED
                            }
                            className='mr-2'
                          />
                          <span>
                            {item.materialId} - Qty: {item.quantity}
                            <span className='ml-2 text-sm'>
                              (Picked: {item.pickedQuantity}/{item.quantity})
                            </span>
                            <span
                              className={`ml-2 text-xs px-2 py-1 rounded-full ${
                                item.status === 'complete'
                                  ? 'bg-green-100 text-green-800'
                                  : item.status === 'partial'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {item.status}
                            </span>
                            {item.notes && (
                              <span className='ml-2 text-sm text-gray-500'>
                                ({item.notes})
                              </span>
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className='text-gray-500'>
                      No items in this picking list.
                    </p>
                  )}
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
