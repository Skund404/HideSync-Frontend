// src/pages/PurchaseOrderManagement.tsx
import CreatePurchaseOrderModal from '@/components/purchases/CreatePurchaseOrderModal';
import PurchaseOrderDetailsModal from '@/components/purchases/PurchaseOrderDetailsModal';
import PurchaseOrderFilterBar from '@/components/purchases/PurchaseOrderFilterBar';
import PurchaseOrderGridView from '@/components/purchases/PurchaseOrderGridView';
import PurchaseOrderListView from '@/components/purchases/PurchaseOrderListView';
import { usePurchaseOrders } from '@/context/PurchaseContext';
import { SupplierProvider } from '@/context/SupplierContext';
import { PurchaseOrder } from '@/types/purchaseTypes';
import React, { useState } from 'react';

const PurchaseOrderManagement: React.FC = () => {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(
    null
  );
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { filteredPurchaseOrders, filters, setFilters } = usePurchaseOrders();

  // Handle viewing a purchase order's details
  const handleViewOrder = (order: PurchaseOrder) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  // Handle creating a new purchase order
  const handleCreateOrder = () => {
    setShowCreateModal(true);
  };

  // Handle closing the details modal
  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedOrder(null);
  };

  // Handle closing the create modal
  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
  };

  return (
    <div className='container mx-auto px-4 py-6'>
      <SupplierProvider>
        <PurchaseOrderFilterBar
          filters={filters}
          setFilters={setFilters}
          viewMode={viewMode}
          setViewMode={setViewMode}
          onCreateOrder={handleCreateOrder}
        />

        {viewMode === 'grid' ? (
          <PurchaseOrderGridView
            orders={filteredPurchaseOrders}
            onViewOrder={handleViewOrder}
          />
        ) : (
          <PurchaseOrderListView
            orders={filteredPurchaseOrders}
            onViewOrder={handleViewOrder}
          />
        )}

        {showDetailsModal && selectedOrder && (
          <PurchaseOrderDetailsModal
            order={selectedOrder}
            onClose={handleCloseDetailsModal}
          />
        )}

        {showCreateModal && (
          <CreatePurchaseOrderModal onClose={handleCloseCreateModal} />
        )}
      </SupplierProvider>
    </div>
  );
};

export default PurchaseOrderManagement;
