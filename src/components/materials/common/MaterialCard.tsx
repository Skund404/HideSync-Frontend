import { Material, MaterialType } from '@/types/materialTypes';
import {
  formatPrice,
  formatQuantity,
  formatType,
  getStatusColor,
  isLowStock,
} from '@/utils/materialHelpers';
import React from 'react';

interface MaterialCardProps {
  material: Material;
  onView: (material: Material) => void;
  onAdjustStock: (material: Material) => void;
}

const MaterialCard: React.FC<MaterialCardProps> = ({
  material,
  onView,
  onAdjustStock,
}) => {
  // Get material-specific details for display
  const getMaterialDetails = () => {
    // Common properties for all materials
    const details = [
      {
        label: 'Quantity',
        value: material.unit
          ? formatQuantity(material.quantity, material.unit)
          : `${material.quantity}`,
      },
      {
        label: 'Location',
        value: material.storageLocation,
      },
    ];

    // Material type specific properties
    switch (material.materialType) {
      case MaterialType.LEATHER:
        const leatherMaterial = material as any;
        return [
          ...details,
          {
            label: 'Thickness',
            value: `${leatherMaterial.thickness}mm`,
          },
          {
            label: 'Area',
            value: leatherMaterial.area
              ? `${leatherMaterial.area} sqft`
              : 'N/A',
          },
        ];
      case MaterialType.HARDWARE:
        const hardwareMaterial = material as any;
        return [
          ...details,
          {
            label: 'Size',
            value: hardwareMaterial.size,
          },
          {
            label: 'Material',
            value: formatType(hardwareMaterial.hardwareMaterial),
          },
        ];
      case MaterialType.THREAD:
      case MaterialType.WAXED_THREAD:
        const threadMaterial = material as any;
        return [
          ...details,
          {
            label: 'Thickness',
            value: threadMaterial.thickness,
          },
          {
            label: 'Composition',
            value: threadMaterial.composition,
          },
        ];
      default:
        return details;
    }
  };

  // Helper function to get color hex for display
  const getColorHex = (colorName: string): string => {
    // Define a common color map
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

  // Get general material color for hardware type
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

  // Get color display for material
  const getColorDisplay = () => {
    if (
      material.materialType === MaterialType.LEATHER ||
      material.materialType === MaterialType.THREAD ||
      material.materialType === MaterialType.WAXED_THREAD ||
      material.materialType === MaterialType.DYE ||
      material.materialType === MaterialType.EDGE_PAINT
    ) {
      const colorMaterial = material as any;
      if (colorMaterial.color) {
        return (
          <div className='absolute bottom-0 left-0 right-0 p-2 flex items-center bg-black/50'>
            <div
              className='w-4 h-4 rounded-full mr-2'
              style={{
                backgroundColor: getColorHex(colorMaterial.color),
              }}
            ></div>
            <span className='text-xs text-white'>{colorMaterial.color}</span>
          </div>
        );
      }
    } else if (material.materialType === MaterialType.HARDWARE) {
      const hardwareMaterial = material as any;
      return (
        <div className='absolute bottom-0 left-0 right-0 p-2 flex items-center justify-between bg-black/50'>
          <div className='flex items-center'>
            <div
              className='w-4 h-4 rounded-full mr-2'
              style={{
                backgroundColor: getHardwareMaterialColor(
                  hardwareMaterial.hardwareMaterial
                ),
              }}
            ></div>
            <span className='text-xs text-white'>
              {formatType(hardwareMaterial.hardwareMaterial)}
            </span>
          </div>
          <span className='text-xs text-white'>
            {formatType(hardwareMaterial.finish)}
          </span>
        </div>
      );
    }

    return null;
  };

  return (
    <div className='bg-white rounded-lg shadow-sm overflow-hidden border border-stone-200 hover:shadow-md transition-shadow'>
      <div className='relative h-40 bg-stone-200'>
        <img
          src={material.thumbnail}
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
        {getColorDisplay()}
      </div>
      <div className='p-4'>
        <div className='flex justify-between items-start mb-2'>
          <h3 className='font-medium text-stone-900 text-lg'>
            {material.name}
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
          {formatType(material.materialType)}
          {material.materialType === MaterialType.LEATHER &&
            (material as any).leatherType &&
            ` • ${formatType((material as any).leatherType)}`}
          {material.materialType === MaterialType.HARDWARE &&
            (material as any).hardwareType &&
            ` • ${formatType((material as any).hardwareType)}`}
        </div>
        <div className='grid grid-cols-2 gap-2 text-sm mb-3'>
          {getMaterialDetails().map((detail, index) => (
            <div key={index}>
              <span className='text-stone-500'>{detail.label}:</span>
              <span className='ml-1 text-stone-700'>{detail.value}</span>
            </div>
          ))}
          <div>
            <span className='text-stone-500'>Supplier:</span>
            <span className='ml-1 text-stone-700'>{material.supplier}</span>
          </div>
          <div>
            <span className='text-stone-500'>Price:</span>
            <span className='ml-1 text-stone-700'>
              {formatPrice(material.price)}
            </span>
          </div>
        </div>
        {material.notes && (
          <div className='text-xs text-stone-500 mb-3 italic'>
            {material.notes}
          </div>
        )}
        <div className='border-t border-stone-100 pt-3 flex justify-between'>
          <button
            onClick={() => onView(material)}
            className='text-sm text-amber-600 hover:text-amber-800 font-medium'
          >
            View Details
          </button>
          <button
            onClick={() => onAdjustStock(material)}
            className='text-sm text-stone-600 hover:text-stone-800 font-medium flex items-center'
          >
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
  );
};

export default MaterialCard;
