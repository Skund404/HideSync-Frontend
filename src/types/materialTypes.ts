/**
 * Material Types Enumeration
 *
 * This enum aligns with the database schema that uses the material_type field
 * as a discriminator to determine the subtype (Leather, Hardware, Supplies).
 *
 * The three main categories are:
 * - LEATHER: Leather materials
 * - HARDWARE: Hardware components
 * - SUPPLIES: Other materials and accessories
 *
 * Additional subtypes provide more specific categorization within these main types.
 */
export enum MaterialType {
  // Main categories (align with database subtypes)
  LEATHER = "leather",
  HARDWARE = "hardware",
  SUPPLIES = "supplies",

  // Leather subcategories
  VEGAN_LEATHER = "vegan_leather",
  SYNTHETIC_LEATHER = "synthetic_leather",

  // Thread subcategories (under Supplies)
  THREAD = "thread",
  WAXED_THREAD = "waxed_thread",
  LINEN_THREAD = "linen_thread",
  NYLON_THREAD = "nylon_thread",
  POLYESTER_THREAD = "polyester_thread",

  // Supplies subcategories
  LINING = "lining",
  BACKING = "backing",
  INTERFACING = "interfacing",
  STABILIZER = "stabilizer",
  BATTING = "batting",

  // Adhesives (under Supplies)
  ADHESIVE = "adhesive",
  CONTACT_CEMENT = "contact_cement",
  GLUE = "glue",
  TAPE = "tape",

  // Edge finishing and treatment (under Supplies)
  DYE = "dye",
  FINISH = "finish",
  EDGE_PAINT = "edge_paint",
  EDGE_COAT = "edge_coat",
  WAX = "wax",
  BURNISHING_GUM = "burnishing_gum",
  SEALER = "sealer",

  // Hardware subcategories
  RIVETS = "rivets",
  BUCKLES = "buckles",
  ZIPPERS = "zippers",
  SNAPS = "snaps",
  BUTTONS = "buttons",
  HOOKS = "hooks",
  RINGS = "rings",
  CLASPS = "clasps",

  // Structural components (under Supplies)
  ELASTIC = "elastic",
  WEBBING = "webbing",
  STRAPPING = "strapping",
  PIPING = "piping",
  CORD = "cord",
  DRAWSTRING = "drawstring",

  // Internal components (under Supplies)
  PADDING = "padding",
  FOAM = "foam",
  FILLER = "filler",
  STIFFENER = "stiffener",
  REINFORCEMENT = "reinforcement",

  // Miscellaneous (under Supplies)
  PATTERN_PAPER = "pattern_paper",
  TRANSFER_PAPER = "transfer_paper",
  TEMPLATE_MATERIAL = "template_material",
  MARKING_TOOL = "marking_tool",
  CLEANING_PRODUCT = "cleaning_product",
  CONDITIONING_PRODUCT = "conditioning_product",
  PACKAGING = "packaging",
  OTHER = "other",
}

/**
 * Material Status Enumeration
 */
export enum MaterialStatus {
  IN_STOCK = "in_stock",
  LOW_STOCK = "low_stock",
  OUT_OF_STOCK = "out_of_stock",
  DISCONTINUED = "discontinued",
  ON_ORDER = "on_order",
}

export enum LeatherType {
  FULL_GRAIN = "full_grain",
  TOP_GRAIN = "top_grain",
  CORRECTED_GRAIN = "corrected_grain",
  SPLIT = "split",
  NUBUCK = "nubuck",
  SUEDE = "suede",
  VEGETABLE_TANNED = "vegetable_tanned",
  CHROME_TANNED = "chrome_tanned",
  SHELL_CORDOVAN = "shell_cordovan",
  BRIDLE_LEATHER = "bridle_leather",
}

export enum TannageType {
  VEGETABLE = "vegetable",
  CHROME = "chrome",
  COMBINATION = "combination",
  ALUM = "alum",
  BRAIN = "brain",
  OIL = "oil",
}

export enum AnimalSource {
  COWHIDE = "cowhide",
  CALFSKIN = "calfskin",
  GOATSKIN = "goatskin",
  SHEEPSKIN = "sheepskin",
  DEERSKIN = "deerskin",
  PIGSKIN = "pigskin",
  HORSE = "horse",
  EXOTICS = "exotics",
}

export enum LeatherFinish {
  NATURAL = "natural",
  ANILINE = "aniline",
  SEMI_ANILINE = "semi_aniline",
  PIGMENTED = "pigmented",
  PULL_UP = "pull_up",
  WAX_PULL_UP = "wax_pull_up",
  PATENT = "patent",
  NUBUCK = "nubuck",
  SUEDE = "suede",
  MATTE = "matte",
  POLISHED = "polished",
  DRUM_DYED = "drum_dyed",
}

export enum LeatherGrade {
  GRADE_A = "grade_a",
  GRADE_B = "grade_b",
  GRADE_C = "grade_c",
  PREMIUM = "premium",
  PROFESSIONAL = "professional",
  STANDARD = "standard",
  SECONDS = "seconds",
  REMNANT = "remnant",
}

// Hardware Specific Types
export enum HardwareType {
  BUCKLE = "buckle",
  ROLLER_BUCKLE = "roller_buckle",
  CONWAY_BUCKLE = "conway_buckle",
  CENTER_BAR_BUCKLE = "center_bar_buckle",
  SNAP = "snap",
  RIVET = "rivet",
  COPPER_RIVET = "copper_rivet",
  EYELET = "eyelet",
  D_RING = "d_ring",
  O_RING = "o_ring",
  TRIGGER_SNAP = "trigger_snap",
  ZIPPER = "zipper",
  METAL_ZIPPER = "metal_zipper",
  BUTTON = "button",
  STUD = "stud",
  HOOK = "hook",
  PLATE = "plate",
  CORNER_PROTECTOR = "corner_protector",
  PURSE_FEET = "purse_feet",
  KEY_RING = "key_ring",
  MAGNETIC_SNAP = "magnetic_snap",
  LOBSTER_CLASP = "lobster_clasp",
  SCREW = "screw",
  CHICAGO_SCREW = "chicago_screw",
}

