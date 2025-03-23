// src/components/sales/PickingListGenerator.tsx
import React, { useEffect, useState } from 'react';
import { usePickingLists } from '../../context/PickingListContext';
import { useProjects } from '../../context/ProjectContext';
import { useSales } from '../../context/SalesContext';
import {
  PickingListStatus,
  ProjectStatus,
  ProjectType,
} from '../../types/enums';
import LoadingSpinner from '../common/LoadingSpinner';

interface PickingListGeneratorProps {
  saleId: number;
  onComplete?: (pickingListId: string) => void;
  onCancel?: () => void;
}

interface MaterialItem {
  materialId: string | number;
  materialName: string;
  quantity: number;
  selected: boolean;
}

const PickingListGenerator: React.FC<PickingListGeneratorProps> = ({
  saleId,
  onComplete,
  onCancel,
}) => {
  const { getSale } = useSales();
  const { createPickingList } = usePickingLists();
  const { createProject } = useProjects();

  const [loading, setLoading] = useState<boolean>(false);
  const [generating, setGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [pickingListId, setPickingListId] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);

  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [selectAll, setSelectAll] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>('');

  const sale = getSale(saleId);

  // Load materials based on the sale items
  useEffect(() => {
    if (!sale) {
      return;
    }

    // In a real implementation, this would fetch the materials needed for the order
    // For this demo, we'll use a simplified approach with mock data
    setLoading(true);

    setTimeout(() => {
      const mockMaterials: MaterialItem[] = [
        {
          materialId: 1,
          materialName: 'Vegetable Tanned Leather',
          quantity: 2,
          selected: true,
        },
        {
          materialId: 2,
          materialName: 'Waxed Thread',
          quantity: 1,
          selected: true,
        },
        {
          materialId: 3,
          materialName: 'Edge Paint',
          quantity: 0.5,
          selected: true,
        },
        {
          materialId: 4,
          materialName: 'Brass Hardware',
          quantity: 4,
          selected: true,
        },
      ];

      setMaterials(mockMaterials);
      setLoading(false);
    }, 500);
  }, [sale]);

  // Toggle selection of all materials
  const handleToggleSelectAll = () => {
    setSelectAll(!selectAll);
    setMaterials(
      materials.map((material) => ({ ...material, selected: !selectAll }))
    );
  };

  // Toggle selection of a single material
  const handleToggleMaterial = (index: number) => {
    const updatedMaterials = [...materials];
    updatedMaterials[index].selected = !updatedMaterials[index].selected;
    setMaterials(updatedMaterials);

    // Update selectAll state
    const allSelected = updatedMaterials.every((material) => material.selected);
    setSelectAll(allSelected);
  };

  // Generate picking list
  const handleGeneratePickingList = async () => {
    if (!sale) {
      setError('Sale not found');
      return;
    }

    try {
      setGenerating(true);
      setError(null);

      // Step 1: Create a project for this order if it doesn't exist
      const startDate = new Date();
      // Set due date to 2 weeks after start date
      const dueDate = new Date(startDate);
      dueDate.setDate(dueDate.getDate() + 14);

      const projectData = {
        name: `Order #${sale.id}`,
        description: `Project for order #${sale.id}`,
        status: ProjectStatus.PLANNING as any, // Use type assertion to handle enum mismatch
        startDate: startDate,
        dueDate: dueDate,
        type: ProjectType.CUSTOM as any, // Use type assertion to handle enum mismatch
      };

      const project = await createProject(projectData);
      setProjectId(project.id);

      // Step 2: Create picking list
      const selectedMaterialItems = materials
        .filter((material) => material.selected)
        .map((material) => ({
          materialId: material.materialId.toString(),
          quantity_ordered: Math.ceil(material.quantity),
          quantity_picked: 0,
          status: 'pending',
          notes: '',
        }));

      // Create picking list with only properties expected by API, use type assertion for enum
      const pickingListData = {
        projectId: project.id,
        status: PickingListStatus.PENDING as any, // Use type assertion to handle enum mismatch
        notes: notes || `Picking list for order #${sale.id}`,
        items: selectedMaterialItems, // Add items property to fix the type error
      };

      const pickingList = await createPickingList(pickingListData);
      setPickingListId(pickingList.id);
      setSuccess(true);

      // Call onComplete if provided
      if (onComplete) {
        onComplete(pickingList.id);
      }
    } catch (err) {
      setError('Failed to generate picking list');
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className='p-4 flex justify-center'>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className='bg-red-50 p-4 rounded-md text-red-800'>
        <p>{error}</p>
        <button
          className='mt-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    );
  }

  if (success && pickingListId) {
    return (
      <div className='bg-green-50 p-4 rounded-md'>
        <div className='flex'>
          <div className='flex-shrink-0'>
            <svg
              className='h-5 w-5 text-green-400'
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 20 20'
              fill='currentColor'
            >
              <path
                fillRule='evenodd'
                d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                clipRule='evenodd'
              />
            </svg>
          </div>
          <div className='ml-3'>
            <h3 className='text-sm font-medium text-green-800'>
              Picking list created successfully!
            </h3>
            <div className='mt-2 text-sm text-green-700'>
              <p>
                Picking list #{pickingListId} has been created for project #
                {projectId}.
              </p>
            </div>
            <div className='mt-4 flex space-x-4'>
              <button
                type='button'
                className='inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                onClick={onCancel}
              >
                Close
              </button>
              <a
                href={`/projects/picking-lists/${pickingListId}`}
                className='inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              >
                View Picking List
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!sale) {
    return (
      <div className='bg-red-50 p-4 rounded-md text-red-800'>
        <p>Order not found</p>
        <button
          className='mt-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
      <div className='pb-5 border-b border-gray-200 mb-6'>
        <h3 className='text-lg leading-6 font-medium text-gray-900'>
          Generate Picking List for Order #{sale.id}
        </h3>
        <p className='mt-2 max-w-4xl text-sm text-gray-500'>
          Select the materials to include in the picking list for this order.
          This will create a new picking list and a project for production.
        </p>
      </div>

      {/* Material selection */}
      <div className='mb-6'>
        <div className='flex justify-between items-center mb-3'>
          <h4 className='text-base font-medium text-gray-900'>
            Materials to Pick
          </h4>
          <div className='flex items-center'>
            <input
              id='select-all'
              name='select-all'
              type='checkbox'
              className='h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded'
              checked={selectAll}
              onChange={handleToggleSelectAll}
            />
            <label htmlFor='select-all' className='ml-2 text-sm text-gray-700'>
              Select All
            </label>
          </div>
        </div>

        <div className='shadow overflow-hidden border-b border-gray-200 sm:rounded-lg'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                >
                  <span className='sr-only'>Select</span>
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                >
                  Material
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                >
                  Quantity
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {materials.map((material, index) => (
                <tr key={index}>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <input
                      type='checkbox'
                      className='h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded'
                      checked={material.selected}
                      onChange={() => handleToggleMaterial(index)}
                    />
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                    {material.materialName}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {material.quantity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notes */}
      <div className='mb-6'>
        <label
          htmlFor='notes'
          className='block text-sm font-medium text-gray-700'
        >
          Notes
        </label>
        <div className='mt-1'>
          <textarea
            id='notes'
            name='notes'
            rows={3}
            className='shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md'
            placeholder='Add any special instructions for this picking list...'
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>

      {/* Buttons */}
      <div className='flex justify-end space-x-3'>
        <button
          type='button'
          className='inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type='button'
          className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500'
          onClick={handleGeneratePickingList}
          disabled={
            generating || materials.filter((m) => m.selected).length === 0
          }
        >
          {generating ? (
            <>
              <svg
                className='animate-spin -ml-1 mr-2 h-4 w-4 text-white'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
              >
                <circle
                  className='opacity-25'
                  cx='12'
                  cy='12'
                  r='10'
                  stroke='currentColor'
                  strokeWidth='4'
                ></circle>
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                ></path>
              </svg>
              Generating...
            </>
          ) : (
            'Generate Picking List'
          )}
        </button>
      </div>
    </div>
  );
};

export default PickingListGenerator;
