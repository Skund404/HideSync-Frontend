// src/components/patterns/components/ComponentDetail.tsx

import { Edit, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useComponentContext } from '../../../context/ComponentContext';
import { Component } from '../../../types/patternTypes';
import ErrorMessage from '../../common/ErrorMessage';
import LoadingSpinner from '../../common/LoadingSpinner';
import ComponentMaterialList from './ComponentMaterialList';

interface ComponentDetailProps {
  componentId: number;
  onClose?: () => void;
  onEdit?: (component: Component) => void;
}

const ComponentDetail: React.FC<ComponentDetailProps> = ({
  componentId,
  onClose,
  onEdit,
}) => {
  const { getComponentById, loading, error } = useComponentContext();
  const [component, setComponent] = useState<Component | undefined>(undefined);

  useEffect(() => {
    const fetchComponent = async () => {
      try {
        const result = await getComponentById(componentId);
        setComponent(result || undefined);
      } catch (err) {
        console.error(`Error fetching component ${componentId}:`, err);
      }
    };

    fetchComponent();
  }, [componentId, getComponentById]);

  if (loading)
    return (
      <LoadingSpinner size='medium' message='Loading component details...' />
    );
  if (error) return <ErrorMessage message={error} />;
  if (!component) return <div className='p-4'>Component not found</div>;

  const attributesList = Object.entries(component.attributes || {}).map(
    ([key, value]) => (
      <div
        key={key}
        className='py-2 flex justify-between border-b border-stone-100'
      >
        <span className='text-stone-500 capitalize'>
          {key.replace(/([A-Z])/g, ' $1').trim()}
        </span>
        <span className='text-stone-800 font-medium'>
          {typeof value === 'object' ? JSON.stringify(value) : value.toString()}
        </span>
      </div>
    )
  );

  return (
    <div className='bg-white shadow-lg rounded-lg overflow-hidden'>
      <div className='bg-amber-600 p-4 flex justify-between items-center'>
        <h2 className='text-xl font-semibold text-white'>{component.name}</h2>
        <button onClick={onClose} className='text-white hover:text-amber-200'>
          <X className='h-6 w-6' />
        </button>
      </div>

      <div className='p-6'>
        <div className='mb-6'>
          <h3 className='text-lg font-medium text-stone-800 mb-2'>
            Component Details
          </h3>
          <p className='text-stone-600 mb-4'>{component.description}</p>

          <div className='grid grid-cols-2 gap-4 mb-4'>
            <div className='bg-stone-50 p-3 rounded'>
              <span className='text-sm text-stone-500'>Component Type</span>
              <div className='font-medium text-stone-800'>
                {component.componentType.replace('_', ' ')}
              </div>
            </div>
            <div className='bg-stone-50 p-3 rounded'>
              <span className='text-sm text-stone-500'>Required</span>
              <div className='font-medium text-stone-800'>
                {component.isOptional ? 'Optional' : 'Required'}
              </div>
            </div>
          </div>

          <h4 className='font-medium text-stone-700 mb-2'>Attributes</h4>
          <div className='bg-stone-50 p-4 rounded mb-4'>
            {attributesList.length > 0 ? (
              attributesList
            ) : (
              <p className='text-stone-500'>No attributes defined</p>
            )}
          </div>

          {component.pathData && (
            <div className='mb-4'>
              <h4 className='font-medium text-stone-700 mb-2'>Preview</h4>
              <div className='border border-stone-200 rounded p-4 flex justify-center'>
                <svg
                  width='300'
                  height='200'
                  viewBox='0 0 300 200'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    d={component.pathData}
                    fill='none'
                    stroke='#92400e'
                    strokeWidth='2'
                  />
                </svg>
              </div>
            </div>
          )}

          <div className='flex gap-2 mt-4'>
            <button
              className='bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center'
              onClick={() => onEdit && onEdit(component)}
            >
              <Edit className='h-4 w-4 mr-2' />
              Edit Component
            </button>
          </div>
        </div>

        <div className='border-t border-stone-200 pt-6'>
          <h3 className='text-lg font-medium text-stone-800 mb-4'>Materials</h3>
          <ComponentMaterialList componentId={component.id} />
        </div>
      </div>
    </div>
  );
};

export default ComponentDetail;
