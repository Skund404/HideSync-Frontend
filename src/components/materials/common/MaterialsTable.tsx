import { Material, MaterialType } from '@/types/materialTypes';
import {
  formatPrice,
  formatQuantity,
  formatType,
  getStatusColor,
} from '@/utils/materialHelpers';
import React from 'react';

interface MaterialsTableProps {
  materials: Material[];
  materialType: MaterialType | 'all';
  onView: (material: Material) => void;
  onAdjustStock: (material: Material) => void;
}

const MaterialsTable: React.FC<MaterialsTableProps> = ({
  materials,
  materialType,
  onView,
  onAdjustStock,
}) => {
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

  // Render table headers based on material type
  const renderHeaders = () => {
    switch (materialType) {
      case MaterialType.LEATHER:
        return (
          <tr>
            <th
              scope='col'
              className='px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
            >
              Leather
            </th>
            <th
              scope='col'
              className='px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
            >
              Type
            </th>
            <th
              scope='col'
              className='px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
            >
              Source
            </th>
            <th
              scope='col'
              className='px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
            >
              Thickness
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
              Actions
            </th>
          </tr>
        );
      case MaterialType.HARDWARE:
        return (
          <tr>
            <th
              scope='col'
              className='px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
            >
              Hardware
            </th>
            <th
              scope='col'
              className='px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
            >
              Type
            </th>
            <th
              scope='col'
              className='px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
            >
              Material
            </th>
            <th
              scope='col'
              className='px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
            >
              Finish
            </th>
            <th
              scope='col'
              className='px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
            >
              Size
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
              Actions
            </th>
          </tr>
        );
      case MaterialType.SUPPLIES:
        return (
          <tr>
            <th
              scope='col'
              className='px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
            >
              Supply
            </th>
            <th
              scope='col'
              className='px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
            >
              Type
            </th>
            <th
              scope='col'
              className='px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
            >
              Color
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
              Supplier
            </th>
            <th
              scope='col'
              className='px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
            >
              Actions
            </th>
          </tr>
        );
      default:
        return (
          <tr>
            <th
              scope='col'
              className='px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
            >
              Material
            </th>
            <th
              scope='col'
              className='px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
            >
              Category
            </th>
            <th
              scope='col'
              className='px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
            >
              Type
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
              Supplier
            </th>
            <th
              scope='col'
              className='px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
            >
              Actions
            </th>
          </tr>
        );
    }
  };

  // Render table rows based on material type
  const renderRows = () => {
    if (materials.length === 0) {
      return (
        <tr>
          <td
            colSpan={materialType === MaterialType.HARDWARE ? 8 : 8}
            className='px-6 py-8 text-center text-sm text-stone-500'
          >
            No materials found matching your criteria
          </td>
        </tr>
      );
    }

    return materials.map((material) => (
      <tr key={material.id} className='hover:bg-stone-50'>
        {/* Name and Thumbnail column */}
        <td className='px-6 py-4 whitespace-nowrap'>
          <div className='flex items-center'>
            <div className='h-10 w-10 flex-shrink-0'>
              <img
                className='h-10 w-10 rounded-md object-cover'
                src={material.thumbnail || ''}
                alt=''
              />
            </div>
            <div className='ml-4'>
              <div className='text-sm font-medium text-stone-900'>
                {material.name}
              </div>
              <div className='text-xs text-stone-500'>
                {material.supplierSku}
              </div>
            </div>
          </div>
        </td>

        {/* Type/Category column - varies based on material type */}
        {materialType === 'all' ? (
          <td className='px-6 py-4 whitespace-nowrap'>
            <div className='text-sm text-stone-900'>
              {formatType(material.materialType)}
            </div>
          </td>
        ) : null}

        {/* Type column */}
        <td className='px-6 py-4 whitespace-nowrap'>
          <div className='text-sm text-stone-900'>
            {material.materialType === MaterialType.LEATHER &&
              (material as any).leatherType &&
              formatType((material as any).leatherType)}
            {material.materialType === MaterialType.HARDWARE &&
              (material as any).hardwareType &&
              formatType((material as any).hardwareType)}
            {(material.materialType === MaterialType.THREAD ||
              material.materialType === MaterialType.WAXED_THREAD ||
              material.materialType === MaterialType.DYE ||
              material.materialType === MaterialType.EDGE_PAINT ||
              material.materialType === MaterialType.BURNISHING_GUM ||
              material.materialType === MaterialType.FINISH ||
              material.materialType === MaterialType.ADHESIVE) &&
              formatType(material.materialType)}
          </div>
        </td>

        {/* Material specific columns */}
        {materialType === MaterialType.LEATHER && (
          <>
            <td className='px-6 py-4 whitespace-nowrap'>
              <div className='text-sm text-stone-900'>
                {formatType((material as any).animalSource)}
              </div>
            </td>
            <td className='px-6 py-4 whitespace-nowrap'>
              <div className='text-sm text-stone-900'>
                {(material as any).thickness} mm
              </div>
            </td>
          </>
        )}

        {materialType === MaterialType.HARDWARE && (
          <>
            <td className='px-6 py-4 whitespace-nowrap'>
              <div className='flex items-center'>
                <div
                  className='w-3 h-3 rounded-full mr-2'
                  style={{
                    backgroundColor: getHardwareMaterialColor(
                      (material as any).hardwareMaterial
                    ),
                  }}
                ></div>
                <div className='text-sm text-stone-900'>
                  {formatType((material as any).hardwareMaterial)}
                </div>
              </div>
            </td>
            <td className='px-6 py-4 whitespace-nowrap'>
              <div className='text-sm text-stone-900'>
                {formatType((material as any).finish)}
              </div>
            </td>
            <td className='px-6 py-4 whitespace-nowrap'>
              <div className='text-sm text-stone-900'>
                {(material as any).size}
              </div>
            </td>
          </>
        )}

        {materialType === MaterialType.SUPPLIES && (
          <>
            <td className='px-6 py-4 whitespace-nowrap'>
              {(material as any).color && (
                <div className='flex items-center'>
                  <div
                    className='w-3 h-3 rounded-full mr-2'
                    style={{
                      backgroundColor: getColorHex((material as any).color),
                    }}
                  ></div>
                  <div className='text-sm text-stone-900'>
                    {(material as any).color}
                  </div>
                </div>
              )}
            </td>
          </>
        )}

        {/* Status column */}
        <td className='px-6 py-4 whitespace-nowrap'>
          <span
            className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${getStatusColor(
              material.status
            )}`}
          >
            {material.status.replace(/_/g, ' ')}
          </span>
        </td>

        {/* Quantity column */}
        <td className='px-6 py-4 whitespace-nowrap'>
          <div className='text-sm text-stone-900'>
            {formatQuantity(material.quantity, material.unit)}
          </div>
          {materialType === MaterialType.LEATHER && (material as any).area && (
            <div className='text-xs text-stone-500'>
              {(material as any).area} sqft
            </div>
          )}
        </td>

        {/* Location column */}
        <td className='px-6 py-4 whitespace-nowrap'>
          <div className='text-sm text-stone-900'>
            {material.storageLocation || 'Unassigned'}
          </div>
        </td>

        {/* Supplier column - only visible in all and supplies view */}
        {(materialType === 'all' || materialType === MaterialType.SUPPLIES) && (
          <td className='px-6 py-4 whitespace-nowrap'>
            <div className='text-sm text-stone-900'>
              {material.supplier || 'Unknown'}
            </div>
            <div className='text-xs text-stone-500'>
              {formatPrice(material.price)}
            </div>
          </td>
        )}

        {/* Actions column */}
        <td className='px-6 py-4 whitespace-nowrap text-sm text-stone-500'>
          <div className='flex space-x-2'>
            <button
              onClick={() => onView(material)}
              className='text-amber-600 hover:text-amber-900'
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
              onClick={() => onAdjustStock(material)}
              className='text-stone-600 hover:text-stone-900'
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
            <button className='text-stone-600 hover:text-stone-900'>
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
            <button className='text-stone-600 hover:text-stone-900'>
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
    ));
  };

  return (
    <div className='bg-white shadow-sm rounded-lg border border-stone-200 overflow-hidden'>
      <div className='overflow-x-auto'>
        <table className='min-w-full divide-y divide-stone-200'>
          <thead className='bg-stone-50'>{renderHeaders()}</thead>
          <tbody className='bg-white divide-y divide-stone-200'>
            {renderRows()}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MaterialsTable;
