import {
  SectionType,
  StorageLocation,
  StorageLocationType,
  StorageStatus,
} from '@/types/storage'; // Updated import path
import { useStorage } from '@context/StorageContext';
import { X } from 'lucide-react';
import React, { useState } from 'react';

interface StorageLocationFormProps {
  onClose: () => void;
  existingLocation?: StorageLocation;
}

const StorageLocationForm: React.FC<StorageLocationFormProps> = ({
  onClose,
  existingLocation,
}) => {
  // Access storage context
  const {
    createStorageLocation,
    updateStorageLocation,
    deleteStorageLocation,
  } = useStorage();

  // Form state
  const [name, setName] = useState(existingLocation?.name || '');
  const [type, setType] = useState<StorageLocationType>(
    existingLocation?.type || StorageLocationType.CABINET
  );
  const [section, setSection] = useState<SectionType>(
    existingLocation?.section || SectionType.MAIN_WORKSHOP
  );
  const [description, setDescription] = useState(
    existingLocation?.description || ''
  );
  const [width, setWidth] = useState(existingLocation?.dimensions.width || 4);
  const [height, setHeight] = useState(
    existingLocation?.dimensions.height || 4
  );
  const [depth, setDepth] = useState(existingLocation?.dimensions.depth || 0);
  const [capacity, setCapacity] = useState(existingLocation?.capacity || 16);
  const [status, setStatus] = useState<StorageStatus>(
    existingLocation?.status || StorageStatus.ACTIVE
  );
  const [notes, setNotes] = useState(existingLocation?.notes || '');

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper function to render enum options with type safety
  const renderStorageTypeOptions = () => {
    // Using type assertion to handle the enum values
    return (Object.values(StorageLocationType) as StorageLocationType[]).map(
      (t) => (
        <option key={t} value={t}>
          {t}
        </option>
      )
    );
  };

  // Helper function to render section options with type safety
  const renderSectionOptions = () => {
    // Using type assertion to handle the enum values
    return (Object.values(SectionType) as SectionType[]).map((s) => (
      <option key={s} value={s}>
        {s.replace(/_/g, ' ')}
      </option>
    ));
  };

  // Helper function to render status options with type safety
  const renderStatusOptions = () => {
    // Using type assertion to handle the enum values
    return (Object.values(StorageStatus) as StorageStatus[]).map((s) => (
      <option key={s} value={s}>
        {s}
      </option>
    ));
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (width < 1) {
      newErrors.width = 'Width must be at least 1';
    }

    if (height < 1) {
      newErrors.height = 'Height must be at least 1';
    }

    if (capacity < 1) {
      newErrors.capacity = 'Capacity must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const locationData = {
        name,
        type,
        section,
        description,
        dimensions: {
          width,
          height,
          depth: depth > 0 ? depth : undefined,
        },
        capacity,
        status,
        notes,
        utilized: existingLocation?.utilized || 0,
        lastModified:
          existingLocation?.lastModified || new Date().toLocaleDateString(), // add this
      };

      if (existingLocation) {
        await updateStorageLocation(existingLocation.id, locationData);
      } else {
        await createStorageLocation(locationData);
      }

      onClose();
    } catch (error) {
      console.error('Error saving storage location:', error);
      setErrors({
        submit: 'Failed to save storage location. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!existingLocation) return;

    const confirmDelete = window.confirm(
      'Are you sure you want to delete this storage location? This action cannot be undone.'
    );

    if (!confirmDelete) return;

    setIsSubmitting(true);

    try {
      await deleteStorageLocation(existingLocation.id);
      onClose();
    } catch (error) {
      console.error('Error deleting storage location:', error);
      setErrors({
        submit: 'Failed to save storage location. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-lg shadow-lg overflow-hidden w-full max-w-2xl'>
        <div className='px-6 py-4 border-b border-stone-200 flex justify-between items-center'>
          <h3 className='text-lg font-semibold text-stone-800'>
            {existingLocation
              ? 'Edit Storage Location'
              : 'Add Storage Location'}
          </h3>
          <button
            className='text-stone-400 hover:text-stone-600'
            onClick={onClose}
          >
            <X className='h-6 w-6' />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className='p-6 max-h-[70vh] overflow-y-auto'>
            <div className='space-y-4'>
              {/* Name */}
              <div>
                <label
                  htmlFor='name'
                  className='block text-sm font-medium text-stone-700 mb-1'
                >
                  Name*
                </label>
                <input
                  type='text'
                  id='name'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full px-3 py-2 border ${
                    errors.name ? 'border-red-300' : 'border-stone-300'
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500`}
                  placeholder='e.g., Cabinet A, Leather Shelf'
                />
                {errors.name && (
                  <p className='mt-1 text-sm text-red-600'>{errors.name}</p>
                )}
              </div>

              {/* Type and Section */}
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div>
                  <label
                    htmlFor='type'
                    className='block text-sm font-medium text-stone-700 mb-1'
                  >
                    Storage Type
                  </label>
                  <select
                    id='type'
                    value={type}
                    onChange={(e) =>
                      setType(e.target.value as StorageLocationType)
                    }
                    className='w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500'
                  >
                    {renderStorageTypeOptions()}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor='section'
                    className='block text-sm font-medium text-stone-700 mb-1'
                  >
                    Section
                  </label>
                  <select
                    id='section'
                    value={section}
                    onChange={(e) => setSection(e.target.value as SectionType)}
                    className='w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500'
                  >
                    {renderSectionOptions()}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor='description'
                  className='block text-sm font-medium text-stone-700 mb-1'
                >
                  Description
                </label>
                <textarea
                  id='description'
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className='w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500'
                  placeholder='Describe this storage location...'
                />
              </div>

              {/* Dimensions */}
              <div>
                <h4 className='text-sm font-medium text-stone-700 mb-2'>
                  Dimensions
                </h4>
                <div className='grid grid-cols-3 gap-4'>
                  <div>
                    <label
                      htmlFor='width'
                      className='block text-sm text-stone-600 mb-1'
                    >
                      Width (cells)
                    </label>
                    <input
                      type='number'
                      id='width'
                      value={width}
                      onChange={(e) => setWidth(parseInt(e.target.value) || 0)}
                      min='1'
                      className={`w-full px-3 py-2 border ${
                        errors.width ? 'border-red-300' : 'border-stone-300'
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500`}
                    />
                    {errors.width && (
                      <p className='mt-1 text-xs text-red-600'>
                        {errors.width}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor='height'
                      className='block text-sm text-stone-600 mb-1'
                    >
                      Height (cells)
                    </label>
                    <input
                      type='number'
                      id='height'
                      value={height}
                      onChange={(e) => setHeight(parseInt(e.target.value) || 0)}
                      min='1'
                      className={`w-full px-3 py-2 border ${
                        errors.height ? 'border-red-300' : 'border-stone-300'
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500`}
                    />
                    {errors.height && (
                      <p className='mt-1 text-xs text-red-600'>
                        {errors.height}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor='depth'
                      className='block text-sm text-stone-600 mb-1'
                    >
                      Depth (optional)
                    </label>
                    <input
                      type='number'
                      id='depth'
                      value={depth}
                      onChange={(e) => setDepth(parseInt(e.target.value) || 0)}
                      min='0'
                      className='w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500'
                    />
                  </div>
                </div>
              </div>

              {/* Capacity */}
              <div>
                <label
                  htmlFor='capacity'
                  className='block text-sm font-medium text-stone-700 mb-1'
                >
                  Capacity (items)
                </label>
                <input
                  type='number'
                  id='capacity'
                  value={capacity}
                  onChange={(e) => setCapacity(parseInt(e.target.value) || 0)}
                  min='1'
                  className={`w-full px-3 py-2 border ${
                    errors.capacity ? 'border-red-300' : 'border-stone-300'
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500`}
                />
                {errors.capacity && (
                  <p className='mt-1 text-sm text-red-600'>{errors.capacity}</p>
                )}
                <p className='mt-1 text-xs text-stone-500'>
                  The capacity represents the maximum number of items this
                  storage can hold.
                </p>
              </div>

              {/* Status */}
              <div>
                <label
                  htmlFor='status'
                  className='block text-sm font-medium text-stone-700 mb-1'
                >
                  Status
                </label>
                <select
                  id='status'
                  value={status}
                  onChange={(e) => setStatus(e.target.value as StorageStatus)}
                  className='w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500'
                >
                  {renderStatusOptions()}
                </select>
              </div>

              {/* Notes */}
              <div>
                <label
                  htmlFor='notes'
                  className='block text-sm font-medium text-stone-700 mb-1'
                >
                  Notes
                </label>
                <textarea
                  id='notes'
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className='w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500'
                  placeholder='Any additional notes about this storage...'
                />
              </div>

              {errors.submit && (
                <div className='p-3 bg-red-50 text-red-700 rounded-md'>
                  {errors.submit}
                </div>
              )}
            </div>
          </div>

          <div className='px-6 py-4 border-t border-stone-200 bg-stone-50 flex justify-between'>
            {existingLocation ? (
              <button
                type='button'
                onClick={handleDelete}
                className='px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium'
                disabled={isSubmitting}
              >
                Delete
              </button>
            ) : (
              <button
                type='button'
                onClick={onClose}
                className='px-4 py-2 border border-stone-300 hover:bg-stone-100 text-stone-700 rounded-md text-sm font-medium'
                disabled={isSubmitting}
              >
                Cancel
              </button>
            )}

            <div className='flex space-x-2'>
              <button
                type='button'
                onClick={onClose}
                className='px-4 py-2 border border-stone-300 hover:bg-stone-100 text-stone-700 rounded-md text-sm font-medium'
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type='submit'
                className='px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-sm font-medium'
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? 'Saving...'
                  : existingLocation
                  ? 'Update'
                  : 'Create'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StorageLocationForm;
