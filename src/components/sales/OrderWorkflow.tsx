import React from 'react';
import { FulfillmentStatus, Sale } from '../../types/salesTypes';

interface OrderWorkflowProps {
  sale: Sale;
  onStatusUpdate: (newStatus: FulfillmentStatus) => Promise<void>;
}

const OrderWorkflow: React.FC<OrderWorkflowProps> = ({
  sale,
  onStatusUpdate,
}) => {
  // Define the sequence of statuses for the workflow
  const workflowSteps = [
    { status: FulfillmentStatus.PENDING, label: 'Pending' },
    { status: FulfillmentStatus.PICKING, label: 'Picking' },
    { status: FulfillmentStatus.READY_TO_SHIP, label: 'Ready to Ship' },
    { status: FulfillmentStatus.SHIPPED, label: 'Shipped' },
    { status: FulfillmentStatus.DELIVERED, label: 'Delivered' },
  ];

  // Find the current step index
  const currentStepIndex = workflowSteps.findIndex(
    (step) => step.status === sale.fulfillmentStatus
  );

  // Special case for cancelled orders
  const isCancelled = sale.fulfillmentStatus === FulfillmentStatus.CANCELLED;

  // Determine if the user can move to the next step
  const canMoveToNextStep =
    currentStepIndex >= 0 && currentStepIndex < workflowSteps.length - 1;

  const handleMoveToNext = async () => {
    if (canMoveToNextStep) {
      const nextStatus = workflowSteps[currentStepIndex + 1].status;
      await onStatusUpdate(nextStatus);
    }
  };

  const handleCancel = async () => {
    await onStatusUpdate(FulfillmentStatus.CANCELLED);
  };

  return (
    <div className='border-t border-b border-gray-200 py-5 px-4 sm:px-6'>
      <h4 className='text-sm font-medium text-gray-500 mb-3'>Order Workflow</h4>

      {isCancelled ? (
        <div className='bg-red-50 border border-red-100 rounded-md p-4 flex items-center'>
          <div className='flex-shrink-0'>
            <svg
              className='h-5 w-5 text-red-400'
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 20 20'
              fill='currentColor'
            >
              <path
                fillRule='evenodd'
                d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                clipRule='evenodd'
              />
            </svg>
          </div>
          <div className='ml-3'>
            <h3 className='text-sm font-medium text-red-800'>
              This order has been cancelled
            </h3>
            <div className='mt-2 text-sm text-red-700'>
              <p>
                You can no longer update the workflow status for this order.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className='flex items-center justify-between'>
            <div className='flex-1'>
              <ol className='flex items-center'>
                {workflowSteps.map((step, index) => {
                  // Determine if this step is the current one, completed, or upcoming
                  const isCompleted = index < currentStepIndex;
                  const isCurrent = index === currentStepIndex;
                  const isUpcoming = index > currentStepIndex;

                  return (
                    <li
                      key={step.status}
                      className={`relative flex-1 ${
                        index === workflowSteps.length - 1
                          ? 'flex justify-end'
                          : ''
                      }`}
                    >
                      {/* Line connecting steps */}
                      {index < workflowSteps.length - 1 && (
                        <div
                          className={`h-0.5 flex-1 ${
                            isCompleted ? 'bg-amber-600' : 'bg-gray-200'
                          }`}
                        />
                      )}

                      {/* Step indicator */}
                      <div
                        className={`relative flex items-center justify-center ${
                          isCompleted
                            ? 'bg-amber-600'
                            : isCurrent
                            ? 'bg-amber-500'
                            : 'bg-gray-200'
                        } h-6 w-6 rounded-full`}
                      >
                        {isCompleted ? (
                          // Checkmark for completed steps
                          <svg
                            className='h-4 w-4 text-white'
                            xmlns='http://www.w3.org/2000/svg'
                            viewBox='0 0 20 20'
                            fill='currentColor'
                          >
                            <path
                              fillRule='evenodd'
                              d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                              clipRule='evenodd'
                            />
                          </svg>
                        ) : (
                          // Step number for current and upcoming steps
                          <span
                            className={`text-xs font-medium ${
                              isCurrent ? 'text-white' : 'text-gray-500'
                            }`}
                          >
                            {index + 1}
                          </span>
                        )}
                      </div>

                      {/* Step label */}
                      <div className='mt-2 text-xs text-center font-medium'>
                        <span
                          className={
                            isCompleted
                              ? 'text-amber-600'
                              : isCurrent
                              ? 'text-amber-500'
                              : 'text-gray-500'
                          }
                        >
                          {step.label}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>

          {/* Action buttons */}
          <div className='mt-6 flex justify-between'>
            <button
              onClick={handleCancel}
              className='inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
            >
              Cancel Order
            </button>

            <button
              onClick={handleMoveToNext}
              disabled={!canMoveToNextStep}
              className={`inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white ${
                canMoveToNextStep
                  ? 'bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              {currentStepIndex < 0
                ? 'Start Process'
                : canMoveToNextStep
                ? `Move to ${workflowSteps[currentStepIndex + 1].label}`
                : 'Order Complete'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default OrderWorkflow;
