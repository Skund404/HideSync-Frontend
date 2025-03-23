// src/components/patterns/materials/MaterialRequirementsViewer.tsx
import React, { useEffect, useState } from 'react';
import * as patternMaterialsService from '../../../services/material-requirements-service';
import * as salesMaterialsService from '../../../services/sales-materials-service';
import { SaleMaterial } from '../../../services/sales-materials-service';
import ErrorMessage from '../../common/ErrorMessage';
import LoadingSpinner from '../../common/LoadingSpinner';

interface MaterialRequirementsViewerProps {
  saleId?: number;
  patternId?: number;
  onGeneratePickingList?: () => void;
}

// Define inventory status thresholds
const INVENTORY_THRESHOLDS = {
  LOW: 0.25, // 25% or less of required quantity available
  MEDIUM: 0.75, // 75% or less of required quantity available
  // Above 75% is considered good
};

const MaterialRequirementsViewer: React.FC<MaterialRequirementsViewerProps> = ({
  saleId,
  patternId,
  onGeneratePickingList,
}) => {
  const [materials, setMaterials] = useState<SaleMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reserving, setReserving] = useState(false);
  const [reserveSuccess, setReserveSuccess] = useState(false);
  const [selectedMaterials, setSelectedMaterials] = useState<number[]>([]);
  const [inventoryStatus, setInventoryStatus] = useState<{
    allAvailable: boolean;
    lowStockItems: SaleMaterial[];
    availabilityPercent: number;
  }>({
    allAvailable: false,
    lowStockItems: [],
    availabilityPercent: 0,
  });

  // Load materials when the component mounts
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        setLoading(true);
        setError(null);

        let saleMaterials: SaleMaterial[] = [];
        let availabilityData: {
          allAvailable: boolean;
          missingItems: SaleMaterial[];
        };

        // Determine which API to call based on the provided ID
        if (saleId) {
          // Fetch sale materials and check availability
          saleMaterials = await salesMaterialsService.getSaleMaterials(saleId);
          availabilityData =
            await salesMaterialsService.checkMaterialAvailability(saleId);
        } else if (patternId) {
          // Fetch pattern materials and check availability
          saleMaterials = await patternMaterialsService.getPatternMaterials(
            patternId
          );
          availabilityData =
            await patternMaterialsService.checkPatternMaterialAvailability(
              patternId
            );
        } else {
          throw new Error('Either saleId or patternId must be provided');
        }

        // Calculate overall availability percentage
        const materialsWithQuantity = saleMaterials.filter(
          (m: SaleMaterial) => m.quantity > 0
        );
        let availableCount = 0;
        let lowStockItems: SaleMaterial[] = [];

        materialsWithQuantity.forEach((material: SaleMaterial) => {
          const availPercent =
            material.available !== undefined
              ? material.available / material.quantity
              : 0;

          if (availPercent >= 1) {
            availableCount++;
          } else if (availPercent <= INVENTORY_THRESHOLDS.LOW) {
            lowStockItems.push(material);
          }
        });

        const availabilityPercent =
          materialsWithQuantity.length > 0
            ? (availableCount / materialsWithQuantity.length) * 100
            : 0;

        setMaterials(saleMaterials);
        setInventoryStatus({
          allAvailable: availabilityData.allAvailable,
          lowStockItems,
          availabilityPercent,
        });

        // Select all materials by default
        setSelectedMaterials(
          saleMaterials
            .filter((m: SaleMaterial) => m.materialId)
            .map((m: SaleMaterial) => m.materialId!)
        );
      } catch (err) {
        console.error('Error fetching materials:', err);
        setError('Failed to load material requirements');
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, [saleId, patternId]);

  // Handle material selection
  const handleToggleSelect = (materialId: number) => {
    setSelectedMaterials((prev) => {
      if (prev.includes(materialId)) {
        return prev.filter((id) => id !== materialId);
      } else {
        return [...prev, materialId];
      }
    });
  };

  // Handle select all
  const handleSelectAll = (select: boolean) => {
    if (select) {
      setSelectedMaterials(
        materials
          .filter((m: SaleMaterial) => m.materialId)
          .map((m: SaleMaterial) => m.materialId!)
      );
    } else {
      setSelectedMaterials([]);
    }
  };

  // Handle reserve materials
  const handleReserveMaterials = async () => {
    if (!saleId) {
      setError('Cannot reserve materials for patterns, only for sales');
      return;
    }

    try {
      setReserving(true);
      setError(null);
      setReserveSuccess(false);

      const success = await salesMaterialsService.reserveSaleMaterials(
        saleId,
        selectedMaterials
      );

      if (success) {
        setReserveSuccess(true);

        // Refresh materials to show updated availability
        const updatedMaterials = await salesMaterialsService.getSaleMaterials(
          saleId
        );
        const availabilityData =
          await salesMaterialsService.checkMaterialAvailability(saleId);

        // Recalculate availability metrics
        const materialsWithQuantity = updatedMaterials.filter(
          (m: SaleMaterial) => m.quantity > 0
        );
        let availableCount = 0;
        let lowStockItems: SaleMaterial[] = [];

        materialsWithQuantity.forEach((material: SaleMaterial) => {
          const availPercent =
            material.available !== undefined
              ? material.available / material.quantity
              : 0;

          if (availPercent >= 1) {
            availableCount++;
          } else if (availPercent <= INVENTORY_THRESHOLDS.LOW) {
            lowStockItems.push(material);
          }
        });

        const availabilityPercent =
          materialsWithQuantity.length > 0
            ? (availableCount / materialsWithQuantity.length) * 100
            : 0;

        setMaterials(updatedMaterials);
        setInventoryStatus({
          allAvailable: availabilityData.allAvailable,
          lowStockItems,
          availabilityPercent,
        });
      } else {
        setError('Failed to reserve materials');
      }
    } catch (err) {
      console.error('Error reserving materials:', err);
      setError('Error reserving materials');
    } finally {
      setReserving(false);
    }
  };

  // Handle generate picking list
  const handleGeneratePickingList = async () => {
    if (onGeneratePickingList) {
      onGeneratePickingList();
    }
  };

  // Calculate availability percentage
  const calculateAvailabilityPercent = (
    available: number = 0,
    required: number
  ) => {
    if (required <= 0) return 0;
    const percent = (available / required) * 100;
    return Math.min(percent, 100); // Cap at 100%
  };

  // Overall inventory status indicator
  const getInventoryStatusColor = (percent: number) => {
    if (percent <= INVENTORY_THRESHOLDS.LOW * 100) return 'bg-red-500';
    if (percent <= INVENTORY_THRESHOLDS.MEDIUM * 100) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // Get availability bar color
  const getAvailabilityBarColor = (available: number, required: number) => {
    if (available === 0) return 'bg-red-500';

    const ratio = available / required;
    if (ratio <= INVENTORY_THRESHOLDS.LOW) return 'bg-red-500';
    if (ratio <= INVENTORY_THRESHOLDS.MEDIUM) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (loading) {
    return (
      <div className='p-4 flex justify-center'>
        <LoadingSpinner
          size='small'
          color='amber'
          message='Loading material requirements...'
        />
      </div>
    );
  }

  if (error && !reserving) {
    return <ErrorMessage message={error} />;
  }

  if (materials.length === 0) {
    return (
      <div className='p-4 text-center text-gray-500'>
        <p>No material requirements found.</p>
      </div>
    );
  }

  const allSelected = materials
    .filter((m: SaleMaterial) => m.materialId)
    .every((m: SaleMaterial) => selectedMaterials.includes(m.materialId!));

  return (
    <div className='space-y-4'>
      <h3 className='text-lg font-medium text-gray-900'>
        Material Requirements
      </h3>

      {/* Overall inventory status */}
      <div className='bg-white rounded-lg border border-gray-200 p-4'>
        <div className='flex justify-between items-center mb-2'>
          <h4 className='text-sm font-medium text-gray-700'>
            Inventory Status
          </h4>
          <span className='text-sm text-gray-500'>
            {inventoryStatus.availabilityPercent.toFixed(0)}% Available
          </span>
        </div>

        <div className='w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700'>
          <div
            className={`${getInventoryStatusColor(
              inventoryStatus.availabilityPercent
            )} h-2.5 rounded-full`}
            style={{ width: `${inventoryStatus.availabilityPercent}%` }}
          ></div>
        </div>

        {/* Inventory alerts */}
        {inventoryStatus.lowStockItems.length > 0 && (
          <div className='mt-3 bg-yellow-50 border-l-4 border-yellow-400 p-4'>
            <div className='flex'>
              <div className='flex-shrink-0'>
                <svg
                  className='h-5 w-5 text-yellow-400'
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                >
                  <path
                    fillRule='evenodd'
                    d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
                    clipRule='evenodd'
                  />
                </svg>
              </div>
              <div className='ml-3'>
                <p className='text-sm text-yellow-700'>
                  <span className='font-medium'>Low inventory alert: </span>
                  {inventoryStatus.lowStockItems.length}{' '}
                  {inventoryStatus.lowStockItems.length === 1
                    ? 'material'
                    : 'materials'}{' '}
                  have insufficient stock.
                </p>
                <ul className='mt-2 text-xs text-yellow-600 list-disc list-inside'>
                  {inventoryStatus.lowStockItems.map((item, index) => (
                    <li key={index}>
                      {item.materialName}: {item.available || 0} of{' '}
                      {item.quantity} {item.unit.toString().toLowerCase()}{' '}
                      available
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {reserveSuccess && (
          <div className='mt-3 bg-green-50 border-l-4 border-green-400 p-4'>
            <div className='flex'>
              <div className='flex-shrink-0'>
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
              </div>
              <div className='ml-3'>
                <p className='text-sm text-green-700'>
                  Materials have been successfully reserved for this order.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {error && <ErrorMessage message={error} />}

      <div className='overflow-x-auto'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              <th scope='col' className='px-2 py-3 text-left'>
                <input
                  type='checkbox'
                  checked={allSelected}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className='h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded'
                />
              </th>
              <th
                scope='col'
                className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
              >
                Material
              </th>
              <th
                scope='col'
                className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
              >
                Type
              </th>
              <th
                scope='col'
                className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
              >
                Quantity
              </th>
              <th
                scope='col'
                className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
              >
                Availability
              </th>
              <th
                scope='col'
                className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
              >
                Location
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {materials.map((material, index) => (
              <tr
                key={index}
                className={
                  material.available !== undefined &&
                  material.available < material.quantity
                    ? 'bg-yellow-50'
                    : ''
                }
              >
                <td className='px-2 py-4 whitespace-nowrap'>
                  {material.materialId && (
                    <input
                      type='checkbox'
                      checked={selectedMaterials.includes(material.materialId)}
                      onChange={() => handleToggleSelect(material.materialId!)}
                      className='h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded'
                    />
                  )}
                </td>
                <td className='px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                  {material.materialName}
                </td>
                <td className='px-4 py-4 whitespace-nowrap text-sm text-gray-500'>
                  {material.materialType.toString().replace('_', ' ')}
                </td>
                <td className='px-4 py-4 whitespace-nowrap text-sm text-gray-500'>
                  {material.quantity} {material.unit.toString().toLowerCase()}
                </td>
                <td className='px-4 py-4 whitespace-nowrap text-sm'>
                  {material.available !== undefined ? (
                    <div className='flex flex-col'>
                      <div className='flex justify-between items-center mb-1'>
                        <span
                          className={`text-xs font-medium ${
                            material.available < material.quantity
                              ? 'text-yellow-700'
                              : 'text-green-700'
                          }`}
                        >
                          {material.available} / {material.quantity}{' '}
                          {material.unit.toString().toLowerCase()}
                        </span>
                      </div>
                      <div className='w-full bg-gray-200 rounded-full h-1.5'>
                        <div
                          className={`${getAvailabilityBarColor(
                            material.available,
                            material.quantity
                          )} h-1.5 rounded-full`}
                          style={{
                            width: `${calculateAvailabilityPercent(
                              material.available,
                              material.quantity
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  ) : (
                    <span>-</span>
                  )}
                </td>
                <td className='px-4 py-4 whitespace-nowrap text-sm text-gray-500'>
                  {material.location || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className='flex justify-end space-x-4 pt-4'>
        {saleId && ( // Only show reserving button for sales
          <button
            onClick={handleReserveMaterials}
            disabled={reserving || selectedMaterials.length === 0}
            className='inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50'
          >
            {reserving ? (
              <>
                <LoadingSpinner size='small' color='amber' />
                <span className='ml-2'>Reserving...</span>
              </>
            ) : (
              'Reserve Materials'
            )}
          </button>
        )}

        {onGeneratePickingList && (
          <button
            onClick={handleGeneratePickingList}
            disabled={
              !inventoryStatus.allAvailable &&
              materials.some(
                (m) => m.available !== undefined && m.available < m.quantity
              )
            }
            className='inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:bg-amber-300'
          >
            Generate Picking List
          </button>
        )}
      </div>
    </div>
  );
};

export default MaterialRequirementsViewer;
