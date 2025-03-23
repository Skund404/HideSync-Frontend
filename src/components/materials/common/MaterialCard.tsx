// src/components/materials/common/MaterialCard.tsx
import {
  isHardwareMaterial,
  isLeatherMaterial,
  isSuppliesMaterial,
  Material,
} from '@/types/materialTypes';
import {
  formatPrice,
  formatQuantity,
  formatType,
  getColorHex,
  getHardwareMaterialColor,
  getStatusColor,
  isLowStock,
} from '@/utils/materialHelpers';
import { Edit, Eye, MoreHorizontal, Plus, Trash2 } from 'lucide-react';
import React from 'react';

interface MaterialCardProps {
  material: Material;
  onView: (material: Material) => void;
  onAdjustStock: (material: Material) => void;
  onEdit?: (material: Material) => void;
  onDelete?: (material: Material) => void;
  isDeleting?: boolean;
}

const MaterialCard: React.FC<MaterialCardProps> = ({
  material,
  onView,
  onAdjustStock,
  onEdit,
  onDelete,
  isDeleting = false,
}) => {
  // Helper to safely get supplier info - supports both supplierId and potential supplier property
  const getSupplierDisplay = (material: Material): string => {
    // Try to access supplier property from material's "any" properties
    const supplierName = (material as any).supplier;

    // If supplier property exists, use it, otherwise use supplierId
    return supplierName || material.supplierId?.toString() || '-';
  };

  // Get general material color for hardware type
  const getDisplayPrice = (material: Material): string => {
    // Try to access price property from material's "any" properties
    const price = (material as any).price || material.sellPrice;
    return formatPrice(price);
  };

  // Get additional details based on material type
  const getAdditionalDetails = () => {
    if (isLeatherMaterial(material)) {
      return (
        <>
          <div>
            <span className='text-stone-500'>Thickness:</span>
            <span className='ml-1 text-stone-700'>
              {material.thickness ? `${material.thickness}mm` : '-'}
            </span>
          </div>
          {material.area && (
            <div>
              <span className='text-stone-500'>Area:</span>
              <span className='ml-1 text-stone-700'>{material.area} sqft</span>
            </div>
          )}
        </>
      );
    }

    if (isHardwareMaterial(material)) {
      return (
        <>
          <div>
            <span className='text-stone-500'>Size:</span>
            <span className='ml-1 text-stone-700'>{material.size || '-'}</span>
          </div>
        </>
      );
    }

    return null;
  };

  return (
    <div className='bg-white rounded-lg shadow-sm overflow-hidden border border-stone-200 hover:shadow-md transition-shadow'>
      <div className='relative h-40 bg-stone-200'>
        <img
          src={material.thumbnail || '/placeholder-image.png'}
          alt={material.name}
          className='w-full h-full object-cover'
        />
        <div className='absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/70 to-transparent'>
          <div className='flex justify-between'>
            <span
              className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(
                material.status
              )}`}
            >
              {material.status.replace(/_/g, ' ')}
            </span>
            {isLowStock(material) && (
              <span className='px-2 py-1 rounded-md text-xs font-medium bg-red-100 text-red-800'>
                Reorder Soon
              </span>
            )}
          </div>
        </div>
        {/* Color display section - start */}
        {isLeatherMaterial(material) && material.color && (
          <div className='absolute bottom-0 left-0 right-0 p-2 flex items-center bg-black/50'>
            <div
              className='w-4 h-4 rounded-full mr-2'
              style={{
                backgroundColor: getColorHex(material.color),
              }}
            ></div>
            <span className='text-xs text-white'>{material.color}</span>
          </div>
        )}
        {isSuppliesMaterial(material) && material.color && (
          <div className='absolute bottom-0 left-0 right-0 p-2 flex items-center bg-black/50'>
            <div
              className='w-4 h-4 rounded-full mr-2'
              style={{
                backgroundColor: getColorHex(material.color),
              }}
            ></div>
            <span className='text-xs text-white'>{material.color}</span>
          </div>
        )}
        {isHardwareMaterial(material) && (
          <div className='absolute bottom-0 left-0 right-0 p-2 flex items-center justify-between bg-black/50'>
            <div className='flex items-center'>
              <div
                className='w-4 h-4 rounded-full mr-2'
                style={{
                  backgroundColor: getHardwareMaterialColor(
                    material.hardwareMaterial
                  ),
                }}
              ></div>
              <span className='text-xs text-white'>
                {formatType(material.hardwareMaterial)}
              </span>
            </div>
            {material.finish && (
              <span className='text-xs text-white'>
                {formatType(material.finish)}
              </span>
            )}
          </div>
        )}
        {/* Color display section - end */}
      </div>
      <div className='p-4'>
        <div className='flex justify-between items-start mb-2'>
          <h3 className='font-medium text-stone-900 text-lg'>
            {material.name}
          </h3>
          <div className='flex'>
            {onEdit && (
              <button
                onClick={() => onEdit(material)}
                className='text-stone-400 hover:text-blue-600 p-1 mr-1'
              >
                <Edit className='h-5 w-5' />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(material)}
                disabled={isDeleting}
                className={`text-stone-400 hover:text-red-600 p-1 ${
                  isDeleting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Trash2 className='h-5 w-5' />
              </button>
            )}
            <button className='text-stone-400 hover:text-amber-600 p-1'>
              <MoreHorizontal className='h-5 w-5' />
            </button>
          </div>
        </div>
        <div className='text-sm text-stone-600 mb-3'>
          {formatType(material.materialType)}
          {isLeatherMaterial(material) &&
            material.subtype &&
            ` • ${formatType(material.subtype)}`}
          {isHardwareMaterial(material) &&
            material.subtype &&
            ` • ${formatType(material.subtype)}`}
        </div>
        <div className='grid grid-cols-2 gap-2 text-sm mb-3'>
          <div>
            <span className='text-stone-500'>Quantity:</span>
            <span className='ml-1 text-stone-700'>
              {formatQuantity(material.quantity, material.unit)}
            </span>
          </div>
          <div>
            <span className='text-stone-500'>Location:</span>
            <span className='ml-1 text-stone-700'>
              {material.storageLocation || 'Unassigned'}
            </span>
          </div>
          <div>
            <span className='text-stone-500'>Supplier:</span>
            <span className='ml-1 text-stone-700'>
              {getSupplierDisplay(material)}
            </span>
          </div>
          <div>
            <span className='text-stone-500'>Price:</span>
            <span className='ml-1 text-stone-700'>
              {getDisplayPrice(material)}
            </span>
          </div>
          {getAdditionalDetails()}
        </div>
        {material.notes && (
          <div className='text-xs text-stone-500 mb-3 italic'>
            {material.notes}
          </div>
        )}
        <div className='border-t border-stone-100 pt-3 flex justify-between'>
          <button
            onClick={() => onView(material)}
            className='text-sm text-amber-600 hover:text-amber-800 font-medium flex items-center'
          >
            <Eye className='h-4 w-4 mr-1' />
            View Details
          </button>
          <button
            onClick={() => onAdjustStock(material)}
            className='text-sm text-stone-600 hover:text-stone-800 font-medium flex items-center'
          >
            <Plus className='h-4 w-4 mr-1' />
            Adjust Stock
          </button>
        </div>
      </div>
    </div>
  );
};

export default MaterialCard;
