// src/components/materials/common/MaterialDetailModal.tsx
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
} from '@/utils/materialHelpers';
import { X } from 'lucide-react';
import React from 'react';

interface MaterialDetailModalProps {
  material: Material;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isDeleting?: boolean;
}

const MaterialDetailModal: React.FC<MaterialDetailModalProps> = ({
  material,
  onClose,
  onEdit,
  onDelete,
  isDeleting = false,
}) => {
  // Helper to safely get supplier info - supports both supplierId and potential supplier property
  const getSupplierDisplay = (material: Material): string => {
    // Try to access supplier property from material's "any" properties
    const supplierName = (material as any).supplier;

    // If supplier property exists, use it, otherwise use supplierId
    return supplierName || material.supplierId?.toString() || 'Not specified';
  };

  // Helper to safely get lastPurchased property
  const getLastPurchased = (material: Material): string => {
    // Try to access lastPurchased property from material's "any" properties
    return (material as any).lastPurchased || 'Not recorded';
  };

  // Get material-specific details for display
  const getMaterialDetails = () => {
    // Common properties for all materials
    const details = [
      {
        label: 'ID',
        value: material.id.toString(),
      },
      {
        label: 'Status',
        value: formatType(material.status),
      },
      {
        label: 'Quantity',
        value: material.unit
          ? formatQuantity(material.quantity, material.unit)
          : `${material.quantity}`,
      },
      {
        label: 'Location',
        value: material.storageLocation || 'Not assigned',
      },
      {
        label: 'Supplier',
        value: getSupplierDisplay(material),
      },
      {
        label: 'SKU',
        value: material.sku || 'No SKU',
      },
      {
        label: 'Supplier SKU',
        value: material.supplierSku || 'No supplier SKU',
      },
      {
        label: 'Cost',
        value: material.costPrice
          ? formatPrice(material.costPrice)
          : 'Not specified',
      },
      {
        label: 'Price',
        value: material.sellPrice
          ? formatPrice(material.sellPrice)
          : 'Not specified',
      },
      {
        label: 'Reorder Point',
        value:
          material.reorderPoint !== undefined
            ? material.reorderPoint.toString()
            : 'Not set',
      },
      {
        label: 'Last Purchased',
        value: getLastPurchased(material),
      },
    ];

    // Material type specific properties
    if (isLeatherMaterial(material)) {
      return [
        ...details,
        {
          label: 'Leather Type',
          value: material.subtype
            ? formatType(material.subtype)
            : 'Not specified',
        },
        {
          label: 'Thickness',
          value: material.thickness
            ? `${material.thickness}mm`
            : 'Not specified',
        },
        {
          label: 'Animal Source',
          value: material.animalSource
            ? formatType(material.animalSource)
            : 'Not specified',
        },
        {
          label: 'Tannage',
          value: material.tannage
            ? formatType(material.tannage)
            : 'Not specified',
        },
        {
          label: 'Color',
          value: material.color || 'Not specified',
        },
        {
          label: 'Area',
          value: material.area ? `${material.area} sqft` : 'Not specified',
        },
      ];
    }

    if (isHardwareMaterial(material)) {
      return [
        ...details,
        {
          label: 'Hardware Type',
          value: material.subtype
            ? formatType(material.subtype)
            : 'Not specified',
        },
        {
          label: 'Material',
          value: material.hardwareMaterial
            ? formatType(material.hardwareMaterial)
            : 'Not specified',
        },
        {
          label: 'Finish',
          value: material.finish
            ? formatType(material.finish)
            : 'Not specified',
        },
        {
          label: 'Size',
          value: material.size || 'Not specified',
        },
      ];
    }

    if (isSuppliesMaterial(material)) {
      return [
        ...details,
        {
          label: 'Supplies Type',
          value: material.subtype
            ? formatType(material.subtype)
            : 'Not specified',
        },
        {
          label: 'Color',
          value: material.color || 'Not specified',
        },
        {
          label: 'Composition',
          value: material.composition || 'Not specified',
        },
        {
          label: 'Thread Type',
          value: material.threadType
            ? formatType(material.threadType)
            : 'Not specified',
        },
      ];
    }

    return details;
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-lg p-6 w-full max-w-3xl max-h-screen overflow-y-auto'>
        <div className='flex justify-between items-start mb-4'>
          <h2 className='text-xl font-bold'>{material.name}</h2>
          <button
            onClick={onClose}
            className='text-stone-400 hover:text-stone-600'
          >
            <X className='h-6 w-6' />
          </button>
        </div>

        <div className='mb-6 flex items-start'>
          {material.thumbnail ? (
            <div className='h-32 w-32 mr-4 bg-stone-100 rounded-md overflow-hidden'>
              <img
                src={material.thumbnail}
                alt={material.name}
                className='w-full h-full object-cover'
              />
            </div>
          ) : (
            <div className='h-32 w-32 mr-4 flex items-center justify-center bg-stone-100 rounded-md text-stone-400'>
              No Image
            </div>
          )}

          <div className='flex-1'>
            <h3 className='font-medium text-lg mb-1'>{material.name}</h3>
            <p className='text-stone-600 text-sm mb-2'>
              {formatType(material.materialType)}
            </p>
            {material.description && (
              <p className='text-sm text-stone-600 mb-3'>
                {material.description}
              </p>
            )}
            <div className='flex flex-wrap gap-2'>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${formatType(
                  material.status
                ).toLowerCase()}-100 text-${formatType(
                  material.status
                ).toLowerCase()}-800`}
              >
                {formatType(material.status)}
              </span>
              {material.quantity <= (material.reorderPoint || 0) && (
                <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800'>
                  Low Stock
                </span>
              )}
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
          <div className='bg-stone-50 p-4 rounded-md'>
            <h3 className='font-medium mb-3 text-stone-700'>
              Material Details
            </h3>
            <div className='grid grid-cols-1 gap-2'>
              {getMaterialDetails().map((detail, index) => (
                <div
                  key={index}
                  className='flex justify-between border-b border-stone-100 py-1'
                >
                  <span className='text-sm text-stone-500'>
                    {detail.label}:
                  </span>
                  <span className='text-sm font-medium text-stone-800'>
                    {detail.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className='font-medium mb-3 text-stone-700'>Notes</h3>
            <div className='bg-stone-50 p-4 rounded-md h-full'>
              {material.notes ? (
                <p className='text-sm text-stone-600'>{material.notes}</p>
              ) : (
                <p className='text-sm text-stone-400 italic'>
                  No notes available for this material
                </p>
              )}
            </div>
          </div>
        </div>

        <div className='flex justify-end mt-4 space-x-3'>
          {onDelete && (
            <button
              onClick={onDelete}
              disabled={isDeleting}
              className={`px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 ${
                isDeleting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          )}
          {onEdit && (
            <button
              onClick={onEdit}
              className='px-4 py-2 border border-amber-300 text-amber-700 rounded-md hover:bg-amber-50'
            >
              Edit
            </button>
          )}
          <button
            onClick={onClose}
            className='px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700'
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MaterialDetailModal;
