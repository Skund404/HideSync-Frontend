// src/pages/MaterialsManagement.tsx
import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

// Material-specific components
import MaterialForm from '@components/materials/common/MaterialForm';
import MaterialsFilter from '@components/materials/common/MaterialsFilter';
import MaterialsHeader from '@components/materials/common/MaterialsHeader';
import MaterialImportExport from '@components/materials/MaterialImportExport';

// View components
import HardwareView from '@components/materials/hardware/HardwareView';
import LeatherView from '@components/materials/leather/LeatherView';
import SuppliesView from '@components/materials/supplies/SuppliesView';

// Contexts and Services
import { useMaterials } from '@context/MaterialsContext';
import {
  HardwareMaterialCreate,
  LeatherMaterialCreate,
  MaterialService,
  SuppliesMaterialCreate,
} from '@services/materials-service';

// Types - only import what we need
import { MaterialType } from '@/types/materialTypes';

// Import service enum as a separate named import to avoid conflicts
import { MaterialType as ServiceMaterialType } from '@/types/enums';

// Utilities
import {
  convertToServiceEnum,
  normalizeMaterial,
} from '@/utils/materialTypeMapper';

// Common components
import ErrorMessage from '@components/common/ErrorMessage';
import LoadingSpinner from '@components/common/LoadingSpinner';
import Modal from '@components/common/Modal';

