import { Material, MaterialType } from '@/types/materialTypes';
import {
  formatPrice,
  formatQuantity,
  formatType,
  getStatusColor,
} from '@/utils/materialHelpers';
import React from 'react';

// Helper function to get color hex for display
const getColorHex = (colorName: string): string => {
  const colorMap: Record<string, string> = {
    natural: '#D2B48C',
    tan: '#D2B48C',
    brown: '#8B4513',
    dark_brown: '#5C4033',
    black: '#222222',
    navy: '#000080',
    burgundy: '#800020',
    red: '#B22222',
    green: '#006400',
    blue: '#0000CD',
    yellow: '#FFD700',
    orange: '#FF8C00',
    purple: '#800080',
    white: '#F5F5F5',
    grey: '#808080',
    gray: '#808080',
    silver: '#C0C0C0',
    olive: '#808000',
  };

  return colorMap[colorName.toLowerCase()] || '#D2B48C'; // Default to tan if color not found
};

// Helper function to get hardware material color
const getHardwareMaterialColor = (material: string): string => {
  const materialColorMap: Record<string, string> = {
    brass: '#B5A642',
    nickel: '#C0C0C0',
    stainless_steel: '#E0E0E0',
    steel: '#71797E',
    zinc: '#D3D4D5',
    copper: '#B87333',
    aluminum: '#A9A9A9',
    plastic: '#1E90FF',
    silver: '#C0C0C0',
    gold: '#FFD700',
  };

  return materialColorMap[material.toLowerCase()] || '#C0C0C0'; // Default to silver
};

interface MaterialDetailModalProps {
  material: Material;
  onClose: () => void;
}

