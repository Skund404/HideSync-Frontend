import React, { useState } from 'react';
import IntegrationSettings from '../components/sales/IntegrationSettings';
import OrderDetail from '../components/sales/OrderDetail';
import SalesDashboard from '../components/sales/SalesDashboard';
import { SalesProvider } from '../context/SalesContext';

const SalesManagement: React.FC = () => {
  const [activeView, setActiveView] = useState<'dashboard' | 'settings'>(
    'dashboard'
  );
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const handleViewOrder = (orderId: number) => {
    setSelectedOrderId(orderId);
  };

  const handleCloseOrderDetail = () => {
    setSelectedOrderId(null);
  };

  return (
    <SalesProvider>
      <div className='p-6'>
        {/* Page header */}
        <div className='flex justify-between items-center mb-6'>
          <h1 className='text-2xl font-semibold text-stone-900'>
            Sales Management
          </h1>

          {!selectedOrderId && (
            <div className='flex space-x-4'>
              <button
                onClick={() => setActiveView('dashboard')}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  activeView === 'dashboard'
                    ? 'bg-amber-600 text-white'
                    : 'text-stone-700 bg-white border border-stone-300 hover:bg-stone-50'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveView('settings')}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  activeView === 'settings'
                    ? 'bg-amber-600 text-white'
                    : 'text-stone-700 bg-white border border-stone-300 hover:bg-stone-50'
                }`}
              >
                Integration Settings
              </button>
            </div>
          )}
        </div>

        {/* Main content */}
        {selectedOrderId ? (
          <OrderDetail
            orderId={selectedOrderId}
            onClose={handleCloseOrderDetail}
          />
        ) : activeView === 'dashboard' ? (
          <SalesDashboard onViewOrder={handleViewOrder} />
        ) : (
          <IntegrationSettings />
        )}
      </div>
    </SalesProvider>
  );
};

export default SalesManagement;
