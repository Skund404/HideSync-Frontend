// src/components/patterns/components/ComponentList.tsx

import React from 'react';
import { useComponentContext } from '../../../context/ComponentContext';
import { EnumTypes } from '../../../types';
import { Component, ComponentFilters } from '../../../types/patternTypes';

interface ComponentListProps {
  patternId?: number;
  onSelectComponent?: (component: Component) => void;
}

const ComponentList: React.FC<ComponentListProps> = ({
  patternId,
  onSelectComponent,
}) => {
  const { components, loading, error, filterComponents } =
    useComponentContext();
  const [filters, setFilters] = React.useState<ComponentFilters>({
    patternId,
  });

  const filteredComponents = filterComponents(filters);

  if (loading) return <div className='p-4'>Loading components...</div>;
  if (error) return <div className='p-4 text-red-500'>Error: {error}</div>;

  if (filteredComponents.length === 0) {
    return (
      <div className='p-6 text-center bg-white shadow-sm rounded-lg border border-stone-200'>
        <div className='bg-amber-100 inline-flex p-3 rounded-full mb-4'>
          {/* Icon placeholder */}
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-6 w-6 text-amber-600'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
            />
          </svg>
        </div>
        <h3 className='text-lg font-medium text-stone-700 mb-2'>
          No Components Found
        </h3>
        <p className='text-stone-500 mb-6'>
          {patternId
            ? "This pattern doesn't have any components yet. Add components to break down this pattern."
            : 'No components found. Try adjusting your filters or create new components.'}
        </p>
        <button
          className='bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md text-sm font-medium'
          onClick={() => {
            /* Add component logic */
          }}
        >
          Add Component
        </button>
      </div>
    );
  }

  return (
    <div className='bg-white shadow-sm rounded-lg overflow-hidden'>
      <div className='p-4 border-b border-stone-200 flex justify-between items-center'>
        <h3 className='text-lg font-medium text-stone-700'>Components</h3>
        <div className='flex gap-2'>
          <input
            type='text'
            placeholder='Search components...'
            className='px-3 py-1 border border-stone-300 rounded-md text-sm'
            onChange={(e) =>
              setFilters({ ...filters, searchQuery: e.target.value })
            }
          />
          <select
            className='px-3 py-1 border border-stone-300 rounded-md text-sm bg-white'
            onChange={(e) =>
              setFilters({
                ...filters,
                componentType: e.target.value
                  ? (e.target.value as EnumTypes.ComponentType)
                  : undefined,
              })
            }
          >
            <option value=''>All Types</option>
            {Object.values(EnumTypes.ComponentType).map((type) => (
              <option key={type} value={type}>
                {type.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      <ul className='divide-y divide-stone-200'>
        {filteredComponents.map((component) => (
          <li
            key={component.id}
            className='p-4 hover:bg-stone-50 cursor-pointer'
            onClick={() => onSelectComponent && onSelectComponent(component)}
          >
            <div className='flex justify-between items-center'>
              <div>
                <h4 className='font-medium text-stone-800'>{component.name}</h4>
                <p className='text-sm text-stone-500'>
                  {component.description}
                </p>
                <div className='flex gap-2 mt-1'>
                  <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800'>
                    {component.componentType.replace('_', ' ')}
                  </span>
                  {component.isOptional && (
                    <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800'>
                      Optional
                    </span>
                  )}
                </div>
              </div>
              <div className='flex items-center gap-2'>
                <button className='p-1 text-stone-400 hover:text-stone-600'>
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
                      d='M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z'
                    />
                  </svg>
                </button>
                <button className='p-1 text-stone-400 hover:text-red-600'>
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
                      d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                    />
                  </svg>
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ComponentList;
