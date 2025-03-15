// src/components/purchases/CreatePurchaseOrderModal.tsx
import { usePurchaseOrders } from '@/context/PurchaseContext';
import { useSuppliers } from '@/context/SupplierContext';
import { PaymentStatus, PurchaseStatus } from '@/types/enums';
import { PurchaseOrderItem as ImportedPurchaseOrderItem } from '@/types/purchaseTypes';
import { formatPrice } from '@/utils/formatter';
import React, { useState } from 'react';
import PurchaseOrderItemForm from './PurchaseOrderItemForm';

// Use the imported interface and make local adjustments if needed
interface PurchaseOrderItem extends ImportedPurchaseOrderItem {
  // You can add additional local-only properties here if needed
}

interface CreatePurchaseOrderModalProps {
  onClose: () => void;
  initialSupplierId?: number;
}

const CreatePurchaseOrderModal: React.FC<CreatePurchaseOrderModalProps> = ({
  onClose,
  initialSupplierId,
}) => {
  const { suppliers } = useSuppliers();
  const { addPurchaseOrder } = usePurchaseOrders();

  // Generate a new order ID (PO-YYYY-XXX format)
  const generateOrderId = () => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    return `PO-${year}-${randomNum}`;
  };

  // Generate a unique item ID
  const generateItemId = () => {
    return Math.floor(Math.random() * 10000);
  };

  // Form state
  const [supplierId, setSupplierId] = useState<number>(initialSupplierId || 0);
  const [orderDate, setOrderDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [deliveryDate, setDeliveryDate] = useState<string>('');
  const [items, setItems] = useState<PurchaseOrderItem[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [showItemForm, setShowItemForm] = useState<boolean>(false);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);

  // Handle adding a new item
  const handleAddItem = (item: Omit<PurchaseOrderItem, 'id'>) => {
    const newItem: PurchaseOrderItem = {
      ...item,
      id: generateItemId(),
    };

    if (editingItemIndex !== null) {
      // Edit existing item
      const updatedItems = [...items];
      updatedItems[editingItemIndex] = newItem;
      setItems(updatedItems);
      setEditingItemIndex(null);
    } else {
      // Add new item
      setItems([...items, newItem]);
    }
    setShowItemForm(false);
  };

  // Handle editing an item
  const handleEditItem = (index: number) => {
    setEditingItemIndex(index);
    setShowItemForm(true);
  };

  // Handle removing an item
  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!supplierId || items.length === 0 || !deliveryDate) {
      // Show validation error
      return;
    }

    const selectedSupplier = suppliers.find((s) => s.id === supplierId);
    if (!selectedSupplier) return;

    // Create the purchase order
    const newOrder = {
      id: generateOrderId(),
      supplier: selectedSupplier.name,
      supplierId,
      date: orderDate,
      deliveryDate,
      status: PurchaseStatus.PLANNING,
      total: subtotal,
      paymentStatus: PaymentStatus.PENDING,
      items,
      notes,
      invoice: 'Pending',
    };

    addPurchaseOrder(newOrder);
    onClose();
  };

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      <div className='flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0'>
        <div className='fixed inset-0 transition-opacity'>
          <div className='absolute inset-0 bg-stone-500 opacity-75'></div>
        </div>

        {/* Modal Content */}
        <div
          className='inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full'
          role='dialog'
          aria-modal='true'
          aria-labelledby='modal-headline'
        >
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div className='bg-stone-50 px-6 py-4 border-b border-stone-200 flex justify-between items-center'>
              <h3
                className='text-xl font-medium text-stone-900'
                id='modal-headline'
              >
                Create Purchase Order
              </h3>
              <button
                type='button'
                onClick={onClose}
                className='text-stone-400 hover:text-stone-500 focus:outline-none'
              >
                <svg
                  className='h-6 w-6'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M6 18L18 6M6 6l12 12'
                  />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className='px-6 py-4 max-h-[calc(100vh-200px)] overflow-y-auto'>
              {/* Purchase Order Details */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
                <div>
                  <label className='block text-sm font-medium text-stone-700 mb-2'>
                    Supplier
                  </label>
                  <select
                    className='block w-full border border-stone-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm'
                    value={supplierId || ''}
                    onChange={(e) => setSupplierId(Number(e.target.value))}
                    required
                  >
                    <option value=''>Select a supplier</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className='block text-sm font-medium text-stone-700 mb-2'>
                    Purchase Order Number
                  </label>
                  <input
                    type='text'
                    className='block w-full border border-stone-300 rounded-md shadow-sm py-2 px-3 bg-stone-50 focus:outline-none sm:text-sm'
                    placeholder='Auto-generated'
                    value={generateOrderId()}
                    disabled
                  />
                  <p className='mt-1 text-xs text-stone-500'>
                    Auto-generated upon submission
                  </p>
                </div>

                <div>
                  <label className='block text-sm font-medium text-stone-700 mb-2'>
                    Order Date
                  </label>
                  <input
                    type='date'
                    className='block w-full border border-stone-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm'
                    value={orderDate}
                    onChange={(e) => setOrderDate(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-stone-700 mb-2'>
                    Expected Delivery Date
                  </label>
                  <input
                    type='date'
                    className='block w-full border border-stone-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm'
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Order Items */}
              <div className='mb-6'>
                <div className='flex justify-between items-center mb-3'>
                  <h4 className='font-medium text-stone-700'>Order Items</h4>
                  <button
                    type='button'
                    onClick={() => {
                      setShowItemForm(true);
                      setEditingItemIndex(null);
                    }}
                    className='bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 rounded-md text-sm font-medium flex items-center'
                  >
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      className='h-4 w-4 mr-1'
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
                    Add Item
                  </button>
                </div>

                {items.length > 0 ? (
                  <div className='bg-white rounded-lg border border-stone-200 overflow-hidden'>
                    <table className='min-w-full divide-y divide-stone-200'>
                      <thead className='bg-stone-50'>
                        <tr>
                          <th
                            scope='col'
                            className='px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
                          >
                            Item
                          </th>
                          <th
                            scope='col'
                            className='px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
                          >
                            Qty
                          </th>
                          <th
                            scope='col'
                            className='px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
                          >
                            Price
                          </th>
                          <th
                            scope='col'
                            className='px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
                          >
                            Total
                          </th>
                          <th
                            scope='col'
                            className='px-6 py-3 text-right text-xs font-medium text-stone-500 uppercase tracking-wider'
                          >
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className='bg-white divide-y divide-stone-200'>
                        {items.map((item, index) => (
                          <tr key={item.id}>
                            <td className='px-6 py-4 whitespace-nowrap'>
                              <div className='text-sm font-medium text-stone-900'>
                                {item.name}
                              </div>
                              {item.itemType && (
                                <div className='text-xs text-stone-500'>
                                  {item.itemType}
                                </div>
                              )}
                            </td>
                            <td className='px-6 py-4 whitespace-nowrap text-sm text-stone-500'>
                              {item.quantity} {item.unit && `(${item.unit})`}
                            </td>
                            <td className='px-6 py-4 whitespace-nowrap text-sm text-stone-500'>
                              {formatPrice(item.price)}
                            </td>
                            <td className='px-6 py-4 whitespace-nowrap text-sm text-stone-700'>
                              {formatPrice(item.total)}
                            </td>
                            <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                              <button
                                type='button'
                                onClick={() => handleEditItem(index)}
                                className='text-amber-600 hover:text-amber-900 mr-3'
                              >
                                Edit
                              </button>
                              <button
                                type='button'
                                onClick={() => handleRemoveItem(index)}
                                className='text-red-600 hover:text-red-900'
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className='bg-stone-50'>
                        <tr>
                          <td
                            colSpan={3}
                            className='px-6 py-4 text-right text-sm font-medium text-stone-700'
                          >
                            Subtotal:
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-stone-700'>
                            {formatPrice(subtotal)}
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  <div className='bg-stone-50 border border-stone-200 rounded-lg p-6 text-center'>
                    <p className='text-stone-500'>
                      No items added yet. Click "Add Item" to add items to this
                      purchase order.
                    </p>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className='mb-6'>
                <label className='block text-sm font-medium text-stone-700 mb-2'>
                  Notes
                </label>
                <textarea
                  rows={3}
                  className='block w-full border border-stone-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm'
                  placeholder='Add any notes or special instructions for this order'
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                ></textarea>
              </div>
            </div>

            {/* Footer/Actions */}
            <div className='bg-stone-50 px-6 py-4 border-t border-stone-200 flex justify-between'>
              <button
                type='button'
                onClick={onClose}
                className='bg-white border border-stone-300 text-stone-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-stone-50 focus:outline-none'
              >
                Cancel
              </button>
              <div className='flex space-x-3'>
                <button
                  type='button'
                  onClick={onClose}
                  className='bg-stone-100 text-stone-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-stone-200 focus:outline-none'
                >
                  Save as Draft
                </button>
                <button
                  type='submit'
                  className='bg-amber-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-amber-700 focus:outline-none'
                  disabled={!supplierId || items.length === 0 || !deliveryDate}
                >
                  Create Purchase Order
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Item Form Modal */}
      {showItemForm && (
        <PurchaseOrderItemForm
          onSave={handleAddItem}
          onCancel={() => {
            setShowItemForm(false);
            setEditingItemIndex(null);
          }}
          initialItem={
            editingItemIndex !== null
              ? {
                  name: items[editingItemIndex].name,
                  quantity: items[editingItemIndex].quantity,
                  price: items[editingItemIndex].price,
                  total: items[editingItemIndex].total,
                  itemType: items[editingItemIndex].itemType,
                  materialType: items[editingItemIndex].materialType,
                  unit: items[editingItemIndex].unit,
                }
              : undefined
          }
        />
      )}
    </div>
  );
};

export default CreatePurchaseOrderModal;
