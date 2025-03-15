import { useStorage } from '@context/StorageContext';
import { SectionType, StorageLocation, StorageLocationType } from '@types';
import {
  AlertTriangle,
  Filter,
  Package,
  PlusCircle,
  Search,
} from 'lucide-react';
import React, { useState } from 'react';
import StorageListView from './Storage.ListView';
import StorageGrid from './StorageGrid';
import StorageLocationDetail from './StorageLocationDetail';
import StorageLocationForm from './StorageLocationForm';
import StorageUtilizationView from './StorageUtilizationView';

interface StorageManagementViewProps {
  viewMode: 'visual' | 'list' | 'analytics';
}

const StorageManagementView: React.FC<StorageManagementViewProps> = ({
  viewMode,
}) => {
  // Access storage context
  const {
    storageLocations,
    selectedLocation,
    selectStorageLocation,
    getItemsForStorage,
    getStorageUtilization,
    storageStats,
    loading,
    error,
  } = useStorage();

  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isAddingLocation, setIsAddingLocation] = useState(false);
  const [isEditingLocation, setIsEditingLocation] = useState(false);

  const filteredLocations = storageLocations.filter((location) => {
    const matchesSearch =
      searchQuery === '' ||
      location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filterLocation === 'all' || location.section === filterLocation;

    return matchesSearch && matchesFilter;
  });
  // Calculate storage statistics per location
  const calculateLocationStats = (location: StorageLocation) => {
    const items = getItemsForStorage(location.id);
    const inStock = items.filter((item) => item.status === 'IN_STOCK').length;
    const attention = items.filter(
      (item) => item.status === 'LOW_STOCK' || item.status === 'OUT_OF_STOCK'
    ).length;
    const utilizationPercentage = getStorageUtilization(location.id);

    return {
      itemCount: items.length,
      inStock,
      attention,
      utilizationPercentage,
    };
  };

  // Handler for adding a new storage location
  const handleAddLocation = () => {
    setIsAddingLocation(true);
  };

  // Handler for editing a storage location
  const handleEditLocation = () => {
    if (selectedLocation) {
      setIsEditingLocation(true);
    }
  };

  // Handler for closing forms
  const handleCloseForm = () => {
    setIsAddingLocation(false);
    setIsEditingLocation(false);
  };

  // If loading
  if (loading) {
    return (
      <div className='flex-1 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600 mx-auto'></div>
          <p className='mt-4 text-stone-600'>Loading storage data...</p>
        </div>
      </div>
    );
  }

  // If error
  if (error) {
    return (
      <div className='flex-1 flex items-center justify-center'>
        <div className='text-center'>
          <AlertTriangle className='h-12 w-12 text-red-500 mx-auto' />
          <p className='mt-4 text-red-600'>{error}</p>
          <button
            className='mt-4 px-4 py-2 bg-amber-600 text-white rounded-md'
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Render based on view mode
  const renderContent = () => {
    switch (viewMode) {
      case 'visual':
        return (
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div className='md:col-span-2'>
              {selectedLocation ? (
                <div className='bg-white rounded-lg shadow-sm border border-stone-200 overflow-hidden'>
                  <div className='px-4 py-3 border-b border-stone-200 flex justify-between items-center'>
                    <div>
                      <h3 className='font-medium text-stone-800'>
                        {selectedLocation.name}
                      </h3>
                      <p className='text-xs text-stone-500'>
                        {selectedLocation.description} •{' '}
                        {selectedLocation.section}
                      </p>
                    </div>
                    <div className='flex space-x-2'>
                      <button
                        className='text-sm text-amber-600 hover:text-amber-800'
                        onClick={handleEditLocation}
                      >
                        Edit
                      </button>
                      <button
                        className='text-sm text-amber-600 hover:text-amber-800'
                        onClick={() => selectStorageLocation(null)}
                      >
                        View All
                      </button>
                    </div>
                  </div>
                  <div className='p-4'>
                    <StorageGrid
                      storageLocation={selectedLocation}
                      items={getItemsForStorage(selectedLocation.id)}
                      onSelectItem={setSelectedItem}
                    />
                  </div>
                </div>
              ) : (
                <div className='bg-white rounded-lg shadow-sm border border-stone-200 overflow-hidden'>
                  <div className='px-4 py-3 border-b border-stone-200 flex justify-between items-center'>
                    <h3 className='font-medium text-stone-800'>
                      Storage Locations
                    </h3>
                    <button
                      className='text-sm text-amber-600 hover:text-amber-800 flex items-center'
                      onClick={handleAddLocation}
                    >
                      <PlusCircle className='h-4 w-4 mr-1' />
                      Add Location
                    </button>
                  </div>
                  <div className='p-4 grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    {filteredLocations.length > 0 ? (
                      filteredLocations.map((location) => {
                        const stats = calculateLocationStats(location);

                        return (
                          <div
                            key={location.id}
                            className='border border-stone-200 rounded-md p-4 hover:border-amber-500 hover:shadow-sm cursor-pointer transition-all'
                            onClick={() => selectStorageLocation(location.id)}
                          >
                            <div className='flex justify-between items-start'>
                              <div>
                                <h4 className='font-medium text-stone-800'>
                                  {location.name}
                                </h4>
                                <p className='text-xs text-stone-500'>
                                  {location.section}
                                </p>
                              </div>
                              <div
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  location.type === StorageLocationType.CABINET
                                    ? 'bg-blue-100 text-blue-800'
                                    : location.type ===
                                      StorageLocationType.SHELF
                                    ? 'bg-amber-100 text-amber-800'
                                    : location.type ===
                                      StorageLocationType.DRAWER
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-purple-100 text-purple-800'
                                }`}
                              >
                                {location.type}
                              </div>
                            </div>
                            <div className='mt-2 w-full h-1.5 bg-stone-100 rounded-full'>
                              <div
                                className={`h-full rounded-full ${
                                  stats.utilizationPercentage > 90
                                    ? 'bg-red-500'
                                    : stats.utilizationPercentage > 70
                                    ? 'bg-amber-500'
                                    : 'bg-green-500'
                                }`}
                                style={{
                                  width: `${stats.utilizationPercentage}%`,
                                }}
                              ></div>
                            </div>
                            <div className='mt-4 flex items-center justify-between'>
                              <div className='text-sm'>
                                <span className='text-stone-600'>
                                  {stats.itemCount} items
                                </span>
                                <span className='mx-2'>•</span>
                                <span className='text-green-600'>
                                  {stats.inStock} in stock
                                </span>
                              </div>
                              {stats.attention > 0 && (
                                <div className='bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium'>
                                  {stats.attention} need attention
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className='col-span-2 text-center py-8 text-stone-500'>
                        <Package className='h-12 w-12 mx-auto mb-2 text-stone-400' />
                        <p>No storage locations found matching your criteria</p>
                        <button
                          className='mt-2 text-amber-600 hover:text-amber-800'
                          onClick={() => {
                            setSearchQuery('');
                            setFilterLocation('all');
                          }}
                        >
                          Clear filters
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Color Legend */}
              <div className='bg-white rounded-lg shadow-sm border border-stone-200 overflow-hidden mt-6'>
                <div className='px-4 py-3 border-b border-stone-200'>
                  <h3 className='font-medium text-stone-800'>Color Legend</h3>
                </div>
                <div className='p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3'>
                  <div className='flex items-center'>
                    <div className='w-4 h-4 bg-amber-50 border border-amber-200 rounded mr-2'></div>
                    <span className='text-xs text-stone-700'>Leather</span>
                  </div>
                  <div className='flex items-center'>
                    <div className='w-4 h-4 bg-blue-50 border border-blue-200 rounded mr-2'></div>
                    <span className='text-xs text-stone-700'>Hardware</span>
                  </div>
                  <div className='flex items-center'>
                    <div className='w-4 h-4 bg-green-50 border border-green-200 rounded mr-2'></div>
                    <span className='text-xs text-stone-700'>Supplies</span>
                  </div>
                  <div className='flex items-center'>
                    <div className='w-4 h-4 bg-amber-100 border border-amber-300 rounded mr-2'></div>
                    <span className='text-xs text-stone-700'>Low Stock</span>
                  </div>
                  <div className='flex items-center'>
                    <div className='w-4 h-4 bg-red-100 border border-red-300 rounded mr-2'></div>
                    <span className='text-xs text-stone-700'>Out of Stock</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Item Details Panel */}
            <div>
              {selectedItem ? (
                <StorageLocationDetail
                  item={selectedItem}
                  onClose={() => setSelectedItem(null)}
                />
              ) : (
                <>
                  {/* Summary Stats */}
                  <div className='bg-white rounded-lg shadow-sm border border-stone-200 overflow-hidden'>
                    <div className='px-4 py-3 border-b border-stone-200'>
                      <h3 className='font-medium text-stone-800'>
                        Storage Summary
                      </h3>
                    </div>
                    <div className='p-4'>
                      <div className='grid grid-cols-2 gap-4'>
                        <div className='border border-stone-200 rounded-md p-3'>
                          <div className='text-xs text-stone-500'>
                            Total Locations
                          </div>
                          <div className='text-xl font-semibold text-stone-800 mt-1'>
                            {storageStats.totalLocations}
                          </div>
                        </div>
                        <div className='border border-stone-200 rounded-md p-3'>
                          <div className='text-xs text-stone-500'>
                            Storage Utilization
                          </div>
                          <div className='text-xl font-semibold text-stone-800 mt-1'>
                            {storageStats.utilizationPercentage}%
                          </div>
                        </div>
                        <div className='border border-stone-200 rounded-md p-3'>
                          <div className='text-xs text-stone-500'>
                            Items Stored
                          </div>
                          <div className='text-xl font-semibold text-stone-800 mt-1'>
                            {storageStats.totalUtilized}
                          </div>
                        </div>
                        <div className='border border-stone-200 rounded-md p-3'>
                          <div className='text-xs text-stone-500'>
                            Available Space
                          </div>
                          <div className='text-xl font-semibold text-stone-800 mt-1'>
                            {storageStats.totalCapacity -
                              storageStats.totalUtilized}
                          </div>
                        </div>
                      </div>
                      <div className='mt-4'>
                        <div className='text-xs text-stone-500 mb-1'>
                          Overall Utilization
                        </div>
                        <div className='w-full h-2 bg-stone-100 rounded-full'>
                          <div
                            className={`h-full rounded-full ${
                              storageStats.utilizationPercentage > 90
                                ? 'bg-red-500'
                                : storageStats.utilizationPercentage > 70
                                ? 'bg-amber-500'
                                : 'bg-green-500'
                            }`}
                            style={{
                              width: `${storageStats.utilizationPercentage}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Filters */}
                  <div className='bg-white rounded-lg shadow-sm border border-stone-200 overflow-hidden mt-6'>
                    <div className='px-4 py-3 border-b border-stone-200'>
                      <h3 className='font-medium text-stone-800'>
                        Quick Filters
                      </h3>
                    </div>
                    <div className='p-4'>
                      <div className='space-y-2'>
                        <button
                          className='w-full text-left px-3 py-2 rounded-md text-sm hover:bg-amber-50 border border-amber-100'
                          onClick={() => setFilterCategory('leather')}
                        >
                          Show All Leather
                        </button>
                        <button
                          className='w-full text-left px-3 py-2 rounded-md text-sm hover:bg-blue-50 border border-blue-100'
                          onClick={() => setFilterCategory('hardware')}
                        >
                          Show All Hardware
                        </button>
                        <button
                          className='w-full text-left px-3 py-2 rounded-md text-sm hover:bg-green-50 border border-green-100'
                          onClick={() => setFilterCategory('supplies')}
                        >
                          Show All Supplies
                        </button>
                        <button
                          className='w-full text-left px-3 py-2 rounded-md text-sm hover:bg-red-50 border border-red-100'
                          onClick={() => setFilterStatus('OUT_OF_STOCK')}
                        >
                          Show Out of Stock Items
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Needs Attention Widget */}
                  <div className='bg-white rounded-lg shadow-sm border border-stone-200 overflow-hidden mt-6'>
                    <div className='px-4 py-3 border-b border-stone-200'>
                      <h3 className='font-medium text-stone-800'>
                        Needs Attention
                      </h3>
                    </div>
                    <div className='p-4'>
                      <div className='space-y-3'>
                        {/* This would need to be replaced with actual data */}
                        <div className='text-center text-stone-500 py-3'>
                          <span className='block mb-2'>📦</span>
                          No items need attention right now
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        );

      case 'list':
        return <StorageListView />;

      case 'analytics':
        return <StorageUtilizationView />;

      default:
        return null;
    }
  };

  return (
    <div className='flex-1 flex flex-col overflow-hidden bg-stone-50'>
      {/* Top Controls */}
      <div className='bg-white shadow-sm z-10 p-4 flex items-center justify-between'>
        <div className='flex items-center space-x-4'>
          {viewMode === 'visual' && selectedLocation && (
            <button
              className='text-sm text-amber-600 hover:text-amber-800'
              onClick={() => selectStorageLocation(null)}
            >
              ← Back to all locations
            </button>
          )}
        </div>

        <div className='flex items-center space-x-4'>
          <div className='relative'>
            <input
              type='text'
              placeholder='Search items...'
              className='w-64 bg-stone-100 border border-stone-300 rounded-md py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className='h-5 w-5 absolute right-3 top-2.5 text-stone-400' />
          </div>

          <button
            className='bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center'
            onClick={handleAddLocation}
          >
            <PlusCircle className='h-5 w-5 mr-2' />
            Add Storage
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className='bg-white p-4 border-b border-stone-200 flex flex-wrap items-center justify-between'>
        <div className='flex items-center space-x-4'>
          <div className='flex items-center'>
            <Filter className='h-5 w-5 text-stone-500 mr-2' />
            <span className='text-sm font-medium text-stone-700'>
              Filter by:
            </span>
          </div>

          <select
            className='rounded-md border border-stone-300 py-1 px-3 text-sm bg-white'
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value='all'>All Categories</option>
            <option value='leather'>Leather</option>
            <option value='hardware'>Hardware</option>
            <option value='supplies'>Supplies</option>
          </select>

          <select
            className='rounded-md border border-stone-300 py-1 px-3 text-sm bg-white'
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
          >
            <option value='all'>All Locations</option>
            <option value={SectionType.MAIN_WORKSHOP}>Main Workshop</option>
            <option value={SectionType.TOOL_ROOM}>Tool Room</option>
            <option value={SectionType.SUPPLY_CLOSET}>Supply Closet</option>
            <option value={SectionType.STORAGE_ROOM}>Storage Room</option>
          </select>

          <select
            className='rounded-md border border-stone-300 py-1 px-3 text-sm bg-white'
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value='all'>All Statuses</option>
            <option value='IN_STOCK'>In Stock</option>
            <option value='LOW_STOCK'>Low Stock</option>
            <option value='OUT_OF_STOCK'>Out of Stock</option>
          </select>
        </div>

        {searchQuery && (
          <div className='mt-2 md:mt-0 text-sm text-stone-600'>
            Showing results for "{searchQuery}"
            <button
              className='ml-2 text-amber-600 hover:text-amber-800'
              onClick={() => setSearchQuery('')}
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className='flex-1 overflow-y-auto p-6'>{renderContent()}</div>

      {/* Add/Edit Storage Location Forms */}
      {isAddingLocation && <StorageLocationForm onClose={handleCloseForm} />}

      {isEditingLocation && selectedLocation && (
        <StorageLocationForm
          onClose={handleCloseForm}
          existingLocation={selectedLocation}
        />
      )}
    </div>
  );
};

export default StorageManagementView;
