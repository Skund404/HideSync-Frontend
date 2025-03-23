// src/context/MaterialsContext.tsx
import { apiClient } from '@/services/api-client';
import {
  AnimalSource,
  HardwareMaterialType,
  HardwareSubtype,
  LeatherSubtype,
  Material,
  MaterialType,
  SuppliesType,
  TannageType,
} from '@/types/materialTypes';

import { handleApiError } from '@/utils/errorHandler';
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

// Import our utilities
import { normalizeMaterial } from '@/utils/materialTypeMapper';

// Define view mode type to include 'storage' view
export type ViewMode = 'grid' | 'list' | 'storage';

// Define filter interfaces for each material type - export for use elsewhere
interface MaterialFilter {
  searchQuery: string;
  filterType: string | null;
  filterMaterial: string | null;
  filterFinish: string | null;
  filterStatus: string | null;
  filterStorage: string | null;
  filterSupplier: string | null;
}

// Export the interfaces so they're not marked as unused
export interface LeatherFilter extends MaterialFilter {
  filterLeatherType: LeatherSubtype | null;
  filterTannage: TannageType | null;
  filterAnimalSource: AnimalSource | null;
  filterThickness: string | null; // Range or specific values
  filterGrade: string | null;
  filterColor: string | null;
}

export interface HardwareFilter extends MaterialFilter {
  filterHardwareType: HardwareSubtype | null;
  filterHardwareMaterial: HardwareMaterialType | null;
  filterSize: string | null;
}

export interface SuppliesFilter extends MaterialFilter {
  filterSuppliesType: SuppliesType | null;
  filterColor: string | null;
  filterComposition: string | null;
}

// Materials context type definition
export interface MaterialsContextType {
  // View state
  activeTab: MaterialType;
  setActiveTab: (tab: MaterialType) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;

