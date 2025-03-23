import { EnumTypes } from './index';

/**
 * Represents a pattern (e.g., for leatherworking and designs)
 * as defined in the ER diagram.
 *
 * ER Diagram fields:
 *   - id, name, description,
 *   - skillLevel (BEGINNER/INTERMEDIATE/ADVANCED/etc.),
 *   - fileType (SVG/PDF/IMAGE),
 *   - filePath, thumbnail,
 *   - tags, isFavorite,
 *   - projectType (WALLET/BAG/BELT/etc.),
 *   - estimatedTime, estimatedDifficulty,
 *   - authorName, isPublic,
 *   - version,
 *   - createdAt, modifiedAt,
 *   - notes.
 */
export interface Pattern {
  id: number;
  name: string;
  description: string;
  skillLevel: EnumTypes.SkillLevel;
  fileType: PatternFileType;
  filePath: string;
  thumbnail: string;
  tags: string[];
  isFavorite: boolean;
  projectType: EnumTypes.ProjectType;
  estimatedTime?: number; // In hours
  estimatedDifficulty?: number; // Scale of 1–10
  authorName: string;
  isPublic: boolean;
  version: string;
  createdAt: Date;
  modifiedAt: Date;
  notes?: string;
}

/**
 * Types of files a pattern can be stored as.
 */
export enum PatternFileType {
  SVG = 'SVG',
  PDF = 'PDF',
  IMAGE = 'IMAGE',
}

/**
 * Parameters for filtering patterns.
 */
export interface PatternFilters {
  searchQuery?: string;
  skillLevel?: EnumTypes.SkillLevel;
  projectType?: EnumTypes.ProjectType;
  tags?: string[];
  favorite?: boolean;
}

/**
 * Represents a component within a pattern.
 *
 * This interface reflects the ER diagram for components,
 * adding audit fields (createdAt, modifiedAt) and author information.
 */
export interface Component {
  id: number;
  patternId: number;
  name: string;
  description: string;
  componentType: EnumTypes.ComponentType;
  attributes: Record<string, any>;
  pathData?: string; // SVG path data or coordinates
  position?: { x: number; y: number };
  rotation?: number;
  isOptional: boolean;
  createdAt: Date;
  modifiedAt: Date;
  authorName?: string;
}

/**
 * Represents material requirements for a component.
 *
 * This interface matches the ER diagram for the ComponentMaterial,
 * indicating the required material details.
 */
export interface ComponentMaterial {
  id: number;
  componentId: number;
  materialId: number;
  materialType: EnumTypes.MaterialType;
  quantity: number;
  unit: EnumTypes.MeasurementUnit;
  isRequired: boolean;
  alternativeMaterialIds?: number[];
  notes?: string;
}

/**
 * Filters for component search and filtering.
 */
export interface ComponentFilters {
  searchQuery?: string;
  componentType?: EnumTypes.ComponentType;
  patternId?: number;
  hasMaterials?: boolean;
}
