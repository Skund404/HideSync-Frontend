// src/pages/SupplierManagement.tsx
import ErrorMessage from '@/components/common/ErrorMessage';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import CreatePurchaseOrderModal from '@/components/purchases/CreatePurchaseOrderModal';
import SupplierDetailsModal from '@/components/suppliers/SupplierDetailsModal';
import SupplierFilterBar from '@/components/suppliers/SupplierFilterBar';
import SupplierForm from '@/components/suppliers/SupplierForm';
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
  const [showAddSupplierForm, setShowAddSupplierForm] = useState(false);
  const [supplierToEdit, setSupplierToEdit] = useState<Supplier | null>(null);

  const { 
    filteredSuppliers, 
    filters, 
    setFilters, 
    loading, 
    error,
    retryFetchSuppliers 
  } = useSuppliers();

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
    setShowAddSupplierForm(true);
  };
  
  // Handle editing a supplier
  const handleEditSupplier = (supplier: Supplier) => {
    setSupplierToEdit(supplier);
  };
  
  // Handle form submission success
  const handleFormSuccess = () => {
    setShowAddSupplierForm(false);
    setSupplierToEdit(null);
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

      {error && (
        <div className="mb-6">
          <ErrorMessage 
            message={error} 
            onRetry={retryFetchSuppliers} 
          />
        </div>
      )}

      {loading ? (
        <LoadingSpinner 
          size="medium" 
          color="amber" 
          message="Loading suppliers..." 
        />
      ) : (
        viewMode === 'grid' ? (
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
        )
      )}

      {selectedSupplier && showDetailsModal && (
        <SupplierDetailsModal
          supplier={selectedSupplier}
          onClose={() => setShowDetailsModal(false)}
          onCreatePurchase={() => {
            setShowDetailsModal(false);
            setShowCreatePurchase(true);
          }}
          onEditSupplier={(supplier) => {
            setShowDetailsModal(false);
            setSupplierToEdit(supplier);
          }}
        />
      )}

      {/* Create Purchase Order Modal */}
      {selectedSupplier && showCreatePurchase && (
        <CreatePurchaseOrderModal
          onClose={() => setShowCreatePurchase(false)}
          initialSupplierId={selectedSupplier.id}
        />
      )}
      
      {/* Add Supplier Form */}
      {showAddSupplierForm && (
        <SupplierForm
          onClose={() => setShowAddSupplierForm(false)}
          onSuccess={handleFormSuccess}
        />
      )}
      
      {/* Edit Supplier Form */}
      {supplierToEdit && (
        <SupplierForm
          initialSupplier={supplierToEdit}
          onClose={() => setSupplierToEdit(null)}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
};

export default SupplierManagement;