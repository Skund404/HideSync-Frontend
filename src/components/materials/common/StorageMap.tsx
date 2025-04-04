// src/components/materials/common/StorageMap.tsx
import { Map } from 'lucide-react';
import React from 'react';
import { useMaterials } from '../../../context/MaterialsContext';
import { useStorage } from '../../../context/StorageContext';
import { Material, MaterialType } from '../../../types/materialTypes';
import {
  formatType,
  getColorHex,
  getHardwareMaterialColor,
} from '../../../utils/materialHelpers';
import {
  isDyeType,
  isEdgePaintType,
  isMaterialOfType,
  isSupplyCategoryType,
  isThreadType,
} from '../../../utils/materialTypeGuards';

interface StorageMapLocation {
  id: string;
  type: string;
  materials: Material[];
  fullLocation: string;
  storageLocation?: any; // Optional link to actual storage location
}

interface StorageMapProps {
  materials: Material[];
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

  // Group materials by storage location
  const getLocationGroups = () => {
    const locationGroups: Record<string, Material[]> = {};

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

    const firstMaterial = location.materials[0];
    if (!firstMaterial || location.materials.length === 0) {
      return 'border-stone-200 bg-stone-50';
    }

    if (isMaterialOfType(firstMaterial, MaterialType.LEATHER)) {
      return 'border-amber-300 bg-amber-50';
    }

    if (isMaterialOfType(firstMaterial, MaterialType.HARDWARE)) {
      return 'border-blue-300 bg-blue-50';
    }

    if (isSupplyCategoryType(firstMaterial)) {
      return 'border-green-300 bg-green-50';
    }

    // Default case
    return 'border-stone-200 bg-stone-50';
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

    const firstMaterial = location.materials[0];
    if (!firstMaterial || location.materials.length === 0) {
      return 'text-stone-400';
    }

    if (isMaterialOfType(firstMaterial, MaterialType.LEATHER)) {
      return 'text-amber-800';
    }

    if (isMaterialOfType(firstMaterial, MaterialType.HARDWARE)) {
      return 'text-blue-800';
    }

    if (isSupplyCategoryType(firstMaterial)) {
      return 'text-green-800';
    }

    // Default case
    return 'text-stone-800';
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

  // Helper to safely get a color value
  const safeGetColor = (material: Material): string | undefined => {
    if (
      'color' in material &&
      material.color &&
      typeof material.color === 'string'
    ) {
      return material.color;
    }
    return undefined;
  };

  // Helper to safely get hardware material
  const safeGetHardwareMaterial = (material: Material): string | undefined => {
    if (
      'hardwareMaterial' in material &&
      material.hardwareMaterial &&
      typeof material.hardwareMaterial === 'string'
    ) {
      return material.hardwareMaterial;
    }
    return undefined;
  };

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
                    const color = safeGetColor(mat);
                    if (
                      (isMaterialOfType(mat, MaterialType.LEATHER) ||
                        isThreadType(mat) ||
                        isDyeType(mat) ||
                        isEdgePaintType(mat)) &&
                      color
                    ) {
                      return (
                        <div
                          key={idx}
                          className='w-3 h-3 rounded-full'
                          style={{
                            backgroundColor: getColorHex(color),
                          }}
                          title={color}
                        ></div>
                      );
                    }
                    // For hardware
                    const hwMaterial = safeGetHardwareMaterial(mat);
                    if (
                      isMaterialOfType(mat, MaterialType.HARDWARE) &&
                      hwMaterial
                    ) {
                      return (
                        <div
                          key={idx}
                          className='w-3 h-3 rounded-full'
                          style={{
                            backgroundColor:
                              getHardwareMaterialColor(hwMaterial),
                          }}
                          title={hwMaterial}
                        ></div>
                      );
                    }
                    // Default case
                    return (
                      <div
                        key={idx}
                        className='text-xs bg-stone-100 px-1 rounded'
                        title={formatType(String(mat.materialType))}
                      >
                        {formatType(String(mat.materialType)).slice(0, 3)}
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
      case MaterialType.LEATHER:
      case MaterialType.HARDWARE:
      case MaterialType.SUPPLIES:
        return (
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='flex items-center'>
              <div
                className={`w-4 h-4 rounded-md ${
                  activeTab === MaterialType.LEATHER
                    ? 'bg-amber-50 border-amber-300'
                    : activeTab === MaterialType.HARDWARE
                    ? 'bg-blue-50 border-blue-300'
                    : 'bg-green-50 border-green-300'
                } border mr-2`}
              ></div>
              <span className='text-sm text-stone-600'>
                {activeTab === MaterialType.LEATHER
                  ? 'Leather Materials'
                  : activeTab === MaterialType.HARDWARE
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
          <Map className='w-16 h-16 mx-auto text-stone-300 mb-4' />
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
