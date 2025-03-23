// src/utils/materialTypeGuards.ts
// Import only the Material interface to avoid conflicting enum imports
import { Material } from '@/types/materialTypes';

// Interface to ensure objects have materialType property
interface MaterialLike {
  materialType: string | any;
  [key: string]: any;
}

/**
 * Utility function to check if material is of a specific type
 * Handles both string and enum-based type checks for compatibility
 */
export const isMaterialOfType = (
  material: Material | MaterialLike,
  materialType: string | any
): boolean => {
  if (!material || typeof material.materialType === 'undefined') return false;

  const materialTypeStr = String(material.materialType);
  const typeToCheckStr = String(materialType);

  return materialTypeStr === typeToCheckStr;
};

/**
 * Check if material is thread-related
 */
export const isThreadType = (material: Material | MaterialLike): boolean => {
  if (!material || typeof material.materialType === 'undefined') return false;

  const materialTypeStr = String(material.materialType);
  return materialTypeStr === 'thread' || materialTypeStr === 'waxed_thread';
};

/**
 * Check if material is dye-related
 */
export const isDyeType = (material: Material | MaterialLike): boolean => {
  if (!material || typeof material.materialType === 'undefined') return false;

  const materialTypeStr = String(material.materialType);
  return materialTypeStr === 'dye';
};

/**
 * Check if material is edge paint
 */
export const isEdgePaintType = (material: Material | MaterialLike): boolean => {
  if (!material || typeof material.materialType === 'undefined') return false;

  const materialTypeStr = String(material.materialType);
  return materialTypeStr === 'edge_paint';
};

/**
 * Check if material is burnishing gum
 */
export const isBurnishingGumType = (
  material: Material | MaterialLike
): boolean => {
  if (!material || typeof material.materialType === 'undefined') return false;

  const materialTypeStr = String(material.materialType);
  return materialTypeStr === 'burnishing_gum';
};

/**
 * Check if material is adhesive
 */
export const isAdhesiveType = (material: Material | MaterialLike): boolean => {
  if (!material || typeof material.materialType === 'undefined') return false;

  const materialTypeStr = String(material.materialType);
  return materialTypeStr === 'adhesive';
};

/**
 * Check if material is finish
 */
export const isFinishType = (material: Material | MaterialLike): boolean => {
  if (!material || typeof material.materialType === 'undefined') return false;

  const materialTypeStr = String(material.materialType);
  return materialTypeStr === 'finish';
};

/**
 * Check if material is a supply category
 */
export const isSupplyCategoryType = (
  material: Material | MaterialLike
): boolean => {
  return (
    isThreadType(material) ||
    isDyeType(material) ||
    isEdgePaintType(material) ||
    isBurnishingGumType(material) ||
    isAdhesiveType(material) ||
    isFinishType(material)
  );
};
