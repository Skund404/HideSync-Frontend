import React, { useEffect, useState } from 'react';
import { useMaterials } from '../../../context/MaterialsContext';
import { Material } from '../../../types/materialTypes';
import {
  filterMaterials,
  formatStatus,
  getColorHex,
  getStatusColorClass,
} from '../../../utils/materialHelpers';
import EmptyState from '../common/EmptyState';
import MaterialCard from '../common/MaterialCard';
import StorageMap from '../common/StorageMap';

// Mock data import - in a real app, this would come from an API
import { supplyMaterials } from '../../../services/mock/supplies';

interface SuppliesViewProps {
  materials: Material[];
  onAdd: () => void;
  onEdit: (material: Material) => void;
  onDelete: (id: number) => Promise<void>;
  isDeleting: boolean;
}
const SuppliesView: React.FC<SuppliesViewProps> = ({ onAdd }) => {
  const {
    viewMode,
    searchQuery,
    filterType,
    filterMaterial,
    filterFinish,
    filterStatus,
    filterStorage,
    filterSupplier,
    filterSuppliesType,
    filterColor,
    applyFilters,
  } = useMaterials();

  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [detailViewMaterial, setDetailViewMaterial] = useState<Material | null>(
    null
  );
  const [stockAdjustMaterial, setStockAdjustMaterial] =
    useState<Material | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [storageFilter, setStorageFilter] = useState<string | null>(null);

  // Simulate loading data from API
  useEffect(() => {
    const loadData = async () => {
      // In a real application, this would be an API call
      // For now, we'll just simulate a delay
      setTimeout(() => {
        setMaterials(supplyMaterials);
        setLoading(false);
      }, 500);
    };

    loadData();
  }, []);

  // Filter materials based on current filters
  const initialFiltered = filterMaterials(materials, {
    searchQuery,
    filterType,
    filterMaterial,
    filterFinish,
    filterStatus,
    filterStorage,
    filterSupplier,
    filterSuppliesType,
    filterColor,
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
                  Brand
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
            </thead>
            <tbody className='bg-white divide-y divide-stone-200'>
              {filteredMaterials.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className='px-6 py-4 text-center text-sm text-stone-500'
                  >
                    No supplies match your filters
                  </td>
                </tr>
              ) : (
                filteredMaterials.map((material: any) => (
                  <tr key={material.id}>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-stone-800'>
                      {material.name}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-stone-600'>
                      {material.materialType}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-stone-600'>
                      {material.brand || '-'}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      {material.color ? (
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
                      ) : (
                        <span className='text-sm text-stone-400'>-</span>
                      )}
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
                      {material.quantity} {material.unit || 'units'}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-stone-600'>
                      {material.storageLocation || '-'}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-stone-600'>
                      {material.supplier || '-'}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-right space-x-2'>
                      <button
                        onClick={() => handleViewMaterial(material)}
                        className='text-amber-600 hover:text-amber-800'
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleAdjustStock(material)}
                        className='text-amber-600 hover:text-amber-800'
                      >
                        Adjust
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
    if (loading) {
      return (
        <div className='flex justify-center items-center h-64'>
          <svg
            className='animate-spin -ml-1 mr-3 h-8 w-8 text-green-600'
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
          >
            <circle
              className='opacity-25'
              cx='12'
              cy='12'
              r='10'
              stroke='currentColor'
              strokeWidth='4'
            ></circle>
            <path
              className='opacity-75'
              fill='currentColor'
              d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
            ></path>
          </svg>
          <span className='text-lg font-medium text-stone-600'>
            Loading supplies...
          </span>
        </div>
      );
    }

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
              Detailed supply information would be displayed here
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

export default SuppliesView;
