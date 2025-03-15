// src/components/patterns/components/ComponentForm.tsx

import React, { useEffect, useState } from 'react';
import { useComponentContext } from '../../../context/ComponentContext';
import { EnumTypes } from '../../../types';
import { Component } from '../../../types/patternTypes';

interface ComponentFormProps {
  patternId: number;
  component?: Component;
  onSave?: (component: Component) => void;
  onCancel?: () => void;
}

const ComponentForm: React.FC<ComponentFormProps> = ({
  patternId,
  component,
  onSave,
  onCancel,
}) => {
  const { addComponent, updateComponent } = useComponentContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [componentType, setComponentType] = useState<EnumTypes.ComponentType>(
    EnumTypes.ComponentType.PANEL
  );
  const [isOptional, setIsOptional] = useState(false);
  const [pathData, setPathData] = useState('');
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [attributes, setAttributes] = useState<Record<string, any>>({});

  // Dynamic attributes management
  const [attributeKeys, setAttributeKeys] = useState<string[]>([]);
  const [newAttrKey, setNewAttrKey] = useState('');
  const [newAttrValue, setNewAttrValue] = useState('');

  // Initialize form if editing an existing component
  useEffect(() => {
    if (component) {
      setName(component.name);
      setDescription(component.description);
      setComponentType(component.componentType);
      setIsOptional(component.isOptional);
      setPathData(component.pathData || '');
      setPosition(component.position || { x: 0, y: 0 });
      setRotation(component.rotation || 0);
      setAttributes(component.attributes || {});
      setAttributeKeys(Object.keys(component.attributes || {}));
    }
  }, [component]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const componentData = {
        name,
        description,
        componentType,
        isOptional,
        pathData: pathData || undefined,
        position: position.x !== 0 || position.y !== 0 ? position : undefined,
        rotation: rotation !== 0 ? rotation : undefined,
        attributes,
        patternId,
        ...(component && {
          id: component.id,
          createdAt: component.createdAt,
          modifiedAt: new Date(),
        }),
      };

      let savedComponent: Component;

      if (component) {
        // Update existing component
        savedComponent = await updateComponent(component.id, componentData);
      } else {
        // Add new component
        savedComponent = await addComponent(
          componentData as Omit<Component, 'id'>
        );
      }

      if (onSave) {
        onSave(savedComponent);
      }
    } catch (err) {
      setError('Failed to save component');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const addAttribute = () => {
    if (newAttrKey.trim() && !attributeKeys.includes(newAttrKey)) {
      const updatedKeys = [...attributeKeys, newAttrKey];
      setAttributeKeys(updatedKeys);

      // Try to convert numeric values
      let value: any = newAttrValue; // Changed from let value = newAttrValue;
      const numValue = parseFloat(newAttrValue);
      if (!isNaN(numValue) && numValue.toString() === newAttrValue) {
        value = numValue;
      }

      setAttributes({
        ...attributes,
        [newAttrKey]: value,
      });

      // Clear inputs
      setNewAttrKey('');
      setNewAttrValue('');
    }
  };

  const removeAttribute = (key: string) => {
    const updatedKeys = attributeKeys.filter((k) => k !== key);
    setAttributeKeys(updatedKeys);

    const updatedAttributes = { ...attributes };
    delete updatedAttributes[key];
    setAttributes(updatedAttributes);
  };

  return (
    <div className='bg-white shadow-lg rounded-lg overflow-hidden'>
      <div className='bg-amber-600 p-4'>
        <h2 className='text-xl font-semibold text-white'>
          {component ? 'Edit Component' : 'Add New Component'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className='p-6'>
        {error && (
          <div className='mb-4 p-3 bg-red-100 text-red-700 rounded'>
            {error}
          </div>
        )}

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
          <div>
            <label className='block text-sm font-medium text-stone-700 mb-1'>
              Component Name
            </label>
            <input
              type='text'
              value={name}
              onChange={(e) => setName(e.target.value)}
              className='w-full px-3 py-2 border border-stone-300 rounded-md'
              required
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-stone-700 mb-1'>
              Component Type
            </label>
            <select
              value={componentType}
              onChange={(e) =>
                setComponentType(e.target.value as EnumTypes.ComponentType)
              }
              className='w-full px-3 py-2 border border-stone-300 rounded-md bg-white'
              required
            >
              {Object.values(EnumTypes.ComponentType).map((type) => (
                <option key={type} value={type}>
                  {type.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className='mb-4'>
          <label className='block text-sm font-medium text-stone-700 mb-1'>
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className='w-full px-3 py-2 border border-stone-300 rounded-md'
            rows={3}
          />
        </div>

        <div className='mb-4'>
          <div className='flex items-center'>
            <input
              type='checkbox'
              id='isOptional'
              checked={isOptional}
              onChange={(e) => setIsOptional(e.target.checked)}
              className='h-4 w-4 text-amber-600 focus:ring-amber-500 border-stone-300 rounded'
            />
            <label
              htmlFor='isOptional'
              className='ml-2 block text-sm text-stone-700'
            >
              This component is optional
            </label>
          </div>
        </div>

        <div className='mb-4'>
          <label className='block text-sm font-medium text-stone-700 mb-1'>
            SVG Path Data (optional)
          </label>
          <textarea
            value={pathData}
            onChange={(e) => setPathData(e.target.value)}
            className='w-full px-3 py-2 border border-stone-300 rounded-md'
            rows={2}
            placeholder='e.g., M 10,10 L 100,10 L 100,100 L 10,100 Z'
          />
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
          <div>
            <label className='block text-sm font-medium text-stone-700 mb-1'>
              Position X
            </label>
            <input
              type='number'
              value={position.x}
              onChange={(e) =>
                setPosition({ ...position, x: parseInt(e.target.value) || 0 })
              }
              className='w-full px-3 py-2 border border-stone-300 rounded-md'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-stone-700 mb-1'>
              Position Y
            </label>
            <input
              type='number'
              value={position.y}
              onChange={(e) =>
                setPosition({ ...position, y: parseInt(e.target.value) || 0 })
              }
              className='w-full px-3 py-2 border border-stone-300 rounded-md'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-stone-700 mb-1'>
              Rotation (degrees)
            </label>
            <input
              type='number'
              value={rotation}
              onChange={(e) => setRotation(parseInt(e.target.value) || 0)}
              className='w-full px-3 py-2 border border-stone-300 rounded-md'
            />
          </div>
        </div>

        <div className='mb-6'>
          <h3 className='text-md font-medium text-stone-700 mb-2'>
            Component Attributes
          </h3>

          {attributeKeys.length > 0 ? (
            <div className='mb-4 border border-stone-200 rounded divide-y divide-stone-200'>
              {attributeKeys.map((key) => (
                <div
                  key={key}
                  className='p-3 flex justify-between items-center'
                >
                  <div>
                    <span className='font-medium text-stone-700'>{key}</span>
                    <span className='mx-2 text-stone-400'>:</span>
                    <span className='text-stone-600'>
                      {attributes[key]?.toString()}
                    </span>
                  </div>
                  <button
                    type='button'
                    onClick={() => removeAttribute(key)}
                    className='text-red-500 hover:text-red-700'
                  >
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      className='h-5 w-5'
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
          ) : (
            <div className='mb-4 p-4 bg-stone-50 text-stone-500 text-center rounded'>
              No attributes added yet
            </div>
          )}

          <div className='flex gap-2 mb-2'>
            <input
              type='text'
              value={newAttrKey}
              onChange={(e) => setNewAttrKey(e.target.value)}
              placeholder='Attribute name'
              className='flex-1 px-3 py-2 border border-stone-300 rounded-md'
            />
            <input
              type='text'
              value={newAttrValue}
              onChange={(e) => setNewAttrValue(e.target.value)}
              placeholder='Attribute value'
              className='flex-1 px-3 py-2 border border-stone-300 rounded-md'
            />
            <button
              type='button'
              onClick={addAttribute}
              disabled={!newAttrKey.trim()}
              className='px-4 py-2 bg-stone-100 text-stone-700 rounded-md hover:bg-stone-200 disabled:opacity-50'
            >
              Add
            </button>
          </div>
          <p className='text-xs text-stone-500'>
            Common attributes: width, height, thickness, corners, cornerRadius
          </p>
        </div>

        <div className='flex justify-end gap-3'>
          <button
            type='button'
            onClick={onCancel}
            className='px-4 py-2 border border-stone-300 text-stone-700 rounded-md hover:bg-stone-50'
          >
            Cancel
          </button>
          <button
            type='submit'
            disabled={isLoading}
            className='px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50'
          >
            {isLoading
              ? 'Saving...'
              : component
              ? 'Update Component'
              : 'Add Component'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ComponentForm;
