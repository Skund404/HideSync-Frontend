import React from 'react';

interface InventoryGridViewProps {
  products: any[];
}

const InventoryGridView: React.FC<InventoryGridViewProps> = ({ products }) => {
  // Helper function to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IN_STOCK':
        return 'bg-green-100 text-green-800';
      case 'LOW_STOCK':
        return 'bg-amber-100 text-amber-800';
      case 'OUT_OF_STOCK':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-stone-100 text-stone-800';
    }
  };

  // Format product type for display
  const formatProductType = (type: string) => {
    if (!type) return '';
    return type
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

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
                d='M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z'
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
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
      {products.map((product) => (
        <div
          key={product.id}
          className='bg-white rounded-lg shadow-sm overflow-hidden border border-stone-200 hover:shadow-md transition-shadow'
        >
          <div className='relative h-48 bg-stone-200'>
            <img
              src={product.thumbnail}
              alt={product.name}
              className='w-full h-full object-cover'
            />
            <div className='absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/70 to-transparent'>
              <div className='flex justify-between'>
                <span
                  className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(
                    product.status
                  )}`}
                >
                  {product.status.replace(/_/g, ' ')}
                </span>
                {product.quantity <= product.reorderPoint &&
                  product.status !== 'OUT_OF_STOCK' && (
                    <span className='px-2 py-1 rounded-md text-xs font-medium bg-red-100 text-red-800'>
                      Reorder Soon
                    </span>
                  )}
              </div>
            </div>
            {product.projectId && (
              <div className='absolute bottom-0 left-0 right-0 p-2 bg-purple-500/70'>
                <span className='text-xs text-white font-medium'>
                  Custom Order
                </span>
              </div>
            )}
          </div>
          <div className='p-4'>
            <div className='flex justify-between items-start mb-2'>
              <h3 className='font-medium text-stone-900 text-lg'>
                {product.name}
              </h3>
              <div className='flex'>
                <button className='text-stone-400 hover:text-amber-600 p-1'>
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
            </div>
            <div className='text-sm text-stone-600 mb-3'>
              <span className='inline-block bg-stone-100 rounded-md px-2 py-1 text-xs'>
                SKU: {product.sku}
              </span>
              <span className='inline-block bg-amber-100 rounded-md px-2 py-1 text-xs ml-2'>
                {formatProductType(product.productType)}
              </span>
            </div>
            <div className='grid grid-cols-2 gap-2 text-sm mb-3'>
              <div>
                <span className='text-stone-500'>Quantity:</span>
                <span className='ml-1 text-stone-700'>{product.quantity}</span>
              </div>
              <div>
                <span className='text-stone-500'>Location:</span>
                <span className='ml-1 text-stone-700'>
                  {product.storageLocation}
                </span>
              </div>
              <div>
                <span className='text-stone-500'>Price:</span>
                <span className='ml-1 text-stone-700'>
                  ${product.sellingPrice.toFixed(2)}
                </span>
              </div>
              <div>
                <span className='text-stone-500'>Margin:</span>
                <span className='ml-1 text-stone-700'>
                  {product.profitMargin.toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Progress bar for stock level */}
            <div className='mb-3'>
              <div className='flex justify-between text-xs mb-1'>
                <span className='text-stone-500'>Stock Level</span>
                <span
                  className={
                    product.quantity <= product.reorderPoint
                      ? 'text-red-600'
                      : 'text-stone-500'
                  }
                >
                  {product.quantity} / Reorder at {product.reorderPoint}
                </span>
              </div>
              <div className='w-full h-2 bg-stone-100 rounded-full'>
                <div
                  className={`h-full rounded-full ${
                    product.quantity === 0
                      ? 'bg-red-500'
                      : product.quantity <= product.reorderPoint
                      ? 'bg-amber-500'
                      : 'bg-green-500'
                  }`}
                  style={{
                    width: `${Math.min(
                      100,
                      (product.quantity /
                        Math.max(product.reorderPoint * 2, 1)) *
                        100
                    )}%`,
                  }}
                ></div>
              </div>
            </div>

            {product.notes && (
              <div className='text-xs text-stone-500 mb-3 italic'>
                {product.notes}
              </div>
            )}

            <div className='border-t border-stone-100 pt-3 flex justify-between'>
              <button className='text-sm text-amber-600 hover:text-amber-800 font-medium'>
                View Details
              </button>
              <button className='text-sm text-stone-600 hover:text-stone-800 font-medium flex items-center'>
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
                    d='M12 6v6m0 0v6m0-6h6m-6 0H6'
                  />
                </svg>
                Adjust Stock
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default InventoryGridView;
