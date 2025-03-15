import { useMaterials } from '@/context/MaterialsContext';
import { MaterialType } from '@/types/materialTypes';
import React from 'react';

interface MaterialsHeaderProps {
  onAdd?: () => void;
}

const MaterialsHeader: React.FC<MaterialsHeaderProps> = ({ onAdd }) => {
  const { activeTab, setActiveTab, searchQuery, setSearchQuery } =
    useMaterials();

  // Get title based on active tab
  const getTabTitle = (): string => {
    switch (activeTab) {
      case MaterialType.LEATHER:
        return 'Leather Management';
      case MaterialType.HARDWARE:
        return 'Hardware Management';
      case MaterialType.SUPPLIES:
        return 'Supplies Management';
      default:
        return 'Materials Management';
    }
  };

  // Handle tab change
  const handleTabChange = (tab: MaterialType) => {
    setActiveTab(tab);
  };

  // Get material name for display
  const getMaterialDisplayName = (): string => {
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

  // Get capitalized tab name for breadcrumb
  const getCapitalizedTabName = (): string => {
    const name = getMaterialDisplayName();
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  // Get material name for "Add" button (singular form)
  const getAddButtonText = (): string => {
    const materialName = getMaterialDisplayName();
    if (materialName === 'materials') {
      return 'Material';
    }
    // Remove the 's' at the end to get singular form
    return materialName.slice(0, -1);
  };

  return (
    <>
      {/* Top Header */}
      <header className='bg-white shadow-sm z-10 p-4 flex items-center justify-between'>
        <div className='flex items-center space-x-3'>
          {/* Page Title and Breadcrumbs */}
          <h1 className='text-xl font-semibold text-stone-900'>
            {getTabTitle()}
          </h1>
          <div className='text-sm hidden md:flex items-center'>
            <span className='text-stone-400 mx-2'>/</span>
            <button
              className='text-stone-500 hover:text-amber-600'
              onClick={() => handleTabChange(MaterialType.LEATHER)}
            >
              Materials
            </button>
            <span className='text-stone-400 mx-2'>/</span>
            <span className='text-amber-600'>{getCapitalizedTabName()}</span>
          </div>
        </div>

        <div className='flex items-center space-x-4'>
          {/* Search */}
          <div className='relative hidden md:block'>
            <input
              type='text'
              placeholder={`Search ${getMaterialDisplayName()}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-64 bg-stone-100 border border-stone-300 rounded-md py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent'
            />
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-5 w-5 absolute right-3 top-2.5 text-stone-400'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
              />
            </svg>
          </div>

          {/* Quick Actions */}
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
            Add {getAddButtonText()}
          </button>

          {/* Notifications */}
          <button className='text-stone-500 hover:text-stone-700 p-1 rounded-full'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-6 w-6'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9'
              />
            </svg>
          </button>
        </div>
      </header>

      {/* Material Type Tabs */}
      <div className='bg-white border-b border-stone-200 px-4'>
        <div className='flex space-x-6'>
          <button
            onClick={() => handleTabChange(MaterialType.LEATHER)}
            className={`py-4 px-1 text-sm font-medium border-b-2 ${
              activeTab === MaterialType.LEATHER
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
            }`}
          >
            Leather
          </button>
          <button
            onClick={() => handleTabChange(MaterialType.HARDWARE)}
            className={`py-4 px-1 text-sm font-medium border-b-2 ${
              activeTab === MaterialType.HARDWARE
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
            }`}
          >
            Hardware
          </button>
          <button
            onClick={() => handleTabChange(MaterialType.SUPPLIES)}
            className={`py-4 px-1 text-sm font-medium border-b-2 ${
              activeTab === MaterialType.SUPPLIES
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
            }`}
          >
            Supplies
          </button>
        </div>
      </div>
    </>
  );
};

export default MaterialsHeader;
