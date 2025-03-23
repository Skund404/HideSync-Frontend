import EmptyState from '@/components/materials/common/EmptyState';
import MaterialCard from '@/components/materials/common/MaterialCard';
import StorageMap from '@/components/materials/common/StorageMap';
import { useMaterials } from '@/context/MaterialsContext';
import { Material } from '@/types/materialTypes';
import {
  filterMaterials,
  formatStatus,
  getColorHex,
  getStatusColorClass,
} from '@/utils/materialHelpers';
import React, { useState } from 'react';

interface LeatherViewProps {
  materials: Material[];
  onAdd: () => void;
  onEdit: (material: Material) => void;
  onDelete: (id: number) => Promise<void>;
  isDeleting: boolean;
}

const LeatherView: React.FC<LeatherViewProps> = ({ 
  materials, 
  onAdd, 
  onEdit,
  onDelete,
  isDeleting 
}) => {
  const {
    viewMode,
    searchQuery,
    filterType,
    filterMaterial,
    filterFinish,
    filterStatus,
    filterStorage,
    filterSupplier,
    filterLeatherType,
    filterTannage,
    filterAnimalSource,
    filterThickness,
    filterColor,
    filterGrade,
  } = useMaterials();

  const [detailViewMaterial, setDetailViewMaterial] = useState<Material | null>(null);
  const [stockAdjustMaterial, setStockAdjustMaterial] = useState<Material | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [storageFilter, setStorageFilter] = useState<string | null>(null);

  // Filter materials based on current filters
  const initialFiltered = filterMaterials(materials, {
    searchQuery,
    filterType,
    filterMaterial,
    filterFinish,
    filterStatus,
    filterStorage,
    filterSupplier,
    filterLeatherType,
    filterTannage,
    filterAnimalSource,
    filterThickness,
    filterColor,
    filterGrade,
  });

  // Apply additional storage location filter if selected from map
  const filteredMaterials = storageFilter
    ? initialFiltered.filter((m) => m.storageLocation === storageFilter)
    : initialFiltered;

  // View material details
  const handleViewMaterial = (material: Material) => {
    setDetailViewMaterial(material);
  };

  // Adjust stock
  const handleAdjustStock = (material: Material) => {
    setStockAdjustMaterial(material);
  };

  // Edit material
  const handleEditMaterial = (material: Material) => {
    onEdit(material);
  };

  // Delete material
  const handleDeleteMaterial = async (material: Material) => {
    if (window.confirm(`Are you sure you want to delete ${material.name}?`)) {
      await onDelete(material.id);
    }
  };

  // Close detail modal
  const closeDetailModal = () => {
    setDetailViewMaterial(null);
  };

  // Close stock adjust modal
  const closeStockModal = () => {
    setStockAdjustMaterial(null);
  };

  // Handle location click in storage map
  const handleLocationClick = (location: any) => {
    setSelectedLocation(location.fullLocation);
    setStorageFilter(location.fullLocation);
  };

  // Render list view
  const renderListView = () => {
    return (
      <div className='bg-white shadow-sm rounded-lg border border-stone-200 overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-stone-200'>
            <thead className='bg-stone-50'>
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
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-stone-200'>
              {filteredMaterials.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className='px-6 py-4 text-center text-sm text-stone-500'
                  >
                    No leather materials match your filters
                  </td>
                </tr>
              ) : (
                filteredMaterials.map((material: any) => (
                  <tr key={material.id}>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-stone-800'>
                      {material.name}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-stone-600'>
                      {material.leatherType}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-stone-600'>
                      {material.animalSource}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-stone-600'>
                      {material.thickness}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='flex items-center'>
                        <div
                          className='h-4 w-4 rounded-full mr-2'
                          style={{
                            backgroundColor: getColorHex(material.color),
                          }}
                        ></div>
                        <span className='text-sm text-stone-600'>
                          {material.color}
                        </span>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColorClass(
                          material.status
                        )}`}
                      >
                        {formatStatus(material.status)}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-stone-600'>
                      {material.quantity} {material.unit || 'sq ft'}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-stone-600'>
                      {material.storageLocation || '-'}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-right space-x-2'>
                      <button
                        onClick={() => handleViewMaterial(material)}
                        className='text-amber-600 hover:text-amber-800'
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleEditMaterial(material)}
                        className='text-blue-600 hover:text-blue-800'
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteMaterial(material)}
                        disabled={isDeleting}
                        className='text-red-600 hover:text-red-800'
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Render view based on viewMode
  const renderView = () => {
    if (filteredMaterials.length === 0 && !storageFilter) {
      return <EmptyState onAdd={onAdd} />;
    }

    // Storage filter notification
    if (storageFilter) {
      return (
        <div>
          <div className='bg-amber-50 border border-amber-200 p-3 mb-4 rounded-md flex justify-between items-center'>
            <span className='text-sm text-amber-800'>
              Showing items in location: <strong>{storageFilter}</strong>
            </span>
            <button
              onClick={() => {
                setStorageFilter(null);
                setSelectedLocation(null);
              }}
              className='text-xs bg-white border border-amber-300 px-2 py-1 rounded text-amber-700 hover:bg-amber-100'
            >
              Clear Location Filter
            </button>
          </div>

          {/* Show appropriate view based on viewMode, but with filtered items */}
          {viewMode === 'grid' && (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {filteredMaterials.map((material) => (
                <MaterialCard
                  key={material.id}
                  material={material}
                  onView={handleViewMaterial}
                  onAdjustStock={handleAdjustStock}
                  onEdit={() => handleEditMaterial(material)}
                  onDelete={() => handleDeleteMaterial(material)}
                  isDeleting={isDeleting}
                />
              ))}
            </div>
          )}
          {viewMode === 'list' && renderListView()}
          {viewMode === 'storage' && (
            <StorageMap
              materials={filteredMaterials}
              onLocationClick={handleLocationClick}
              highlightedLocations={selectedLocation ? [selectedLocation] : []}
            />
          )}
        </div>
      );
    }

    // Regular views if no storage filter active
    switch (viewMode) {
      case 'grid':
        return (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {filteredMaterials.map((material) => (
              <MaterialCard
                key={material.id}
                material={material}
                onView={handleViewMaterial}
                onAdjustStock={handleAdjustStock}
                onEdit={() => handleEditMaterial(material)}
                onDelete={() => handleDeleteMaterial(material)}
                isDeleting={isDeleting}
              />
            ))}
          </div>
        );
      case 'list':
        return renderListView();
      case 'storage':
        return (
          <StorageMap
            materials={filteredMaterials}
            onLocationClick={handleLocationClick}
            highlightedLocations={selectedLocation ? [selectedLocation] : []}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      {renderView()}

      {/* Detail Modal */}
      {detailViewMaterial && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-lg p-6 w-full max-w-3xl max-h-screen overflow-y-auto'>
            <div className='flex justify-between items-start mb-4'>
              <h2 className='text-xl font-bold'>{detailViewMaterial.name}</h2>
              <button
                onClick={closeDetailModal}
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
            <div className='text-center p-8 text-stone-600'>
              Detailed material information would be displayed here
            </div>
            <div className='flex justify-end mt-4'>
              <button
                onClick={closeDetailModal}
                className='px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700'
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {stockAdjustMaterial && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-lg p-6 w-full max-w-md'>
            <div className='flex justify-between items-start mb-4'>
              <h2 className='text-xl font-bold'>Adjust Stock</h2>
              <button
                onClick={closeStockModal}
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
            <div className='text-center p-8 text-stone-600'>
              Stock adjustment form would be here
            </div>
            <div className='flex justify-end mt-4 space-x-2'>
              <button
                onClick={closeStockModal}
                className='px-4 py-2 border border-stone-300 rounded-md text-stone-700 hover:bg-stone-50'
              >
                Cancel
              </button>
              <button
                onClick={closeStockModal}
                className='px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700'
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LeatherView;