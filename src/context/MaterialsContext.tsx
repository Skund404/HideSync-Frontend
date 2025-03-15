import {
  AnimalSource,
  HardwareMaterialType,
  HardwareType,
  LeatherType,
  Material,
  MaterialStatus,
  MaterialType,
  SuppliesType,
  TannageType,
} from '@/types/materialTypes';
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

// Define view mode type to include 'storage' view
export type ViewMode = 'grid' | 'list' | 'storage';

// Define filter interfaces for each material type
interface MaterialFilter {
  searchQuery: string;
  filterType: string | null;
  filterMaterial: string | null;
  filterFinish: string | null;
  filterStatus: string | null;
  filterStorage: string | null;
  filterSupplier: string | null;
}

interface LeatherFilter extends MaterialFilter {
  filterLeatherType: LeatherType | null;
  filterTannage: TannageType | null;
  filterAnimalSource: AnimalSource | null;
  filterThickness: string | null; // Range or specific values
  filterGrade: string | null;
  filterColor: string | null;
}

interface HardwareFilter extends MaterialFilter {
  filterHardwareType: HardwareType | null;
  filterHardwareMaterial: HardwareMaterialType | null;
  filterSize: string | null;
}

interface SuppliesFilter extends MaterialFilter {
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
  filterLeatherType: LeatherType | null;
  setFilterLeatherType: (type: LeatherType | null) => void;
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
  filterHardwareType: HardwareType | null;
  setFilterHardwareType: (type: HardwareType | null) => void;
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

  // Add this new method
  applyFilters: (materials: Material[]) => Material[];
}

