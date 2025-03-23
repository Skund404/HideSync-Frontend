// src/types/materialTypes.ts
/**
 * Comprehensive Material Type Definitions
 * Strictly aligned with ER Diagram and Business Requirements
 */

/**
 * Discriminated Union for Material Subtypes
 */
export type MaterialSubtype =
  | LeatherSubtype
  | HardwareSubtype
  | SuppliesSubtype;

/**
 * Comprehensive Material Type Enumeration
 * Covers all material categories and subcategories
 */
export enum MaterialType {
  // Core Categories
  LEATHER = 'leather',
  HARDWARE = 'hardware',
  SUPPLIES = 'supplies',

  // Leather Subtypes
  FULL_GRAIN_LEATHER = 'full_grain_leather',
  TOP_GRAIN_LEATHER = 'top_grain_leather',
  SUEDE = 'suede',
  NUBUCK = 'nubuck',
  EXOTIC_LEATHER = 'exotic_leather',
  VEGAN_LEATHER = 'vegan_leather',

  // Hardware Subtypes
  BUCKLE = 'buckle',
  RIVET = 'rivet',
  SNAP = 'snap',
  ZIPPER = 'zipper',
  BUTTON = 'button',
  HOOK = 'hook',
  RING = 'ring',

  // Supplies Subtypes
  THREAD = 'thread',
  WAXED_THREAD = 'waxed_thread',
  ADHESIVE = 'adhesive',
  DYE = 'dye',
  EDGE_FINISH = 'edge_finish',
  TOOL = 'tool',
}

// Specific Subtypes Enums
export enum LeatherSubtype {
  FULL_GRAIN = 'full_grain',
  TOP_GRAIN = 'top_grain',
  SUEDE = 'suede',
  NUBUCK = 'nubuck',
  VEGAN = 'vegan',
  EXOTIC = 'exotic',
}

export enum HardwareSubtype {
  BUCKLE = 'buckle',
  ROLLER_BUCKLE = 'roller_buckle',
  RIVET = 'rivet',
  SNAP = 'snap',
  ZIPPER = 'zipper',
  BUTTON = 'button',
  HOOK = 'hook',
  RING = 'ring',
}

export enum SuppliesSubtype {
  THREAD = 'thread',
  WAXED_THREAD = 'waxed_thread',
  ADHESIVE = 'adhesive',
  DYE = 'dye',
  EDGE_FINISH = 'edge_finish',
  TOOL = 'tool',
}

/**
 * Material Status Enumeration
 * Represents the current state of a material in inventory
 */
export enum MaterialStatus {
  IN_STOCK = 'in_stock',
  LOW_STOCK = 'low_stock',
  OUT_OF_STOCK = 'out_of_stock',
  RESERVED = 'reserved',
  IN_PRODUCTION = 'in_production',
  DISCONTINUED = 'discontinued',
}

/**
 * Quality Grades for Materials
 */
export enum MaterialQuality {
  PREMIUM = 'premium',
  PROFESSIONAL = 'professional',
  STANDARD = 'standard',
  ECONOMY = 'economy',
  SECONDS = 'seconds',
}

/**
 * Measurement Units for Materials
 */
export enum MeasurementUnit {
  PIECE = 'piece',
  SQUARE_FOOT = 'square_foot',
  SQUARE_METER = 'square_meter', // Added missing unit
  LINEAR_FOOT = 'linear_foot',
  YARD = 'yard',
  METER = 'meter',
  KILOGRAM = 'kilogram',
  LITER = 'liter',
  SPOOL = 'spool',
  BOTTLE = 'bottle',
  HIDE = 'hide', // Added missing unit
  PAIR = 'pair', // Added missing unit
  PACK = 'pack', // Added missing unit
  BOX = 'box', // Added missing unit
}

// Leather-specific Enums
export enum TannageType {
  VEGETABLE = 'vegetable',
  CHROME = 'chrome',
  COMBINATION = 'combination',
  SYNTHETIC = 'synthetic',
  ALUM = 'alum',
  BRAIN = 'brain',
  OIL = 'oil',
}

export enum AnimalSource {
  COWHIDE = 'cowhide',
  CALFSKIN = 'calfskin',
  GOATSKIN = 'goatskin',
  SHEEPSKIN = 'sheepskin',
  DEERSKIN = 'deerskin',
  PIGSKIN = 'pigskin',
  HORSE = 'horse',
  EXOTICS = 'exotics',
}

export enum LeatherFinish {
  NATURAL = 'natural',
  ANILINE = 'aniline',
  SEMI_ANILINE = 'semi_aniline',
  PIGMENTED = 'pigmented',
  PULL_UP = 'pull_up',
  WAX_PULL_UP = 'wax_pull_up',
  PATENT = 'patent',
  NUBUCK = 'nubuck',
  SUEDE = 'suede',
  MATTE = 'matte',
  POLISHED = 'polished',
  DRUM_DYED = 'drum_dyed',
}

