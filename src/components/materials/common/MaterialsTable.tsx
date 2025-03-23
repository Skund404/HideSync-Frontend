// src/components/materials/common/MaterialsTable.tsx
import { Edit, Eye, MoreHorizontal, Plus } from 'lucide-react';
import React from 'react';
import { Material, MaterialType } from '../../../types/materialTypes';
import {
  formatPrice,
  formatQuantity,
  formatType,
  getColorHex,
  getHardwareMaterialColor,
  getStatusColorClass,
} from '../../../utils/materialHelpers';
import {
  isAdhesiveType,
  isBurnishingGumType,
  isDyeType,
  isEdgePaintType,
  isFinishType,
  isMaterialOfType,
  isThreadType,
} from '../../../utils/materialTypeGuards';

interface MaterialsTableProps {
  materials: Material[];
  materialType: MaterialType | 'all';
  onView: (material: Material) => void;
  onAdjustStock: (material: Material) => void;
  onEdit?: (material: Material) => void;
  onDelete?: (id: number | string) => Promise<void>;
  isDeleting?: boolean;
}

const MaterialsTable: React.FC<MaterialsTableProps> = ({
  materials,
  materialType,
  onView,
  onAdjustStock,
  onEdit,
  onDelete,
  isDeleting = false,
}) => {
  // Helper to safely get supplier info - supports both supplierId and potential supplier property
  const getSupplierDisplay = (material: Material): string => {
    // Try to access supplier property from material
    const supplierName =
      'supplier' in material
        ? typeof material.supplier === 'string'
          ? material.supplier
          : ''
        : '';

    // If supplier property exists, use it, otherwise use supplierId
    return (
      supplierName ||
      (material.supplierId ? material.supplierId.toString() : '-')
    );
  };

  // Helper to safely get price
  const getDisplayPrice = (material: Material): string => {
    // Try to access price property from material
    const price =
      'price' in material
        ? typeof material.price === 'number'
          ? material.price
          : material.sellPrice
        : material.sellPrice;

    return formatPrice(price);
  };

  // Helper to safely format a property that might be an object or string
  const safeFormatType = (value: any): string => {
    if (!value) return '-';
    if (typeof value === 'string') return formatType(value);
    if (typeof value === 'object') return '-';
    return String(value);
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
              {material.thumbnail ? (
                <img
                  className='h-10 w-10 rounded-md object-cover'
                  src={material.thumbnail}
                  alt={material.name}
                />
              ) : (
                <div className='h-10 w-10 rounded-md bg-stone-100 flex items-center justify-center text-stone-400'>
                  <span className='text-xs'>No img</span>
                </div>
              )}
            </div>
            <div className='ml-4'>
              <div className='text-sm font-medium text-stone-900'>
                {material.name}
              </div>
              <div className='text-xs text-stone-500'>
                {material.supplierSku || material.sku || '-'}
              </div>
            </div>
          </div>
        </td>

        {/* Type/Category column - varies based on material type */}
        {materialType === 'all' ? (
          <td className='px-6 py-4 whitespace-nowrap'>
            <div className='text-sm text-stone-900'>
              {formatType(String(material.materialType))}
            </div>
          </td>
        ) : null}

        {/* Type column */}
        <td className='px-6 py-4 whitespace-nowrap'>
          <div className='text-sm text-stone-900'>
            {isMaterialOfType(material, MaterialType.LEATHER) &&
              'leatherType' in material &&
              safeFormatType(material.leatherType)}
            {isMaterialOfType(material, MaterialType.HARDWARE) &&
              'hardwareType' in material &&
              safeFormatType(material.hardwareType)}
            {(isThreadType(material) ||
              isDyeType(material) ||
              isEdgePaintType(material) ||
              isBurnishingGumType(material) ||
              isFinishType(material) ||
              isAdhesiveType(material)) &&
              formatType(String(material.materialType))}
          </div>
        </td>

        {/* Material specific columns */}
        {materialType === MaterialType.LEATHER && (
          <>
            <td className='px-6 py-4 whitespace-nowrap'>
              <div className='text-sm text-stone-900'>
                {'animalSource' in material && material.animalSource
                  ? safeFormatType(material.animalSource)
                  : '-'}
              </div>
            </td>
            <td className='px-6 py-4 whitespace-nowrap'>
              <div className='text-sm text-stone-900'>
                {'thickness' in material &&
                typeof material.thickness === 'number'
                  ? `${material.thickness} mm`
                  : '-'}
              </div>
            </td>
          </>
        )}

        {materialType === MaterialType.HARDWARE && (
          <>
            <td className='px-6 py-4 whitespace-nowrap'>
              <div className='flex items-center'>
                {'hardwareMaterial' in material &&
                  material.hardwareMaterial &&
                  typeof material.hardwareMaterial === 'string' && (
                    <div
                      className='w-3 h-3 rounded-full mr-2'
                      style={{
                        backgroundColor: getHardwareMaterialColor(
                          material.hardwareMaterial
                        ),
                      }}
                    ></div>
                  )}
                <div className='text-sm text-stone-900'>
                  {'hardwareMaterial' in material && material.hardwareMaterial
                    ? safeFormatType(material.hardwareMaterial)
                    : '-'}
                </div>
              </div>
            </td>
            <td className='px-6 py-4 whitespace-nowrap'>
              <div className='text-sm text-stone-900'>
                {'finish' in material && material.finish
                  ? safeFormatType(material.finish)
                  : '-'}
              </div>
            </td>
            <td className='px-6 py-4 whitespace-nowrap'>
              <div className='text-sm text-stone-900'>
                {'size' in material && material.size
                  ? typeof material.size === 'string'
                    ? material.size
                    : String(material.size)
                  : '-'}
              </div>
            </td>
          </>
        )}

        {materialType === MaterialType.SUPPLIES && (
          <>
            <td className='px-6 py-4 whitespace-nowrap'>
              {'color' in material &&
              material.color &&
              typeof material.color === 'string' ? (
                <div className='flex items-center'>
                  <div
                    className='w-3 h-3 rounded-full mr-2'
                    style={{
                      backgroundColor: getColorHex(material.color),
                    }}
                  ></div>
                  <div className='text-sm text-stone-900'>{material.color}</div>
                </div>
              ) : (
                <div className='text-sm text-stone-500'>-</div>
              )}
            </td>
          </>
        )}

        {/* Status column */}
        <td className='px-6 py-4 whitespace-nowrap'>
          <span
            className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${getStatusColorClass(
              material.status
            )}`}
          >
            {formatType(String(material.status))}
          </span>
        </td>

        {/* Quantity column */}
        <td className='px-6 py-4 whitespace-nowrap'>
          <div className='text-sm text-stone-900'>
            {formatQuantity(material.quantity, material.unit)}
          </div>
          {materialType === MaterialType.LEATHER &&
            'area' in material &&
            material.area &&
            typeof material.area === 'number' && (
              <div className='text-xs text-stone-500'>{material.area} sqft</div>
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
              {getSupplierDisplay(material)}
            </div>
            <div className='text-xs text-stone-500'>
              {getDisplayPrice(material)}
            </div>
          </td>
        )}

        {/* Actions column */}
        <td className='px-6 py-4 whitespace-nowrap text-sm text-stone-500'>
          <div className='flex space-x-2'>
            <button
              onClick={() => onView(material)}
              className='text-amber-600 hover:text-amber-900'
              title='View details'
            >
              <Eye className='h-5 w-5' />
            </button>
            <button
              onClick={() => onAdjustStock(material)}
              className='text-stone-600 hover:text-stone-900'
              title='Adjust stock'
            >
              <Plus className='h-5 w-5' />
            </button>
            {onEdit && (
              <button
                onClick={() => onEdit(material)}
                className='text-stone-600 hover:text-stone-900'
                title='Edit material'
              >
                <Edit className='h-5 w-5' />
              </button>
            )}
            <button className='text-stone-600 hover:text-stone-900'>
              <MoreHorizontal className='h-5 w-5' />
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