const MaterialsManagement: React.FC = () => {
  // Routing and Navigation
  const navigate = useNavigate();
  const location = useLocation();
  const { materialType } = useParams<{ materialType?: string }>();

  // Material Context
  const { activeTab, setActiveTab, materials, loading, error, fetchMaterials } =
    useMaterials();

  // Local State - using any type for selectedMaterial to avoid conflicts
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  const [operationLoading, setOperationLoading] = useState(false);
  const [operationError, setOperationError] = useState<string | null>(null);

  // Determine Material Type from URL
  const getMaterialTypeFromPath = useCallback((path: string): MaterialType => {
    if (path.includes('/leather')) return MaterialType.LEATHER;
    if (path.includes('/hardware')) return MaterialType.HARDWARE;
    if (path.includes('/supplies')) return MaterialType.SUPPLIES;
    return MaterialType.LEATHER; // Default
  }, []);

  // Update Active Tab Based on Route
  useEffect(() => {
    if (materialType) {
      const detectedType = getMaterialTypeFromPath(location.pathname);
      setActiveTab(detectedType);
    }
  }, [materialType, location.pathname, setActiveTab, getMaterialTypeFromPath]);

  // Update URL When Active Tab Changes
  useEffect(() => {
    let newPath = '';
    switch (activeTab) {
      case MaterialType.LEATHER:
        newPath = '/materials/leather';
        break;
      case MaterialType.HARDWARE:
        newPath = '/materials/hardware';
        break;
      case MaterialType.SUPPLIES:
        newPath = '/materials/supplies';
        break;
      default:
        newPath = '/materials/leather';
    }

    if (location.pathname !== newPath) {
      navigate(newPath);
    }
  }, [activeTab, navigate, location.pathname]);

  // Material Operations
  const handleAddMaterial = () => {
    setSelectedMaterial(null);
    setIsModalOpen(true);
  };

  const handleEditMaterial = (material: any) => {
    setSelectedMaterial(material);
    setIsModalOpen(true);
  };

  const handleDeleteMaterial = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this material?')) {
      setOperationLoading(true);
      setOperationError(null);
      try {
        await MaterialService.deleteMaterial(id);
        await fetchMaterials();
      } catch (err: any) {
        setOperationError(err.message || 'Failed to delete material');
        console.error('Delete material error:', err);
      } finally {
        setOperationLoading(false);
      }
    }
  };

  const handleSubmitMaterial = async (formData: any) => {
    setOperationLoading(true);
    setOperationError(null);
    try {
      if (selectedMaterial) {
        // Update existing material
        const normalizedMaterial = normalizeMaterial(selectedMaterial);
        const materialId = normalizedMaterial.id;

        // Convert to the correct type expected by the API
        await MaterialService.updateMaterial(materialId, {
          ...formData,
          id: materialId, // Ensure ID is a number for the API
          materialType: convertToServiceEnum(activeTab), // Convert enum type for service
        });
      } else {
        // Create new material based on material type
        switch (activeTab) {
          case MaterialType.LEATHER:
            {
              const leatherData: LeatherMaterialCreate = {
                name: formData.name,
                materialType: ServiceMaterialType.LEATHER, // Use service enum
                quantity: formData.quantity,
                unit: formData.unit,
                status: formData.status,
                quality: formData.quality,
                description: formData.description,
                notes: formData.notes,
                supplierId: formData.supplierId,
                supplier: formData.supplier,
                sku: formData.sku,
                supplierSku: formData.supplierSku,
                storageLocation: formData.storageLocation,
                cost: formData.cost,
                price: formData.price,
                reorderPoint: formData.reorderPoint,
                // Leather-specific fields
                leatherType: formData.subtype || 'vegetable_tanned',
                tannage: formData.tannage || 'vegetable',
                animalSource: formData.animalSource || 'cowhide',
                thickness: formData.thickness || 2.0,
                area: formData.area,
                isFullHide: formData.isFullHide,
                color: formData.color,
                finish: formData.finish,
                grade: formData.grade,
              };
              await MaterialService.createLeatherMaterial(leatherData);
            }
            break;

          case MaterialType.HARDWARE:
            {
              const hardwareData: HardwareMaterialCreate = {
                name: formData.name,
                materialType: ServiceMaterialType.HARDWARE, // Use service enum
                quantity: formData.quantity,
                unit: formData.unit,
                status: formData.status,
                quality: formData.quality,
                description: formData.description,
                notes: formData.notes,
                supplierId: formData.supplierId,
                supplier: formData.supplier,
                sku: formData.sku,
                supplierSku: formData.supplierSku,
                storageLocation: formData.storageLocation,
                cost: formData.cost,
                price: formData.price,
                reorderPoint: formData.reorderPoint,
                // Hardware-specific fields
                hardwareType: formData.subtype || 'buckle',
                hardwareMaterial: formData.hardwareMaterial || 'brass',
                finish: formData.finish,
                size: formData.size,
                color: formData.color,
              };
              await MaterialService.createHardwareMaterial(hardwareData);
            }
            break;

          case MaterialType.SUPPLIES:
            {
              const suppliesData: SuppliesMaterialCreate = {
                name: formData.name,
                materialType: ServiceMaterialType.SUPPLIES, // Use service enum
                quantity: formData.quantity,
                unit: formData.unit,
                status: formData.status,
                quality: formData.quality,
                description: formData.description,
                notes: formData.notes,
                supplierId: formData.supplierId,
                supplier: formData.supplier,
                sku: formData.sku,
                supplierSku: formData.supplierSku,
                storageLocation: formData.storageLocation,
                cost: formData.cost,
                price: formData.price,
                reorderPoint: formData.reorderPoint,
                // Supplies-specific fields
                suppliesMaterialType: formData.subtype || 'thread',
                color: formData.color,
                threadThickness: formData.threadThickness,
                materialComposition: formData.materialComposition,
                volume: formData.volume,
                length: formData.length,
                dryingTime: formData.dryingTime,
                applicationMethod: formData.applicationMethod,
                finish: formData.finish,
              };
              await MaterialService.createSuppliesMaterial(suppliesData);
            }
            break;

          default:
            throw new Error(`Unsupported material type: ${activeTab}`);
        }
      }

      // Refresh materials and close modal
      await fetchMaterials();
      setIsModalOpen(false);
    } catch (err: any) {
      setOperationError(err.message || 'Failed to save material');
      console.error('Save material error:', err);
    } finally {
      setOperationLoading(false);
    }
  };

  // Render View Based on Active Tab
  const renderMaterialView = () => {
    if (loading) {
      return <LoadingSpinner message={`Loading ${activeTab} materials...`} />;
    }

    if (error) {
      return <ErrorMessage message={error} onRetry={fetchMaterials} />;
    }

    const filteredMaterials = materials.filter(
      (m) => m.materialType === activeTab
    );

    switch (activeTab) {
      case MaterialType.LEATHER:
        return (
          <LeatherView
            materials={filteredMaterials}
            onAdd={handleAddMaterial}
            onEdit={handleEditMaterial}
            onDelete={handleDeleteMaterial}
            isDeleting={operationLoading}
          />
        );
      case MaterialType.HARDWARE:
        return (
          <HardwareView
            materials={filteredMaterials}
            onAdd={handleAddMaterial}
            onEdit={handleEditMaterial}
            onDelete={handleDeleteMaterial}
            isDeleting={operationLoading}
          />
        );
      case MaterialType.SUPPLIES:
        return (
          <SuppliesView
            materials={filteredMaterials}
            onAdd={handleAddMaterial}
            onEdit={handleEditMaterial}
            onDelete={handleDeleteMaterial}
            isDeleting={operationLoading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className='flex-1 overflow-auto'>
      {/* Main Header with Add and Tab Navigation */}
      <MaterialsHeader onAdd={handleAddMaterial} />

      {/* Filtering Component */}
      <MaterialsFilter />

      {/* Material View Area */}
      <div className='p-4'>{renderMaterialView()}</div>

      {/* Material Form Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={selectedMaterial ? 'Edit Material' : 'Add New Material'}
        >
          <MaterialForm
            material={selectedMaterial} // Now correctly typed as any
            materialType={activeTab}
            onSubmit={handleSubmitMaterial}
            onCancel={() => setIsModalOpen(false)}
            isLoading={operationLoading}
          />
        </Modal>
      )}

      {/* Import/Export Modal */}
      {isImportExportOpen && (
        <Modal
          isOpen={isImportExportOpen}
          onClose={() => setIsImportExportOpen(false)}
          title='Materials Import/Export'
        >
          <MaterialImportExport />
        </Modal>
      )}

      {/* Global Operation Error Display */}
      {operationError && (
        <div className='fixed bottom-4 right-4 z-50'>
          <div className='bg-red-50 border border-red-200 text-red-700 p-3 rounded-md shadow-lg'>
            {operationError}
            <button
              onClick={() => setOperationError(null)}
              className='ml-2 text-red-500 hover:text-red-700'
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialsManagement;
