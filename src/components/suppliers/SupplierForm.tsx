// src/components/suppliers/SupplierForm.tsx
import { useSuppliers } from '@/context/SupplierContext';
import { SupplierStatus } from '@/types/enums';
import { Supplier } from '@/types/supplierTypes';
import React, { useState } from 'react';

interface SupplierFormProps {
  initialSupplier?: Supplier;
  onClose: () => void;
  onSuccess: () => void;
}

const SupplierForm: React.FC<SupplierFormProps> = ({
  initialSupplier,
  onClose,
  onSuccess,
}) => {
  const isEditMode = !!initialSupplier;
  const { addSupplier, updateSupplier } = useSuppliers();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initial state based on provided supplier or defaults
  const [formData, setFormData] = useState<Partial<Supplier>>(
    initialSupplier || {
      name: '',
      category: 'MIXED',
      contactName: '',
      email: '',
      phone: '',
      address: '',
      website: '',
      rating: 3,
      status: SupplierStatus.ACTIVE,
      materialCategories: [],
      paymentTerms: 'Net 30',
      minOrderAmount: '$100',
      leadTime: '2-3 weeks',
      logo: '/api/placeholder/100/100',
    }
  );

  // For materials categories input handling
  const [newCategory, setNewCategory] = useState('');

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'rating' ? parseInt(value) : value,
    }));
  };

  // Handle adding a material category
  const handleAddCategory = () => {
    if (newCategory.trim() === '') return;
    setFormData((prev) => ({
      ...prev,
      materialCategories: [
        ...(prev.materialCategories || []),
        newCategory.trim(),
      ],
    }));
    setNewCategory('');
  };

  // Handle removing a material category
  const handleRemoveCategory = (categoryToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      materialCategories: (prev.materialCategories || []).filter(
        (category) => category !== categoryToRemove
      ),
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEditMode && initialSupplier) {
        await updateSupplier({
          ...initialSupplier,
          ...formData,
        } as Supplier);
      } else {
        await addSupplier(formData as Omit<Supplier, 'id'>);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving the supplier');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='fixed inset-0 bg-stone-900/50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden'>
        <div className='p-6 border-b border-stone-200'>
          <h2 className='text-xl font-medium'>
            {isEditMode ? 'Edit Supplier' : 'Add New Supplier'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className='overflow-y-auto p-6'>
          {error && (
            <div className='mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md'>
              {error}
            </div>
          )}

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Basic Information */}
            <div className='md:col-span-2'>
              <h3 className='font-medium text-stone-700 mb-2'>
                Basic Information
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-stone-700 mb-1'>
                    Supplier Name*
                  </label>
                  <input
                    type='text'
                    name='name'
                    value={formData.name || ''}
                    onChange={handleChange}
                    required
                    className='w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-stone-700 mb-1'>
                    Category*
                  </label>
                  <select
                    name='category'
                    value={formData.category || ''}
                    onChange={handleChange}
                    required
                    className='w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500'
                  >
                    <option value='LEATHER'>Leather</option>
                    <option value='HARDWARE'>Hardware</option>
                    <option value='SUPPLIES'>Supplies</option>
                    <option value='MIXED'>Mixed</option>
                  </select>
                </div>

                <div>
                  <label className='block text-sm font-medium text-stone-700 mb-1'>
                    Status*
                  </label>
                  <select
                    name='status'
                    value={formData.status || ''}
                    onChange={handleChange}
                    required
                    className='w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500'
                  >
                    <option value={SupplierStatus.ACTIVE}>Active</option>
                    <option value={SupplierStatus.INACTIVE}>Inactive</option>
                    <option value={SupplierStatus.PREFERRED}>Preferred</option>
                    <option value={SupplierStatus.BLACKLISTED}>
                      Blacklisted
                    </option>
                  </select>
                </div>

                <div>
                  <label className='block text-sm font-medium text-stone-700 mb-1'>
                    Rating*
                  </label>
                  <select
                    name='rating'
                    value={formData.rating || 3}
                    onChange={handleChange}
                    required
                    className='w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500'
                  >
                    <option value={1}>★☆☆☆☆ (1)</option>
                    <option value={2}>★★☆☆☆ (2)</option>
                    <option value={3}>★★★☆☆ (3)</option>
                    <option value={4}>★★★★☆ (4)</option>
                    <option value={5}>★★★★★ (5)</option>
                  </select>
                </div>

                <div>
                  <label className='block text-sm font-medium text-stone-700 mb-1'>
                    Logo URL
                  </label>
                  <input
                    type='text'
                    name='logo'
                    value={formData.logo || ''}
                    onChange={handleChange}
                    className='w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500'
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className='md:col-span-2'>
              <h3 className='font-medium text-stone-700 mb-2'>
                Contact Information
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-stone-700 mb-1'>
                    Contact Name*
                  </label>
                  <input
                    type='text'
                    name='contactName'
                    value={formData.contactName || ''}
                    onChange={handleChange}
                    required
                    className='w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-stone-700 mb-1'>
                    Email*
                  </label>
                  <input
                    type='email'
                    name='email'
                    value={formData.email || ''}
                    onChange={handleChange}
                    required
                    className='w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-stone-700 mb-1'>
                    Phone*
                  </label>
                  <input
                    type='text'
                    name='phone'
                    value={formData.phone || ''}
                    onChange={handleChange}
                    required
                    className='w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-stone-700 mb-1'>
                    Website
                  </label>
                  <input
                    type='text'
                    name='website'
                    value={formData.website || ''}
                    onChange={handleChange}
                    className='w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500'
                  />
                </div>

                <div className='md:col-span-2'>
                  <label className='block text-sm font-medium text-stone-700 mb-1'>
                    Address
                  </label>
                  <input
                    type='text'
                    name='address'
                    value={formData.address || ''}
                    onChange={handleChange}
                    className='w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500'
                  />
                </div>
              </div>
            </div>

            {/* Supply Information */}
            <div className='md:col-span-2'>
              <h3 className='font-medium text-stone-700 mb-2'>
                Supply Information
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-stone-700 mb-1'>
                    Payment Terms*
                  </label>
                  <input
                    type='text'
                    name='paymentTerms'
                    value={formData.paymentTerms || ''}
                    onChange={handleChange}
                    required
                    className='w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-stone-700 mb-1'>
                    Minimum Order Amount*
                  </label>
                  <input
                    type='text'
                    name='minOrderAmount'
                    value={formData.minOrderAmount || ''}
                    onChange={handleChange}
                    required
                    className='w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-stone-700 mb-1'>
                    Lead Time*
                  </label>
                  <input
                    type='text'
                    name='leadTime'
                    value={formData.leadTime || ''}
                    onChange={handleChange}
                    required
                    className='w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-stone-700 mb-1'>
                    Last Order Date
                  </label>
                  <input
                    type='text'
                    name='lastOrderDate'
                    value={formData.lastOrderDate || ''}
                    onChange={handleChange}
                    className='w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500'
                  />
                </div>
              </div>
            </div>

            {/* Material Categories */}
            <div className='md:col-span-2'>
              <h3 className='font-medium text-stone-700 mb-2'>
                Material Categories
              </h3>
              <div className='flex flex-wrap gap-2 mb-2'>
                {(formData.materialCategories || []).map((category, index) => (
                  <div
                    key={index}
                    className='bg-stone-100 text-stone-700 px-2 py-1 rounded-md flex items-center'
                  >
                    <span>{category}</span>
                    <button
                      type='button'
                      onClick={() => handleRemoveCategory(category)}
                      className='ml-2 text-stone-500 hover:text-stone-700'
                    >
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='h-4 w-4'
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
                ))}
              </div>
              <div className='flex gap-2'>
                <input
                  type='text'
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder='Add a category'
                  className='flex-1 px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500'
                />
                <button
                  type='button'
                  onClick={handleAddCategory}
                  className='px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-md'
                >
                  Add
                </button>
              </div>
            </div>

            {/* Notes */}
            <div className='md:col-span-2'>
              <label className='block text-sm font-medium text-stone-700 mb-1'>
                Notes
              </label>
              <textarea
                name='notes'
                value={formData.notes || ''}
                onChange={handleChange}
                rows={3}
                className='w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500'
              ></textarea>
            </div>
          </div>

          <div className='mt-6 flex justify-end space-x-3'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 py-2 bg-stone-100 text-stone-700 rounded-md hover:bg-stone-200'
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type='submit'
              className='px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 flex items-center'
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg
                    className='animate-spin -ml-1 mr-2 h-4 w-4 text-white'
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
                  Saving...
                </>
              ) : (
                <>{isEditMode ? 'Update Supplier' : 'Add Supplier'}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupplierForm;
