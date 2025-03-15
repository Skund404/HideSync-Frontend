// src/components/tools/common/ToolForm.tsx
//
// A form component for adding and editing tools.
// Used in the Tool Management module for creating and updating tool records.

import { Tool, ToolCategory, ToolStatus } from '@/types/toolType';
import { useTools } from '@context/ToolContext';
import { X } from 'lucide-react';
import React, { useState } from 'react';

interface ToolFormProps {
  isOpen: boolean;
  onClose: () => void;
  editTool?: Tool; // If provided, we're editing an existing tool
}

const ToolForm: React.FC<ToolFormProps> = ({ isOpen, onClose, editTool }) => {
  const { addTool, updateTool } = useTools();

  // Default values for a new tool
  const defaultValues = {
    name: '',
    description: '',
    category: ToolCategory.CUTTING,
    brand: '',
    model: '',
    serialNumber: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    purchasePrice: 0,
    supplier: '',
    specifications: '',
    status: ToolStatus.IN_STOCK,
    lastMaintenance: new Date().toISOString().split('T')[0],
    nextMaintenance: new Date(new Date().setDate(new Date().getDate() + 180))
      .toISOString()
      .split('T')[0],
    maintenanceInterval: 180, // 6 months default
    location: 'Main Workshop',
    image: '/api/placeholder/80/80',
  };

  // Initialize form state
  const [formData, setFormData] = useState<Omit<Tool, 'id'>>(
    editTool || defaultValues
  );

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    // Handle numeric inputs
    if (type === 'number') {
      setFormData({
        ...formData,
        [name]: parseFloat(value),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editTool) {
      // Update existing tool
      updateTool({
        ...editTool,
        ...formData,
      });
    } else {
      // Add new tool
      addTool(formData);
    }

    onClose();
  };

  // If the modal is not open, don't render
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div className='px-6 py-4 border-b border-stone-200 flex justify-between items-center'>
          <h2 className='text-xl font-semibold text-stone-800'>
            {editTool ? 'Edit Tool' : 'Add New Tool'}
          </h2>
          <button
            onClick={onClose}
            className='p-2 text-stone-500 hover:text-stone-700 rounded-full'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className='p-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Basic Information Section */}
            <div className='md:col-span-2'>
              <h3 className='text-lg font-medium text-stone-800 mb-4'>
                Basic Information
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-stone-700 mb-1'>
                    Tool Name <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='text'
                    name='name'
                    value={formData.name}
                    onChange={handleInputChange}
                    className='w-full rounded-md border border-stone-300 py-2 px-3 text-sm'
                    required
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-stone-700 mb-1'>
                    Category <span className='text-red-500'>*</span>
                  </label>
                  <select
                    name='category'
                    value={formData.category}
                    onChange={handleInputChange}
                    className='w-full rounded-md border border-stone-300 py-2 px-3 text-sm'
                    required
                  >
                    {Object.values(ToolCategory).map((category) => (
                      <option key={category} value={category}>
                        {category.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                <div className='md:col-span-2'>
                  <label className='block text-sm font-medium text-stone-700 mb-1'>
                    Description
                  </label>
                  <textarea
                    name='description'
                    value={formData.description}
                    onChange={handleInputChange}
                    className='w-full rounded-md border border-stone-300 py-2 px-3 text-sm'
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Product Information Section */}
            <div className='md:col-span-2'>
              <h3 className='text-lg font-medium text-stone-800 mb-4'>
                Product Information
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-stone-700 mb-1'>
                    Brand
                  </label>
                  <input
                    type='text'
                    name='brand'
                    value={formData.brand}
                    onChange={handleInputChange}
                    className='w-full rounded-md border border-stone-300 py-2 px-3 text-sm'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-stone-700 mb-1'>
                    Model
                  </label>
                  <input
                    type='text'
                    name='model'
                    value={formData.model}
                    onChange={handleInputChange}
                    className='w-full rounded-md border border-stone-300 py-2 px-3 text-sm'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-stone-700 mb-1'>
                    Serial Number
                  </label>
                  <input
                    type='text'
                    name='serialNumber'
                    value={formData.serialNumber}
                    onChange={handleInputChange}
                    className='w-full rounded-md border border-stone-300 py-2 px-3 text-sm'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-stone-700 mb-1'>
                    Supplier
                  </label>
                  <input
                    type='text'
                    name='supplier'
                    value={formData.supplier}
                    onChange={handleInputChange}
                    className='w-full rounded-md border border-stone-300 py-2 px-3 text-sm'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-stone-700 mb-1'>
                    Purchase Date
                  </label>
                  <input
                    type='date'
                    name='purchaseDate'
                    value={formData.purchaseDate}
                    onChange={handleInputChange}
                    className='w-full rounded-md border border-stone-300 py-2 px-3 text-sm'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-stone-700 mb-1'>
                    Purchase Price
                  </label>
                  <input
                    type='number'
                    name='purchasePrice'
                    value={formData.purchasePrice}
                    onChange={handleInputChange}
                    className='w-full rounded-md border border-stone-300 py-2 px-3 text-sm'
                    step='0.01'
                    min='0'
                  />
                </div>
              </div>
            </div>

            {/* Maintenance Information Section */}
            <div className='md:col-span-2'>
              <h3 className='text-lg font-medium text-stone-800 mb-4'>
                Maintenance Information
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-stone-700 mb-1'>
                    Status <span className='text-red-500'>*</span>
                  </label>
                  <select
                    name='status'
                    value={formData.status}
                    onChange={handleInputChange}
                    className='w-full rounded-md border border-stone-300 py-2 px-3 text-sm'
                    required
                  >
                    {Object.values(ToolStatus).map((status) => (
                      <option key={status} value={status}>
                        {status.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className='block text-sm font-medium text-stone-700 mb-1'>
                    Location <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='text'
                    name='location'
                    value={formData.location}
                    onChange={handleInputChange}
                    className='w-full rounded-md border border-stone-300 py-2 px-3 text-sm'
                    required
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-stone-700 mb-1'>
                    Last Maintenance Date
                  </label>
                  <input
                    type='date'
                    name='lastMaintenance'
                    value={formData.lastMaintenance}
                    onChange={handleInputChange}
                    className='w-full rounded-md border border-stone-300 py-2 px-3 text-sm'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-stone-700 mb-1'>
                    Next Maintenance Date
                  </label>
                  <input
                    type='date'
                    name='nextMaintenance'
                    value={formData.nextMaintenance}
                    onChange={handleInputChange}
                    className='w-full rounded-md border border-stone-300 py-2 px-3 text-sm'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-stone-700 mb-1'>
                    Maintenance Interval (days)
                  </label>
                  <input
                    type='number'
                    name='maintenanceInterval'
                    value={formData.maintenanceInterval}
                    onChange={handleInputChange}
                    className='w-full rounded-md border border-stone-300 py-2 px-3 text-sm'
                    min='1'
                  />
                </div>
              </div>
            </div>

            {/* Specifications Section */}
            <div className='md:col-span-2'>
              <h3 className='text-lg font-medium text-stone-800 mb-4'>
                Specifications
              </h3>
              <textarea
                name='specifications'
                value={formData.specifications}
                onChange={handleInputChange}
                className='w-full rounded-md border border-stone-300 py-2 px-3 text-sm'
                rows={4}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className='mt-8 flex justify-end space-x-3'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 py-2 border border-stone-300 rounded-md text-stone-700 hover:bg-stone-50'
            >
              Cancel
            </button>
            <button
              type='submit'
              className='px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md'
            >
              {editTool ? 'Update Tool' : 'Add Tool'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ToolForm;