  // Data state
  materials: Material[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchMaterials: () => Promise<void>;
  addMaterial: (material: Material) => Promise<void>;
  updateMaterial: (
    id: number | string,
    material: Partial<Material>
  ) => Promise<void>;
  deleteMaterial: (id: number | string) => Promise<void>;

  // Filter state and actions - general across all materials
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterType: string | null;
  setFilterType: (type: string | null) => void;
  filterMaterial: string | null;
  setFilterMaterial: (material: string | null) => void;
  filterFinish: string | null;
  setFilterFinish: (finish: string | null) => void;
  filterStatus: string | null;
  setFilterStatus: (status: string | null) => void;
  filterStorage: string | null;
  setFilterStorage: (storage: string | null) => void;
  filterSupplier: string | null;
  setFilterSupplier: (supplier: string | null) => void;

  // Specialized filters for leather
  filterLeatherType: LeatherSubtype | null;
  setFilterLeatherType: (type: LeatherSubtype | null) => void;
  filterTannage: TannageType | null;
  setFilterTannage: (tannage: TannageType | null) => void;
  filterAnimalSource: AnimalSource | null;
  setFilterAnimalSource: (source: AnimalSource | null) => void;
  filterColor: string | null;
  setFilterColor: (color: string | null) => void;
  filterThickness: string | null;
  setFilterThickness: (thickness: string | null) => void;
  filterGrade: string | null;
  setFilterGrade: (grade: string | null) => void;

  // Specialized filters for hardware
  filterHardwareType: HardwareSubtype | null;
  setFilterHardwareType: (type: HardwareSubtype | null) => void;
  filterHardwareMaterial: HardwareMaterialType | null;
  setFilterHardwareMaterial: (material: HardwareMaterialType | null) => void;

  // Specialized filters for supplies
  filterSuppliesType: SuppliesType | null;
  setFilterSuppliesType: (type: SuppliesType | null) => void;

  // Legacy filters object for backward compatibility
  filters: {
    leather: Record<string, any>;
    hardware: Record<string, any>;
    supplies: Record<string, any>;
    [key: string]: Record<string, any>;
  };
  setFilters: (materialType: string, filters: Record<string, any>) => void;

  // Utility functions
  clearFilters: () => void;

  // Storage management
  storageLocations: any[]; // Replace with your StorageLocation type
  fetchStorageLocations: () => Promise<void>;

  // Suppliers
  suppliers: any[]; // Replace with your Supplier type
  fetchSuppliers: () => Promise<void>;

  // Apply filters method
  applyFilters: (materials: Material[]) => Material[];

  // Refresh data
  refresh: () => Promise<void>;
}

// Create the context with default values
const MaterialsContext = createContext<MaterialsContextType | undefined>(
  undefined
);

// API endpoints
const MATERIALS_ENDPOINT = '/materials';
const STORAGE_ENDPOINT = '/storage/locations';
const SUPPLIERS_ENDPOINT = '/suppliers';

// Provider component
export const MaterialsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // View state
  const [activeTab, setActiveTab] = useState<MaterialType>(
    MaterialType.LEATHER
  );
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Data state
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Storage and suppliers state
  const [storageLocations, setStorageLocations] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);

  // Filter state - Common filters across all material types
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<string | null>(null);
  const [filterMaterial, setFilterMaterial] = useState<string | null>(null);
  const [filterFinish, setFilterFinish] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [filterStorage, setFilterStorage] = useState<string | null>(null);
  const [filterSupplier, setFilterSupplier] = useState<string | null>(null);

  // Leather-specific filters
  const [filterLeatherType, setFilterLeatherType] =
    useState<LeatherSubtype | null>(null);
  const [filterTannage, setFilterTannage] = useState<TannageType | null>(null);
  const [filterAnimalSource, setFilterAnimalSource] =
    useState<AnimalSource | null>(null);
  const [filterColor, setFilterColor] = useState<string | null>(null);
  const [filterThickness, setFilterThickness] = useState<string | null>(null);
  const [filterGrade, setFilterGrade] = useState<string | null>(null);

  // Hardware-specific filters
  const [filterHardwareType, setFilterHardwareType] =
    useState<HardwareSubtype | null>(null);
  const [filterHardwareMaterial, setFilterHardwareMaterial] =
    useState<HardwareMaterialType | null>(null);

  // Supplies-specific filters
  const [filterSuppliesType, setFilterSuppliesType] =
    useState<SuppliesType | null>(null);

  // Legacy filters object for backward compatibility
  const [filtersObject, setFiltersObject] = useState<{
    leather: Record<string, any>;
    hardware: Record<string, any>;
    supplies: Record<string, any>;
    [key: string]: Record<string, any>;
  }>({
    leather: {},
    hardware: {},
    supplies: {},
  });

  // Create a ref with proper initialization
  const fetchMaterialsRef = useRef<() => Promise<void>>(() =>
    Promise.resolve()
  );

  // Fetch storage locations - wrapped in useCallback
  const fetchStorageLocations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(STORAGE_ENDPOINT);
      setStorageLocations(response.data);
      return Promise.resolve();
    } catch (err: any) {
      const errorMessage = handleApiError(
        err,
        'Failed to fetch storage locations'
      );
      setError(errorMessage);
      return Promise.reject(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch suppliers - wrapped in useCallback
  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(SUPPLIERS_ENDPOINT);
      setSuppliers(response.data);
      return Promise.resolve();
    } catch (err: any) {
      const errorMessage = handleApiError(err, 'Failed to fetch suppliers');
      setError(errorMessage);
      return Promise.reject(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Legacy setFilters method for backward compatibility
  const setFilters = (materialType: string, filters: Record<string, any>) => {
    setFiltersObject((prev) => ({
      ...prev,
      [materialType]: filters,
    }));

    // If it's leather filters, also update the individual filter states
    if (materialType === 'leather') {
      if ('leatherType' in filters)
        setFilterLeatherType(filters.leatherType || null);
      if ('tannage' in filters) setFilterTannage(filters.tannage || null);
      if ('animalSource' in filters)
        setFilterAnimalSource(filters.animalSource || null);
      if ('color' in filters) setFilterColor(filters.color || null);
      if ('thickness' in filters) setFilterThickness(filters.thickness || null);
      if ('grade' in filters) setFilterGrade(filters.grade || null);
    }
    // Handle hardware filters
    else if (materialType === 'hardware') {
      if ('hardwareType' in filters)
        setFilterHardwareType(filters.hardwareType || null);
      if ('material' in filters)
        setFilterHardwareMaterial(filters.material || null);
      if ('finish' in filters) setFilterFinish(filters.finish || null);
      if ('size' in filters) setFilterMaterial(filters.size || null);
      if ('color' in filters) setFilterColor(filters.color || null);
    }
    // Handle supplies filters
    else if (materialType === 'supplies') {
      if ('materialType' in filters)
        setFilterSuppliesType(filters.materialType || null);
      if ('color' in filters) setFilterColor(filters.color || null);
      if ('brand' in filters) setFilterSupplier(filters.brand || null);
      if ('subType' in filters) setFilterType(filters.subType || null);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    // Clear common filters
    setSearchQuery('');
    setFilterType(null);
    setFilterMaterial(null);
    setFilterFinish(null);
    setFilterStatus(null);
    setFilterStorage(null);
    setFilterSupplier(null);

    // Clear leather-specific filters
    setFilterLeatherType(null);
    setFilterTannage(null);
    setFilterAnimalSource(null);
    setFilterColor(null);
    setFilterThickness(null);
    setFilterGrade(null);

    // Clear hardware-specific filters
    setFilterHardwareType(null);
    setFilterHardwareMaterial(null);

    // Clear supplies-specific filters
    setFilterSuppliesType(null);

    // Clear legacy filters object
    setFiltersObject({
      leather: {},
      hardware: {},
      supplies: {},
    });
  };

  // Fetch materials data implementation
  const fetchMaterials = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Build query parameters
      let url = MATERIALS_ENDPOINT;
      const params = new URLSearchParams();

      if (activeTab) {
        params.append('material_type', activeTab);
      }

      // Add common filters
      if (filterStatus) params.append('status', filterStatus);
      if (filterStorage) params.append('storage_location', filterStorage);
      if (filterSupplier) params.append('supplier_id', filterSupplier);

      // Add material-specific filters based on active tab
      if (activeTab === MaterialType.LEATHER) {
        if (filterLeatherType) params.append('leather_type', filterLeatherType);
        if (filterTannage) params.append('tannage', filterTannage);
        if (filterAnimalSource)
          params.append('animal_source', filterAnimalSource);
        if (filterColor) params.append('color', filterColor);
        if (filterThickness) params.append('thickness', filterThickness);
        if (filterGrade) params.append('grade', filterGrade);
      } else if (activeTab === MaterialType.HARDWARE) {
        if (filterHardwareType)
          params.append('hardware_type', filterHardwareType);
        if (filterHardwareMaterial)
          params.append('hardware_material', filterHardwareMaterial);
        if (filterFinish) params.append('finish', filterFinish);
      } else if (activeTab === MaterialType.SUPPLIES) {
        if (filterSuppliesType)
          params.append('supplies_type', filterSuppliesType);
        if (filterColor) params.append('color', filterColor);
      }

      // Add search query
      if (searchQuery) params.append('search', searchQuery);

      // Append params to URL if there are any
      const queryString = params.toString();
      if (queryString) {
        url = `${url}?${queryString}`;
      }

      const response = await apiClient.get<Material[]>(url);
      setMaterials(response.data);
    } catch (err: any) {
      const errorMessage = handleApiError(err, 'Failed to fetch materials');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [
    activeTab,
    filterStatus,
    filterStorage,
    filterSupplier,
    filterLeatherType,
    filterTannage,
    filterAnimalSource,
    filterColor,
    filterThickness,
    filterGrade,
    filterHardwareType,
    filterHardwareMaterial,
    filterFinish,
    filterSuppliesType,
    searchQuery,
  ]);

  // Store the fetchMaterials function in a ref to avoid dependency cycle issues
  useEffect(() => {
    fetchMaterialsRef.current = fetchMaterials;
  }, [fetchMaterials]);

  // Refresh all data - now using properly declared functions
  const refresh = useCallback(async () => {
    try {
      await Promise.all([
        fetchMaterialsRef.current(),
        fetchStorageLocations(),
        fetchSuppliers(),
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  }, [fetchStorageLocations, fetchSuppliers]);

  // Apply filters to materials
  const applyFilters = useCallback(
    (materialsToFilter: Material[]): Material[] => {
      return materialsToFilter.filter((material) => {
        // Search query filtering
        if (
          searchQuery &&
          !material.name.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return false;
        }

        // Common filters
        if (filterType && material.materialType !== filterType) {
          return false;
        }

        if (filterStatus && material.status !== filterStatus) {
          return false;
        }

        if (filterStorage && material.storageLocation !== filterStorage) {
          return false;
        }

        if (filterSupplier && material.supplierId !== filterSupplier) {
          return false;
        }

        // Material-specific filters
        if (material.materialType === MaterialType.LEATHER) {
          const leatherMaterial = material as any;

          if (
            filterLeatherType &&
            leatherMaterial.subtype !== filterLeatherType
          ) {
            return false;
          }

          if (filterTannage && leatherMaterial.tannage !== filterTannage) {
            return false;
          }

          if (
            filterAnimalSource &&
            leatherMaterial.animalSource !== filterAnimalSource
          ) {
            return false;
          }

          if (filterColor && leatherMaterial.color !== filterColor) {
            return false;
          }

          if (filterThickness) {
            // Basic thickness filtering
            if (
              !leatherMaterial.thickness ||
              leatherMaterial.thickness.toString() !== filterThickness
            ) {
              return false;
            }
          }

          if (filterGrade && leatherMaterial.grade !== filterGrade) {
            return false;
          }
        } else if (material.materialType === MaterialType.HARDWARE) {
          const hardwareMaterial = material as any;

          if (
            filterHardwareType &&
            hardwareMaterial.subtype !== filterHardwareType
          ) {
            return false;
          }

          if (
            filterHardwareMaterial &&
            hardwareMaterial.hardwareMaterial !== filterHardwareMaterial
          ) {
            return false;
          }

          if (filterFinish && hardwareMaterial.finish !== filterFinish) {
            return false;
          }

          if (filterMaterial && hardwareMaterial.size !== filterMaterial) {
            return false;
          }
        } else if (material.materialType === MaterialType.SUPPLIES) {
          const suppliesMaterial = material as any;

          if (
            filterSuppliesType &&
            suppliesMaterial.subtype !== filterSuppliesType
          ) {
            return false;
          }

          if (filterColor && suppliesMaterial.color !== filterColor) {
            return false;
          }

          if (
            filterMaterial &&
            suppliesMaterial.composition !== filterMaterial
          ) {
            return false;
          }
        }

        // If all filters pass, include the material
        return true;
      });
    },
    [
      searchQuery,
      filterType,
      filterStatus,
      filterStorage,
      filterSupplier,
      filterLeatherType,
      filterTannage,
      filterAnimalSource,
      filterColor,
      filterThickness,
      filterGrade,
      filterHardwareType,
      filterHardwareMaterial,
      filterFinish,
      filterMaterial,
      filterSuppliesType,
    ]
  );

  // Add material
  const addMaterial = async (material: Material) => {
    setLoading(true);
    setError(null);
    try {
      const normalizedMaterial = normalizeMaterial(material);
      const response = await apiClient.post<Material>(
        MATERIALS_ENDPOINT,
        normalizedMaterial
      );
      setMaterials((prev) => [...prev, response.data]);
      return Promise.resolve();
    } catch (err: any) {
      const errorMessage = handleApiError(err, 'Failed to add material');
      setError(errorMessage);
      return Promise.reject(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Update material
  const updateMaterial = async (
    id: number | string,
    material: Partial<Material>
  ) => {
    setLoading(true);
    setError(null);
    try {
      const normalizedId = typeof id === 'string' ? parseInt(id, 10) : id;
      const normalizedMaterial = normalizeMaterial(material);

      const response = await apiClient.put<Material>(
        `${MATERIALS_ENDPOINT}/${normalizedId}`,
        normalizedMaterial
      );

      setMaterials((prev) =>
        prev.map((item) => (item.id === id ? response.data : item))
      );
      return Promise.resolve();
    } catch (err: any) {
      const errorMessage = handleApiError(err, 'Failed to update material');
      setError(errorMessage);
      return Promise.reject(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Delete material
  const deleteMaterial = async (id: number | string) => {
    setLoading(true);
    setError(null);
    try {
      const normalizedId = typeof id === 'string' ? parseInt(id, 10) : id;
      await apiClient.delete(`${MATERIALS_ENDPOINT}/${normalizedId}`);
      setMaterials((prev) => prev.filter((item) => item.id !== id));
      return Promise.resolve();
    } catch (err: any) {
      const errorMessage = handleApiError(err, 'Failed to delete material');
      setError(errorMessage);
      return Promise.reject(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Initial data loading
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await Promise.all([
          fetchMaterials(),
          fetchStorageLocations(),
          fetchSuppliers(),
        ]);
      } catch (error) {
        console.error('Error loading initial data:', error);
      }
    };

    loadInitialData();
  }, [fetchMaterials, fetchStorageLocations, fetchSuppliers]);

  // Refresh materials data when relevant filters change
  useEffect(() => {
    fetchMaterials();
  }, [
    activeTab,
    searchQuery,
    filterType,
    filterStatus,
    filterStorage,
    filterSupplier,
    filterLeatherType,
    filterTannage,
    filterAnimalSource,
    filterThickness,
    filterGrade,
    filterHardwareType,
    filterHardwareMaterial,
    filterSuppliesType,
    filterColor,
    fetchMaterials,
  ]);

  // Context value
  const value: MaterialsContextType = {
    // View state
    activeTab,
    setActiveTab,
    viewMode,
    setViewMode,

    // Data state
    materials,
    loading,
    error,

    // Actions
    fetchMaterials,
    addMaterial,
    updateMaterial,
    deleteMaterial,

    // Filter state and actions - general across all materials
    searchQuery,
    setSearchQuery,
    filterType,
    setFilterType,
    filterMaterial,
    setFilterMaterial,
    filterFinish,
    setFilterFinish,
    filterStatus,
    setFilterStatus,
    filterStorage,
    setFilterStorage,
    filterSupplier,
    setFilterSupplier,

    // Specialized filters for leather
    filterLeatherType,
    setFilterLeatherType,
    filterTannage,
    setFilterTannage,
    filterAnimalSource,
    setFilterAnimalSource,
    filterColor,
    setFilterColor,
    filterThickness,
    setFilterThickness,
    filterGrade,
    setFilterGrade,

    // Specialized filters for hardware
    filterHardwareType,
    setFilterHardwareType,
    filterHardwareMaterial,
    setFilterHardwareMaterial,

    // Specialized filters for supplies
    filterSuppliesType,
    setFilterSuppliesType,

    // Legacy filters object for backward compatibility
    filters: filtersObject,
    setFilters,

    // Utility functions
    clearFilters,
    applyFilters,

    // Storage management
    storageLocations,
    fetchStorageLocations,

    // Suppliers
    suppliers,
    fetchSuppliers,

    // Refresh data
    refresh,
  };

  return (
    <MaterialsContext.Provider value={value}>
      {children}
    </MaterialsContext.Provider>
  );
};

// Custom hook for using the materials context
export const useMaterials = () => {
  const context = useContext(MaterialsContext);
  if (context === undefined) {
    throw new Error('useMaterials must be used within a MaterialsProvider');
  }
  return context;
};

export default MaterialsContext;
