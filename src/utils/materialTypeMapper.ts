// src/utils/materialTypeMapper.ts

// Import both enum types
import { MaterialType as EnumsType } from '@/types/enums';
import { MaterialType as MaterialTypesType } from '@/types/materialTypes';

/**
 * Utility to convert between different MaterialType enums
 * This helps bridge the gap between the materialTypes.ts and enums.ts definitions
 */

// Convert from materialTypes.ts enum to enums.ts enum
export function convertToServiceEnum(type: MaterialTypesType): EnumsType {
  switch (type) {
    case MaterialTypesType.LEATHER:
      return EnumsType.LEATHER;
    case MaterialTypesType.HARDWARE:
      return EnumsType.HARDWARE;
    case MaterialTypesType.SUPPLIES:
      return EnumsType.SUPPLIES;
    // Add cases for other values if needed
    default:
      // Default to a sensible value or throw an error
      console.warn(`Unknown material type: ${type}`);
      return EnumsType.SUPPLIES; // Default fallback
  }
}

// Convert from enums.ts enum to materialTypes.ts enum
export function convertToUIEnum(type: EnumsType): MaterialTypesType {
  switch (type) {
    case EnumsType.LEATHER:
      return MaterialTypesType.LEATHER;
    case EnumsType.HARDWARE:
      return MaterialTypesType.HARDWARE;
    case EnumsType.SUPPLIES:
      return MaterialTypesType.SUPPLIES;
    // Add cases for other values if needed
    default:
      // Default to a sensible value or throw an error
      console.warn(`Unknown material type: ${type}`);
      return MaterialTypesType.SUPPLIES; // Default fallback
  }
}

// Utility function to safely convert ID between string and number
export function convertIdToNumber(id: string | number): number {
  if (typeof id === 'number') return id;
  const parsed = parseInt(id, 10);
  if (isNaN(parsed)) {
    throw new Error(`Invalid ID format: ${id}`);
  }
  return parsed;
}

export function convertIdToString(id: string | number): string {
  return String(id);
}

/**
 * Safely normalizes a material object between the two different Material interfaces
 * This handles cases where one interface expects id as string and another as number
 */
export function normalizeMaterial(material: any): any {
  if (!material) return null;

  return {
    ...material,
    // Ensure the ID is a number for API communications
    id:
      typeof material.id === 'string'
        ? convertIdToNumber(material.id)
        : material.id,
  };
}
