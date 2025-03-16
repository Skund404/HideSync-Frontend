import React, { useEffect, useState } from 'react';
import { useMaterials } from '../../context/MaterialsContext';
import { useSales } from '../../context/SalesContext';
import { Material, MaterialStatus } from '../../types/materialTypes';
import { Sale } from '../../types/salesTypes';
import LoadingSpinner from '../common/LoadingSpinner';

// Material requirement as stored in the final list
interface MaterialRequirement {
  materialId: string | number;
  materialName: string;
  quantity: number;
  available: number;
  status: MaterialStatus;
  unit?: string;
  storageLocation?: string;
  materialType: string;
}

// Initial definition type that doesn't need inventory-specific fields
interface MaterialDefinition {
  materialId: string | number;
  materialName: string;
  quantity: number;
  unit?: string;
  materialType: string;
}

interface MaterialRequirementsProps {
  saleId: number;
  onGeneratePickingList?: () => void;
}

const MaterialRequirements: React.FC<MaterialRequirementsProps> = ({
  saleId,
  onGeneratePickingList,
}) => {
  const { getSale } = useSales();
  const { materials, loading: materialsLoading } = useMaterials();
  const [requirements, setRequirements] = useState<MaterialRequirement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const sale = getSale(saleId);

  useEffect(() => {
    if (!sale || materialsLoading) {
      return;
    }

    setLoading(true);
    try {
      // Calculate material requirements based on the sale items
      const calculatedRequirements = calculateMaterialRequirements(
        sale,
        materials
      );
      setRequirements(calculatedRequirements);
      setLoading(false);
    } catch (err) {
      setError('Failed to calculate material requirements');
      setLoading(false);
    }
  }, [sale, materials, materialsLoading]);

  // Function to calculate material requirements based on sale items
  const calculateMaterialRequirements = (
    sale: Sale,
    materials: Material[]
  ): MaterialRequirement[] => {
    // In a real implementation, this would use actual product recipes or BOMs
    // For this demo, we'll use a simplified mapping from products to materials

    const productMaterialMap: Record<string, MaterialDefinition[]> = {
      // Wallets
      'Leather Wallet': [
        {
          materialId: 1,
          materialName: 'Vegetable Tanned Leather',
          quantity: 0.5,
          unit: 'sq ft',
          materialType: 'leather',
        },
        {
          materialId: 2,
          materialName: 'Waxed Thread',
          quantity: 0.1,
          unit: 'spool',
          materialType: 'supplies',
        },
        {
          materialId: 3,
          materialName: 'Edge Paint',
          quantity: 0.05,
          unit: 'bottle',
          materialType: 'supplies',
        },
      ],
      'Bifold Wallet': [
        {
          materialId: 1,
          materialName: 'Vegetable Tanned Leather',
          quantity: 0.4,
          unit: 'sq ft',
          materialType: 'leather',
        },
        {
          materialId: 2,
          materialName: 'Waxed Thread',
          quantity: 0.1,
          unit: 'spool',
          materialType: 'supplies',
        },
        {
          materialId: 3,
          materialName: 'Edge Paint',
          quantity: 0.05,
          unit: 'bottle',
          materialType: 'supplies',
        },
      ],
      'Card Holder': [
        {
          materialId: 1,
          materialName: 'Vegetable Tanned Leather',
          quantity: 0.2,
          unit: 'sq ft',
          materialType: 'leather',
        },
        {
          materialId: 2,
          materialName: 'Waxed Thread',
          quantity: 0.05,
          unit: 'spool',
          materialType: 'supplies',
        },
        {
          materialId: 3,
          materialName: 'Edge Paint',
          quantity: 0.02,
          unit: 'bottle',
          materialType: 'supplies',
        },
      ],

      // Bags
      'Leather Tote': [
        {
          materialId: 1,
          materialName: 'Vegetable Tanned Leather',
          quantity: 4,
          unit: 'sq ft',
          materialType: 'leather',
        },
        {
          materialId: 2,
          materialName: 'Waxed Thread',
          quantity: 0.5,
          unit: 'spool',
          materialType: 'supplies',
        },
        {
          materialId: 4,
          materialName: 'Magnetic Snaps',
          quantity: 1,
          unit: 'piece',
          materialType: 'hardware',
        },
      ],
      'Messenger Bag': [
        {
          materialId: 1,
          materialName: 'Vegetable Tanned Leather',
          quantity: 5,
          unit: 'sq ft',
          materialType: 'leather',
        },
        {
          materialId: 2,
          materialName: 'Waxed Thread',
          quantity: 0.5,
          unit: 'spool',
          materialType: 'supplies',
        },
        {
          materialId: 5,
          materialName: 'Brass Buckles',
          quantity: 2,
          unit: 'piece',
          materialType: 'hardware',
        },
        {
          materialId: 6,
          materialName: 'D-Rings',
          quantity: 4,
          unit: 'piece',
          materialType: 'hardware',
        },
      ],

      // Belts
      'Leather Belt': [
        {
          materialId: 1,
          materialName: 'Vegetable Tanned Leather',
          quantity: 1,
          unit: 'sq ft',
          materialType: 'leather',
        },
        {
          materialId: 2,
          materialName: 'Waxed Thread',
          quantity: 0.1,
          unit: 'spool',
          materialType: 'supplies',
        },
        {
          materialId: 5,
          materialName: 'Brass Buckles',
          quantity: 1,
          unit: 'piece',
          materialType: 'hardware',
        },
      ],

      // Default/fallback for other products
      default: [
        {
          materialId: 1,
          materialName: 'Vegetable Tanned Leather',
          quantity: 1,
          unit: 'sq ft',
          materialType: 'leather',
        },
        {
          materialId: 2,
          materialName: 'Waxed Thread',
          quantity: 0.1,
          unit: 'spool',
          materialType: 'supplies',
        },
      ],
    };

    // Aggregate material requirements from all items
    const aggregatedMaterials: Record<string | number, MaterialRequirement> =
      {};

    sale.items.forEach((item) => {
      const itemName = item.name;
      const itemQuantity = item.quantity;

      // Get material list for this product (or use default)
      const materialList =
        productMaterialMap[itemName] || productMaterialMap['default'];

      materialList.forEach((material) => {
        const totalQuantity = material.quantity * itemQuantity;

        if (aggregatedMaterials[material.materialId]) {
          // Add to existing material requirement
          aggregatedMaterials[material.materialId].quantity += totalQuantity;
        } else {
          // Convert from MaterialDefinition to MaterialRequirement
          aggregatedMaterials[material.materialId] = {
            ...material,
            quantity: totalQuantity,
            available: 0, // Will be updated with actual inventory data
            status: MaterialStatus.IN_STOCK, // Default value
          };
        }
      });
    });

    // Add actual inventory data to the requirements
    Object.values(aggregatedMaterials).forEach((requirement) => {
      const materialInInventory = materials.find(
        (m) => m.id === requirement.materialId
      );
      if (materialInInventory) {
        requirement.available = materialInInventory.quantity;
        requirement.status = materialInInventory.status;
        requirement.storageLocation = materialInInventory.storageLocation;
      } else {
        requirement.available = 0;
        requirement.status = MaterialStatus.OUT_OF_STOCK;
      }
    });

    return Object.values(aggregatedMaterials);
  };

  // Check if all materials are available
  const allMaterialsAvailable = requirements.every(
    (req) => req.available >= req.quantity
  );

  // Check if any materials need to be ordered
  const anyMaterialsNeedOrdering = requirements.some(
    (req) =>
      req.status === MaterialStatus.OUT_OF_STOCK || req.available < req.quantity
  );

  if (loading || materialsLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className='bg-red-50 p-4 rounded-md text-red-800'>{error}</div>;
  }

  if (!sale) {
    return (
      <div className='bg-red-50 p-4 rounded-md text-red-800'>
        Order not found
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <h3 className='text-lg font-medium text-gray-900'>
        Material Requirements
      </h3>

      {/* Status summary */}
      <div
        className={`p-4 rounded-md ${
          allMaterialsAvailable
            ? 'bg-green-50'
            : anyMaterialsNeedOrdering
            ? 'bg-red-50'
            : 'bg-yellow-50'
        }`}
      >
        <div className='flex'>
          <div className='flex-shrink-0'>
            {allMaterialsAvailable ? (
              <svg
                className='h-5 w-5 text-green-400'
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 20 20'
                fill='currentColor'
              >
                <path
                  fillRule='evenodd'
                  d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                  clipRule='evenodd'
                />
              </svg>
            ) : anyMaterialsNeedOrdering ? (
              <svg
                className='h-5 w-5 text-red-400'
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 20 20'
                fill='currentColor'
              >
                <path
                  fillRule='evenodd'
                  d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                  clipRule='evenodd'
                />
              </svg>
            ) : (
              <svg
                className='h-5 w-5 text-yellow-400'
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 20 20'
                fill='currentColor'
              >
                <path
                  fillRule='evenodd'
                  d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'
                  clipRule='evenodd'
                />
              </svg>
            )}
          </div>
          <div className='ml-3'>
            <h3
              className={`text-sm font-medium ${
                allMaterialsAvailable
                  ? 'text-green-800'
                  : anyMaterialsNeedOrdering
                  ? 'text-red-800'
                  : 'text-yellow-800'
              }`}
            >
              {allMaterialsAvailable
                ? 'All materials available'
                : anyMaterialsNeedOrdering
                ? 'Some materials need to be ordered'
                : 'Some materials are low in stock'}
            </h3>
            <div className='mt-2 text-sm'>
              <p
                className={
                  allMaterialsAvailable
                    ? 'text-green-700'
                    : anyMaterialsNeedOrdering
                    ? 'text-red-700'
                    : 'text-yellow-700'
                }
              >
                {allMaterialsAvailable
                  ? 'You have all the materials needed for this order.'
                  : anyMaterialsNeedOrdering
                  ? 'Some materials are out of stock or insufficient quantity. Consider placing a purchase order.'
                  : 'Some materials are running low. You have enough for this order, but consider restocking soon.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Material requirements table */}
      <div className='flex flex-col'>
        <div className='-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8'>
          <div className='py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8'>
            <div className='shadow overflow-hidden border-b border-gray-200 sm:rounded-lg'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th
                      scope='col'
                      className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                    >
                      Material
                    </th>
                    <th
                      scope='col'
                      className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                    >
                      Type
                    </th>
                    <th
                      scope='col'
                      className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                    >
                      Required
                    </th>
                    <th
                      scope='col'
                      className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                    >
                      Available
                    </th>
                    <th
                      scope='col'
                      className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                    >
                      Status
                    </th>
                    <th
                      scope='col'
                      className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                    >
                      Location
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {requirements.map((requirement, index) => (
                    <tr
                      key={index}
                      className={
                        requirement.available < requirement.quantity
                          ? 'bg-red-50'
                          : ''
                      }
                    >
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                        {requirement.materialName}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        {requirement.materialType
                          .replace('_', ' ')
                          .charAt(0)
                          .toUpperCase() +
                          requirement.materialType.replace('_', ' ').slice(1)}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        {requirement.quantity} {requirement.unit}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        {requirement.available} {requirement.unit}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${
                            requirement.available >= requirement.quantity
                              ? 'bg-green-100 text-green-800'
                              : requirement.available === 0
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {requirement.available >= requirement.quantity
                            ? 'Available'
                            : requirement.available === 0
                            ? 'Out of Stock'
                            : 'Insufficient'}
                        </span>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        {requirement.storageLocation || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className='flex justify-between'>
        <button
          type='button'
          className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500'
          onClick={onGeneratePickingList}
        >
          Generate Picking List
        </button>

        {anyMaterialsNeedOrdering && (
          <button
            type='button'
            className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          >
            Create Purchase Order
          </button>
        )}
      </div>
    </div>
  );
};

export default MaterialRequirements;
