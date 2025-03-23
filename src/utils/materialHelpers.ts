// src/utils/materialHelpers.ts
import {
  HardwareMaterial,
  HardwareSubtype,
  isHardwareMaterial,
  isLeatherMaterial,
  isSuppliesMaterial,
  LeatherMaterial,
  LeatherSubtype,
  Material,
  MaterialCreatePayload,
  MaterialQuality,
  MaterialStatus,
  MaterialType,
  MeasurementUnit,
  SuppliesMaterial,
  SuppliesSubtype,
} from '@/types/materialTypes';

/**
 * Generic option interface for dropdowns and selectors
 */
export interface SelectOption {
  value: string;
  label: string;
}

/**
 * Format a type string for display (convert snake_case to Title Case)
 * @param type The type string to format
 * @returns Formatted type string
 */
export const formatType = (type: string | undefined): string => {
  if (!type) return 'Unknown';

  return type
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (match) => match.toUpperCase());
};

/**
 * Get a color class for the status label based on material status
 * @param status Material status
 * @returns CSS class string
 */
export const getStatusColorClass = (status: MaterialStatus): string => {
  switch (status) {
    case MaterialStatus.IN_STOCK:
      return 'bg-green-100 text-green-800';
    case MaterialStatus.LOW_STOCK:
      return 'bg-yellow-100 text-yellow-800';
    case MaterialStatus.OUT_OF_STOCK:
      return 'bg-red-100 text-red-800';
    case MaterialStatus.RESERVED:
      return 'bg-blue-100 text-blue-800';
    case MaterialStatus.DISCONTINUED:
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Get status color for general UI elements
 * @param status Material status
 * @returns CSS color class
 */
export const getStatusColor = (status: MaterialStatus): string => {
  switch (status) {
    case MaterialStatus.IN_STOCK:
      return 'bg-green-100 text-green-800';
    case MaterialStatus.LOW_STOCK:
      return 'bg-yellow-100 text-yellow-800';
    case MaterialStatus.OUT_OF_STOCK:
      return 'bg-red-100 text-red-800';
    case MaterialStatus.RESERVED:
      return 'bg-blue-100 text-blue-800';
    case MaterialStatus.IN_PRODUCTION:
      return 'bg-purple-100 text-purple-800';
    case MaterialStatus.DISCONTINUED:
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Determine if a material is low on stock
 * @param material Material to check
 * @returns True if material is low on stock
 */
export const isLowStock = (material: Material): boolean => {
  if (!material || !material.quantity) return false;

  // If reorder point is defined, check against it
  if (material.reorderPoint !== undefined) {
    return material.quantity <= material.reorderPoint;
  }

  // Default low stock condition (20% of usual stock)
  return material.status === MaterialStatus.LOW_STOCK;
};

/**
 * Get a human-readable display name for a material
 * @param material The material object
 * @returns Formatted display name
 */
export const getMaterialDisplayName = (material: Material): string => {
  if (!material) return '';

  let details = '';

  if (isLeatherMaterial(material)) {
    details = material.thickness ? `${material.thickness}mm` : '';
    if (material.subtype) {
      details = details ? `${material.subtype} ${details}` : material.subtype;
    }
  } else if (isHardwareMaterial(material)) {
    details = material.size || '';
    if (material.subtype) {
      details = details ? `${material.subtype} ${details}` : material.subtype;
    }
  } else if (isSuppliesMaterial(material)) {
    if (material.subtype) {
      details = material.subtype;
    }
  }

  return details ? `${material.name} (${details})` : material.name;
};

/**
 * Format supplier information for a material
 * @param material The material object
 * @returns Formatted supplier string
 */
export const getSupplierInfo = (material: Material): string => {
  if (!material) return '';

  if (material.supplierId) {
    return `${material.supplierId}${
      material.supplierSku ? ` - ${material.supplierSku}` : ''
    }`;
  }

  return '';
};

/**
 * Format price for display
 * @param price Price value
 * @param currency Currency code (default: USD)
 * @returns Formatted price string
 */
export const formatPrice = (
  price?: number,
  currency: string = 'USD'
): string => {
  if (price === undefined || price === null) {
    return '-';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(price);
};

/**
 * Format material quantity and unit for display
 * @param quantity Material quantity
 * @param unit Measurement unit
 * @returns Formatted string
 */
export const formatQuantity = (
  quantity: number,
  unit: MeasurementUnit
): string => {
  const unitLabel = unit.toString().toLowerCase().replace('_', ' ');
  return `${quantity} ${unitLabel}${
    quantity !== 1 && !unitLabel.endsWith('s') ? 's' : ''
  }`;
};

/**
 * Get descriptive details for a leather material
 * @param material The leather material
 * @returns Array of detail strings
 */
export const getLeatherDetails = (material: LeatherMaterial): string[] => {
  const details: string[] = [];

  if (material.subtype) {
    details.push(`Type: ${material.subtype}`);
  }

  if (material.thickness) {
    details.push(`Thickness: ${material.thickness}mm`);
  }

  if (material.tannage) {
    details.push(`Tannage: ${material.tannage}`);
  }

  if (material.animalSource) {
    details.push(`Source: ${material.animalSource}`);
  }

  if (material.color) {
    details.push(`Color: ${material.color}`);
  }

  if (material.finish) {
    details.push(`Finish: ${material.finish}`);
  }

  if (material.grade) {
    details.push(`Grade: ${material.grade}`);
  }

  return details;
};

/**
 * Get descriptive details for a hardware material
 * @param material The hardware material
 * @returns Array of detail strings
 */
export const getHardwareDetails = (material: HardwareMaterial): string[] => {
  const details: string[] = [];

  if (material.subtype) {
    details.push(`Type: ${material.subtype}`);
  }

  if (material.hardwareMaterial) {
    details.push(`Material: ${material.hardwareMaterial}`);
  }

  if (material.size) {
    details.push(`Size: ${material.size}`);
  }

  if (material.finish) {
    details.push(`Finish: ${material.finish}`);
  }

  if (material.color) {
    details.push(`Color: ${material.color}`);
  }

  return details;
};

/**
 * Get descriptive details for a supplies material
 * @param material The supplies material
 * @returns Array of detail strings
 */
export const getSuppliesDetails = (material: SuppliesMaterial): string[] => {
  const details: string[] = [];

  if (material.subtype) {
    details.push(`Type: ${material.subtype}`);
  }

  if (material.threadType) {
    details.push(`Thread Type: ${material.threadType}`);
  }

  if (material.adhesiveType) {
    details.push(`Adhesive Type: ${material.adhesiveType}`);
  }

  if (material.composition) {
    details.push(`Composition: ${material.composition}`);
  }

  if (material.color) {
    details.push(`Color: ${material.color}`);
  }

  if (material.volume) {
    details.push(`Volume: ${material.volume}ml`);
  }

  if (material.length) {
    details.push(`Length: ${material.length}m`);
  }

  return details;
};

/**
 * Get color hex value from a color name
 * @param colorName The color name
 * @returns Hex color code
 */
export const getColorHex = (colorName?: string): string => {
  if (!colorName) return '#CCCCCC';

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

  return colorMap[colorName.toLowerCase()] || '#CCCCCC';
};

/**
 * Get hardware material color for display
 * @param material Hardware material type
 * @returns Hex color code
 */
export const getHardwareMaterialColor = (material?: string): string => {
  if (!material) return '#CCCCCC';

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

  return materialColorMap[material.toLowerCase()] || '#CCCCCC';
};

/**
 * Calculate material value based on quantity and price
 * @param material Material to calculate value for
 * @returns Calculated value
 */
export const calculateMaterialValue = (material: Material): number => {
  if (!material) return 0;

  const price = material.costPrice || 0;
  return material.quantity * price;
};

/**
 * Get options for material type dropdown
 * @returns Array of select options
 */
export const getMaterialTypeOptions = (): SelectOption[] => {
  return [
    { value: MaterialType.LEATHER, label: 'Leather' },
    { value: MaterialType.HARDWARE, label: 'Hardware' },
    { value: MaterialType.SUPPLIES, label: 'Supplies' },
  ];
};

/**
 * Get options for measurement units dropdown
 * @param materialType Type of material
 * @returns Array of select options filtered by material type
 */
export const getMeasurementUnitOptions = (
  materialType?: MaterialType
): SelectOption[] => {
  const allOptions = Object.entries(MeasurementUnit).map(([key, value]) => ({
    value,
    label: key.charAt(0) + key.slice(1).toLowerCase().replace(/_/g, ' '),
  }));

  if (!materialType) {
    return allOptions;
  }

  // Filter options based on material type
  switch (materialType) {
    case MaterialType.LEATHER:
      return allOptions.filter((option) =>
        [
          MeasurementUnit.SQUARE_FOOT,
          MeasurementUnit.SQUARE_METER,
          MeasurementUnit.PIECE,
          MeasurementUnit.HIDE,
        ].includes(option.value as MeasurementUnit)
      );
    case MaterialType.HARDWARE:
      return allOptions.filter((option) =>
        [
          MeasurementUnit.PIECE,
          MeasurementUnit.PAIR,
          MeasurementUnit.PACK,
          MeasurementUnit.BOX,
        ].includes(option.value as MeasurementUnit)
      );
    case MaterialType.SUPPLIES:
      return allOptions.filter((option) =>
        [
          MeasurementUnit.SPOOL,
          MeasurementUnit.BOTTLE,
          MeasurementUnit.METER,
          MeasurementUnit.PIECE,
          MeasurementUnit.LITER,
        ].includes(option.value as MeasurementUnit)
      );
    default:
      return allOptions;
  }
};

/**
 * Get options for material quality dropdown
 * @returns Array of select options
 */
export const getMaterialQualityOptions = (): SelectOption[] => {
  return Object.entries(MaterialQuality).map(([key, value]) => ({
    value,
    label: key.charAt(0) + key.slice(1).toLowerCase().replace(/_/g, ' '),
  }));
};

/**
 * Format a string to title case
 * @param str Input string
 * @returns Title cased string
 */
export const toTitleCase = (str: string): string => {
  return str
    .replace(/_/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Initialize a new material object with default values
 * @param type Material type
 * @returns New material object
 */
export const createInitialMaterial = (
  type: MaterialType
): MaterialCreatePayload => {
  const baseProperties = {
    name: '',
    materialType: type,
    quantity: 0,
    unit: MeasurementUnit.PIECE,
    status: MaterialStatus.IN_STOCK,
    quality: MaterialQuality.STANDARD,
  };

  switch (type) {
    case MaterialType.LEATHER:
      return {
        ...baseProperties,
        materialType: MaterialType.LEATHER,
        subtype: LeatherSubtype.FULL_GRAIN,
        thickness: 2.0,
        animalSource: 'cowhide',
        tannage: 'vegetable',
      } as MaterialCreatePayload;

    case MaterialType.HARDWARE:
      return {
        ...baseProperties,
        materialType: MaterialType.HARDWARE,
        subtype: HardwareSubtype.BUCKLE,
        hardwareMaterial: 'brass',
        size: 'medium',
      } as MaterialCreatePayload;

    case MaterialType.SUPPLIES:
      return {
        ...baseProperties,
        materialType: MaterialType.SUPPLIES,
        subtype: SuppliesSubtype.THREAD,
        volume: 0,
        length: 0,
      } as MaterialCreatePayload;

    default:
      return baseProperties as MaterialCreatePayload;
  }
};
