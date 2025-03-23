// src/components/materials/all/AllMaterialsView.tsx
import { useMaterials } from '@/context/MaterialsContext';
import { Material } from '@/types/materialTypes';
import { formatPrice } from '@/utils/materialHelpers';
import { convertIdToNumber } from '@/utils/materialTypeMapper';
import React, { useState } from 'react';
import MaterialCard from '../common/MaterialCard';
import MaterialDetailModal from '../common/MaterialDetailModal';
import MaterialsTable from '../common/MaterialsTable';

interface AllMaterialsViewProps {
  materials: Material[];
  onAdd?: () => void;
  onEdit?: (material: Material) => void;
  onDelete?: (id: number) => Promise<void>;
  isDeleting?: boolean;
}

const AllMaterialsView: React.FC<AllMaterialsViewProps> = ({
  materials,
  onAdd,
  onEdit,
  onDelete,
  isDeleting = false,
}) => {
  const { viewMode } = useMaterials();
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(
    null
  );
  const [isAdjustingStock, setIsAdjustingStock] = useState(false);

  // Handle view material details
  const handleViewMaterial = (material: Material) => {
    setSelectedMaterial(material);
  };

  // Handle adjust stock
  const handleAdjustStock = (material: Material) => {
    setSelectedMaterial(material);
    setIsAdjustingStock(true);
  };

  // Handle edit material
  const handleEditMaterial = (material: Material) => {
    if (onEdit) {
      onEdit(material);
    }
  };

  // Handle delete material
  const handleDeleteMaterial = async (material: Material) => {
    if (onDelete) {
      try {
        // Convert ID to number before deletion
        const materialId =
          typeof material.id === 'string'
            ? convertIdToNumber(material.id)
            : material.id;

        await onDelete(materialId);
      } catch (error) {
        console.error('Error deleting material:', error);
      }
    }
  };

  // Group materials by type
  const getMaterialsByType = (): Record<string, Material[]> => {
    return materials.reduce((groups: Record<string, Material[]>, material) => {
      const type = material.materialType as string;
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(material);
      return groups;
    }, {});
  };

  // Calculate total value
  const calculateTotalValue = (): string => {
    const total = materials.reduce((sum, material) => {
      const price = material.costPrice || 0;
      return sum + price * material.quantity;
    }, 0);

    return formatPrice(total);
  };

  // Render materials grid view
  const renderMaterialGrid = () => {
    if (materials.length === 0) {
      return (
        <div className='text-center py-10'>
          <p className='text-gray-500'>No materials found</p>
          {onAdd && (
            <button
              onClick={onAdd}
              className='mt-4 px-4 py-2 bg-amber-600 text-white rounded-md'
            >
              Add Material
            </button>
          )}
        </div>
      );
    }

    const materialsByType = getMaterialsByType();

    return (
      <div className='space-y-6'>
        {Object.entries(materialsByType).map(([type, typeMaterials]) => (
          <div key={type}>
            <h2 className='text-lg font-medium text-gray-900 mb-3'>
              {type.charAt(0).toUpperCase() + type.slice(1)} Materials (
              {typeMaterials.length})
            </h2>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
              {typeMaterials.map((material) => (
                <MaterialCard
                  key={material.id}
                  material={material}
                  onView={handleViewMaterial}
                  onAdjustStock={handleAdjustStock}
                  onEdit={onEdit ? handleEditMaterial : undefined}
                  onDelete={
                    onDelete ? () => handleDeleteMaterial(material) : undefined
                  }
                  isDeleting={isDeleting}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render materials table view
  const renderMaterialTable = () => {
    return (
      <MaterialsTable
        materials={materials}
        materialType='all'
        onView={handleViewMaterial}
        onAdjustStock={handleAdjustStock}
        onEdit={onEdit ? handleEditMaterial : undefined}
        onDelete={
          onDelete
            ? (id) => {
                // Convert ID to number before deletion
                const materialId =
                  typeof id === 'string' ? convertIdToNumber(id) : id;
                return onDelete(materialId);
              }
            : undefined
        }
        isDeleting={isDeleting}
      />
    );
  };

  return (
    <div>
      <div className='bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-6'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div>
            <div className='text-sm text-gray-500'>Total Materials</div>
            <div className='text-2xl font-semibold text-gray-900'>
              {materials.length}
            </div>
          </div>
          <div>
            <div className='text-sm text-gray-500'>Total Value</div>
            <div className='text-2xl font-semibold text-gray-900'>
              {calculateTotalValue()}
            </div>
          </div>
          <div>
            <div className='text-sm text-gray-500'>Categories</div>
            <div className='text-2xl font-semibold text-gray-900'>
              {Object.keys(getMaterialsByType()).length}
            </div>
          </div>
        </div>
      </div>

      {viewMode === 'grid' ? renderMaterialGrid() : renderMaterialTable()}

      {/* Material detail modal */}
      {selectedMaterial && !isAdjustingStock && (
        <MaterialDetailModal
          material={selectedMaterial}
          onClose={() => setSelectedMaterial(null)}
          onEdit={
            onEdit ? () => handleEditMaterial(selectedMaterial) : undefined
          }
          onDelete={
            onDelete ? () => handleDeleteMaterial(selectedMaterial) : undefined
          }
          isDeleting={isDeleting}
        />
      )}

      {/* Stock adjustment modal would go here */}
      {selectedMaterial && isAdjustingStock && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 w-full max-w-lg'>
            <h2 className='text-xl font-bold mb-4'>
              Adjust Stock: {selectedMaterial.name}
            </h2>
            {/* Stock adjustment form would go here */}
            <div className='flex justify-end mt-4'>
              <button
                onClick={() => {
                  setSelectedMaterial(null);
                  setIsAdjustingStock(false);
                }}
                className='px-4 py-2 bg-amber-600 text-white rounded-md'
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllMaterialsView;
