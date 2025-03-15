// src/pages/Storage.tsx
import StorageLocationDetail from '@components/storage/StorageLocationDetail';
import StorageLocationForm from '@components/storage/StorageLocationForm';
import StorageManagementView from '@components/storage/StorageManagementView';
import { StorageProvider } from '@context/StorageContext';
import React, { useState } from 'react';

const Storage: React.FC = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState<'visual' | 'list' | 'analytics'>(
    'visual'
  );

  // Handle viewing a specific item
  const handleViewItem = (item: any) => {
    setSelectedItem(item);
  };

  // Handle closing the item detail view
  const handleCloseDetail = () => {
    setSelectedItem(null);
  };

  // Handle opening the add form
  const handleShowAddForm = () => {
    setShowAddForm(true);
  };

  // Handle closing the add form
  const handleCloseAddForm = () => {
    setShowAddForm(false);
  };

  return (
    <StorageProvider>
      <div className='flex flex-col h-full'>
        {/* Add Location Modal */}
        {showAddForm && (
          <div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4'>
            <div className='w-full max-w-2xl'>
              <StorageLocationForm onClose={handleCloseAddForm} />
            </div>
          </div>
        )}

        {/* Item Detail Modal */}
        {selectedItem && (
          <div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4'>
            <div className='w-full max-w-2xl'>
              <StorageLocationDetail
                item={selectedItem}
                onClose={handleCloseDetail}
              />
            </div>
          </div>
        )}

        {/* Main Storage Management View */}
        <StorageManagementView viewMode={viewMode} />
      </div>
    </StorageProvider>
  );
};

export default Storage;
