import React, { useState } from 'react';
import { useSales } from '../../context/SalesContext';

interface FulfillmentFormProps {
  saleId: number;
  onComplete: () => void;
  onCancel: () => void;
}

const FulfillmentForm: React.FC<FulfillmentFormProps> = ({
  saleId,
  onComplete,
  onCancel,
}) => {
  const { updateFulfillment, getSale } = useSales();
  const [trackingNumber, setTrackingNumber] = useState('');
  const [shippingProvider, setShippingProvider] = useState('');
  const [shippingMethod, setShippingMethod] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sale = getSale(saleId);

  // If the sale has existing shipping data, pre-fill the form
  React.useEffect(() => {
    if (sale) {
      if (sale.shippingProvider) setShippingProvider(sale.shippingProvider);
      if (sale.shippingMethod) setShippingMethod(sale.shippingMethod);
      if (sale.trackingNumber) setTrackingNumber(sale.trackingNumber);
    }
  }, [sale]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!trackingNumber || !shippingProvider) {
      setError('Tracking number and shipping provider are required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await updateFulfillment(saleId, trackingNumber, shippingProvider);
      // Call the complete callback to notify parent component
      onComplete();
    } catch (err) {
      setError('Failed to update fulfillment information.');
      console.error('Fulfillment update error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // List of common shipping providers
  const shippingProviders = [
    { id: 'usps', name: 'USPS' },
    { id: 'ups', name: 'UPS' },
    { id: 'fedex', name: 'FedEx' },
    { id: 'dhl', name: 'DHL' },
    { id: 'other', name: 'Other' },
  ];

  // List of common shipping methods
  const shippingMethods = [
    { id: 'standard', name: 'Standard Shipping' },
    { id: 'expedited', name: 'Expedited Shipping' },
    { id: 'overnight', name: 'Overnight Shipping' },
    { id: 'ground', name: 'Ground' },
    { id: 'international', name: 'International' },
    { id: 'local', name: 'Local Delivery' },
    { id: 'pickup', name: 'Customer Pickup' },
    { id: 'other', name: 'Other' },
  ];

  return (
    <div className='bg-white rounded-md'>
      <h3 className='text-lg font-medium text-gray-900 mb-3'>
        Fulfillment Information
      </h3>
      {error && (
        <div className='mb-4 bg-red-50 border border-red-100 rounded-md p-3 text-sm text-red-800'>
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <label
            htmlFor='trackingNumber'
            className='block text-sm font-medium text-gray-700'
          >
            Tracking Number
          </label>
          <input
            type='text'
            id='trackingNumber'
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm'
            placeholder='Enter tracking number'
          />
        </div>

        <div>
          <label
            htmlFor='shippingProvider'
            className='block text-sm font-medium text-gray-700'
          >
            Shipping Provider
          </label>
          <select
            id='shippingProvider'
            value={shippingProvider}
            onChange={(e) => setShippingProvider(e.target.value)}
            className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm'
          >
            <option value=''>Select a shipping provider</option>
            {shippingProviders.map((provider) => (
              <option key={provider.id} value={provider.id}>
                {provider.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor='shippingMethod'
            className='block text-sm font-medium text-gray-700'
          >
            Shipping Method
          </label>
          <select
            id='shippingMethod'
            value={shippingMethod}
            onChange={(e) => setShippingMethod(e.target.value)}
            className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm'
          >
            <option value=''>Select a shipping method</option>
            {shippingMethods.map((method) => (
              <option key={method.id} value={method.id}>
                {method.name}
              </option>
            ))}
          </select>
        </div>

        <div className='flex justify-end space-x-3 pt-3'>
          <button
            type='button'
            onClick={onCancel}
            className='inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500'
          >
            Cancel
          </button>
          <button
            type='submit'
            disabled={isSubmitting}
            className='inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:bg-amber-300'
          >
            {isSubmitting ? 'Saving...' : 'Mark as Shipped'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FulfillmentForm;
