// src/utils/materialHelpers.ts
import {
  AnimalSource,
  HardwareMaterial,
  HardwareType,
  LeatherMaterial,
  LeatherType,
  Material,
  MaterialStatus,
  MaterialType,
  MeasurementUnit,
  SuppliesMaterial,
  TannageType,
} from '@/types/materialTypes';

// Type for filter options
export interface MaterialFilterOptions {
  searchQuery?: string;
  filterType?: string | null;
  filterMaterial?: string | null;
  filterFinish?: string | null;
  filterStatus?: string | null;
  filterStorage?: string | null;
  filterSupplier?: string | null;

  // Leather-specific filters
  filterLeatherType?: LeatherType | null;
  filterTannage?: TannageType | null;
  filterAnimalSource?: AnimalSource | null;
  filterThickness?: string | null;
  filterGrade?: string | null;
  filterColor?: string | null;

  // Hardware-specific filters
  filterHardwareType?: HardwareType | null;
  filterHardwareMaterial?: string | null;
  filterSize?: string | null;

  // Supplies-specific filters
  filterSuppliesType?: string | null;
  filterComposition?: string | null;
}

/**
 * Filter materials based on provided filters
 */
export const filterMaterials = (
  materials: Material[],
  filters: MaterialFilterOptions = {}
): Material[] => {
  if (!materials || !materials.length) return [];
  if (!filters || Object.keys(filters).length === 0) return materials;

  const {
    searchQuery = '',
    filterType = null,
    filterMaterial = null,
    filterFinish = null,
    filterStatus = null,
    filterStorage = null,
    filterSupplier = null,
    filterLeatherType = null,
    filterTannage = null,
    filterAnimalSource = null,
    filterThickness = null,
    filterHardwareType = null,
    filterHardwareMaterial = null,
    filterSuppliesType = null,
  } = filters;

  return materials.filter((material) => {
    // Search query filtering - check name and description
    if (
      searchQuery &&
      !(
        material.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (material.description &&
          material.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()))
      )
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

    // Material-specific filtering
    if (material.materialType === MaterialType.LEATHER) {
      const leatherMaterial = material as LeatherMaterial;

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

      if (filterFinish && leatherMaterial.finish !== filterFinish) {
        return false;
      }

      if (filterThickness) {
        // Check if thickness matches a range or exact value
        const [min, max] = filterThickness.split('-').map(Number);
        if (min && max) {
          if (
            leatherMaterial.thickness < min ||
            leatherMaterial.thickness > max
          ) {
            return false;
          }
        } else if (min && leatherMaterial.thickness !== min) {
          return false;
        }
      }
    } else if (material.materialType === MaterialType.HARDWARE) {
      const hardwareMaterial = material as HardwareMaterial;

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
    } else if (material.materialType === MaterialType.SUPPLIES) {
      const suppliesMaterial = material as SuppliesMaterial;

      if (
        filterSuppliesType &&
        suppliesMaterial.suppliesMaterialType !== filterSuppliesType
      ) {
        return false;
      }

      if (
        filterMaterial &&
        suppliesMaterial.materialComposition !== filterMaterial
      ) {
        return false;
      }
    }

    return true;
  });
};

/**
 * Get color hex code from color name
 */
export const getColorHex = (colorName: string): string => {
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
    clear: '#FFFFFF',
  };

  return colorMap[colorName?.toLowerCase()] || '#D2B48C'; // Default to tan if color not found
};

/**
 * Get hardware material color
 */
export const getHardwareMaterialColor = (material: string): string => {
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

  return materialColorMap[material?.toLowerCase()] || '#C0C0C0'; // Default to silver
};

/**
 * Format status for display
 */