export enum LeatherGrade {
  GRADE_A = 'grade_a',
  GRADE_B = 'grade_b',
  GRADE_C = 'grade_c',
  PREMIUM = 'premium',
  PROFESSIONAL = 'professional',
  STANDARD = 'standard',
  SECONDS = 'seconds',
  REMNANT = 'remnant',
}

// Hardware-specific Enums
export enum HardwareMaterialType {
  BRASS = 'brass',
  NICKEL = 'nickel',
  STAINLESS_STEEL = 'stainless_steel',
  STEEL = 'steel',
  ZINC = 'zinc',
  COPPER = 'copper',
  ALUMINUM = 'aluminum',
  PLASTIC = 'plastic',
  SILVER = 'silver',
  GOLD = 'gold',
}

export enum HardwareFinishType {
  POLISHED = 'polished',
  BRUSHED = 'brushed',
  ANTIQUE = 'antique',
  MATTE = 'matte',
  NATURAL = 'natural',
  PLATED = 'plated',
  POWDER_COATED = 'powder_coated',
  NICKEL_PLATED = 'nickel_plated',
  BRASS_PLATED = 'brass_plated',
  CHROME_PLATED = 'chrome_plated',
  BLACK_OXIDE = 'black_oxide',
  GOLD_PLATED = 'gold_plated',
  SILVER_PLATED = 'silver_plated',
}

// Supplies-specific Enums
export enum SuppliesType {
  ADHESIVE = 'adhesive',
  THREAD = 'thread',
  EDGE_FINISH = 'edge_finish',
  DYE = 'dye',
  CONDITIONER = 'conditioner',
  TOOL_MAINTENANCE = 'tool_maintenance',
  OTHER = 'other',
}

export enum ThreadType {
  POLYESTER = 'polyester',
  NYLON = 'nylon',
  LINEN = 'linen',
  COTTON = 'cotton',
  SILK = 'silk',
  KEVLAR = 'kevlar',
}

export enum AdhesiveType {
  CONTACT_CEMENT = 'contact_cement',
  PVA = 'pva',
  RUBBER_CEMENT = 'rubber_cement',
  EPOXY = 'epoxy',
  CYANOACRYLATE = 'cyanoacrylate',
}

// Base Interfaces
interface BaseMaterialProperties {
  id: string;
  name: string;
  materialType: MaterialType;
  subtype?: MaterialSubtype;

  // Inventory Management
  quantity: number;
  unit: MeasurementUnit;
  status: MaterialStatus;
  reorderPoint?: number;

  // Cost and Pricing
  costPrice?: number;
  sellPrice?: number;

  // Tracking
  sku?: string;
  supplierSku?: string;
  supplierId?: string;
  storageLocation?: string;

  // Metadata
  quality?: MaterialQuality;
  description?: string;
  notes?: string;
  tags?: string[];

  // Audit Trail
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;

  // Multimedia
  thumbnail?: string;
  images?: string[];
}

// Material Interfaces with Specific Types
export interface LeatherMaterial extends BaseMaterialProperties {
  materialType: MaterialType.LEATHER;
  subtype: LeatherSubtype;

  // Leather-specific Properties
  thickness: number;
  area?: number;
  animalSource: AnimalSource;
  tannage: TannageType;
  color?: string;
  finish?: LeatherFinish;
  grade?: LeatherGrade;
  isFullHide?: boolean;
}

export interface HardwareMaterial extends BaseMaterialProperties {
  materialType: MaterialType.HARDWARE;
  subtype: HardwareSubtype;

  // Hardware-specific Properties
  hardwareMaterial: HardwareMaterialType;
  size?: string;
  finish?: HardwareFinishType;
  color?: string;
}

export interface SuppliesMaterial extends BaseMaterialProperties {
  materialType: MaterialType.SUPPLIES;
  subtype: SuppliesSubtype;

  // Supplies-specific Properties
  color?: string;
  composition?: string;
  threadType?: ThreadType;
  adhesiveType?: AdhesiveType;
  volume?: number;
  length?: number;
}

// Union Type for Materials
export type Material = LeatherMaterial | HardwareMaterial | SuppliesMaterial;

// Type Guards
export function isLeatherMaterial(
  material: Material
): material is LeatherMaterial {
  return material.materialType === MaterialType.LEATHER;
}

export function isHardwareMaterial(
  material: Material
): material is HardwareMaterial {
  return material.materialType === MaterialType.HARDWARE;
}

export function isSuppliesMaterial(
  material: Material
): material is SuppliesMaterial {
  return material.materialType === MaterialType.SUPPLIES;
}

// Material Creation Payload Types
export type MaterialCreatePayload =
  | Omit<LeatherMaterial, 'id' | 'createdAt' | 'updatedAt'>
  | Omit<HardwareMaterial, 'id' | 'createdAt' | 'updatedAt'>
  | Omit<SuppliesMaterial, 'id' | 'createdAt' | 'updatedAt'>;
