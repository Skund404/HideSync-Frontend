import { useMaterials } from '@/context/MaterialsContext';
import { MaterialType } from '@/types/materialTypes';
import React from 'react';

interface EmptyStateProps {
  onAdd: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onAdd }) => {
  const { activeTab } = useMaterials();

  // Get appropriate icon based on material type
  const getIcon = () => {
    switch (activeTab) {
      case MaterialType.LEATHER:
        return (
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-10 w-10 text-amber-600'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'
            />
          </svg>
        );
      case MaterialType.HARDWARE:
        return (
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-10 w-10 text-blue-600'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z'
            />
          </svg>
        );
      case MaterialType.SUPPLIES:
        return (
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-10 w-10 text-green-600'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
            />
          </svg>
        );
      default:
        return (
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-10 w-10 text-stone-600'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'
            />
          </svg>
        );
    }
  };

  // Get background color for icon container
  const getIconBgColor = () => {
    switch (activeTab) {
      case MaterialType.LEATHER:
        return 'bg-amber-100';
      case MaterialType.HARDWARE:
        return 'bg-blue-100';
      case MaterialType.SUPPLIES:
        return 'bg-green-100';
      default:
        return 'bg-stone-100';
    }
  };

  // Get title based on material type
  const getTitle = () => {
    switch (activeTab) {
      case MaterialType.LEATHER:
        return 'No Leather Found';
      case MaterialType.HARDWARE:
        return 'No Hardware Found';
      case MaterialType.SUPPLIES:
        return 'No Supplies Found';
      default:
        return 'No Materials Found';
    }
  };

  // Get display name for the material type
  const getMaterialDisplayName = () => {
    switch (activeTab) {
      case MaterialType.LEATHER:
        return 'leather';
      case MaterialType.HARDWARE:
        return 'hardware';
      case MaterialType.SUPPLIES:
        return 'supplies';
      default:
        return 'materials';
    }
  };

  // Material name for adding new
  const getNewMaterialText = () => {
    const materialName = getMaterialDisplayName();
    return materialName === 'materials'
      ? 'Material'
      : // Remove the 's' at the end for singular form
        materialName.slice(0, -1);
  };

  return (
    <div className='bg-white shadow-sm rounded-lg p-6 border border-stone-200 text-center'>
      <div className='flex flex-col items-center justify-center py-12'>
        <div className={`${getIconBgColor()} p-4 rounded-full mb-4`}>
          {getIcon()}
        </div>
        <h3 className='text-lg font-medium text-stone-700 mb-2'>
          {getTitle()}
        </h3>
        <p className='text-stone-500 max-w-md mb-6'>
          Try adjusting your filters or add new {getMaterialDisplayName()} to
          your inventory.
        </p>
        <button
          onClick={onAdd}
          className='bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center'
        >
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
          Add New {getNewMaterialText()}
        </button>
      </div>
    </div>
  );
};

export default EmptyState;