export const formatStatus = (status: string): string => {
  if (!status) return '-';

  return status
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

/**
 * Get color class for material status tag
 */
export function getStatusColorClass(status: MaterialStatus): string {
  switch (status) {
    case MaterialStatus.IN_STOCK:
      return 'bg-green-100 text-green-800';
    case MaterialStatus.LOW_STOCK:
      return 'bg-amber-100 text-amber-800';
    case MaterialStatus.OUT_OF_STOCK:
      return 'bg-red-100 text-red-800';
    case MaterialStatus.ON_ORDER:
      return 'bg-blue-100 text-blue-800';
    case MaterialStatus.DISCONTINUED:
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

/**
 * Get status color for use in components (just the color, not the full class)
 */
export function getStatusColor(status: MaterialStatus): string {
  switch (status) {
    case MaterialStatus.IN_STOCK:
      return 'green';
    case MaterialStatus.LOW_STOCK:
      return 'amber';
    case MaterialStatus.OUT_OF_STOCK:
      return 'red';
    case MaterialStatus.ON_ORDER:
      return 'blue';
    case MaterialStatus.DISCONTINUED:
      return 'gray';
    default:
      return 'gray';
  }
}

/**
 * Get material icon based on material type
 */
export function getMaterialIcon(type: MaterialType): string {
  switch (type) {
    case MaterialType.LEATHER:
      return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M20 12a8 8 0 01-8 8m0 0a8 8 0 01-8-8m16 0a8 8 0 10-16 0m16 0c0 2.183-.87 4.2-2.3 5.657A12.087 12.087 0 0112 18a12.087 12.087 0 01-5.7-1.343A8.012 8.012 0 012 12" />
      </svg>`;
    case MaterialType.HARDWARE:
      return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
      </svg>`;
    case MaterialType.SUPPLIES:
      return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
      </svg>`;
    case MaterialType.THREAD:
    case MaterialType.WAXED_THREAD:
      return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>`;
    default:
      return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
      </svg>`;
  }
}

/**
 * Format quantity with appropriate unit
 */
export function formatQuantity(
  quantity: number,
  unit?: MeasurementUnit | string
): string {
  if (!unit) return `${quantity}`;

  // For special units like "pair" or "piece", handle pluralization
  if (typeof unit === 'string') {
    const pluralUnits = [
      'piece',
      'pair',
      'set',
      'pack',
      'bottle',
      'tube',
      'jar',
      'can',
      'roll',
      'tin',
      'shoulder',
      'bend',
    ];
    if (pluralUnits.includes(unit) && quantity !== 1) {
      return `${quantity} ${unit}s`;
    }
    return `${quantity} ${unit}`;
  }

  return `${quantity} ${unit}`;
}

/**
 * Calculate if material is low in stock based on reorder point
 */
export function isLowStock(material: Material): boolean {
  if (!material.reorderPoint) return false;
  return material.quantity <= material.reorderPoint;
}

/**
 * Format type name for display (convert SNAKE_CASE to Title Case)
 */
export function formatType(type: string): string {
  if (!type) return '';
  return type
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Format price with appropriate currency symbol
 */
export function formatPrice(price?: number, currency: string = '$'): string {
  if (price === undefined || price === null) return 'N/A';
  return `${currency}${price.toFixed(2)}`;
}

/**
 * Calculate total value of inventory for a material
 */
export function calculateInventoryValue(material: Material): number {
  if (!material.cost || material.cost <= 0) return 0;
  return material.quantity * material.cost;
}

/**
 * Determine appropriate unit label based on material type
 */
export function getUnitLabel(material: Material): string {
  if (!material.unit) {
    switch (material.materialType) {
      case MaterialType.LEATHER:
        return 'sq ft';
      case MaterialType.HARDWARE:
        return 'pcs';
      case MaterialType.SUPPLIES:
        return 'units';
      default:
        return 'items';
    }
  }
  // Fix the toString issue by casting to string directly
  return typeof material.unit === 'string'
    ? material.unit
    : String(material.unit);
}

// Create a named exports object to fix the ESLint anonymous default export warning
export const materialHelpers = {
  filterMaterials,
  getStatusColorClass,
  getStatusColor,
  getMaterialIcon,
  formatQuantity,
  isLowStock,
  formatType,
  formatPrice,
  calculateInventoryValue,
  getUnitLabel,
  getColorHex,
  getHardwareMaterialColor,
  formatStatus,
};

// Export it as default
export default materialHelpers;
