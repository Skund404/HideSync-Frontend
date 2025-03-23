// src/components/inventory/InventoryDetailModal.tsx
import { X } from 'lucide-react';
import React from 'react';

// Helper function to format date
const formatDate = (dateString: string | Date | null) => {
  if (!dateString) return 'N/A';

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'Invalid Date';
  }
};

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

// Helper function to get margin color
const getMarginColor = (margin: number) => {
  if (margin >= 40) return 'text-green-600';
  if (margin >= 30) return 'text-amber-600';
  return 'text-red-600';
};

// Format product type for display
const formatProductType = (type: string) => {
  if (!type) return '';
  return type
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());
};

// Helper function to check if product contains leather material
const containsLeatherMaterial = (product: any) => {
  if (!product.materials || !Array.isArray(product.materials)) return false;

  const leatherKeywords = [
    'leather',
    'hide',
    'suede',
    'nubuck',
    'cordovan',
    'calfskin',
    'cowhide',
    'sheepskin',
    'goatskin',
    'deerskin',
    'pigskin',
  ];

  return product.materials.some((material: string) =>
    leatherKeywords.some((keyword) => material.toLowerCase().includes(keyword))
  );
};

interface InventoryDetailModalProps {
  product: any;
  onClose: () => void;
}

const InventoryDetailModal: React.FC<InventoryDetailModalProps> = ({
  product,
  onClose,
}) => {
  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-lg p-6 w-full max-w-4xl max-h-screen overflow-y-auto'>
        {/* Header */}
        <div className='flex justify-between items-start mb-6'>
          <div className='flex-grow'>
            <h2 className='text-xl font-bold text-stone-900 flex items-center'>
              {product.name}
              {product.projectId && (
                <span className='ml-2 px-2 py-1 bg-purple-100 text-purple-800 rounded-md text-xs'>
                  Custom Order
                </span>
              )}
            </h2>
            <p className='text-sm text-stone-500 mt-1'>
              {product.sku} • {formatProductType(product.productType)}
            </p>
          </div>
          <button
            onClick={onClose}
            className='text-stone-400 hover:text-stone-600'
          >
            <X className='h-6 w-6' />
          </button>
        </div>

        {/* Product Image and Summary */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-6'>
          {/* Product Image */}
          <div className='md:col-span-1 relative'>
            <div className='bg-stone-200 rounded-lg overflow-hidden'>
              <img
                src={product.thumbnail}
                alt={product.name}
                className='w-full h-64 object-cover'
              />
            </div>
            <div className='absolute top-0 left-0 p-2'>
              <span
                className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(
                  product.status
                )}`}
              >
                {product.status.replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          {/* Product Summary */}
          <div className='md:col-span-2 grid grid-cols-2 gap-4'>
            <div>
              <span className='text-stone-500 text-sm block'>Dimensions</span>
              <span className='text-stone-800'>{product.dimensions}</span>
            </div>
            <div>
              <span className='text-stone-500 text-sm block'>Pattern</span>
              <span className='text-stone-800'>
                {product.patternName || 'N/A'}
              </span>
            </div>
            <div>
              <span className='text-stone-500 text-sm block'>
                Storage Location
              </span>
              <span className='text-stone-800'>{product.storageLocation}</span>
            </div>
            <div>
              <span className='text-stone-500 text-sm block'>
                Reorder Point
              </span>
              <span className='text-stone-800'>{product.reorderPoint}</span>
            </div>
          </div>
        </div>

        {/* Financial Details */}
        <div className='bg-stone-50 border border-stone-200 rounded-lg p-4 mb-6 grid grid-cols-3 gap-4'>
          <div>
            <span className='text-stone-500 text-sm block'>Selling Price</span>
            <span className='text-stone-800 font-medium'>
              ${product.sellingPrice.toFixed(2)}
            </span>
          </div>
          <div>
            <span className='text-stone-500 text-sm block'>Total Cost</span>
            <span className='text-stone-800 font-medium'>
              ${product.totalCost.toFixed(2)}
            </span>
          </div>
          <div>
            <span className='text-stone-500 text-sm block'>Profit Margin</span>
            <span
              className={`font-medium ${getMarginColor(product.profitMargin)}`}
            >
              {product.profitMargin.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Detailed Cost Breakdown */}
        <div className='mb-6'>
          <h3 className='text-lg font-medium text-stone-800 mb-4'>
            Cost Breakdown
          </h3>
          <div className='grid grid-cols-3 gap-4'>
            <div>
              <span className='text-stone-500 text-sm block'>Materials</span>
              <span className='text-stone-800'>
                ${product.costBreakdown.materials.toFixed(2)}
              </span>
            </div>
            <div>
              <span className='text-stone-500 text-sm block'>Labor</span>
              <span className='text-stone-800'>
                ${product.costBreakdown.labor.toFixed(2)}
              </span>
            </div>
            <div>
              <span className='text-stone-500 text-sm block'>Overhead</span>
              <span className='text-stone-800'>
                ${product.costBreakdown.overhead.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Inventory and Sales Metrics */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div>
            <h3 className='text-lg font-medium text-stone-800 mb-4'>
              Inventory
            </h3>
            <div className='space-y-3'>
              <div>
                <span className='text-stone-500 text-sm block'>
                  Current Quantity
                </span>
                <span className='text-stone-800 font-medium'>
                  {product.quantity}{' '}
                  {containsLeatherMaterial(product)
                    ? product.unit || 'sq ft'
                    : product.unit || 'units'}
                </span>
              </div>
              <div>
                <div className='flex justify-between text-sm mb-1'>
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
              <div>
                <span className='text-stone-500 text-sm block'>Last Sold</span>
                <span className='text-stone-800'>
                  {formatDate(product.lastSold)}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className='text-lg font-medium text-stone-800 mb-4'>
              Additional Details
            </h3>
            {product.materials && product.materials.length > 0 && (
              <div className='mb-3'>
                <span className='text-stone-500 text-sm block'>Materials</span>
                <div className='flex flex-wrap gap-1 mt-1'>
                  {product.materials.map((material: string, index: number) => (
                    <span
                      key={index}
                      className='text-xs bg-stone-100 px-2 py-0.5 rounded'
                    >
                      {material}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {product.notes && (
              <div className='mb-3'>
                <span className='text-stone-500 text-sm block'>Notes</span>
                <span className='text-stone-800 italic'>{product.notes}</span>
              </div>
            )}
            <div>
              <span className='text-stone-500 text-sm block'>Created</span>
              <span className='text-stone-800'>
                {formatDate(product.dateAdded)}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className='flex justify-end mt-6 space-x-3'>
          <button
            onClick={onClose}
            className='px-4 py-2 bg-stone-100 text-stone-700 rounded-md hover:bg-stone-200'
          >
            Close
          </button>
          <button className='px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700'>
            Edit Product
          </button>
        </div>
      </div>
    </div>
  );
};

export default InventoryDetailModal;
