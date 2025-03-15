// src/components/patterns/components/ComponentMaterialForm.tsx

import React, { useEffect, useState } from 'react';
import { useComponentContext } from '../../../context/ComponentContext';
import { EnumTypes } from '../../../types';
import { ComponentMaterial } from '../../../types/patternTypes';

interface ComponentMaterialFormProps {
  componentId: number;
  componentMaterial?: ComponentMaterial;
  onSave?: () => void;
  onCancel?: () => void;
}

const ComponentMaterialForm: React.FC<ComponentMaterialFormProps> = ({
  componentId,
  componentMaterial,
  onSave,
  onCancel,
}) => {
  const { addComponentMaterial, updateComponentMaterial } =
    useComponentContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [materialId, setMaterialId] = useState(0);
  const [materialType, setMaterialType] = useState<EnumTypes.MaterialType>(
    EnumTypes.MaterialType.LEATHER
  );
  const [quantity, setQuantity] = useState(0);
  const [unit, setUnit] = useState<EnumTypes.MeasurementUnit>(
    EnumTypes.MeasurementUnit.SQUARE_FOOT
  );
  const [isRequired, setIsRequired] = useState(true);
  const [notes, setNotes] = useState('');

  // Initialize form if editing an existing component material
  useEffect(() => {
    if (componentMaterial) {
      setMaterialId(componentMaterial.materialId);
      setMaterialType(componentMaterial.materialType);
      setQuantity(componentMaterial.quantity);
      setUnit(componentMaterial.unit);
      setIsRequired(componentMaterial.isRequired);
      setNotes(componentMaterial.notes || '');
    }
  }, [componentMaterial]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const materialData = {
        componentId,
        materialId,
        materialType,
        quantity,
        unit,
        isRequired,
        notes: notes || undefined,
      };

      if (componentMaterial) {
        // Update existing component material
        await updateComponentMaterial(componentMaterial.id, materialData);
      } else {
        // Add new component material
        await addComponentMaterial(
          materialData as Omit<ComponentMaterial, 'id'>
        );
      }

      if (onSave) {
        onSave();
      }
    } catch (err) {
      setError('Failed to save material');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='bg-stone-50 p-4 rounded-md mb-4'>
      <h3 className='text-md font-medium text-stone-700 mb-3'>
        {componentMaterial ? 'Edit Material' : 'Add New Material'}
      </h3>

      <form onSubmit={handleSubmit}>
        {error && (
          <div className='mb-4 p-3 bg-red-100 text-red-700 rounded'>
            {error}
          </div>
        )}

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
          <div>
            <label className='block text-sm font-medium text-stone-700 mb-1'>
              Material ID
            </label>
            <input
              type='number'
              value={materialId}
              onChange={(e) => setMaterialId(parseInt(e.target.value) || 0)}
              className='w-full px-3 py-2 border border-stone-300 rounded-md'
              required
              min='1'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-stone-700 mb-1'>
              Material Type
            </label>
            <select
              value={materialType}
              onChange={(e) =>
                setMaterialType(e.target.value as EnumTypes.MaterialType)
              }
              className='w-full px-3 py-2 border border-stone-300 rounded-md bg-white'
              required
            >
              {Object.values(EnumTypes.MaterialType).map((type) => (
                <option key={type} value={type}>
                  {type.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
          <div>
            <label className='block text-sm font-medium text-stone-700 mb-1'>
              Quantity
            </label>
            <input
              type='number'
              value={quantity}
              onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
              className='w-full px-3 py-2 border border-stone-300 rounded-md'
              required
              step='0.01'
              min='0'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-stone-700 mb-1'>
              Unit
            </label>
            <select
              value={unit}
              onChange={(e) =>
                setUnit(e.target.value as EnumTypes.MeasurementUnit)
              }
              className='w-full px-3 py-2 border border-stone-300 rounded-md bg-white'
              required
            >
              {Object.values(EnumTypes.MeasurementUnit).map((u) => (
                <option key={u} value={u}>
                  {u.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className='mb-4'>
          <div className='flex items-center'>
            <input
              type='checkbox'
              id='isRequired'
              checked={isRequired}
              onChange={(e) => setIsRequired(e.target.checked)}
              className='h-4 w-4 text-amber-600 focus:ring-amber-500 border-stone-300 rounded'
            />
            <label
              htmlFor='isRequired'
              className='ml-2 block text-sm text-stone-700'
            >
              This material is required
            </label>
          </div>
        </div>

        <div className='mb-4'>
          <label className='block text-sm font-medium text-stone-700 mb-1'>
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className='w-full px-3 py-2 border border-stone-300 rounded-md'
            rows={2}
            placeholder='Special instructions, alternatives, etc.'
          />
        </div>

        <div className='flex justify-end gap-3'>
          <button
            type='button'
            onClick={onCancel}
            className='px-3 py-2 border border-stone-300 text-stone-700 rounded-md hover:bg-stone-100'
          >
            Cancel
          </button>
          <button
            type='submit'
            disabled={isLoading}
            className='px-3 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50'
          >
            {isLoading
              ? 'Saving...'
              : componentMaterial
              ? 'Update Material'
              : 'Add Material'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ComponentMaterialForm;
