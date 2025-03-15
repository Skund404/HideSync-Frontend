// src/components/patterns/materials/MaterialRequirementsViewer.tsx
import React, { useEffect, useState } from 'react';
import { EnumTypes } from '../../../types';

interface MaterialRequirement {
  id: number;
  name: string;
  materialType: EnumTypes.MaterialType;
  quantity: number;
  unit: EnumTypes.MeasurementUnit;
  isRequired: boolean;
  notes?: string;
}

interface MaterialRequirementsViewerProps {
  patternId: number;
}

const MaterialRequirementsViewer: React.FC<MaterialRequirementsViewerProps> = ({
  patternId,
}) => {
  const [materials, setMaterials] = useState<MaterialRequirement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data for demonstration
  const mockMaterials: MaterialRequirement[] = [
    {
      id: 1,
      name: 'Vegetable Tanned Leather',
      materialType: EnumTypes.MaterialType.LEATHER,
      quantity: 2.5,
      unit: EnumTypes.MeasurementUnit.SQUARE_FOOT,
      isRequired: true,
      notes: 'Recommended thickness: 4-5oz',
    },
    {
      id: 2,
      name: 'Waxed Thread',
      materialType: EnumTypes.MaterialType.WAXED_THREAD,
      quantity: 10,
      unit: EnumTypes.MeasurementUnit.YARD,
      isRequired: true,
      notes: 'Color: Natural',
    },
    {
      id: 3,
      name: 'Edge Beveler',
      materialType: EnumTypes.MaterialType.WAXED_THREAD,
      quantity: 1,
      unit: EnumTypes.MeasurementUnit.PIECE,
      isRequired: false,
      notes: 'Size #2 recommended',
    },
  ];

  useEffect(() => {
    // Simulate API call to fetch material requirements
    const fetchMaterials = async () => {
      setLoading(true);
      try {
        // In a real implementation, this would be an API call
        // const response = await api.getMaterialRequirements(patternId);

        // Using mock data for now
        await new Promise((resolve) => setTimeout(resolve, 500));
        setMaterials(mockMaterials);
        setError(null);
      } catch (err) {
        console.error('Error fetching material requirements:', err);
        setError('Failed to load material requirements');
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, [patternId]);

  if (loading) {
    return (
      <div className='p-4 text-center'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto'></div>
        <p className='mt-2 text-stone-500'>Loading material requirements...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className='p-4 text-center bg-red-50 rounded-md'>
        <p className='text-red-600'>{error}</p>
        <button
          className='mt-2 px-4 py-2 bg-red-600 text-white rounded-md text-sm'
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  if (materials.length === 0) {
    return (
      <div className='p-8 text-center bg-stone-50 border border-dashed border-stone-300 rounded-md'>
        <p className='text-stone-500'>
          No material requirements defined for this pattern.
        </p>
        <button className='mt-4 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-sm'>
          Add Material Requirement
        </button>
      </div>
    );
  }

  // Calculate total by material type
  const materialSummary = materials.reduce((acc, material) => {
    const key = material.materialType.toString();
    if (!acc[key]) {
      acc[key] = {
        type: material.materialType,
        count: 0,
      };
    }
    acc[key].count++;
    return acc;
  }, {} as Record<string, { type: EnumTypes.MaterialType; count: number }>);

  return (
    <div className='space-y-6'>
      {/* Summary section */}
      <div className='bg-white p-4 rounded-lg border border-stone-200'>
        <h3 className='text-lg font-medium text-stone-800 mb-3'>
          Material Summary
        </h3>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          {Object.values(materialSummary).map((summary, index) => (
            <div key={index} className='bg-stone-50 p-3 rounded-md'>
              <div className='text-sm font-medium text-stone-700'>
                {summary.type.toString().replace('_', ' ')}
              </div>
              <div className='text-2xl font-semibold text-amber-600'>
                {summary.count}
              </div>
              <div className='text-xs text-stone-500'>items required</div>
            </div>
          ))}
        </div>
      </div>

      {/* Materials list */}
      <div className='bg-white rounded-lg border border-stone-200 overflow-hidden'>
        <table className='min-w-full divide-y divide-stone-200'>
          <thead className='bg-stone-50'>
            <tr>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
              >
                Material
              </th>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
              >
                Type
              </th>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
              >
                Quantity
              </th>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
              >
                Required
              </th>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'
              >
                Notes
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-stone-200'>
            {materials.map((material) => (
              <tr key={material.id} className='hover:bg-stone-50'>
                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-stone-900'>
                  {material.name}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-stone-500'>
                  {material.materialType.toString().replace('_', ' ')}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-stone-500'>
                  {material.quantity}{' '}
                  {material.unit.toString().replace('_', ' ')}
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  {material.isRequired ? (
                    <span className='px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800'>
                      Required
                    </span>
                  ) : (
                    <span className='px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-stone-100 text-stone-800'>
                      Optional
                    </span>
                  )}
                </td>
                <td className='px-6 py-4 text-sm text-stone-500'>
                  {material.notes || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Action buttons */}
      <div className='flex justify-between'>
        <button className='px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-sm flex items-center'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-5 w-5 mr-2'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M12 6v6m0 0v6m0-6h6m-6 0H6'
            />
          </svg>
          Add Material
        </button>
        <button className='px-4 py-2 border border-stone-300 hover:bg-stone-50 text-stone-700 rounded-md text-sm flex items-center'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-5 w-5 mr-2'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4'
            />
          </svg>
          Export Material List
        </button>
      </div>
    </div>
  );
};

export default MaterialRequirementsViewer;
