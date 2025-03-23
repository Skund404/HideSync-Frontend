// src/components/sales/OrderActions.tsx
import React, { useState } from 'react';
import { useSales } from '../../context/SalesContext';
import { FulfillmentStatus, Sale } from '../../types/salesTypes';
import FulfillmentForm from './FulfillmentForm';
import MaterialRequirements from './MaterialRequirements';
import PickingListGenerator from './PickingListGenerator';

interface OrderActionsProps {
  sale: Sale;
}

// Define a type for the enhanced sale with our custom properties
interface EnhancedSale extends Sale {
  _pickingListId?: number;
  _pickingListStatus?: string;
  _pickingListCreatedAt?: string;
}

const OrderActions: React.FC<OrderActionsProps> = ({ sale }) => {
  const { createPickingList } = useSales();
  const [showFulfillmentForm, setShowFulfillmentForm] = useState(false);
  const [showMaterialRequirements, setShowMaterialRequirements] =
    useState(false);
  const [showPickingListGenerator, setShowPickingListGenerator] =
    useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionMessage, setActionMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Cast sale to our enhanced type
  const enhancedSale = sale as EnhancedSale;

  // Check available actions based on status
  const canCreatePickingList =
    sale.fulfillmentStatus === FulfillmentStatus.PENDING &&
    !enhancedSale._pickingListId;

  const canMarkAsShipped =
    (sale.fulfillmentStatus === FulfillmentStatus.READY_TO_SHIP ||
      sale.fulfillmentStatus === FulfillmentStatus.PICKING) &&
    !showFulfillmentForm;

  // Direct creation of picking list without going through the generator UI
  const handleCreatePickingList = async () => {
    if (!canCreatePickingList) return;

    setIsProcessing(true);
    setActionMessage(null);

    try {
      const pickingListId = await createPickingList(sale.id);
      setActionMessage({
        type: 'success',
        text: `Picking list #${pickingListId} created successfully.`,
      });
    } catch (err) {
      console.error('Failed to create picking list:', err);
      setActionMessage({
        type: 'error',
        text: 'Failed to create picking list. Please try again.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleShowMaterialRequirements = () => {
    setShowMaterialRequirements(true);
    setShowFulfillmentForm(false);
    setShowPickingListGenerator(false);
  };

  const handleShowPickingListGenerator = () => {
    setShowPickingListGenerator(true);
    setShowFulfillmentForm(false);
    setShowMaterialRequirements(false);
  };

  const handlePickingListComplete = (pickingListId: string) => {
    setActionMessage({
      type: 'success',
      text: `Picking list #${pickingListId} created successfully.`,
    });
    setShowPickingListGenerator(false);
  };

  const handlePrintOrder = () => {
    window.print();
  };

  const handlePrintInvoice = () => {
    alert('Invoice printing functionality will be implemented in future phase');
  };

  const handlePrintShippingLabel = () => {
    alert(
      'Shipping label printing functionality will be implemented in future phase'
    );
  };

  const handleViewPickingList = () => {
    if (enhancedSale._pickingListId) {
      alert(
        `Navigate to picking list #${enhancedSale._pickingListId} will be implemented in future phase`
      );
    }
  };

  return (
    <div>
      <h4 className='text-sm font-medium text-gray-500 mb-3'>Order Actions</h4>

      {/* Status message */}
      {actionMessage && (
        <div
          className={`mb-4 p-3 rounded text-sm ${
            actionMessage.type === 'success'
              ? 'bg-green-50 text-green-800'
              : 'bg-red-50 text-red-800'
          }`}
        >
          {actionMessage.text}
        </div>
      )}

      {/* Fulfillment Form */}
      {showFulfillmentForm && (
        <div className='mb-4 border-b pb-4 border-gray-200'>
          <FulfillmentForm
            saleId={sale.id}
            onComplete={() => setShowFulfillmentForm(false)}
            onCancel={() => setShowFulfillmentForm(false)}
          />
        </div>
      )}

      {/* Material Requirements */}
      {showMaterialRequirements && (
        <div className='mb-4 border-b pb-4 border-gray-200'>
          <MaterialRequirements
            saleId={sale.id}
            onGeneratePickingList={handleShowPickingListGenerator}
          />
        </div>
      )}

      {/* Picking List Generator */}
      {showPickingListGenerator && (
        <div className='mb-4 border-b pb-4 border-gray-200'>
          <PickingListGenerator
            saleId={sale.id}
            onComplete={handlePickingListComplete}
            onCancel={() => setShowPickingListGenerator(false)}
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className='flex flex-wrap gap-3'>
        {/* Material Requirements Button */}
        {!showMaterialRequirements && (
          <button
            onClick={handleShowMaterialRequirements}
            className='inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500'
          >
            <svg
              className='mr-2 h-4 w-4 text-gray-500'
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
              />
            </svg>
            Material Requirements
          </button>
        )}

        {/* Picking List Actions */}
        {canCreatePickingList && !showPickingListGenerator && (
          <>
            <button
              onClick={handleShowPickingListGenerator}
              className='inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:bg-amber-300'
            >
              <svg
                className='mr-2 h-4 w-4'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 14l2 2m0 0l2-2m-2 2v-6'
                />
              </svg>
              Configure Picking List
            </button>

            <button
              onClick={handleCreatePickingList}
              disabled={isProcessing}
              className='inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50'
            >
              {isProcessing ? (
                <>
                  <svg
                    className='animate-spin -ml-1 mr-2 h-4 w-4 text-amber-700'
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
                  Creating...
                </>
              ) : (
                <>
                  <svg
                    className='mr-2 h-4 w-4 text-amber-700'
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 6v6m0 0v6m0-6h6m-6 0H6'
                    />
                  </svg>
                  Quick Create List
                </>
              )}
            </button>
          </>
        )}

        {enhancedSale._pickingListId && (
          <button
            onClick={handleViewPickingList}
            className='inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500'
          >
            <svg
              className='mr-2 h-4 w-4 text-gray-500'
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
              />
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
              />
            </svg>
            View Picking List
          </button>
        )}

        {/* Fulfillment Actions */}
        {canMarkAsShipped && (
          <button
            onClick={() => setShowFulfillmentForm(true)}
            className='inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
          >
            <svg
              className='mr-2 h-4 w-4'
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path d='M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z' />
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0'
              />
            </svg>
            Mark as Shipped
          </button>
        )}

        {/* Printing Actions */}
        <button
          onClick={handlePrintOrder}
          className='inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500'
        >
          <svg
            className='mr-2 h-4 w-4 text-gray-500'
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z'
            />
          </svg>
          Print Order
        </button>

        <button
          onClick={handlePrintInvoice}
          className='inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500'
        >
          <svg
            className='mr-2 h-4 w-4 text-gray-500'
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
            />
          </svg>
          Print Invoice
        </button>

        {sale.fulfillmentStatus === FulfillmentStatus.READY_TO_SHIP &&
          sale.shippingAddress && (
            <button
              onClick={handlePrintShippingLabel}
              className='inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500'
            >
              <svg
                className='mr-2 h-4 w-4 text-gray-500'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z'
                />
              </svg>
              Print Shipping Label
            </button>
          )}
      </div>
    </div>
  );
};

export default OrderActions;
