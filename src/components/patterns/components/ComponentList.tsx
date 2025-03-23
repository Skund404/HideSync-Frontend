// src/components/patterns/components/ComponentList.tsx

import { AlertTriangle, Edit, Plus, Search, Trash2 } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useComponentContext } from '../../../context/ComponentContext';
import { EnumTypes } from '../../../types';
import { Component, ComponentFilters } from '../../../types/patternTypes';
import ErrorMessage from '../../common/ErrorMessage';
import LoadingSpinner from '../../common/LoadingSpinner';

interface ComponentListProps {
  patternId?: number;
  onSelectComponent?: (component: Component) => void;
  onAddComponent?: () => void;
  onEditComponent?: (component: Component) => void;
  onDeleteComponent?: (component: Component) => void;
}

const ComponentList: React.FC<ComponentListProps> = ({
  patternId,
  onSelectComponent,
  onAddComponent,
  onEditComponent,
  onDeleteComponent,
}) => {
  const {
    loading: globalLoading,
    error: globalError,
    getComponentsByPatternId,
    filterComponents,
  } = useComponentContext();

  const [localComponents, setLocalComponents] = useState<Component[]>([]);
  const [filteredComponents, setFilteredComponents] = useState<Component[]>([]);
  const [filters, setFilters] = useState<ComponentFilters>({
    patternId,
  });
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Load components for a specific pattern
  useEffect(() => {
    if (patternId) {
      const loadComponents = async () => {
        try {
          setLocalLoading(true);
          const fetchedComponents = await getComponentsByPatternId(patternId);
          setLocalComponents(fetchedComponents);
          setFilteredComponents(fetchedComponents);
          setLocalError(null);
        } catch (err) {
          console.error(
            `Error loading components for pattern ${patternId}:`,
            err
          );
          setLocalError('Failed to load components');
          setLocalComponents([]);
          setFilteredComponents([]);
        } finally {
          setLocalLoading(false);
        }
      };

      loadComponents();
    }
  }, [patternId, getComponentsByPatternId]);

  // Apply filters when not using patternId, or apply local filters when using patternId
  useEffect(() => {
    if (!patternId) {
      // When not using patternId, fetch filtered components from the API
      const applyGlobalFilters = async () => {
        try {
          setLocalLoading(true);
          const components = await filterComponents(filters);
          setFilteredComponents(components);
          setLocalError(null);
        } catch (err) {
          console.error('Error filtering components:', err);
          setLocalError('Failed to filter components');
          setFilteredComponents([]);
        } finally {
          setLocalLoading(false);
        }
      };

      applyGlobalFilters();
    } else if (localComponents.length > 0) {
      // When using patternId, filter the localComponents array locally
      const applyLocalFilters = () => {
        let filtered = [...localComponents];

        if (filters.searchQuery) {
          const query = filters.searchQuery.toLowerCase();
          filtered = filtered.filter(
            (comp) =>
              comp.name.toLowerCase().includes(query) ||
              comp.description.toLowerCase().includes(query)
          );
        }

        if (filters.componentType) {
          filtered = filtered.filter(
            (comp) => comp.componentType === filters.componentType
          );
        }

        setFilteredComponents(filtered);
      };

      applyLocalFilters();
    }
  }, [patternId, localComponents, filters, filterComponents]);

  const handleAddComponent = useCallback(() => {
    if (onAddComponent) {
      onAddComponent();
    }
  }, [onAddComponent]);

  const handleEditClick = useCallback(
    (e: React.MouseEvent, component: Component) => {
      e.stopPropagation();
      if (onEditComponent) {
        onEditComponent(component);
      }
    },
    [onEditComponent]
  );

  const handleDeleteClick = useCallback(
    (e: React.MouseEvent, component: Component) => {
      e.stopPropagation();
      if (onDeleteComponent) {
        onDeleteComponent(component);
      }
    },
    [onDeleteComponent]
  );

  if (globalLoading || localLoading)
    return <LoadingSpinner size='medium' message='Loading components...' />;

  if (globalError || localError)
    return (
      <ErrorMessage message={globalError || localError || 'Unknown error'} />
    );

  if (filteredComponents.length === 0) {
    return (
      <div className='p-6 text-center bg-white shadow-sm rounded-lg border border-stone-200'>
        <div className='bg-amber-100 inline-flex p-3 rounded-full mb-4'>
          <AlertTriangle className='h-6 w-6 text-amber-600' />
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
          onClick={handleAddComponent}
          aria-label='Add new component'
        >
          <Plus className='h-4 w-4 mr-2 inline' />
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
          <div className='relative'>
            <input
              type='text'
              placeholder='Search...'
              className='px-3 py-1 pl-8 border border-stone-300 rounded-md text-sm'
              onChange={(e) =>
                setFilters({ ...filters, searchQuery: e.target.value })
              }
              aria-label='Search components'
            />
            <Search className='h-4 w-4 absolute left-2 top-1.5 text-stone-400' />
          </div>
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
            aria-label='Filter by component type'
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
        {filteredComponents.map((component: Component) => (
          <li
            key={component.id}
            className='p-4 hover:bg-stone-50 cursor-pointer transition-colors'
            onClick={() => onSelectComponent && onSelectComponent(component)}
          >
            <div className='flex justify-between items-center'>
              <div>
                <h4 className='font-medium text-stone-800'>{component.name}</h4>
                <p className='text-sm text-stone-500 line-clamp-2'>
                  {component.description}
                </p>
                <div className='flex gap-2 mt-1 flex-wrap'>
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
                <button
                  className='p-1 text-stone-400 hover:text-stone-600'
                  onClick={(e) => handleEditClick(e, component)}
                  aria-label={`Edit ${component.name}`}
                >
                  <Edit className='h-5 w-5' />
                </button>
                <button
                  className='p-1 text-stone-400 hover:text-red-600'
                  onClick={(e) => handleDeleteClick(e, component)}
                  aria-label={`Delete ${component.name}`}
                >
                  <Trash2 className='h-5 w-5' />
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
