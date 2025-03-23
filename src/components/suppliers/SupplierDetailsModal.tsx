// src/components/suppliers/SupplierDetailsModal.tsx
import ErrorMessage from '@/components/common/ErrorMessage';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { usePurchaseOrders } from '@/context/PurchaseContext';
import { useSuppliers } from '@/context/SupplierContext';
import { SupplierStatus } from '@/types/enums';
import { Purchase, Supplier } from '@/types/supplierTypes';
import React, { useState } from 'react';

interface SupplierDetailsModalProps {
  supplier: Supplier;
  onClose: () => void;
  onCreatePurchase: () => void;
  onEditSupplier: (supplier: Supplier) => void;
}

const SupplierDetailsModal: React.FC<SupplierDetailsModalProps> = ({
  supplier,
  onClose,
  onCreatePurchase,
  onEditSupplier,
}) => {
  const { getSupplierPurchaseOrders, loading, error } = usePurchaseOrders();
  const { updateSupplier } = useSuppliers();
  const [supplierPurchaseOrders, setSupplierPurchaseOrders] = useState<
    Purchase[]
  >([]);
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  // Get purchase orders for this supplier
  React.useEffect(() => {
    const fetchPurchaseOrders = async () => {
      try {
        const orders = await getSupplierPurchaseOrders(supplier.id);
        setSupplierPurchaseOrders(orders);
      } catch (err: any) {
        console.error('Error fetching purchase orders:', err);
      }
    };

    fetchPurchaseOrders();
  }, [supplier.id, getSupplierPurchaseOrders]);

  // Handle supplier activation/deactivation
  const handleToggleStatus = async () => {
    try {
      setUpdating(true);
      setUpdateError(null);

      const newStatus =
        supplier.status === SupplierStatus.ACTIVE
          ? SupplierStatus.INACTIVE
          : SupplierStatus.ACTIVE;

      await updateSupplier({
        ...supplier,
        status: newStatus,
      });

      // The supplier object in the parent component will be updated via the context
    } catch (err: any) {
      setUpdateError(err.message || 'Failed to update supplier status');
      console.error('Error updating supplier status:', err);
    } finally {
      setUpdating(false);
    }
  };

  // Helper function to get color for status
  const getStatusColor = (status: string) => {
    // Convert to uppercase for comparison with our constants
    const upperStatus = status.toUpperCase();

    if (
      [
        'ACTIVE',
        'PREFERRED',
        'STRATEGIC',
        'PRIMARY',
        'APPROVED',
        'QUALIFIED',
      ].includes(upperStatus)
    ) {
      return 'bg-green-100 text-green-800';
    }

    if (
      [
        'SECONDARY',
        'BACKUP',
        'OCCASIONAL',
        'NEW',
        'PROBATIONARY',
        'PENDING',
        'PENDING_APPROVAL',
        'PENDING_REVIEW',
        'UNDER_EVALUATION',
      ].includes(upperStatus)
    ) {
      return 'bg-amber-100 text-amber-800';
    }

    if (['INACTIVE', 'SUSPENDED', 'ON_HOLD'].includes(upperStatus)) {
      return 'bg-stone-100 text-stone-800';
    }

    if (
      ['BLACKLISTED', 'BANNED', 'DISPUTED', 'TERMINATED'].includes(upperStatus)
    ) {
      return 'bg-red-100 text-red-800';
    }

    if (
      [
        'DELIVERED',
        'COMPLETE',
        'QUALITY_INSPECTION',
        'ACKNOWLEDGED',
        'RECEIVED',
        'PAID',
      ].includes(upperStatus)
    ) {
      return 'bg-green-100 text-green-800';
    }

    if (
      [
        'PROCESSING',
        'APPROVED',
        'SUBMITTED_TO_SUPPLIER',
        'PLANNING',
        'PENDING_APPROVAL',
      ].includes(upperStatus)
    ) {
      return 'bg-blue-100 text-blue-800';
    }

    if (
      [
        'IN_TRANSIT',
        'BACKORDERED',
        'PARTIAL_SHIPMENT',
        'SHIPPED',
        'PARTIALLY_RECEIVED',
        'PAYMENT_PENDING',
        'BALANCE_PENDING',
        'DEPOSIT_PENDING',
      ].includes(upperStatus)
    ) {
      return 'bg-amber-100 text-amber-800';
    }

    return 'bg-stone-100 text-stone-800';
  };

  // Format text for display (replace underscores with spaces)
  const formatText = (text: string) => {
    return text.replace(/_/g, ' ');
  };

  // Helper function to render star rating
  const renderRating = (rating: number) => {
    return (
      <div className='flex items-center'>
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            xmlns='http://www.w3.org/2000/svg'
            className={`h-4 w-4 ${
              star <= rating ? 'text-amber-500' : 'text-stone-300'
            }`}
            viewBox='0 0 20 20'
            fill='currentColor'
          >
            <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div className='fixed inset-0 bg-stone-900/50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden'>
        <div className='border-b border-stone-200 p-6 flex justify-between items-center'>
          <div className='flex items-center'>
            <img
              src={supplier.logo}
              alt={supplier.name}
              className='h-12 w-12 rounded-lg object-cover'
            />
            <div className='ml-4'>
              <h2 className='text-xl font-medium text-stone-900'>
                {supplier.name}
              </h2>
              <div className='flex items-center mt-1'>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                    supplier.status
                  )}`}
                >
                  {formatText(supplier.status)}
                </span>
                <span className='mx-2 text-stone-300'>•</span>
                {renderRating(supplier.rating)}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className='text-stone-400 hover:text-stone-600'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-6 w-6'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>
        </div>

        <div className='p-6 flex-1 overflow-y-auto'>
          {updateError && (
            <div className='mb-4'>
              <ErrorMessage message={updateError} />
            </div>
          )}

          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-6'>
            <div className='bg-stone-50 rounded-lg p-4'>
              <h3 className='font-medium text-stone-700 mb-3'>
                Contact Information
              </h3>
              <ul className='space-y-2'>
                <li className='flex'>
                  <span className='text-stone-500 w-20 text-sm'>Contact:</span>
                  <span className='text-stone-800 text-sm font-medium'>
                    {supplier.contactName}
                  </span>
                </li>
                <li className='flex'>
                  <span className='text-stone-500 w-20 text-sm'>Email:</span>
                  <span className='text-stone-800 text-sm font-medium'>
                    {supplier.email}
                  </span>
                </li>
                <li className='flex'>
                  <span className='text-stone-500 w-20 text-sm'>Phone:</span>
                  <span className='text-stone-800 text-sm font-medium'>
                    {supplier.phone}
                  </span>
                </li>
                <li className='flex'>
                  <span className='text-stone-500 w-20 text-sm'>Website:</span>
                  <span className='text-stone-800 text-sm font-medium'>
                    {supplier.website}
                  </span>
                </li>
                <li className='flex'>
                  <span className='text-stone-500 w-20 text-sm'>Address:</span>
                  <span className='text-stone-800 text-sm'>
                    {supplier.address}
                  </span>
                </li>
              </ul>
            </div>

            <div className='bg-stone-50 rounded-lg p-4'>
              <h3 className='font-medium text-stone-700 mb-3'>
                Supply Information
              </h3>
              <ul className='space-y-2'>
                <li className='flex'>
                  <span className='text-stone-500 w-24 text-sm'>Category:</span>
                  <span className='text-stone-800 text-sm font-medium'>
                    {formatText(supplier.category)}
                  </span>
                </li>
                <li className='flex'>
                  <span className='text-stone-500 w-24 text-sm'>
                    Materials:
                  </span>
                  <div className='flex flex-wrap gap-1'>
                    {supplier.materialCategories.map((category, index) => (
                      <span
                        key={index}
                        className='px-1.5 py-0.5 bg-stone-200 text-stone-700 rounded text-xs'
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </li>
                <li className='flex'>
                  <span className='text-stone-500 w-24 text-sm'>Terms:</span>
                  <span className='text-stone-800 text-sm font-medium'>
                    {supplier.paymentTerms}
                  </span>
                </li>
                <li className='flex'>
                  <span className='text-stone-500 w-24 text-sm'>
                    Min Order:
                  </span>
                  <span className='text-stone-800 text-sm font-medium'>
                    {supplier.minOrderAmount}
                  </span>
                </li>
                <li className='flex'>
                  <span className='text-stone-500 w-24 text-sm'>
                    Lead Time:
                  </span>
                  <span className='text-stone-800 text-sm font-medium'>
                    {supplier.leadTime}
                  </span>
                </li>
              </ul>
            </div>

            <div className='bg-stone-50 rounded-lg p-4'>
              <h3 className='font-medium text-stone-700 mb-3'>Order Summary</h3>
              <ul className='space-y-2'>
                <li className='flex'>
                  <span className='text-stone-500 w-32 text-sm'>
                    Last Order Date:
                  </span>
                  <span className='text-stone-800 text-sm font-medium'>
                    {supplier.lastOrderDate || 'N/A'}
                  </span>
                </li>
                <li className='flex'>
                  <span className='text-stone-500 w-32 text-sm'>
                    Total Orders:
                  </span>
                  <span className='text-stone-800 text-sm font-medium'>
                    {supplierPurchaseOrders.length}
                  </span>
                </li>
                <li className='flex'>
                  <span className='text-stone-500 w-32 text-sm'>
                    Avg. Order Value:
                  </span>
                  <span className='text-stone-800 text-sm font-medium'>
                    $
                    {(
                      supplierPurchaseOrders.reduce(
                        (sum, p) => sum + p.total,
                        0
                      ) / (supplierPurchaseOrders.length || 1)
                    ).toFixed(2)}
                  </span>
                </li>
                <li className='flex'>
                  <span className='text-stone-500 w-32 text-sm'>
                    Total Spent:
                  </span>
                  <span className='text-stone-800 text-sm font-medium'>
                    $
                    {supplierPurchaseOrders
                      .reduce((sum, p) => sum + p.total, 0)
                      .toFixed(2)}
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {supplier.notes && (
            <div className='bg-stone-50 rounded-lg p-4 mb-6'>
              <h3 className='font-medium text-stone-700 mb-2'>Notes</h3>
              <p className='text-stone-600 text-sm'>{supplier.notes}</p>
            </div>
          )}

          <div className='mb-6'>
            <h3 className='font-medium text-stone-700 mb-3'>
              Purchase History
            </h3>
            {loading ? (
              <LoadingSpinner
                size='small'
                color='amber'
                message='Loading purchase history...'
              />
            ) : error ? (
              <ErrorMessage message={error} />
            ) : supplierPurchaseOrders.length > 0 ? (
              <div className='bg-white rounded-lg border border-stone-200 overflow-hidden'>
                <table className='min-w-full divide-y divide-stone-200'>
                  <thead className='bg-stone-50'>
                    <tr>
                      <th
                        scope='col'
                        className='px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
                      >
                        PO #
                      </th>
                      <th
                        scope='col'
                        className='px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
                      >
                        Date
                      </th>
                      <th
                        scope='col'
                        className='px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
                      >
                        Status
                      </th>
                      <th
                        scope='col'
                        className='px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
                      >
                        Total
                      </th>
                      <th
                        scope='col'
                        className='px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
                      >
                        Payment
                      </th>
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-stone-200'>
                    {supplierPurchaseOrders.map((purchase) => (
                      <tr key={purchase.id} className='hover:bg-stone-50'>
                        <td className='px-4 py-3 whitespace-nowrap text-sm font-medium text-stone-900'>
                          {purchase.id}
                        </td>
                        <td className='px-4 py-3 whitespace-nowrap text-sm text-stone-500'>
                          {purchase.date}
                        </td>
                        <td className='px-4 py-3 whitespace-nowrap'>
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${getStatusColor(
                              purchase.status
                            )}`}
                          >
                            {formatText(purchase.status)}
                          </span>
                        </td>
                        <td className='px-4 py-3 whitespace-nowrap text-sm text-stone-900'>
                          ${purchase.total.toFixed(2)}
                        </td>
                        <td className='px-4 py-3 whitespace-nowrap'>
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${getStatusColor(
                              purchase.paymentStatus
                            )}`}
                          >
                            {formatText(purchase.paymentStatus)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className='bg-stone-50 rounded-lg p-4 text-center'>
                <p className='text-stone-500 text-sm'>
                  No purchase history found for this supplier.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className='border-t border-stone-200 p-6 flex justify-between'>
          <div className='flex space-x-3'>
            <button
              onClick={() => onEditSupplier(supplier)}
              className='bg-stone-100 hover:bg-stone-200 text-stone-700 px-4 py-2 rounded-md text-sm font-medium'
            >
              Edit Supplier
            </button>
            {updating ? (
              <button className='bg-stone-100 text-stone-400 px-4 py-2 rounded-md text-sm font-medium cursor-not-allowed flex items-center'>
                <svg
                  className='animate-spin -ml-1 mr-2 h-4 w-4 text-stone-500'
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
                Updating...
              </button>
            ) : supplier.status === SupplierStatus.ACTIVE ? (
              <button
                onClick={handleToggleStatus}
                className='bg-red-50 hover:bg-red-100 text-red-700 px-4 py-2 rounded-md text-sm font-medium'
              >
                Deactivate
              </button>
            ) : (
              <button
                onClick={handleToggleStatus}
                className='bg-green-50 hover:bg-green-100 text-green-700 px-4 py-2 rounded-md text-sm font-medium'
              >
                Activate
              </button>
            )}
          </div>
          <button
            onClick={onCreatePurchase}
            className='bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-5 w-5 mr-2'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z'
              />
            </svg>
            Create Purchase Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupplierDetailsModal;
