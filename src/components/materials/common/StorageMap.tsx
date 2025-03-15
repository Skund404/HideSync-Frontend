import { useMaterials } from '@context/MaterialsContext';
import { useStorage } from '@context/StorageContext';
import { EnumTypes, MaterialTypes, StorageLocation } from '@types';
import { formatType } from '@utils/materialHelpers';
import React from 'react';

interface StorageMapLocation {
  id: string;
  type: string;
  materials: MaterialTypes.Material[];
  fullLocation: string;
  storageLocation?: StorageLocation; // Optional link to actual storage location
}

interface StorageMapProps {
  materials: MaterialTypes.Material[];
  onLocationClick?: (location: StorageMapLocation) => void;
  highlightedLocations?: string[]; // Array of location IDs to highlight
  readOnly?: boolean;
}

const StorageMap: React.FC<StorageMapProps> = ({
  materials,
  onLocationClick,
  highlightedLocations = [],
  readOnly = false,
}) => {
  const { activeTab } = useMaterials();
  const { storageLocations } = useStorage();

  // Helper function to get color hex for display
  const getColorHex = (colorName: string): string => {
    // Define a common color map
    const colorMap: Record<string, string> = {
      natural: '#D2B48C',
      tan: '#D2B48C',
      brown: '#8B4513',
      dark_brown: '#5C4033',
      black: '#222222',
      navy: '#000080',
      burgundy: '#800020',
      red: '#B22222',
      green: '#006400',
      blue: '#0000CD',
      yellow: '#FFD700',
      orange: '#FF8C00',
      purple: '#800080',
      white: '#F5F5F5',
      grey: '#808080',
      gray: '#808080',
      silver: '#C0C0C0',
      olive: '#808000',
    };

    return colorMap[colorName.toLowerCase()] || '#D2B48C'; // Default to tan if color not found
  };

  // Get general material color for hardware type
  const getHardwareMaterialColor = (material: string): string => {
    const materialColorMap: Record<string, string> = {
      brass: '#B5A642',
      nickel: '#C0C0C0',
      stainless_steel: '#E0E0E0',
      steel: '#71797E',
      zinc: '#D3D4D5',
      copper: '#B87333',
      aluminum: '#A9A9A9',
      plastic: '#1E90FF',
      silver: '#C0C0C0',
      gold: '#FFD700',
    };

    return materialColorMap[material.toLowerCase()] || '#C0C0C0'; // Default to silver
  };

  // Group materials by storage location
  const getLocationGroups = () => {
    const locationGroups: Record<string, MaterialTypes.Material[]> = {};

    materials.forEach((material) => {
      if (!material.storageLocation) return;

      if (!locationGroups[material.storageLocation]) {
        locationGroups[material.storageLocation] = [];
      }
      locationGroups[material.storageLocation].push(material);
    });

    // Convert to array of location objects
    return Object.keys(locationGroups).map((location) => {
      const parts = location.split(' ');
      const type = parts[0];
      const id = parts.slice(1).join(' '); // Handle IDs with spaces

      // Try to find the corresponding storage location from the storage context
      const matchingStorageLocation = storageLocations.find(
        (sl) => `${sl.type} ${sl.id}` === location || sl.name === location
      );

      return {
        id,
        type,
        materials: locationGroups[location],
        fullLocation: location,
        storageLocation: matchingStorageLocation,
      };
    });
  };

  const locations = getLocationGroups();

  // Get background color class based on material type
  const getLocationColorClass = (location: StorageMapLocation) => {
    // If location is highlighted, return a stronger highlight color
    if (
      highlightedLocations.includes(location.fullLocation) ||
      highlightedLocations.includes(location.id)
    ) {
      return 'border-amber-500 bg-amber-100';
    }

    const materialType = location.materials[0]?.materialType;

    if (!materialType || location.materials.length === 0) {
      return 'border-stone-200 bg-stone-50';
    }

    switch (materialType) {
      case EnumTypes.MaterialType.LEATHER:
        return 'border-amber-300 bg-amber-50';
      case EnumTypes.MaterialType.HARDWARE:
        return 'border-blue-300 bg-blue-50';
      case EnumTypes.MaterialType.THREAD:
      case EnumTypes.MaterialType.WAXED_THREAD:
      case EnumTypes.MaterialType.DYE:
      case EnumTypes.MaterialType.EDGE_PAINT:
      case EnumTypes.MaterialType.BURNISHING_GUM:
      case EnumTypes.MaterialType.ADHESIVE:
      case EnumTypes.MaterialType.FINISH:
        return 'border-green-300 bg-green-50';
      default:
        return 'border-stone-200 bg-stone-50';
    }
  };

  // Get text color for location item count
  const getTextColorClass = (location: StorageMapLocation) => {
    // If location is highlighted, return a stronger text color
    if (
      highlightedLocations.includes(location.fullLocation) ||
      highlightedLocations.includes(location.id)
    ) {
      return 'text-amber-900';
    }

    const materialType = location.materials[0]?.materialType;

    if (!materialType || location.materials.length === 0) {
      return 'text-stone-400';
    }

    switch (materialType) {
      case EnumTypes.MaterialType.LEATHER:
        return 'text-amber-800';
      case EnumTypes.MaterialType.HARDWARE:
        return 'text-blue-800';
      case EnumTypes.MaterialType.THREAD:
      case EnumTypes.MaterialType.WAXED_THREAD:
      case EnumTypes.MaterialType.DYE:
      case EnumTypes.MaterialType.EDGE_PAINT:
      case EnumTypes.MaterialType.BURNISHING_GUM:
      case EnumTypes.MaterialType.ADHESIVE:
      case EnumTypes.MaterialType.FINISH:
        return 'text-green-800';
      default:
        return 'text-stone-800';
    }
  };

  // Group locations by type
  const getLocationsByType = () => {
    const locationTypes: Record<string, StorageMapLocation[]> = {};

    locations.forEach((location) => {
      if (!locationTypes[location.type]) {
        locationTypes[location.type] = [];
      }
      locationTypes[location.type].push(location);
    });

    return locationTypes;
  };

  const locationsByType = getLocationsByType();

  const renderStorageSection = (
    type: string,
    locations: StorageMapLocation[]
  ) => {
    return (
      <div key={type} className='mb-6'>
        <h4 className='text-sm font-medium text-stone-700 mb-3'>
          {type} Storage
        </h4>
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2'>
          {locations.map((location) => (
            <div
              key={location.id}
              className={`p-3 rounded-md border ${getLocationColorClass(
                location
              )} hover:shadow-sm transition-shadow ${
                !readOnly ? 'cursor-pointer' : ''
              }`}
              onClick={() =>
                !readOnly && onLocationClick && onLocationClick(location)
              }
            >
              <div className='text-xs font-medium text-stone-700 flex justify-between'>
                <span>
                  {location.type} {location.id}
                </span>
                {location.storageLocation && (
                  <span className='text-stone-500'>
                    {Math.round(
                      (location.storageLocation.utilized /
                        location.storageLocation.capacity) *
                        100
                    )}
                    %
                  </span>
                )}
              </div>
              <div
                className={`text-sm font-medium mt-1 ${getTextColorClass(
                  location
                )}`}
              >
                {location.materials.length} items
              </div>
              {location.materials.length > 0 && (
                <div className='mt-1 flex flex-wrap gap-1'>
                  {location.materials.slice(0, 3).map((mat, idx) => {
                    // For leather and supplies with color
                    if (
                      (mat.materialType === EnumTypes.MaterialType.LEATHER ||
                        mat.materialType === EnumTypes.MaterialType.THREAD ||
                        mat.materialType ===
                          EnumTypes.MaterialType.WAXED_THREAD ||
                        mat.materialType === EnumTypes.MaterialType.DYE ||
                        mat.materialType ===
                          EnumTypes.MaterialType.EDGE_PAINT) &&
                      (mat as any).color
                    ) {
                      return (
                        <div
                          key={idx}
                          className='w-3 h-3 rounded-full'
                          style={{
                            backgroundColor: getColorHex((mat as any).color),
                          }}
                          title={(mat as any).color}
                        ></div>
                      );
                    }
                    // For hardware
                    else if (
                      mat.materialType === EnumTypes.MaterialType.HARDWARE &&
                      (mat as any).hardwareMaterial
                    ) {
                      return (
                        <div
                          key={idx}
                          className='w-3 h-3 rounded-full'
                          style={{
                            backgroundColor: getHardwareMaterialColor(
                              (mat as any).hardwareMaterial
                            ),
                          }}
                          title={(mat as any).hardwareMaterial}
                        ></div>
                      );
                    }
                    // Default case
                    return (
                      <div
                        key={idx}
                        className='text-xs bg-stone-100 px-1 rounded'
                        title={formatType(mat.materialType)}
                      >
                        {formatType(mat.materialType).slice(0, 3)}
                      </div>
                    );
                  })}
                  {location.materials.length > 3 && (
                    <div className={`text-xs ${getTextColorClass(location)}`}>
                      +{location.materials.length - 3}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Get the legend based on active tab
  const renderLegend = () => {
    switch (activeTab) {
      case EnumTypes.MaterialType.LEATHER:
      case EnumTypes.MaterialType.HARDWARE:
      case EnumTypes.MaterialType.SUPPLIES:
        return (
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='flex items-center'>
              <div
                className={`w-4 h-4 rounded-md ${
                  activeTab === EnumTypes.MaterialType.LEATHER
                    ? 'bg-amber-50 border-amber-300'
                    : activeTab === EnumTypes.MaterialType.HARDWARE
                    ? 'bg-blue-50 border-blue-300'
                    : 'bg-green-50 border-green-300'
                } border mr-2`}
              ></div>
              <span className='text-sm text-stone-600'>
                {activeTab === EnumTypes.MaterialType.LEATHER
                  ? 'Leather Materials'
                  : activeTab === EnumTypes.MaterialType.HARDWARE
                  ? 'Hardware Items'
                  : 'Supplies'}
              </span>
            </div>
            {highlightedLocations.length > 0 && (
              <div className='flex items-center'>
                <div className='w-4 h-4 rounded-md bg-amber-100 border border-amber-500 mr-2'></div>
                <span className='text-sm text-stone-600'>
                  Selected Location
                </span>
              </div>
            )}
            <div className='flex items-center'>
              <div className='w-4 h-4 rounded-md bg-stone-50 border border-stone-200 mr-2'></div>
              <span className='text-sm text-stone-600'>Empty Location</span>
            </div>
          </div>
        );
      default:
        return (
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            <div className='flex items-center'>
              <div className='w-4 h-4 rounded-md bg-amber-50 border border-amber-300 mr-2'></div>
              <span className='text-sm text-stone-600'>Leather Materials</span>
            </div>
            <div className='flex items-center'>
              <div className='w-4 h-4 rounded-md bg-blue-50 border border-blue-300 mr-2'></div>
              <span className='text-sm text-stone-600'>Hardware Items</span>
            </div>
            <div className='flex items-center'>
              <div className='w-4 h-4 rounded-md bg-green-50 border border-green-300 mr-2'></div>
              <span className='text-sm text-stone-600'>Supplies</span>
            </div>
            {highlightedLocations.length > 0 && (
              <div className='flex items-center'>
                <div className='w-4 h-4 rounded-md bg-amber-100 border border-amber-500 mr-2'></div>
                <span className='text-sm text-stone-600'>
                  Selected Location
                </span>
              </div>
            )}
            <div className='flex items-center'>
              <div className='w-4 h-4 rounded-md bg-stone-50 border border-stone-200 mr-2'></div>
              <span className='text-sm text-stone-600'>Empty Location</span>
            </div>
          </div>
        );
    }
  };

  // Handle empty state
  if (locations.length === 0) {
    return (
      <div className='bg-white rounded-lg shadow-sm border border-stone-200 p-6'>
        <div className='mb-6'>
          <h3 className='text-lg font-medium text-stone-800 mb-2'>
            Storage Map
          </h3>
          <p className='text-sm text-stone-600'>
            Visual representation of material storage locations
          </p>
        </div>

        <div className='py-8 text-center'>
          <svg
            className='w-16 h-16 mx-auto text-stone-300 mb-4'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={1.5}
              d='M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4'
            />
          </svg>
          <p className='text-stone-500 mb-1'>No storage locations found</p>
          <p className='text-sm text-stone-400'>
            Assign materials to storage locations to see them here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white rounded-lg shadow-sm border border-stone-200 p-6'>
      <div className='mb-6'>
        <h3 className='text-lg font-medium text-stone-800 mb-2'>Storage Map</h3>
        <p className='text-sm text-stone-600'>
          Visual representation of material storage locations
        </p>
      </div>

      <div className='space-y-6'>
        {Object.keys(locationsByType).map((type) =>
          renderStorageSection(type, locationsByType[type])
        )}
      </div>

      {/* Legend */}
      <div className='mt-8 p-4 border border-stone-200 rounded-md bg-stone-50'>
        <h4 className='text-sm font-medium text-stone-700 mb-2'>
          Storage Legend
        </h4>
        {renderLegend()}
      </div>
    </div>
  );
};

export default StorageMap;
