// src/components/materials/common/MaterialForm.tsx
import {
  AnimalSource,
  HardwareFinishType,
  HardwareMaterialType,
  HardwareSubtype,
  LeatherSubtype,
  Material,
  MaterialQuality,
  MaterialStatus,
  MaterialType,
  MeasurementUnit,
  SuppliesSubtype,
  ThreadType,
} from '@/types/materialTypes';
import React, { useEffect, useState } from 'react';

// Form Props Interface
interface MaterialFormProps {
  // Accept the actual Material type that has string IDs
  material?: Material | null;
  materialType: MaterialType;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const MaterialForm: React.FC<MaterialFormProps> = ({
  material,
  materialType,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  // Dynamic form state based on material type
  const [formData, setFormData] = useState<any>({
    name: '',
    materialType: materialType,
    quantity: 0,
    unit: MeasurementUnit.PIECE,
    status: MaterialStatus.IN_STOCK,
    quality: MaterialQuality.STANDARD,
  });

  const [error, setError] = useState<string | null>(null);

  // Populate form when editing existing material
  useEffect(() => {
    if (material) {
      setFormData({
        ...material,
        materialType: materialType,
      });
    } else {
      // Reset form when creating a new material
      setFormData({
        name: '',
        materialType: materialType,
        quantity: 0,
        unit: MeasurementUnit.PIECE,
        status: MaterialStatus.IN_STOCK,
        quality: MaterialQuality.STANDARD,
      });
    }
  }, [material, materialType]);

  // Dynamic input handler
  // Update the handleChange function to fix the typing issue with 'prev'
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    // Special handling for numeric fields
    const numericFields = ['quantity', 'thickness', 'area', 'volume', 'length'];
    const processedValue =
      numericFields.includes(name) && value !== ''
        ? parseFloat(value) || 0
        : value;

    setFormData((prev: any) => ({
      ...prev,
      [name]: processedValue,
    }));
  };

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      // Validate required fields
      if (!formData.name) {
        throw new Error('Material name is required');
      }

      // Add validations for type-specific required fields
      if (materialType === MaterialType.LEATHER) {
        if (!formData.thickness) {
          throw new Error('Thickness is required for leather materials');
        }
      }

      await onSubmit(formData);
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving the material');
    }
  };

  // Dynamic form fields based on material type
  const renderTypeSpecificFields = () => {
    switch (materialType) {
      case MaterialType.LEATHER:
        return (
          <>
            <div>
              <label
                htmlFor='leatherSubtype'
                className='block text-sm font-medium text-stone-700'
              >
                Leather Type
              </label>
              <select
                name='subtype'
                id='leatherSubtype'
                value={formData.subtype || ''}
                onChange={handleChange}
                className='mt-1 block w-full border border-stone-300 rounded-md shadow-sm p-2 sm:text-sm'
              >
                <option value=''>Select Leather Type</option>
                {Object.values(LeatherSubtype).map((type) => (
                  <option key={type} value={type}>
                    {type
                      .replace(/_/g, ' ')
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor='thickness'
                className='block text-sm font-medium text-stone-700'
              >
                Thickness (mm) *
              </label>
              <input
                type='number'
                name='thickness'
                id='thickness'
                required
                value={formData.thickness?.toString() || ''}
                onChange={handleChange}
                step='0.1'
                className='mt-1 block w-full border border-stone-300 rounded-md shadow-sm p-2 sm:text-sm'
              />
            </div>
            <div>
              <label
                htmlFor='animalSource'
                className='block text-sm font-medium text-stone-700'
              >
                Animal Source
              </label>
              <select
                name='animalSource'
                id='animalSource'
                value={formData.animalSource || ''}
                onChange={handleChange}
                className='mt-1 block w-full border border-stone-300 rounded-md shadow-sm p-2 sm:text-sm'
              >
                <option value=''>Select Animal Source</option>
                {Object.values(AnimalSource).map((source) => (
                  <option key={source} value={source}>
                    {source
                      .replace(/_/g, ' ')
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor='tannage'
                className='block text-sm font-medium text-stone-700'
              >
                Tannage
              </label>
              <input
                type='text'
                name='tannage'
                id='tannage'
                value={formData.tannage || ''}
                onChange={handleChange}
                className='mt-1 block w-full border border-stone-300 rounded-md shadow-sm p-2 sm:text-sm'
                placeholder='e.g., vegetable, chrome'
              />
            </div>
            <div>
              <label
                htmlFor='color'
                className='block text-sm font-medium text-stone-700'
              >
                Color
              </label>
              <input
                type='text'
                name='color'
                id='color'
                value={formData.color || ''}
                onChange={handleChange}
                className='mt-1 block w-full border border-stone-300 rounded-md shadow-sm p-2 sm:text-sm'
              />
            </div>
          </>
        );

      case MaterialType.HARDWARE:
        return (
          <>
            <div>
              <label
                htmlFor='hardwareSubtype'
                className='block text-sm font-medium text-stone-700'
              >
                Hardware Type
              </label>
              <select
                name='subtype'
                id='hardwareSubtype'
                value={formData.subtype || ''}
                onChange={handleChange}
                className='mt-1 block w-full border border-stone-300 rounded-md shadow-sm p-2 sm:text-sm'
              >
                <option value=''>Select Hardware Type</option>
                {Object.values(HardwareSubtype).map((type) => (
                  <option key={type} value={type}>
                    {type
                      .replace(/_/g, ' ')
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor='hardwareMaterial'
                className='block text-sm font-medium text-stone-700'
              >
                Material
              </label>
              <select
                name='hardwareMaterial'
                id='hardwareMaterial'
                value={formData.hardwareMaterial || ''}
                onChange={handleChange}
                className='mt-1 block w-full border border-stone-300 rounded-md shadow-sm p-2 sm:text-sm'
              >
                <option value=''>Select Material</option>
                {Object.values(HardwareMaterialType).map((material) => (
                  <option key={material} value={material}>
                    {material
                      .replace(/_/g, ' ')
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor='finish'
                className='block text-sm font-medium text-stone-700'
              >
                Finish
              </label>
              <select
                name='finish'
                id='finish'
                value={formData.finish || ''}
                onChange={handleChange}
                className='mt-1 block w-full border border-stone-300 rounded-md shadow-sm p-2 sm:text-sm'
              >
                <option value=''>Select Finish</option>
                {Object.values(HardwareFinishType).map((finish) => (
                  <option key={finish} value={finish}>
                    {finish
                      .replace(/_/g, ' ')
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor='size'
                className='block text-sm font-medium text-stone-700'
              >
                Size
              </label>
              <input
                type='text'
                name='size'
                id='size'
                value={formData.size || ''}
                onChange={handleChange}
                className='mt-1 block w-full border border-stone-300 rounded-md shadow-sm p-2 sm:text-sm'
              />
            </div>
            <div>
              <label
                htmlFor='color'
                className='block text-sm font-medium text-stone-700'
              >
                Color
              </label>
              <input
                type='text'
                name='color'
                id='color'
                value={formData.color || ''}
                onChange={handleChange}
                className='mt-1 block w-full border border-stone-300 rounded-md shadow-sm p-2 sm:text-sm'
              />
            </div>
          </>
        );

      case MaterialType.SUPPLIES:
        return (
          <>
            <div>
              <label
                htmlFor='suppliesSubtype'
                className='block text-sm font-medium text-stone-700'
              >
                Supplies Type
              </label>
              <select
                name='subtype'
                id='suppliesSubtype'
                value={formData.subtype || ''}
                onChange={handleChange}
                className='mt-1 block w-full border border-stone-300 rounded-md shadow-sm p-2 sm:text-sm'
              >
                <option value=''>Select Supplies Type</option>
                {Object.values(SuppliesSubtype).map((type) => (
                  <option key={type} value={type}>
                    {type
                      .replace(/_/g, ' ')
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
            {formData.subtype === SuppliesSubtype.THREAD && (
              <div>
                <label
                  htmlFor='threadType'
                  className='block text-sm font-medium text-stone-700'
                >
                  Thread Type
                </label>
                <select
                  name='threadType'
                  id='threadType'
                  value={formData.threadType || ''}
                  onChange={handleChange}
                  className='mt-1 block w-full border border-stone-300 rounded-md shadow-sm p-2 sm:text-sm'
                >
                  <option value=''>Select Thread Type</option>
                  {Object.values(ThreadType).map((type) => (
                    <option key={type} value={type}>
                      {type
                        .replace(/_/g, ' ')
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label
                htmlFor='color'
                className='block text-sm font-medium text-stone-700'
              >
                Color
              </label>
              <input
                type='text'
                name='color'
                id='color'
                value={formData.color || ''}
                onChange={handleChange}
                className='mt-1 block w-full border border-stone-300 rounded-md shadow-sm p-2 sm:text-sm'
              />
            </div>
            <div>
              <label
                htmlFor='materialComposition'
                className='block text-sm font-medium text-stone-700'
              >
                Material Composition
              </label>
              <input
                type='text'
                name='materialComposition'
                id='materialComposition'
                value={formData.materialComposition || ''}
                onChange={handleChange}
                className='mt-1 block w-full border border-stone-300 rounded-md shadow-sm p-2 sm:text-sm'
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      {error && (
        <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md'>
          {error}
        </div>
      )}

      <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
        <div>
          <label
            htmlFor='name'
            className='block text-sm font-medium text-stone-700'
          >
            Material Name *
          </label>
          <input
            type='text'
            name='name'
            id='name'
            required
            value={formData.name}
            onChange={handleChange}
            className='mt-1 block w-full border border-stone-300 rounded-md shadow-sm p-2 focus:ring-amber-500 focus:border-amber-500 sm:text-sm'
          />
        </div>

        <div>
          <label
            htmlFor='quantity'
            className='block text-sm font-medium text-stone-700'
          >
            Quantity *
          </label>
          <input
            type='number'
            name='quantity'
            id='quantity'
            required
            value={formData.quantity}
            onChange={handleChange}
            step='0.01'
            className='mt-1 block w-full border border-stone-300 rounded-md shadow-sm p-2 focus:ring-amber-500 focus:border-amber-500 sm:text-sm'
          />
        </div>

        <div>
          <label
            htmlFor='unit'
            className='block text-sm font-medium text-stone-700'
          >
            Unit *
          </label>
          <select
            name='unit'
            id='unit'
            required
            value={formData.unit}
            onChange={handleChange}
            className='mt-1 block w-full border border-stone-300 rounded-md shadow-sm p-2 focus:ring-amber-500 focus:border-amber-500 sm:text-sm'
          >
            <option value=''>Select Unit</option>
            {Object.values(MeasurementUnit).map((unit) => (
              <option key={unit} value={unit}>
                {unit
                  .replace(/_/g, ' ')
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor='status'
            className='block text-sm font-medium text-stone-700'
          >
            Status *
          </label>
          <select
            name='status'
            id='status'
            required
            value={formData.status}
            onChange={handleChange}
            className='mt-1 block w-full border border-stone-300 rounded-md shadow-sm p-2 focus:ring-amber-500 focus:border-amber-500 sm:text-sm'
          >
            <option value=''>Select Status</option>
            {Object.values(MaterialStatus).map((status) => (
              <option key={status} value={status}>
                {status
                  .replace(/_/g, ' ')
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor='quality'
            className='block text-sm font-medium text-stone-700'
          >
            Quality *
          </label>
          <select
            name='quality'
            id='quality'
            required
            value={formData.quality}
            onChange={handleChange}
            className='mt-1 block w-full border border-stone-300 rounded-md shadow-sm p-2 focus:ring-amber-500 focus:border-amber-500 sm:text-sm'
          >
            <option value=''>Select Quality</option>
            {Object.values(MaterialQuality).map((quality) => (
              <option key={quality} value={quality}>
                {quality
                  .replace(/_/g, ' ')
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor='sku'
            className='block text-sm font-medium text-stone-700'
          >
            SKU
          </label>
          <input
            type='text'
            name='sku'
            id='sku'
            value={formData.sku || ''}
            onChange={handleChange}
            className='mt-1 block w-full border border-stone-300 rounded-md shadow-sm p-2 focus:ring-amber-500 focus:border-amber-500 sm:text-sm'
          />
        </div>

        {/* Type specific fields inserted here */}
        {renderTypeSpecificFields()}

        <div className='sm:col-span-2'>
          <label
            htmlFor='description'
            className='block text-sm font-medium text-stone-700'
          >
            Description
          </label>
          <textarea
            name='description'
            id='description'
            rows={3}
            value={formData.description || ''}
            onChange={handleChange}
            className='mt-1 block w-full border border-stone-300 rounded-md shadow-sm p-2 focus:ring-amber-500 focus:border-amber-500 sm:text-sm'
          ></textarea>
        </div>

        <div className='sm:col-span-2'>
          <label
            htmlFor='notes'
            className='block text-sm font-medium text-stone-700'
          >
            Notes
          </label>
          <textarea
            name='notes'
            id='notes'
            rows={2}
            value={formData.notes || ''}
            onChange={handleChange}
            className='mt-1 block w-full border border-stone-300 rounded-md shadow-sm p-2 focus:ring-amber-500 focus:border-amber-500 sm:text-sm'
          ></textarea>
        </div>
      </div>

      <div className='flex justify-end space-x-3'>
        <button
          type='button'
          onClick={onCancel}
          className='py-2 px-4 border border-stone-300 shadow-sm text-sm font-medium rounded-md text-stone-700 bg-white hover:bg-stone-50'
        >
          Cancel
        </button>
        <button
          type='submit'
          disabled={isLoading}
          className='py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700'
        >
          {isLoading
            ? 'Saving...'
            : material
            ? 'Update Material'
            : 'Create Material'}
        </button>
      </div>
    </form>
  );
};

export default MaterialForm;
