import React from 'react';

interface InventoryStorageViewProps {
  products: any[];
}

const InventoryStorageView: React.FC<InventoryStorageViewProps> = ({
  products,
}) => {
  // Reorganize products by storage location
  const getLocationMap = () => {
    const locationMap: Record<string, any[]> = {};

    products.forEach((product) => {
      const location = product.storageLocation;
      if (!locationMap[location]) {
        locationMap[location] = [];
      }
      locationMap[location].push(product);
    });

    return locationMap;
  };

  const locationMap = getLocationMap();
  const locations = Object.keys(locationMap).sort();

  // Extract location type from location string (e.g., "Cabinet A-2" -> "Cabinet")
  const getLocationType = (location: string) => {
    const parts = location.split(' ');
    return parts[0];
  };

  // Extract location ID from location string (e.g., "Cabinet A-2" -> "A-2")
  const getLocationId = (location: string) => {
    const parts = location.split(' ');
    return parts[1] || '';
  };

  // Group locations by type
  const getLocationsByType = () => {
    const typeMap: Record<string, string[]> = {};

    locations.forEach((location) => {
      const type = getLocationType(location);
      if (!typeMap[type]) {
        typeMap[type] = [];
      }
      typeMap[type].push(location);
    });

    return typeMap;
  };

  const locationsByType = getLocationsByType();
  const locationTypes = Object.keys(locationsByType).sort();

  if (products.length === 0) {
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
                d='M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4'
              />
            </svg>
          </div>
          <h3 className='text-lg font-medium text-stone-700 mb-2'>
            No Products Found
          </h3>
          <p className='text-stone-500 max-w-md mb-6'>
            Try adjusting your filters or add new products to your inventory.
          </p>
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
            Add New Product
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white rounded-lg shadow-sm border border-stone-200 p-6'>
      <div className='mb-6'>
        <h3 className='text-lg font-medium text-stone-800 mb-2'>
          Storage Location Map
        </h3>
        <p className='text-sm text-stone-600'>
          Visual representation of product storage locations
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {locationTypes.map((locationType) => (
          <div key={locationType}>
            <h4 className='text-sm font-medium text-stone-700 mb-3'>
              {locationType} Storage
            </h4>
            <div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
              {locationsByType[locationType].map((location) => {
                const locationProducts = locationMap[location];
                const totalItems = locationProducts.length;
                const lowStockItems = locationProducts.filter(
                  (p) => p.status === 'LOW_STOCK'
                ).length;
                const outOfStockItems = locationProducts.filter(
                  (p) => p.status === 'OUT_OF_STOCK'
                ).length;

                return (
                  <div
                    key={location}
                    className='p-4 rounded-md border border-amber-300 bg-amber-50 hover:shadow-sm transition-shadow cursor-pointer'
                  >
                    <div className='text-sm font-medium text-stone-700'>
                      {location}
                    </div>
                    <div className='text-lg font-medium mt-1 text-amber-800'>
                      {totalItems} items
                    </div>

                    {totalItems > 0 && (
                      <div className='mt-2'>
                        <div className='flex justify-between text-xs mb-1'>
                          <span className='text-stone-500'>
                            Space Utilization
                          </span>
                          <span className='text-amber-700'>
                            {Math.min(100, Math.round((totalItems / 10) * 100))}
                            %
                          </span>
                        </div>
                        <div className='w-full h-2 bg-stone-100 rounded-full'>
                          <div
                            className='h-full bg-amber-500 rounded-full'
                            style={{
                              width: `${Math.min(
                                100,
                                (totalItems / 10) * 100
                              )}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {lowStockItems > 0 && (
                      <div className='mt-2 text-xs text-amber-600 flex items-center'>
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          className='h-4 w-4 mr-1'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
                          />
                        </svg>
                        {lowStockItems} low stock
                      </div>
                    )}

                    {outOfStockItems > 0 && (
                      <div className='mt-1 text-xs text-red-600 flex items-center'>
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          className='h-4 w-4 mr-1'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'
                          />
                        </svg>
                        {outOfStockItems} out of stock
                      </div>
                    )}

                    <div className='mt-3 border-t border-amber-200 pt-2'>
                      <div className='flex flex-wrap gap-1'>
                        {locationProducts.slice(0, 3).map((product, idx) => (
                          <div
                            key={idx}
                            className='text-xs bg-white px-1.5 py-0.5 rounded border border-amber-200 truncate max-w-full'
                          >
                            {product.name.substring(0, 15)}
                            {product.name.length > 15 ? '...' : ''}
                          </div>
                        ))}
                        {locationProducts.length > 3 && (
                          <div className='text-xs bg-amber-100 px-1.5 py-0.5 rounded border border-amber-200'>
                            +{locationProducts.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className='mt-8 p-4 border border-stone-200 rounded-md bg-stone-50'>
        <h4 className='text-sm font-medium text-stone-700 mb-2'>
          Storage Legend
        </h4>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div className='flex items-center'>
            <div className='w-4 h-4 rounded-md bg-amber-50 border border-amber-300 mr-2'></div>
            <span className='text-sm text-stone-600'>Products Present</span>
          </div>
          <div className='flex items-center'>
            <div className='w-4 h-4 rounded-md bg-stone-50 border border-stone-300 mr-2'></div>
            <span className='text-sm text-stone-600'>Empty Location</span>
          </div>
          <div className='flex items-center'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-4 w-4 text-amber-600 mr-2'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
              />
            </svg>
            <span className='text-sm text-stone-600'>Low Stock Items</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryStorageView;