export enum HardwareMaterialType {
  BRASS = "brass",
  NICKEL = "nickel",
  STAINLESS_STEEL = "stainless_steel",
  STEEL = "steel",
  ZINC = "zinc",
  COPPER = "copper",
  ALUMINUM = "aluminum",
  PLASTIC = "plastic",
  SILVER = "silver",
  GOLD = "gold",
}

export enum HardwareFinishType {
  POLISHED = "polished",
  BRUSHED = "brushed",
  ANTIQUE = "antique",
  MATTE = "matte",
  NATURAL = "natural",
  PLATED = "plated",
  POWDER_COATED = "powder_coated",
  NICKEL_PLATED = "nickel_plated",
  BRASS_PLATED = "brass_plated",
  CHROME_PLATED = "chrome_plated",
  BLACK_OXIDE = "black_oxide",
  GOLD_PLATED = "gold_plated",
  SILVER_PLATED = "silver_plated",
}

// For backward compatibility
export const HardwareFinish = HardwareFinishType;

// Supplies Specific Types
export enum SuppliesType {
  ADHESIVE = "adhesive",
  THREAD = "thread",
  EDGE_FINISH = "edge_finish",
  DYE = "dye",
  CONDITIONER = "conditioner",
  TOOL_MAINTENANCE = "tool_maintenance",
  OTHER = "other",
}

export enum ThreadType {
  POLYESTER = "polyester",
  NYLON = "nylon",
  LINEN = "linen",
  COTTON = "cotton",
  SILK = "silk",
  KEVLAR = "kevlar",
}

export enum AdhesiveType {
  CONTACT_CEMENT = "contact_cement",
  PVA = "pva",
  RUBBER_CEMENT = "rubber_cement",
  EPOXY = "epoxy",
  CYANOACRYLATE = "cyanoacrylate",
}

// Units of measurement
export enum MeasurementUnit {
  PIECE = "piece",
  PAIR = "pair",
  SET = "set",
  PACK = "pack",
  SPOOL = "spool",
  MILLIMETER = "millimeter",
  CENTIMETER = "centimeter",
  METER = "meter",
  INCH = "inch",
  FOOT = "foot",
  SQUARE_FOOT = "square_foot",
  HIDE = "hide",
  GRAM = "gram",
  KILOGRAM = "kilogram",
  OUNCE = "ounce",
  POUND = "pound",
  BOTTLE = "bottle",
  TUBE = "tube",
  JAR = "jar",
  CAN = "can",
  ROLL = "roll",
  TIN = "tin",
  SHOULDER = "shoulder",
  BEND = "bend",
}

// Material Interfaces
export interface Material {
  id: number;
  name: string;
  materialType: string; // Discriminator for type (LEATHER, HARDWARE, SUPPLIES)
  status: MaterialStatus;
  quantity: number;
  unit?: MeasurementUnit | string;
  quality?: string;
  supplierId?: number; // FK to Supplier
  supplier?: string; // Display name for supplier (for UI purposes)
  reorderPoint?: number;
  description?: string;
  sku?: string;
  imageUrl?: string;
  thumbnail?: string;
  supplierSku?: string;
  cost?: number;
  price?: number;
  lastPurchased?: string; // Date
  lastPurchaseDate?: string; // Alternative date format for compatibility
  storageLocation?: string; // Storage location ID
  notes?: string;
}

/**
 * Leather subtype of Material, as defined in the ER diagram
 */
export interface LeatherMaterial extends Material {
  leatherType: LeatherType;
  thickness: number; // In ounces
  area?: number; // Square footage
  isFullHide: boolean;

  // Additional leather properties not in ER but useful for the application
  tannage?: TannageType;
  animalSource?: AnimalSource;
  color?: string;
  grade?: string;
  finish?: string;
  origin?: string;
}

/**
 * Hardware subtype of Material, as defined in the ER diagram
 */
export interface HardwareMaterial extends Material {
  hardwareType: HardwareType;
  hardwareMaterial: string | HardwareMaterialType; // String in ER diagram
  finish: string | HardwareFinishType; // String in ER diagram
  size: string; // Dimensions or standard size

  // Additional properties not in ER but useful for the application
  color?: string;
  plating?: string;
}

/**
 * Supplies subtype of Material, as defined in the ER diagram
 * This covers thread, adhesive, dye, etc. with specific properties
 */
export interface SuppliesMaterial extends Material {
  suppliesMaterialType: string; // thread/adhesive/dye/etc.
  color?: string;
  threadThickness?: string;
  materialComposition?: string;

  // Additional properties not in ER but useful for specific subtypes
  volume?: number; // For dyes, adhesives, etc.
  dryingTime?: string; // For adhesives
  applicationMethod?: string; // For adhesives, dyes
  length?: number; // For thread
  strength?: string; // For thread
  finish?: string; // For finishes

  // Legacy properties for backward compatibility
  thickness?: string; // For thread
  composition?: string; // For materials
}

// Legacy interfaces for backward compatibility
export interface ThreadMaterial extends SuppliesMaterial {}
export interface DyeMaterial extends SuppliesMaterial {}
export interface AdhesiveMaterial extends SuppliesMaterial {}
export interface FinishMaterial extends SuppliesMaterial {}
export interface HardwareItem extends HardwareMaterial {}
