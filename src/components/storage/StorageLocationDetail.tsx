import { useStorage } from '@context/StorageContext';
import { Edit, MoveUpRight } from 'lucide-react';
import React from 'react';

interface StorageLocationDetailProps {
  item: any;
  onClose: () => void;
}

const StorageLocationDetail: React.FC<StorageLocationDetailProps> = ({
  item,
  onClose,
}) => {
  const { storageLocations } = useStorage();

  // Find the storage location for the item
  const getStorageLocation = () => {
    if (!item.storageId) return 'Unknown';
    const location = storageLocations.find((loc) => loc.id === item.storageId);
    return location ? location.name : 'Unknown';
  };

  return (
    <div className='bg-white rounded-lg shadow-lg border border-stone-200 overflow-hidden sticky top-6'>
      <div className='px-4 py-3 border-b border-stone-200 flex justify-between items-center'>
        <h3 className='font-medium text-stone-800'>Item Details</h3>
        <button
          className='text-sm text-stone-500 hover:text-stone-700'
          onClick={onClose}
        >
          Close
        </button>
      </div>
      <div className='p-4'>
        <div className='flex items-center mb-4'>
          <img
            src={item.image || '/api/placeholder/64/64'}
            alt={item.name}
            className='w-16 h-16 rounded-md mr-3 bg-stone-200 object-cover'
          />
          <div>
            <h4 className='font-medium text-stone-800'>{item.name}</h4>
            <p className='text-sm text-stone-500 capitalize'>
              {item.category}
              {item.subcategory && ` • ${item.subcategory.replace(/-/g, ' ')}`}
            </p>
          </div>
        </div>

        <div className='mb-4'>
          <div
            className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
              item.status === 'IN_STOCK'
                ? 'bg-green-100 text-green-800'
                : item.status === 'LOW_STOCK'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {item.status && item.status.replace(/_/g, ' ')}
          </div>
        </div>

        <div className='grid grid-cols-2 gap-3 mb-4'>
          <div>
            <h5 className='text-xs font-medium text-stone-500'>Quantity</h5>
            <p className='text-sm text-stone-800'>
              {item.quantity} {item.unit}
            </p>
          </div>
          <div>
            <h5 className='text-xs font-medium text-stone-500'>Location</h5>
            <p className='text-sm text-stone-800'>{getStorageLocation()}</p>
          </div>
          {item.color && (
            <div>
              <h5 className='text-xs font-medium text-stone-500'>Color</h5>
              <p className='text-sm text-stone-800'>{item.color}</p>
            </div>
          )}
          {item.thickness && (
            <div>
              <h5 className='text-xs font-medium text-stone-500'>Thickness</h5>
              <p className='text-sm text-stone-800'>{item.thickness}</p>
            </div>
          )}
          {item.size && (
            <div>
              <h5 className='text-xs font-medium text-stone-500'>Size</h5>
              <p className='text-sm text-stone-800'>{item.size}</p>
            </div>
          )}
          {item.supplier && (
            <div>
              <h5 className='text-xs font-medium text-stone-500'>Supplier</h5>
              <p className='text-sm text-stone-800'>{item.supplier}</p>
            </div>
          )}
          {item.lastUpdated && (
            <div>
              <h5 className='text-xs font-medium text-stone-500'>
                Last Updated
              </h5>
              <p className='text-sm text-stone-800'>{item.lastUpdated}</p>
            </div>
          )}
          {item.position && (
            <div>
              <h5 className='text-xs font-medium text-stone-500'>Position</h5>
              <p className='text-sm text-stone-800'>
                Row {item.position.y + 1}, Column {item.position.x + 1}
              </p>
            </div>
          )}
        </div>

        {item.tags && item.tags.length > 0 && (
          <div className='mb-4'>
            <h5 className='text-xs font-medium text-stone-500 mb-1'>Tags</h5>
            <div className='flex flex-wrap gap-1'>
              {item.tags.map((tag: string) => (
                <span
                  key={tag}
                  className='px-2 py-0.5 bg-stone-100 text-stone-800 rounded-full text-xs'
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {item.notes && (
          <div className='mb-4'>
            <h5 className='text-xs font-medium text-stone-500 mb-1'>Notes</h5>
            <p className='text-sm text-stone-700 p-2 bg-stone-50 rounded-md'>
              {item.notes}
            </p>
          </div>
        )}

        <div className='flex space-x-2 mt-6'>
          <button className='flex items-center justify-center bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-md text-sm font-medium flex-1'>
            <Edit className='h-4 w-4 mr-1' />
            Edit Item
          </button>
          <button className='flex items-center justify-center border border-stone-300 hover:bg-stone-50 text-stone-700 px-3 py-1.5 rounded-md text-sm font-medium flex-1'>
            <MoveUpRight className='h-4 w-4 mr-1' />
            Move Item
          </button>
        </div>
      </div>
    </div>
  );
};

export default StorageLocationDetail;
