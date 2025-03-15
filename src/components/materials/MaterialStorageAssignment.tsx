// src/components/materials/MaterialStorageAssignment.tsx
import { useStorage } from '@/context/StorageContext';
import { Material } from '@/types/models';
import { StorageCell, StorageLocation } from '@types';
import React, { useEffect, useState } from 'react';
import { StorageMoveRequest } from '../../types/storage';

interface MaterialStorageAssignmentProps {
  material: Material;
  onClose: () => void;
  onAssigned: () => void;
}

const MaterialStorageAssignment: React.FC<MaterialStorageAssignmentProps> = ({
  material,
  onClose,
  onAssigned,
}) => {
  const { storageLocations, storageCells, fetchStorageCells, moveItem } =
    useStorage();

  const [selectedLocation, setSelectedLocation] =
    useState<StorageLocation | null>(null);
  const [selectedCell, setSelectedCell] = useState<StorageCell | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Current storage info
  const [currentStorage, setCurrentStorage] = useState<{
    locationId: string;
    position: { x: number; y: number; z?: number };
  } | null>(null);

  // Filter for locations that have available space
  const availableLocations = storageLocations.filter(
    (location) => location.utilized < location.capacity
  );

  // Load the current storage information if the material is already stored
  useEffect(() => {
    const loadCurrentStorage = async () => {
      try {
        // This would be a backend call in a real app
        // Here we just search through all cells to find our material
        for (const location of storageLocations) {
          await fetchStorageCells(location.id);
          const materialCell = storageCells.find(
            (cell) =>
              cell.itemId === material.id &&
              cell.itemType === material.materialType.toLowerCase()
          );

          if (materialCell) {
            setCurrentStorage({
              locationId: materialCell.storageId,
              position: materialCell.position,
            });
            break;
          }
        }
      } catch (err) {
        console.error('Error loading current storage:', err);
      }
    };

    loadCurrentStorage();
  }, [material, storageLocations, storageCells, fetchStorageCells]);

  // Load cells for the selected location
  useEffect(() => {
    if (selectedLocation) {
      const loadCells = async () => {
        setLoading(true);
        try {
          await fetchStorageCells(selectedLocation.id);
        } catch (err) {
          console.error('Error loading cells:', err);
          setError('Failed to load storage cells');
        } finally {
          setLoading(false);
        }
      };

      loadCells();
    }
  }, [selectedLocation, fetchStorageCells]);

  // Get available cells for the selected location
  const getAvailableCells = (): StorageCell[] => {
    if (!selectedLocation) return [];

    return storageCells.filter(
      (cell) => cell.storageId === selectedLocation.id && !cell.occupied
    );
  };

  // Format cell position for display
  const formatPosition = (position: {
    x: number;
    y: number;
    z?: number;
  }): string => {
    return position.z !== undefined
      ? `(${position.x}, ${position.y}, ${position.z})`
      : `(${position.x}, ${position.y})`;
  };

  // Handle cell selection
  const handleCellSelect = (cell: StorageCell) => {
    setSelectedCell(cell);
  };

  // Handle submit - move the item to the selected location
  const handleSubmit = async () => {
    if (!selectedLocation || !selectedCell) {
      setError('Please select a storage location and cell');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const moveRequest: Omit<
        StorageMoveRequest,
        'id' | 'requestDate' | 'requestedBy'
      > = {
        itemId: material.id,
        itemType: material.materialType.toLowerCase(),
        quantity: 1, // Assuming one unit being moved
        fromStorageId: currentStorage?.locationId || '',
        fromPosition: currentStorage?.position || { x: 0, y: 0 },
        toStorageId: selectedCell.storageId,
        toPosition: selectedCell.position,
        completedDate: new Date().toISOString(),
        completedBy: 'Current User', // In a real app, this would be the current user
        notes: `Moved ${material.name} to ${selectedLocation.name}`,
        status: 'completed', // Use string literal for status that matches expected value
      };

      await moveItem(moveRequest);
      onAssigned();
      onClose();
    } catch (err) {
      console.error('Error moving item:', err);
      setError('Failed to move the item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='bg-white rounded-lg shadow-lg overflow-hidden max-w-2xl mx-auto'>
      <div className='px-6 py-4 bg-stone-50 border-b border-stone-200 flex justify-between items-center'>
        <h3 className='text-lg font-medium text-stone-800'>
          Assign Storage Location
        </h3>
        <button
          className='text-stone-500 hover:text-stone-700'
          onClick={onClose}
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
              d='M6 18L18 6M6 6l12 12'
            />
          </svg>
        </button>
      </div>

      <div className='p-6'>
        {/* Material Info */}
        <div className='mb-6 flex items-start'>
          <div className='h-16 w-16 bg-amber-100 rounded-md flex items-center justify-center text-amber-700 mr-4'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-8 w-8'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'
              />
            </svg>
          </div>
          <div>
            <h4 className='font-medium text-stone-800 text-lg'>
              {material.name}
            </h4>
            <p className='text-stone-500'>
              ID: {material.id} • {material.materialType}
            </p>
            {currentStorage && (
              <p className='text-stone-500 mt-1'>
                Currently stored at:{' '}
                {storageLocations.find(
                  (loc) => loc.id === currentStorage.locationId
                )?.name || 'Unknown'}{' '}
                {formatPosition(currentStorage.position)}
              </p>
            )}
          </div>
        </div>

        {/* Current vs New Location */}
        <div className='mb-6 bg-stone-50 border border-stone-200 rounded-lg p-4'>
          <h5 className='font-medium text-stone-700 mb-3'>
            Storage Assignment
          </h5>

          {currentStorage ? (
            <div className='flex items-center justify-center mb-4'>
              <div className='flex-1 text-center'>
                <div className='text-sm text-stone-500'>Current Location</div>
                <div className='font-medium text-stone-700'>
                  {storageLocations.find(
                    (loc) => loc.id === currentStorage.locationId
                  )?.name || 'None'}
                </div>
                <div className='text-xs text-stone-500'>
                  {formatPosition(currentStorage.position)}
                </div>
              </div>

              <div className='px-4'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-6 w-6 text-amber-600'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M14 5l7 7m0 0l-7 7m7-7H3'
                  />
                </svg>
              </div>

              <div className='flex-1 text-center'>
                <div className='text-sm text-stone-500'>New Location</div>
                <div className='font-medium text-stone-700'>
                  {selectedLocation
                    ? selectedLocation.name
                    : 'Select a location'}
                </div>
                <div className='text-xs text-stone-500'>
                  {selectedCell
                    ? formatPosition(selectedCell.position)
                    : 'Select a cell'}
                </div>
              </div>
            </div>
          ) : (
            <div className='mb-4 text-center text-stone-600'>
              This material is not currently assigned to any storage location.
            </div>
          )}
        </div>

        {/* Location Selection */}
        <div className='mb-6'>
          <label className='block text-sm font-medium text-stone-700 mb-2'>
            Select Storage Location
          </label>

          {availableLocations.length === 0 ? (
            <div className='text-center py-4 bg-red-50 rounded-md text-red-600'>
              No storage locations with available space found.
            </div>
          ) : (
            <div className='grid grid-cols-2 gap-2 max-h-40 overflow-y-auto'>
              {availableLocations.map((location) => (
                <button
                  key={location.id}
                  type='button'
                  onClick={() => setSelectedLocation(location)}
                  className={`p-2 border rounded-md text-left ${
                    selectedLocation?.id === location.id
                      ? 'border-amber-500 bg-amber-50 text-amber-700'
                      : 'border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <div className='text-sm font-medium truncate'>
                    {location.name}
                  </div>
                  <div className='text-xs text-stone-500'>
                    {location.utilized}/{location.capacity} • {location.type}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Cell Selection */}
        {selectedLocation && (
          <div className='mb-6'>
            <label className='block text-sm font-medium text-stone-700 mb-2'>
              Select Storage Cell
            </label>

            {loading ? (
              <div className='text-center py-4'>
                <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-amber-600 mx-auto'></div>
                <p className='mt-2 text-stone-500'>Loading cells...</p>
              </div>
            ) : (
              <>
                {getAvailableCells().length === 0 ? (
                  <div className='text-center py-4 bg-red-50 rounded-md text-red-600'>
                    No available cells in this location.
                  </div>
                ) : (
                  <div className='border border-stone-200 rounded-lg p-4'>
                    <div
                      className='grid'
                      style={{
                        gridTemplateColumns: `repeat(${selectedLocation.dimensions.width}, minmax(0, 1fr))`,
                        gridTemplateRows: `repeat(${selectedLocation.dimensions.height}, 40px)`,
                        gap: '4px',
                      }}
                    >
                      {Array.from({
                        length:
                          selectedLocation.dimensions.width *
                          selectedLocation.dimensions.height,
                      }).map((_, index) => {
                        const x = index % selectedLocation.dimensions.width;
                        const y = Math.floor(
                          index / selectedLocation.dimensions.width
                        );

                        // Find cell for this position
                        const cell = storageCells.find(
                          (cell) =>
                            cell.storageId === selectedLocation.id &&
                            cell.position.x === x &&
                            cell.position.y === y
                        );

                        // Skip occupied cells
                        if (cell && cell.occupied) {
                          return (
                            <div
                              key={`cell-${index}`}
                              className='bg-stone-200 rounded flex items-center justify-center text-xs text-stone-500'
                            >
                              Occupied
                            </div>
                          );
                        }

                        // For empty/available cells
                        return (
                          <button
                            key={`cell-${index}`}
                            type='button'
                            onClick={() => cell && handleCellSelect(cell)}
                            className={`rounded border ${
                              selectedCell &&
                              selectedCell.position.x === x &&
                              selectedCell.position.y === y
                                ? 'border-amber-500 bg-amber-100 text-amber-800'
                                : 'border-stone-300 bg-stone-50 hover:bg-stone-100'
                            } flex items-center justify-center text-xs font-medium`}
                          >
                            {x},{y}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {error && (
          <div className='mb-6 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600'>
            {error}
          </div>
        )}

        <div className='flex justify-end space-x-3'>
          <button
            type='button'
            onClick={onClose}
            className='px-4 py-2 border border-stone-300 text-stone-700 rounded-md text-sm font-medium hover:bg-stone-50'
          >
            Cancel
          </button>
          <button
            type='button'
            onClick={handleSubmit}
            disabled={loading || !selectedLocation || !selectedCell}
            className='px-4 py-2 bg-amber-600 text-white rounded-md text-sm font-medium hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {loading ? (
              <span className='flex items-center'>
                <svg
                  className='animate-spin -ml-1 mr-2 h-4 w-4 text-white'
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
                Processing...
              </span>
            ) : currentStorage ? (
              'Move to New Location'
            ) : (
              'Assign to Location'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MaterialStorageAssignment;