// Create the context with default values
const MaterialsContext = createContext<MaterialsContextType | undefined>(
  undefined
);

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
    useState<LeatherType | null>(null);
  const [filterTannage, setFilterTannage] = useState<TannageType | null>(null);
  const [filterAnimalSource, setFilterAnimalSource] =
    useState<AnimalSource | null>(null);
  const [filterColor, setFilterColor] = useState<string | null>(null);
  const [filterThickness, setFilterThickness] = useState<string | null>(null);
  const [filterGrade, setFilterGrade] = useState<string | null>(null);

  // Hardware-specific filters
  const [filterHardwareType, setFilterHardwareType] =
    useState<HardwareType | null>(null);
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

  // Apply filters to materials - NEW FUNCTION
  const applyFilters = (materialsToFilter: Material[]): Material[] => {
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

      if (filterSupplier && material.supplier !== filterSupplier) {
        return false;
      }

      // Material-specific filters
      if (material.materialType === MaterialType.LEATHER) {
        const leatherMaterial = material as any;

        if (
          filterLeatherType &&
          leatherMaterial.leatherType !== filterLeatherType
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
          hardwareMaterial.hardwareType !== filterHardwareType
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
      } else if (
        material.materialType === MaterialType.SUPPLIES ||
        material.materialType === MaterialType.THREAD ||
        material.materialType === MaterialType.WAXED_THREAD ||
        material.materialType === MaterialType.DYE ||
        material.materialType === MaterialType.EDGE_PAINT ||
        material.materialType === MaterialType.BURNISHING_GUM ||
        material.materialType === MaterialType.ADHESIVE ||
        material.materialType === MaterialType.FINISH
      ) {
        const suppliesMaterial = material as any;

        if (
          filterSuppliesType &&
          suppliesMaterial.suppliesMaterialType !== filterSuppliesType
        ) {
          return false;
        }

        if (filterColor && suppliesMaterial.color !== filterColor) {
          return false;
        }

        if (
          filterMaterial &&
          suppliesMaterial.materialComposition !== filterMaterial
        ) {
          return false;
        }
      }

      // If all filters pass, include the material
      return true;
    });
  };

  // Fetch materials data
  const fetchMaterials = async () => {
    setLoading(true);
    setError(null);
    try {
      // In a real app, this would be an API call with proper filtering
      // For now, simulate with mock data
      setTimeout(() => {
        const mockMaterials = [
          {
            id: 1,
            name: 'Vegetable Tanned Leather',
            materialType: MaterialType.LEATHER,
            status: MaterialStatus.IN_STOCK,
            quantity: 3,
            leatherType: LeatherType.VEGETABLE_TANNED,
            thickness: 3.5,
            supplier: 'Tandy Leather',
            storageLocation: 'Cabinet 1A',
            color: 'tan',
          },
          {
            id: 2,
            name: 'Brass Buckles',
            materialType: MaterialType.HARDWARE,
            status: MaterialStatus.IN_STOCK,
            quantity: 25,
            hardwareType: HardwareType.BUCKLE,
            supplier: 'Hardware Supply Co',
            storageLocation: 'Drawer 2D',
            hardwareMaterial: 'brass',
            size: '1 inch',
          },
          {
            id: 3,
            name: 'Waxed Thread',
            materialType: MaterialType.SUPPLIES,
            status: MaterialStatus.LOW_STOCK,
            quantity: 2,
            suppliesMaterialType: 'thread',
            supplier: 'Thread & Needle',
            storageLocation: 'Box 4B',
            color: 'black',
          },
        ];
        setMaterials(mockMaterials);
        setLoading(false);
      }, 500);
    } catch (err) {
      setError('Failed to fetch materials');
      setLoading(false);
    }
  };

  // Add material
  const addMaterial = async (material: Material) => {
    // In a real app, this would call the API
    try {
      // Mock implementation
      setMaterials([...materials, { ...material, id: Date.now() }]);
    } catch (err) {
      setError('Failed to add material');
    }
  };

  // Update material
  const updateMaterial = async (
    id: number | string,
    material: Partial<Material>
  ) => {
    // In a real app, this would call the API
    try {
      // Mock implementation
      setMaterials(
        materials.map((item) =>
          item.id === id ? { ...item, ...material } : item
        )
      );
    } catch (err) {
      setError('Failed to update material');
    }
  };

  // Delete material
  const deleteMaterial = async (id: number | string) => {
    // In a real app, this would call the API
    try {
      // Mock implementation
      setMaterials(materials.filter((item) => item.id !== id));
    } catch (err) {
      setError('Failed to delete material');
    }
  };

  // Fetch storage locations
  const fetchStorageLocations = async () => {
    // In a real app, this would call the API
    try {
      // Mock implementation
      const mockStorageLocations = [
        {
          id: '1A',
          name: 'Cabinet 1A',
          type: 'Cabinet',
          capacity: 100,
          utilized: 65,
        },
        {
          id: '2D',
          name: 'Drawer 2D',
          type: 'Drawer',
          capacity: 80,
          utilized: 42,
        },
        { id: '4B', name: 'Box 4B', type: 'Box', capacity: 50, utilized: 30 },
      ];
      setStorageLocations(mockStorageLocations);
    } catch (err) {
      setError('Failed to fetch storage locations');
    }
  };

  // Fetch suppliers
  const fetchSuppliers = async () => {
    // In a real app, this would call the API
    try {
      // Mock implementation
      const mockSuppliers = [
        { id: 1, name: 'Tandy Leather', status: 'active' },
        { id: 2, name: 'Hardware Supply Co', status: 'active' },
        { id: 3, name: 'Thread & Needle', status: 'active' },
      ];
      setSuppliers(mockSuppliers);
    } catch (err) {
      setError('Failed to fetch suppliers');
    }
  };

  // Initial data loading
  useEffect(() => {
    fetchMaterials();
    fetchStorageLocations();
    fetchSuppliers();
  }, []);

  // Refresh data when relevant filters change
  useEffect(() => {
    fetchMaterials();
  }, [
    activeTab,
    searchQuery,
    filterType,
    filterStatus,
    filterStorage,
    filterSupplier,
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

    // NEW: Add the applyFilters function
    applyFilters,

    // Storage management
    storageLocations,
    fetchStorageLocations,

    // Suppliers
    suppliers,
    fetchSuppliers,
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
