// src/components/sales/MaterialRequirements.tsx
import React, { useEffect, useState } from 'react';
import { useMaterials } from '../../context/MaterialsContext';
import { useSales } from '../../context/SalesContext';
import * as salesMaterialsService from '../../services/sales-materials-service';
import { MaterialStatus } from '../../types/enums';
import ErrorMessage from '../common/ErrorMessage';
import LoadingSpinner from '../common/LoadingSpinner';

// Material requirement as stored in the final list
interface MaterialRequirement {
  materialId: number; // Changed from string | number to just number for consistency
  materialName: string;
  quantity: number;
  available: number;
  status: MaterialStatus;
  unit?: string;
  storageLocation?: string;
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
    if (!sale) {
      return;
    }

    const fetchMaterialRequirements = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch material requirements from the API
        const saleMaterials = await salesMaterialsService.getSaleMaterials(
          saleId
        );

        // Check availability of materials
        const availabilityData =
          await salesMaterialsService.checkMaterialAvailability(saleId);

        // Create a map of material IDs to their full details from context
        const materialsMap = materials
          ? new Map(materials.map((material) => [material.id, material]))
          : new Map();

        // Transform the API response to our internal format
        const materialRequirements: MaterialRequirement[] = saleMaterials.map(
          (material) => {
            // Get additional details from materials context if available
            // Convert materialId to number to match the context map type
            const materialId =
              typeof material.materialId === 'string'
                ? parseInt(material.materialId, 10)
                : material.materialId || 0;
            const contextMaterial = materialsMap.get(materialId);
            const storageLocation =
              material.location ||
              (contextMaterial ? contextMaterial.storageLocation : undefined);

            return {
              materialId: materialId,
              materialName: material.materialName,
              quantity: material.quantity,
              available: material.available || 0,
              status:
                (material.status as MaterialStatus) ||
                MaterialStatus.OUT_OF_STOCK,
              unit: material.unit?.toString() || 'piece',
              storageLocation: storageLocation,
              materialType: material.materialType.toString(),
            };
          }
        );

        // Update availability information based on the availability check
        if (!availabilityData.allAvailable) {
          const missingItemsMap = new Map(
            availabilityData.missingItems.map((item) => {
              // Ensure materialId is a number for consistent lookup
              const materialId =
                typeof item.materialId === 'string'
                  ? parseInt(item.materialId, 10)
                  : item.materialId || 0;
              return [materialId, item];
            })
          );

          materialRequirements.forEach((req) => {
            // Convert materialId to number for consistent lookup
            const materialId =
              typeof req.materialId === 'string'
                ? parseInt(req.materialId as string, 10)
                : (req.materialId as number);

            const missingItem = missingItemsMap.get(materialId);
            if (missingItem) {
              req.available = missingItem.available || 0;
              req.status = MaterialStatus.OUT_OF_STOCK;
            }
          });
        }

        setRequirements(materialRequirements);
      } catch (err) {
        console.error('Error fetching material requirements:', err);
        setError('Failed to load material requirements for this order');
      } finally {
        setLoading(false);
      }
    };

    fetchMaterialRequirements();
  }, [sale, saleId, materials]);

  // Check if all materials are available
  const allMaterialsAvailable = requirements.every(
    (req) => req.available >= req.quantity
  );

  // Check if any materials need to be ordered
  const anyMaterialsNeedOrdering = requirements.some(
    (req) =>
      req.status === MaterialStatus.OUT_OF_STOCK || req.available < req.quantity
  );

  // Handle creating purchase order
  const handleCreatePurchaseOrder = () => {
    // This would be implemented to navigate to purchase order creation
    // or call an API to create purchase orders for missing items
    alert(
      'Create Purchase Order functionality will be implemented in a future phase'
    );
  };

  if (loading || materialsLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!sale) {
    return <ErrorMessage message='Order not found' />;
  }

  if (requirements.length === 0) {
    return (
      <div className='p-4 text-center text-gray-500'>
        <p>No material requirements found for this order.</p>
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
          disabled={!allMaterialsAvailable}
        >
          Generate Picking List
        </button>

        {anyMaterialsNeedOrdering && (
          <button
            type='button'
            className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            onClick={handleCreatePurchaseOrder}
          >
            Create Purchase Order
          </button>
        )}
      </div>
    </div>
  );
};

export default MaterialRequirements;
