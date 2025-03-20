// src/pages/MaterialsManagement.tsx
import { MaterialType } from '@/types/materialTypes';
import MaterialsFilter from '@components/materials/common/MaterialsFilter';
import MaterialsHeader from '@components/materials/common/MaterialsHeader';
import HardwareView from '@components/materials/hardware/HardwareView';
import LeatherView from '@components/materials/leather/LeatherView';
import SuppliesView from '@components/materials/supplies/SuppliesView';
import { useMaterials } from '@context/MaterialsContext';
import React, { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

const MaterialsManagement: React.FC = () => {
  const { activeTab, setActiveTab } = useMaterials();
  const navigate = useNavigate();
  const { materialType } = useParams<{ materialType?: string }>();
  const location = useLocation();

  // Map the URL param to a MaterialType
  const getMaterialTypeFromParam = (param?: string): MaterialType => {
    switch (param) {
      case 'leather':
        return MaterialType.LEATHER;
      case 'hardware':
        return MaterialType.HARDWARE;
      case 'supplies':
        return MaterialType.SUPPLIES;
      default:
        return MaterialType.LEATHER;
    }
  };

  // Update activeTab based on the URL param
  useEffect(() => {
    const type = getMaterialTypeFromParam(materialType);
    setActiveTab(type);
  }, [materialType, setActiveTab]);

  // Removed the auto-navigate effect to prevent bidirectional updates.
  // Instead, update the URL directly in the tab click handlers in your UI.

  const handleAddMaterial = () => {
    console.log('Add material');
  };

  // Render appropriate view based on active tab
  const renderView = () => {
    switch (activeTab) {
      case MaterialType.LEATHER:
        return <LeatherView onAdd={handleAddMaterial} />;
      case MaterialType.HARDWARE:
        return <HardwareView onAdd={handleAddMaterial} />;
      case MaterialType.SUPPLIES:
        return <SuppliesView onAdd={handleAddMaterial} />;
      default:
        return <LeatherView onAdd={handleAddMaterial} />;
    }
  };

  return (
    <div className='flex-1 overflow-auto'>
      <MaterialsHeader onAdd={handleAddMaterial} />
      <MaterialsFilter />
      <div className='p-4'>{renderView()}</div>
    </div>
  );
};

export default MaterialsManagement;
