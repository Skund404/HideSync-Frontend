// src/components/tools/common/ToolDetailModal.tsx
//
// A modal component for viewing and editing tool details.
// Used in the Tool Management module for detailed information display.

import { useTools } from '@/context/ToolContext';
import { Tool, ToolCategory, ToolStatus } from '@/types/toolType';
import { AlertTriangle, Clock, Edit, XCircle } from 'lucide-react';
import React, { useState } from 'react';

interface ToolDetailModalProps {
  tool: Tool | null;
  isOpen: boolean;
  onClose: () => void;
  readOnly?: boolean;
}

const ToolDetailModal: React.FC<ToolDetailModalProps> = ({
  tool,
  isOpen,
  onClose,
  readOnly = false,
}) => {
  const { updateTool } = useTools();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTool, setEditedTool] = useState<Tool | null>(tool);

  // If the modal is not open or there's no tool, don't render anything
  if (!isOpen || !tool) {
    return null;
  }

  // Update local state when the tool prop changes
  if (tool !== editedTool && !isEditing) {
    setEditedTool(tool);
  }

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setEditedTool((prev) => {
      if (!prev) return prev;

      if (name === 'category') {
        return { ...prev, [name]: value as ToolCategory };
      } else if (name === 'status') {
        return { ...prev, [name]: value as ToolStatus };
      } else if (name === 'purchasePrice' || name === 'maintenanceInterval') {
        return { ...prev, [name]: parseFloat(value) };
      } else {
        return { ...prev, [name]: value };
      }
    });
  };

  const handleSave = () => {
    if (editedTool) {
      updateTool(editedTool);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditedTool(tool);
    setIsEditing(false);
  };

  // Helper function to get status badge color
  const getStatusColor = (status: ToolStatus) => {
    switch (status) {
      case ToolStatus.IN_STOCK:
        return 'bg-green-100 text-green-800';
      case ToolStatus.CHECKED_OUT:
        return 'bg-blue-100 text-blue-800';
      case ToolStatus.MAINTENANCE:
        return 'bg-amber-100 text-amber-800';
      case ToolStatus.DAMAGED:
      case ToolStatus.LOST:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-stone-100 text-stone-800';
    }
  };

  // Calculate days until next maintenance
  const calculateDaysUntilMaintenance = () => {
    if (!tool.nextMaintenance) return null;

    const today = new Date();
    const nextDate = new Date(tool.nextMaintenance);
    const diffTime = nextDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  const daysUntilMaintenance = calculateDaysUntilMaintenance();

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div className='px-6 py-4 border-b border-stone-200 flex justify-between items-center'>
          <h2 className='text-xl font-semibold text-stone-800'>
            {isEditing ? 'Edit Tool' : 'Tool Details'}
          </h2>
          <div className='flex space-x-2'>
            {!readOnly && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className='p-2 text-amber-600 hover:text-amber-800 rounded-full'
              >
                <Edit className='w-5 h-5' />
              </button>
            )}
            <button
              onClick={onClose}
              className='p-2 text-stone-500 hover:text-stone-700 rounded-full'
            >
              <XCircle className='w-5 h-5' />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className='p-6'>
          {/* Basic Information Section */}
          <div className='mb-6'>
            <h3 className='text-lg font-medium text-stone-800 mb-4'>
              Basic Information
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {/* Tool Photo */}
              <div className='md:row-span-3 flex justify-center items-start'>
                <div className='w-40 h-40 bg-stone-100 rounded-lg flex items-center justify-center overflow-hidden'>
                  {editedTool?.image ? (
                    <img
                      src={editedTool.image}
                      alt={editedTool.name}
                      className='object-cover w-full h-full'
                    />
                  ) : (
                    <div className='text-stone-400'>No Image</div>
                  )}
                </div>
              </div>

              {/* Basic Info Fields */}
              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-stone-700 mb-1'>
                    Name
                  </label>
                  {isEditing ? (
                    <input
                      type='text'
                      name='name'
                      value={editedTool?.name || ''}
                      onChange={handleInputChange}
                      className='w-full rounded-md border border-stone-300 py-2 px-3 text-sm'
                    />
                  ) : (
                    <div className='text-stone-800'>{tool.name}</div>
                  )}
                </div>

                <div>
                  <label className='block text-sm font-medium text-stone-700 mb-1'>
                    Category
                  </label>
                  {isEditing ? (
                    <select
                      name='category'
                      value={editedTool?.category || ''}
                      onChange={handleInputChange}
                      className='w-full rounded-md border border-stone-300 py-2 px-3 text-sm'
                    >
                      {Object.values(ToolCategory).map((category) => (
                        <option key={category} value={category}>
                          {category.replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className='text-stone-800'>{tool.category}</div>
                  )}
                </div>

                <div>
                  <label className='block text-sm font-medium text-stone-700 mb-1'>
                    Status
                  </label>
                  {isEditing ? (
                    <select
                      name='status'
                      value={editedTool?.status || ''}
                      onChange={handleInputChange}
                      className='w-full rounded-md border border-stone-300 py-2 px-3 text-sm'
                    >
                      {Object.values(ToolStatus).map((status) => (
                        <option key={status} value={status}>
                          {status.replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        tool.status
                      )}`}
                    >
                      {tool.status.replace('_', ' ')}
                    </span>
                  )}
                </div>

                <div>
                  <label className='block text-sm font-medium text-stone-700 mb-1'>
                    Location
                  </label>
                  {isEditing ? (
                    <input
                      type='text'
                      name='location'
                      value={editedTool?.location || ''}
                      onChange={handleInputChange}
                      className='w-full rounded-md border border-stone-300 py-2 px-3 text-sm'
                    />
                  ) : (
                    <div className='text-stone-800'>{tool.location}</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Product Information Section */}
          <div className='mb-6'>
            <h3 className='text-lg font-medium text-stone-800 mb-4'>
              Product Information
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-stone-700 mb-1'>
                  Brand
                </label>
                {isEditing ? (
                  <input
                    type='text'
                    name='brand'
                    value={editedTool?.brand || ''}
                    onChange={handleInputChange}
                    className='w-full rounded-md border border-stone-300 py-2 px-3 text-sm'
                  />
                ) : (
                  <div className='text-stone-800'>{tool.brand}</div>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-stone-700 mb-1'>
                  Model
                </label>
                {isEditing ? (
                  <input
                    type='text'
                    name='model'
                    value={editedTool?.model || ''}
                    onChange={handleInputChange}
                    className='w-full rounded-md border border-stone-300 py-2 px-3 text-sm'
                  />
                ) : (
                  <div className='text-stone-800'>{tool.model}</div>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-stone-700 mb-1'>
                  Serial Number
                </label>
                {isEditing ? (
                  <input
                    type='text'
                    name='serialNumber'
                    value={editedTool?.serialNumber || ''}
                    onChange={handleInputChange}
                    className='w-full rounded-md border border-stone-300 py-2 px-3 text-sm'
                  />
                ) : (
                  <div className='text-stone-800'>{tool.serialNumber}</div>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-stone-700 mb-1'>
                  Supplier
                </label>
                {isEditing ? (
                  <input
                    type='text'
                    name='supplier'
                    value={editedTool?.supplier || ''}
                    onChange={handleInputChange}
                    className='w-full rounded-md border border-stone-300 py-2 px-3 text-sm'
                  />
                ) : (
                  <div className='text-stone-800'>
                    {tool.supplier || 'Not specified'}
                  </div>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-stone-700 mb-1'>
                  Purchase Date
                </label>
                {isEditing ? (
                  <input
                    type='date'
                    name='purchaseDate'
                    value={editedTool?.purchaseDate || ''}
                    onChange={handleInputChange}
                    className='w-full rounded-md border border-stone-300 py-2 px-3 text-sm'
                  />
                ) : (
                  <div className='text-stone-800'>
                    {new Date(tool.purchaseDate).toLocaleDateString()}
                  </div>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-stone-700 mb-1'>
                  Purchase Price
                </label>
                {isEditing ? (
                  <input
                    type='number'
                    name='purchasePrice'
                    value={editedTool?.purchasePrice || 0}
                    onChange={handleInputChange}
                    className='w-full rounded-md border border-stone-300 py-2 px-3 text-sm'
                    step='0.01'
                  />
                ) : (
                  <div className='text-stone-800'>
                    ${tool.purchasePrice.toFixed(2)}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Maintenance Information Section */}
          <div className='mb-6'>
            <h3 className='text-lg font-medium text-stone-800 mb-4'>
              Maintenance Information
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-stone-700 mb-1'>
                  Last Maintenance
                </label>
                {isEditing ? (
                  <input
                    type='date'
                    name='lastMaintenance'
                    value={editedTool?.lastMaintenance || ''}
                    onChange={handleInputChange}
                    className='w-full rounded-md border border-stone-300 py-2 px-3 text-sm'
                  />
                ) : (
                  <div className='text-stone-800'>
                    {new Date(tool.lastMaintenance).toLocaleDateString()}
                  </div>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-stone-700 mb-1'>
                  Next Maintenance
                </label>
                {isEditing ? (
                  <input
                    type='date'
                    name='nextMaintenance'
                    value={editedTool?.nextMaintenance || ''}
                    onChange={handleInputChange}
                    className='w-full rounded-md border border-stone-300 py-2 px-3 text-sm'
                  />
                ) : (
                  <div className='flex items-center'>
                    <span className='text-stone-800 mr-2'>
                      {new Date(tool.nextMaintenance).toLocaleDateString()}
                    </span>
                    {daysUntilMaintenance !== null && (
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          daysUntilMaintenance < 0
                            ? 'bg-red-100 text-red-800'
                            : daysUntilMaintenance < 30
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {daysUntilMaintenance < 0
                          ? `${Math.abs(daysUntilMaintenance)} days overdue`
                          : `${daysUntilMaintenance} days remaining`}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-stone-700 mb-1'>
                  Maintenance Interval (days)
                </label>
                {isEditing ? (
                  <input
                    type='number'
                    name='maintenanceInterval'
                    value={editedTool?.maintenanceInterval || 0}
                    onChange={handleInputChange}
                    className='w-full rounded-md border border-stone-300 py-2 px-3 text-sm'
                  />
                ) : (
                  <div className='text-stone-800'>
                    {tool.maintenanceInterval} days
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Specifications Section */}
          <div className='mb-6'>
            <h3 className='text-lg font-medium text-stone-800 mb-4'>
              Specifications
            </h3>
            {isEditing ? (
              <textarea
                name='specifications'
                value={editedTool?.specifications || ''}
                onChange={handleInputChange}
                className='w-full rounded-md border border-stone-300 py-2 px-3 text-sm'
                rows={4}
              />
            ) : (
              <div className='text-stone-800 whitespace-pre-wrap bg-stone-50 p-4 rounded-md'>
                {tool.specifications || 'No specifications provided'}
              </div>
            )}
          </div>

          {/* Status-specific information */}
          {tool.status === ToolStatus.CHECKED_OUT && tool.checkedOutTo && (
            <div className='mb-6 bg-blue-50 border border-blue-100 rounded-md p-4'>
              <h3 className='text-md font-medium text-blue-800 mb-2 flex items-center'>
                <Clock className='h-5 w-5 mr-2' />
                Checkout Information
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <span className='text-sm font-medium text-blue-700'>
                    Checked Out To:
                  </span>
                  <div className='text-blue-800'>{tool.checkedOutTo}</div>
                </div>
                {tool.checkedOutDate && (
                  <div>
                    <span className='text-sm font-medium text-blue-700'>
                      Checkout Date:
                    </span>
                    <div className='text-blue-800'>
                      {new Date(tool.checkedOutDate).toLocaleDateString()}
                    </div>
                  </div>
                )}
                {tool.dueDate && (
                  <div>
                    <span className='text-sm font-medium text-blue-700'>
                      Due Date:
                    </span>
                    <div className='text-blue-800'>
                      {new Date(tool.dueDate).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {tool.status === ToolStatus.DAMAGED && tool.damageReport && (
            <div className='mb-6 bg-red-50 border border-red-100 rounded-md p-4'>
              <h3 className='text-md font-medium text-red-800 mb-2 flex items-center'>
                <AlertTriangle className='h-5 w-5 mr-2' />
                Damage Report
              </h3>
              <div>
                <span className='text-sm font-medium text-red-700'>
                  Reported By:
                </span>
                <div className='text-red-800'>{tool.reportedBy}</div>
              </div>
              <div className='mt-2'>
                <span className='text-sm font-medium text-red-700'>
                  Description:
                </span>
                <div className='text-red-800'>{tool.damageReport}</div>
              </div>
              {tool.reportedDamagedDate && (
                <div className='mt-2'>
                  <span className='text-sm font-medium text-red-700'>
                    Reported Date:
                  </span>
                  <div className='text-red-800'>
                    {new Date(tool.reportedDamagedDate).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>
          )}

          {tool.status === ToolStatus.LOST && tool.reportedLostDate && (
            <div className='mb-6 bg-red-50 border border-red-100 rounded-md p-4'>
              <h3 className='text-md font-medium text-red-800 mb-2 flex items-center'>
                <AlertTriangle className='h-5 w-5 mr-2' />
                Lost Report
              </h3>
              <div>
                <span className='text-sm font-medium text-red-700'>
                  Reported By:
                </span>
                <div className='text-red-800'>{tool.reportedBy}</div>
              </div>
              <div className='mt-2'>
                <span className='text-sm font-medium text-red-700'>
                  Reported Date:
                </span>
                <div className='text-red-800'>
                  {new Date(tool.reportedLostDate).toLocaleDateString()}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer with action buttons */}
        <div className='px-6 py-4 border-t border-stone-200 flex justify-end space-x-2'>
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className='px-4 py-2 border border-stone-300 rounded-md text-stone-700 hover:bg-stone-50'
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className='px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md'
              >
                Save Changes
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className='px-4 py-2 bg-stone-600 hover:bg-stone-700 text-white rounded-md'
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ToolDetailModal;
