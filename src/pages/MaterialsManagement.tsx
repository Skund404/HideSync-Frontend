import { MaterialType } from '@/types/materialTypes'; // Direct import, matching the context
import MaterialsFilter from '@components/materials/common/MaterialsFilter';
import MaterialsHeader from '@components/materials/common/MaterialsHeader';
import HardwareView from '@components/materials/hardware/HardwareView';
import LeatherView from '@components/materials/leather/LeatherView';
import SuppliesView from '@components/materials/supplies/SuppliesView';
import { useMaterials } from '@context/MaterialsContext';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface MaterialsManagementProps {
  initialTab?: MaterialType; // Direct type, not namespaced
}

const MaterialsManagement: React.FC<MaterialsManagementProps> = ({
  initialTab,
}) => {
  const { activeTab, setActiveTab } = useMaterials();
  const navigate = useNavigate();
  const location = useLocation();
  const [showAddMaterial, setShowAddMaterial] = useState(false);

  // Set active tab based on URL or initialTab prop when component mounts
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    } else if (location.pathname.includes('/leather')) {
      setActiveTab(MaterialType.LEATHER);
    } else if (location.pathname.includes('/hardware')) {
      setActiveTab(MaterialType.HARDWARE);
    } else if (location.pathname.includes('/supplies')) {
      setActiveTab(MaterialType.SUPPLIES);
    }
  }, [initialTab, location.pathname, setActiveTab]);

  // Update URL when active tab changes
  useEffect(() => {
    if (activeTab === MaterialType.LEATHER) {
      navigate('/materials/leather');
    } else if (activeTab === MaterialType.HARDWARE) {
      navigate('/materials/hardware');
    } else if (activeTab === MaterialType.SUPPLIES) {
      navigate('/materials/supplies');
    } else {
      navigate('/materials');
    }
  }, [activeTab, navigate]);

  const handleAddMaterial = () => {
    setShowAddMaterial(true);
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
        // You could render a combined view or default to leather
        return <LeatherView onAdd={handleAddMaterial} />;
    }
  };

  return (
    <div className='flex-1 overflow-auto'>
      <MaterialsHeader onAdd={handleAddMaterial} />
      <MaterialsFilter />
      <div className='p-4'>{renderView()}</div>

      {/* Add Material Modal would go here */}
      {showAddMaterial && (
        <div className='fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center'>
          <div className='bg-white rounded-lg p-6 w-full max-w-xl'>
            <h2 className='text-xl font-semibold mb-4'>Add New Material</h2>
            <p className='mb-4 text-stone-500'>
              Implement add material form based on the active tab.
            </p>
            <div className='flex justify-end'>
              <button
                onClick={() => setShowAddMaterial(false)}
                className='px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700'
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

export default MaterialsManagement;