const MaterialDetailModal: React.FC<MaterialDetailModalProps> = ({
  material,
  onClose,
}) => {
  // Render specific details based on material type
  const renderSpecificDetails = () => {
    switch (material.materialType) {
      case MaterialType.LEATHER: {
        const leatherMaterial = material as any;
        return (
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <span className='text-stone-500 text-sm block'>
                Animal Source
              </span>
              <span className='text-stone-800'>
                {formatType(leatherMaterial.animalSource)}
              </span>
            </div>
            <div>
              <span className='text-stone-500 text-sm block'>Tannage</span>
              <span className='text-stone-800'>
                {formatType(leatherMaterial.tannage)}
              </span>
            </div>
            <div>
              <span className='text-stone-500 text-sm block'>Thickness</span>
              <span className='text-stone-800'>
                {leatherMaterial.thickness} oz
              </span>
            </div>
            <div>
              <span className='text-stone-500 text-sm block'>Color</span>
              <div className='flex items-center'>
                <div
                  className='w-4 h-4 rounded-full mr-2'
                  style={{
                    backgroundColor: getColorHex(leatherMaterial.color),
                  }}
                ></div>
                <span className='text-stone-800'>{leatherMaterial.color}</span>
              </div>
            </div>
            <div>
              <span className='text-stone-500 text-sm block'>Total Area</span>
              <span className='text-stone-800'>
                {leatherMaterial.area} sq ft
              </span>
            </div>
          </div>
        );
      }
      case MaterialType.HARDWARE: {
        const hardwareMaterial = material as any;
        return (
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <span className='text-stone-500 text-sm block'>
                Hardware Type
              </span>
              <span className='text-stone-800'>
                {formatType(hardwareMaterial.hardwareType)}
              </span>
            </div>
            <div>
              <span className='text-stone-500 text-sm block'>Material</span>
              <div className='flex items-center'>
                <div
                  className='w-4 h-4 rounded-full mr-2'
                  style={{
                    backgroundColor: getHardwareMaterialColor(
                      hardwareMaterial.hardwareMaterial
                    ),
                  }}
                ></div>
                <span className='text-stone-800'>
                  {formatType(hardwareMaterial.hardwareMaterial)}
                </span>
              </div>
            </div>
            <div>
              <span className='text-stone-500 text-sm block'>Finish</span>
              <span className='text-stone-800'>
                {formatType(hardwareMaterial.finish)}
              </span>
            </div>
            <div>
              <span className='text-stone-500 text-sm block'>Size</span>
              <span className='text-stone-800'>{hardwareMaterial.size}</span>
            </div>
          </div>
        );
      }
      case MaterialType.THREAD:
      case MaterialType.WAXED_THREAD: {
        const threadMaterial = material as any;
        return (
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <span className='text-stone-500 text-sm block'>Thread Type</span>
              <span className='text-stone-800'>
                {formatType(threadMaterial.threadType)}
              </span>
            </div>
            <div>
              <span className='text-stone-500 text-sm block'>Thickness</span>
              <span className='text-stone-800'>{threadMaterial.thickness}</span>
            </div>
            <div>
              <span className='text-stone-500 text-sm block'>Color</span>
              <div className='flex items-center'>
                <div
                  className='w-4 h-4 rounded-full mr-2'
                  style={{ backgroundColor: getColorHex(threadMaterial.color) }}
                ></div>
                <span className='text-stone-800'>{threadMaterial.color}</span>
              </div>
            </div>
            <div>
              <span className='text-stone-500 text-sm block'>Composition</span>
              <span className='text-stone-800'>
                {threadMaterial.composition}
              </span>
            </div>
          </div>
        );
      }
      case MaterialType.SUPPLIES: {
        const supplyMaterial = material as any;
        return (
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <span className='text-stone-500 text-sm block'>Supply Type</span>
              <span className='text-stone-800'>
                {formatType(supplyMaterial.materialType)}
              </span>
            </div>
            {supplyMaterial.color && (
              <div>
                <span className='text-stone-500 text-sm block'>Color</span>
                <div className='flex items-center'>
                  <div
                    className='w-4 h-4 rounded-full mr-2'
                    style={{
                      backgroundColor: getColorHex(supplyMaterial.color),
                    }}
                  ></div>
                  <span className='text-stone-800'>{supplyMaterial.color}</span>
                </div>
              </div>
            )}
            {supplyMaterial.brand && (
              <div>
                <span className='text-stone-500 text-sm block'>Brand</span>
                <span className='text-stone-800'>{supplyMaterial.brand}</span>
              </div>
            )}
            {supplyMaterial.size && (
              <div>
                <span className='text-stone-500 text-sm block'>Size</span>
                <span className='text-stone-800'>{supplyMaterial.size}</span>
              </div>
            )}
          </div>
        );
      }
      default:
        return null;
    }
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-lg p-6 w-full max-w-3xl max-h-screen overflow-y-auto'>
        {/* Header */}
        <div className='flex justify-between items-start mb-6'>
          <div className='flex-grow'>
            <h2 className='text-xl font-bold text-stone-900'>
              {material.name}
            </h2>
            <p className='text-sm text-stone-500 mt-1'>
              {formatType(material.materialType)} • {material.supplierSku}
            </p>
          </div>
          <button
            onClick={onClose}
            className='text-stone-400 hover:text-stone-600'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-6 w-6'
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

        {/* Material Summary */}
        <div className='bg-stone-50 border border-stone-200 rounded-lg p-4 mb-6 grid grid-cols-3 gap-4'>
          <div>
            <span className='text-stone-500 text-sm block'>Status</span>
            <span
              className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(
                material.status
              )}`}
            >
              {material.status.replace(/_/g, ' ')}
            </span>
          </div>
          <div>
            <span className='text-stone-500 text-sm block'>Quantity</span>
            <span className='text-stone-800'>
              {formatQuantity(material.quantity, material.unit)}
            </span>
          </div>
          <div>
            <span className='text-stone-500 text-sm block'>Location</span>
            <span className='text-stone-800'>
              {material.storageLocation || 'Unassigned'}
            </span>
          </div>
        </div>

        {/* Specific Material Details */}
        <div className='mb-6'>
          <h3 className='text-lg font-medium text-stone-800 mb-4'>Details</h3>
          {renderSpecificDetails()}
        </div>

        {/* Additional Information */}
        <div className='bg-stone-50 border border-stone-200 rounded-lg p-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <span className='text-stone-500 text-sm block'>Supplier</span>
              <span className='text-stone-800'>{material.supplier}</span>
            </div>
            <div>
              <span className='text-stone-500 text-sm block'>Unit Price</span>
              <span className='text-stone-800'>
                {formatPrice(material.price)}
              </span>
            </div>
            {material.notes && (
              <div className='col-span-2'>
                <span className='text-stone-500 text-sm block'>Notes</span>
                <span className='text-stone-800 italic'>{material.notes}</span>
              </div>
            )}
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
            Edit Material
          </button>
        </div>
      </div>
    </div>
  );
};

export default MaterialDetailModal;
