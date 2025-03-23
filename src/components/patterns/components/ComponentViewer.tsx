// src/components/patterns/components/ComponentViewer.tsx

import React, { useEffect, useState } from 'react';
import { useComponentContext } from '../../../context/ComponentContext';
import { Component } from '../../../types/patternTypes';
import ErrorMessage from '../../common/ErrorMessage';
import LoadingSpinner from '../../common/LoadingSpinner';

interface ComponentViewerProps {
  patternId?: number;
  components?: Component[];
  selectedComponentId?: number;
  onSelectComponent?: (component: Component) => void;
}

const ComponentViewer: React.FC<ComponentViewerProps> = ({
  patternId,
  components: propComponents,
  selectedComponentId,
  onSelectComponent,
}) => {
  const { getComponentsByPatternId, loading, error } = useComponentContext();
  const [components, setComponents] = useState<Component[]>(
    propComponents || []
  );
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Load components if not provided via props
  useEffect(() => {
    if (propComponents) {
      setComponents(propComponents);
    } else if (patternId) {
      const fetchComponents = async () => {
        try {
          const patternComponents = await getComponentsByPatternId(patternId);
          setComponents(patternComponents);
          setFetchError(null);
        } catch (err) {
          console.error(
            `Error fetching components for pattern ${patternId}:`,
            err
          );
          setFetchError('Failed to load components');
        }
      };

      fetchComponents();
    }
  }, [patternId, propComponents, getComponentsByPatternId]);

  if (loading)
    return <LoadingSpinner size='small' message='Loading components...' />;
  if (error || fetchError)
    return <ErrorMessage message={error || fetchError || 'Unknown error'} />;

  if (!components || components.length === 0) {
    return (
      <div className='flex items-center justify-center p-8 bg-stone-50 border border-stone-200 rounded-md'>
        <p className='text-stone-500'>
          No components available for visualization
        </p>
      </div>
    );
  }

  return (
    <div className='border border-stone-200 rounded-md overflow-hidden'>
      <div className='p-4 bg-stone-100 border-b border-stone-200'>
        <h3 className='text-md font-medium text-stone-700'>
          Component Visualization
        </h3>
      </div>
      <div className='p-4 bg-white'>
        <svg
          width='100%'
          height='500'
          viewBox='0 0 800 500'
          xmlns='http://www.w3.org/2000/svg'
        >
          <rect width='800' height='500' fill='#f8f8f8' />

          {/* Grid lines for reference */}
          <g stroke='#e0e0e0' strokeWidth='1'>
            {Array.from({ length: 16 }).map((_, i) => (
              <line
                key={`vline-${i}`}
                x1={i * 50}
                y1='0'
                x2={i * 50}
                y2='500'
              />
            ))}
            {Array.from({ length: 10 }).map((_, i) => (
              <line
                key={`hline-${i}`}
                x1='0'
                y1={i * 50}
                x2='800'
                y2={i * 50}
              />
            ))}
          </g>

          {/* Components */}
          {components.map((component) => {
            const isSelected = component.id === selectedComponentId;
            const translateX = component.position?.x || 0;
            const translateY = component.position?.y || 0;
            const rotation = component.rotation || 0;

            return (
              <g
                key={component.id}
                transform={`translate(${translateX}, ${translateY}) rotate(${rotation})`}
                onClick={() =>
                  onSelectComponent && onSelectComponent(component)
                }
                style={{ cursor: 'pointer' }}
              >
                {component.pathData ? (
                  <path
                    d={component.pathData}
                    fill={isSelected ? '#f59e0b33' : '#f5f5f4'}
                    stroke={isSelected ? '#b45309' : '#78716c'}
                    strokeWidth={isSelected ? 2 : 1}
                  />
                ) : (
                  /* Placeholder rectangle if no path data */
                  <rect
                    width='100'
                    height='80'
                    fill={isSelected ? '#f59e0b33' : '#f5f5f4'}
                    stroke={isSelected ? '#b45309' : '#78716c'}
                    strokeWidth={isSelected ? 2 : 1}
                    rx='4'
                  />
                )}

                {/* Component label */}
                <text
                  x={component.pathData ? '50%' : '50'}
                  y={component.pathData ? '50%' : '40'}
                  textAnchor='middle'
                  dominantBaseline='middle'
                  fill='#44403c'
                  fontSize='12'
                  fontWeight={isSelected ? 'bold' : 'normal'}
                >
                  {component.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default ComponentViewer;
