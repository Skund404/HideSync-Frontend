// src/components/patterns/components/ComponentForm.tsx

import { X } from 'lucide-react';
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
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

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

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!name.trim()) {
      errors.name = 'Component name is required';
    }

    if (pathData) {
      try {
        // Basic SVG path validation - just check if it starts with a valid command
        const validCommands = [
          'M',
          'm',
          'L',
          'l',
          'H',
          'h',
          'V',
          'v',
          'C',
          'c',
          'S',
          's',
          'Q',
          'q',
          'T',
          't',
          'A',
          'a',
          'Z',
          'z',
        ];
        const firstCommand = pathData.trim().charAt(0);
        if (!validCommands.includes(firstCommand)) {
          errors.pathData =
            'SVG path must start with a valid command (M, L, etc.)';
        }
      } catch (e) {
        errors.pathData = 'Invalid SVG path data';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

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
      };

      let savedComponent: Component;

      if (component) {
        // Update existing component
        savedComponent = await updateComponent(component.id, {
          ...componentData,
          modifiedAt: new Date(),
        });
      } else {
        // Add new component (we need to include all required fields)
        const now = new Date();

        // Need to explicitly type this properly to satisfy TypeScript
        const newComponent: Omit<Component, 'id'> = {
          ...componentData,
          createdAt: now,
          modifiedAt: now,
        };

        savedComponent = await addComponent(newComponent);
      }

      if (onSave) {
        onSave(savedComponent);
      }
    } catch (err) {
      setError(
        'Failed to save component. Please check your inputs and try again.'
      );
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
      let value: any = newAttrValue;
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Add attribute when Enter is pressed in attribute value field
    if (e.key === 'Enter' && newAttrKey.trim() && !e.shiftKey) {
      e.preventDefault();
      addAttribute();
    }
  };

  const resetForm = () => {
    if (component) {
      // Reset to original component values
      setName(component.name);
      setDescription(component.description);
      setComponentType(component.componentType);
      setIsOptional(component.isOptional);
      setPathData(component.pathData || '');
      setPosition(component.position || { x: 0, y: 0 });
      setRotation(component.rotation || 0);
      setAttributes(component.attributes || {});
      setAttributeKeys(Object.keys(component.attributes || {}));
    } else {
      // Reset to defaults for new component
      setName('');
      setDescription('');
      setComponentType(EnumTypes.ComponentType.PANEL);
      setIsOptional(false);
      setPathData('');
      setPosition({ x: 0, y: 0 });
      setRotation(0);
      setAttributes({});
      setAttributeKeys([]);
    }

    setError(null);
    setValidationErrors({});
  };

  // SVG path preview
  const pathPreview = () => {
    if (!pathData) return null;

    try {
      return (
        <div className='mt-2 border border-stone-200 rounded p-3 bg-stone-50'>
          <p className='text-xs text-stone-500 mb-2'>Path Preview:</p>
          <svg
            width='100%'
            height='100'
            viewBox='0 0 200 100'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path d={pathData} fill='none' stroke='#b45309' strokeWidth='2' />
          </svg>
        </div>
      );
    } catch (e) {
      return null;
    }
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
          <div
            className='mb-4 p-3 bg-red-100 text-red-700 rounded'
            role='alert'
          >
            {error}
          </div>
        )}

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
          <div>
            <label
              htmlFor='component-name'
              className='block text-sm font-medium text-stone-700 mb-1'
            >
              Component Name
            </label>
            <input
              id='component-name'
              type='text'
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-3 py-2 border ${
                validationErrors.name ? 'border-red-500' : 'border-stone-300'
              } rounded-md`}
              aria-invalid={validationErrors.name ? 'true' : 'false'}
              aria-describedby={
                validationErrors.name ? 'name-error' : undefined
              }
              required
            />
            {validationErrors.name && (
              <p id='name-error' className='mt-1 text-sm text-red-600'>
                {validationErrors.name}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor='component-type'
              className='block text-sm font-medium text-stone-700 mb-1'
            >
              Component Type
            </label>
            <select
              id='component-type'
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
          <label
            htmlFor='component-description'
            className='block text-sm font-medium text-stone-700 mb-1'
          >
            Description
          </label>
          <textarea
            id='component-description'
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
          <label
            htmlFor='svg-path'
            className='block text-sm font-medium text-stone-700 mb-1'
          >
            SVG Path Data (optional)
            <span className='ml-2 text-xs text-stone-500'>
              (Format: M x,y L x,y Z)
            </span>
          </label>
          <textarea
            id='svg-path'
            value={pathData}
            onChange={(e) => setPathData(e.target.value)}
            className={`w-full px-3 py-2 border ${
              validationErrors.pathData ? 'border-red-500' : 'border-stone-300'
            } rounded-md`}
            rows={2}
            placeholder='e.g., M 10,10 L 100,10 L 100,100 L 10,100 Z'
            aria-invalid={validationErrors.pathData ? 'true' : 'false'}
            aria-describedby={
              validationErrors.pathData ? 'path-error' : undefined
            }
          />
          {validationErrors.pathData && (
            <p id='path-error' className='mt-1 text-sm text-red-600'>
              {validationErrors.pathData}
            </p>
          )}
          {pathPreview()}
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
          <div>
            <label
              htmlFor='position-x'
              className='block text-sm font-medium text-stone-700 mb-1'
            >
              Position X
            </label>
            <input
              id='position-x'
              type='number'
              value={position.x}
              onChange={(e) =>
                setPosition({ ...position, x: parseInt(e.target.value) || 0 })
              }
              className='w-full px-3 py-2 border border-stone-300 rounded-md'
            />
          </div>

          <div>
            <label
              htmlFor='position-y'
              className='block text-sm font-medium text-stone-700 mb-1'
            >
              Position Y
            </label>
            <input
              id='position-y'
              type='number'
              value={position.y}
              onChange={(e) =>
                setPosition({ ...position, y: parseInt(e.target.value) || 0 })
              }
              className='w-full px-3 py-2 border border-stone-300 rounded-md'
            />
          </div>

          <div>
            <label
              htmlFor='rotation'
              className='block text-sm font-medium text-stone-700 mb-1'
            >
              Rotation (degrees)
            </label>
            <input
              id='rotation'
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
                    aria-label={`Remove ${key} attribute`}
                  >
                    <X className='h-5 w-5' />
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
              aria-label='New attribute name'
            />
            <input
              type='text'
              value={newAttrValue}
              onChange={(e) => setNewAttrValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder='Attribute value'
              className='flex-1 px-3 py-2 border border-stone-300 rounded-md'
              aria-label='New attribute value'
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

        <div className='flex justify-between gap-3'>
          <button
            type='button'
            onClick={resetForm}
            className='px-4 py-2 border border-stone-300 text-stone-700 rounded-md hover:bg-stone-50'
          >
            Reset
          </button>

          <div className='flex gap-3'>
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
        </div>
      </form>
    </div>
  );
};

export default ComponentForm;
