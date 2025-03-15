import { StorageLocation } from '@types';
import React from 'react';

interface StorageGridProps {
  storageLocation: StorageLocation;
  items: any[];
  onSelectItem: (item: any) => void;
}

const StorageGrid: React.FC<StorageGridProps> = ({
  storageLocation,
  items,
  onSelectItem,
}) => {
  const { width, height } = storageLocation.dimensions;

  // Helper function to get cell color based on item category and status
  const getCellColor = (item: any) => {
    if (!item) return 'bg-stone-100 border-stone-200';

    if (item.status === 'OUT_OF_STOCK') {
      return 'bg-red-100 border-red-300';
    } else if (item.status === 'LOW_STOCK') {
      return 'bg-amber-100 border-amber-300';
    } else {
      switch (item.category) {
        case 'leather':
          return 'bg-amber-50 border-amber-200';
        case 'hardware':
          return 'bg-blue-50 border-blue-200';
        case 'supplies':
          return 'bg-green-50 border-green-200';
        default:
          return 'bg-stone-100 border-stone-200';
      }
    }
  };

  // Get item at position
  const getItemAtPosition = (x: number, y: number) => {
    return items.find(
      (item) => item.position && item.position.x === x && item.position.y === y
    );
  };

  return (
    <div className='border border-stone-300 rounded-lg overflow-hidden'>
      <div
        className='grid'
        style={{
          gridTemplateColumns: `repeat(${width}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${height}, 60px)`,
        }}
      >
        {/* Generate grid cells */}
        {Array.from({ length: width * height }).map((_, index) => {
          const x = index % width;
          const y = Math.floor(index / width);
          const item = getItemAtPosition(x, y);

          return (
            <div
              key={`cell-${index}`}
              className={`border ${getCellColor(
                item
              )} hover:bg-opacity-80 cursor-pointer flex items-center justify-center transition-colors`}
              onClick={() => item && onSelectItem(item)}
            >
              {item && (
                <div className='text-xs text-center p-1 truncate w-full'>
                  <div className='font-medium truncate'>{item.name}</div>
                  <div className='text-stone-500 truncate'>
                    {item.quantity} {item.unit}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StorageGrid;
