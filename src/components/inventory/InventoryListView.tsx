import React, { useState } from 'react';
import InventoryDetailModal from './InventoryDetailModal';

interface InventoryListViewProps {
  products: any[];
  onAddProduct?: () => void;
}

const InventoryListView: React.FC<InventoryListViewProps> = ({
  products,
  onAddProduct,
}) => {
  const [detailViewProduct, setDetailViewProduct] = useState<any | null>(null);

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
          {onAddProduct && (
            <button
              onClick={onAddProduct}
              className='bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center'
            >
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
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className='bg-white shadow-sm rounded-lg border border-stone-200 overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-stone-200'>
            <thead className='bg-stone-50'>
              <tr>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
                >
                  Product
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
                >
                  SKU / Type
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
                >
                  Status
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
                >
                  Quantity
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
                >
                  Location
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
                >
                  Price
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
                >
                  Cost / Margin
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
                >
                  Pattern
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-right text-xs font-medium text-stone-500 uppercase tracking-wider'
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-stone-200'>
              {products.map((product) => (
                <tr key={product.id} className='hover:bg-stone-50'>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='flex items-center'>
                      <div className='h-10 w-10 flex-shrink-0'>
                        <img
                          className='h-10 w-10 rounded-md object-cover'
                          src={product.thumbnail}
                          alt=''
                        />
                      </div>
                      <div className='ml-4'>
                        <div className='text-sm font-medium text-stone-900'>
                          {product.name}
                        </div>
                        <div className='text-xs text-stone-500'>
                          {product.dimensions}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='text-sm text-stone-900'>{product.sku}</div>
                    <div className='text-xs text-stone-500'>
                      {formatProductType(product.productType)}
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${getStatusColor(
                        product.status
                      )}`}
                    >
                      {product.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='text-sm text-stone-900'>
                      {product.quantity}
                    </div>
                    <div className='text-xs text-stone-500'>
                      Reorder at {product.reorderPoint}
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='text-sm text-stone-900'>
                      {product.storageLocation}
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='text-sm text-stone-900'>
                      ${product.sellingPrice.toFixed(2)}
                    </div>
                    <div className='text-xs text-stone-500'>
                      Last sold: {product.lastSold || 'Never'}
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='text-sm text-stone-900'>
                      ${product.totalCost.toFixed(2)}
                    </div>
                    <div
                      className={`text-xs ${
                        product.profitMargin > 40
                          ? 'text-green-600'
                          : product.profitMargin > 30
                          ? 'text-amber-600'
                          : 'text-red-600'
                      }`}
                    >
                      {product.profitMargin.toFixed(1)}% margin
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='text-sm text-stone-900'>
                      {product.patternName}
                    </div>
                    <div className='text-xs text-stone-500'>
                      {product.projectId ? 'Custom Order' : 'Standard'}
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                    <div className='flex space-x-2 justify-end'>
                      <button
                        onClick={() => setDetailViewProduct(product)}
                        className='text-amber-600 hover:text-amber-900'
                        title='View Details'
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
                            d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                          />
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                          />
                        </svg>
                      </button>
                      <button
                        className='text-stone-600 hover:text-stone-900'
                        title='Adjust Stock'
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
                            d='M12 6v6m0 0v6m0-6h6m-6 0H6'
                          />
                        </svg>
                      </button>
                      <button
                        className='text-stone-600 hover:text-stone-900'
                        title='Edit Product'
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
                            d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                          />
                        </svg>
                      </button>
                      <button
                        className='text-stone-600 hover:text-stone-900'
                        title='More Options'
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
                            d='M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z'
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {detailViewProduct && (
        <InventoryDetailModal
          product={detailViewProduct}
          onClose={() => setDetailViewProduct(null)}
        />
      )}
    </>
  );
};

export default InventoryListView;
