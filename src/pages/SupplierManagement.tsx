// src/pages/SupplierManagement.tsx
import SupplierDetailsModal from '@/components/suppliers/SupplierDetailsModal';
import SupplierFilterBar from '@/components/suppliers/SupplierFilterBar';
import SupplierGridView from '@/components/suppliers/SupplierGridView';
import SupplierListView from '@/components/suppliers/SupplierListView';
import { useSuppliers } from '@/context/SupplierContext';
import { Supplier } from '@/types/supplierTypes';
import React, { useState } from 'react';

const SupplierManagement: React.FC = () => {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null
  );
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCreatePurchase, setShowCreatePurchase] = useState(false);

  const { filteredSuppliers, filters, setFilters } = useSuppliers();

  // Handle viewing a supplier's details
  const handleViewSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setShowDetailsModal(true);
  };

  // Handle creating a purchase order for a supplier
  const handleCreatePurchase = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setShowCreatePurchase(true);
  };

  // Handle adding a new supplier
  const handleAddSupplier = () => {
    // This would typically open a create supplier modal
    console.log('Add new supplier');
  };

  return (
    <div className='container mx-auto px-4 py-6'>
      <SupplierFilterBar
        filters={filters}
        setFilters={setFilters}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onAddSupplier={handleAddSupplier}
      />

      {viewMode === 'grid' ? (
        <SupplierGridView
          suppliers={filteredSuppliers}
          onViewSupplier={handleViewSupplier}
          onCreatePurchase={handleCreatePurchase}
        />
      ) : (
        <SupplierListView
          suppliers={filteredSuppliers}
          onViewSupplier={handleViewSupplier}
          onCreatePurchase={handleCreatePurchase}
        />
      )}

      {selectedSupplier && showDetailsModal && (
        <SupplierDetailsModal
          supplier={selectedSupplier}
          onClose={() => setShowDetailsModal(false)}
          onCreatePurchase={() => {
            setShowDetailsModal(false);
            setShowCreatePurchase(true);
          }}
        />
      )}

      {/* Create Purchase Order Modal would be added here */}
      {selectedSupplier && showCreatePurchase && (
        <div className='fixed inset-0 bg-stone-900/50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-lg shadow-xl max-w-4xl w-full'>
            <div className='p-6 border-b border-stone-200'>
              <h2 className='text-xl font-medium'>Create Purchase Order</h2>
              <p className='text-stone-500 text-sm'>
                Supplier: {selectedSupplier.name}
              </p>
            </div>
            <div className='p-6'>
              <p>Purchase order form would go here.</p>
            </div>
            <div className='p-6 border-t border-stone-200 flex justify-end space-x-3'>
              <button
                onClick={() => setShowCreatePurchase(false)}
                className='px-4 py-2 bg-stone-100 text-stone-700 rounded-md'
              >
                Cancel
              </button>
              <button className='px-4 py-2 bg-amber-600 text-white rounded-md'>
                Create Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierManagement;
