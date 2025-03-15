// src/components/purchases/PurchaseOrderItemForm.tsx
import { MaterialType } from '@/types/enums';
import { formatPrice } from '@/utils/formatter';
import React, { useEffect, useState } from 'react';

interface PurchaseOrderItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
  itemType?: string;
  materialType?: string;
  unit?: string;
  id?: string; // Optional to support both new and existing items
}

interface PurchaseOrderItemFormProps {
  onSave: (item: PurchaseOrderItem) => void;
  onCancel: () => void;
  initialItem?: PurchaseOrderItem;
}

const PurchaseOrderItemForm: React.FC<PurchaseOrderItemFormProps> = ({
  onSave,
  onCancel,
  initialItem,
}) => {
  // Form state
  const [name, setName] = useState<string>(initialItem?.name || '');
  const [quantity, setQuantity] = useState<number>(initialItem?.quantity || 1);
  const [price, setPrice] = useState<number>(initialItem?.price || 0);
  const [itemType, setItemType] = useState<string>(
    initialItem?.itemType || 'MATERIAL'
  );
  const [materialType, setMaterialType] = useState<string>(
    initialItem?.materialType || ''
  );
  const [unit, setUnit] = useState<string>(initialItem?.unit || '');

  // Derived values
  const total = quantity * price;

  // Pre-populate shipping if that's the name
  useEffect(() => {
    if (name.toLowerCase() === 'shipping') {
      setItemType('SERVICE');
    }
  }, [name]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || quantity <= 0 || price < 0) {
      // Show validation error
      return;
    }

    const newItem: PurchaseOrderItem = {
      name,
      quantity,
      price,
      total,
      ...(itemType && { itemType }),
      ...(materialType && { materialType }),
      ...(unit && { unit }),
      // Keep the original id if it exists
      ...(initialItem?.id && { id: initialItem.id }),
    };

    onSave(newItem);
  };

  return (
    <div className='fixed inset-0 z-[60] overflow-y-auto'>
      <div className='flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0'>
        <div className='fixed inset-0 transition-opacity'>
          <div className='absolute inset-0 bg-stone-500 opacity-75'></div>
        </div>

        {/* Modal Content */}
        <div
          className='inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full'
          role='dialog'
          aria-modal='true'
          aria-labelledby='item-form-headline'
        >
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div className='bg-stone-50 px-6 py-4 border-b border-stone-200'>
              <h3
                className='text-lg font-medium text-stone-900'
                id='item-form-headline'
              >
                {initialItem ? 'Edit Item' : 'Add Item'}
              </h3>
            </div>

            {/* Content */}
            <div className='px-6 py-4'>
              <div className='space-y-4'>
                {/* Item Name */}
                <div>
                  <label
                    htmlFor='item-name'
                    className='block text-sm font-medium text-stone-700 mb-1'
                  >
                    Item Name
                  </label>
                  <input
                    type='text'
                    id='item-name'
                    className='block w-full border border-stone-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm'
                    placeholder='E.g., Vegetable Tanned Leather, Brass Buckles'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                {/* Item Type */}
                <div>
                  <label
                    htmlFor='item-type'
                    className='block text-sm font-medium text-stone-700 mb-1'
                  >
                    Item Type
                  </label>
                  <select
                    id='item-type'
                    className='block w-full border border-stone-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm'
                    value={itemType}
                    onChange={(e) => setItemType(e.target.value)}
                  >
                    <option value='MATERIAL'>Material</option>
                    <option value='LEATHER'>Leather</option>
                    <option value='HARDWARE'>Hardware</option>
                    <option value='TOOL'>Tool</option>
                    <option value='SUPPLY'>Supply</option>
                    <option value='SERVICE'>Service</option>
                    <option value='OTHER'>Other</option>
                  </select>
                </div>

                {/* Material Type (show only if itemType is MATERIAL or LEATHER) */}
                {(itemType === 'MATERIAL' || itemType === 'LEATHER') && (
                  <div>
                    <label
                      htmlFor='material-type'
                      className='block text-sm font-medium text-stone-700 mb-1'
                    >
                      Material Type
                    </label>
                    <select
                      id='material-type'
                      className='block w-full border border-stone-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm'
                      value={materialType}
                      onChange={(e) => setMaterialType(e.target.value)}
                    >
                      <option value=''>Select Material Type</option>
                      {Object.values(MaterialType).map((type) => (
                        <option key={type} value={type}>
                          {type.replace(/_/g, ' ')}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Quantity and Unit */}
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label
                      htmlFor='quantity'
                      className='block text-sm font-medium text-stone-700 mb-1'
                    >
                      Quantity
                    </label>
                    <input
                      type='number'
                      id='quantity'
                      className='block w-full border border-stone-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm'
                      placeholder='Quantity'
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(Math.max(1, Number(e.target.value)))
                      }
                      min='1'
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor='unit'
                      className='block text-sm font-medium text-stone-700 mb-1'
                    >
                      Unit (Optional)
                    </label>
                    <input
                      type='text'
                      id='unit'
                      className='block w-full border border-stone-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm'
                      placeholder='e.g., PIECE, HIDE, SET'
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                    />
                  </div>
                </div>

                {/* Price */}
                <div>
                  <label
                    htmlFor='price'
                    className='block text-sm font-medium text-stone-700 mb-1'
                  >
                    Unit Price
                  </label>
                  <div className='relative rounded-md shadow-sm'>
                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                      <span className='text-stone-500 sm:text-sm'>$</span>
                    </div>
                    <input
                      type='number'
                      id='price'
                      className='block w-full pl-7 border border-stone-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm'
                      placeholder='0.00'
                      step='0.01'
                      min='0'
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      required
                    />
                  </div>
                </div>

                {/* Total (display only) */}
                <div>
                  <label className='block text-sm font-medium text-stone-700 mb-1'>
                    Total
                  </label>
                  <div className='bg-stone-50 border border-stone-200 rounded-md py-2 px-3 shadow-sm'>
                    <span className='text-stone-700 font-medium'>
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className='bg-stone-50 px-6 py-4 border-t border-stone-200 flex justify-end space-x-3'>
              <button
                type='button'
                onClick={onCancel}
                className='bg-white border border-stone-300 text-stone-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-stone-50 focus:outline-none'
              >
                Cancel
              </button>
              <button
                type='submit'
                className='bg-amber-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-amber-700 focus:outline-none'
              >
                {initialItem ? 'Update Item' : 'Add Item'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrderItemForm;
