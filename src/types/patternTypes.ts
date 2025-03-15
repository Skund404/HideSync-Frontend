// src/types/patternTypes.ts
import { EnumTypes } from './index';

/**
 * Represents a leatherworking pattern
 */
export interface Pattern {
  id: number;
  name: string;
  description: string;
  skillLevel: EnumTypes.SkillLevel;
  createdAt: Date;
  modifiedAt: Date;
  fileType: PatternFileType;
  filePath: string;
  thumbnail: string;
  tags: string[];
  isFavorite: boolean;
  projectType: EnumTypes.ProjectType;
  estimatedTime?: number; // In hours
  estimatedDifficulty?: number; // Scale of 1-10
  authorName?: string;
  authorId?: number;
  isPublic: boolean;
  version: string;
  notes?: string;
}

/**
 * Types of files a pattern can be stored as
 */
export enum PatternFileType {
  SVG = 'SVG',
  PDF = 'PDF',
  IMAGE = 'IMAGE',
}

/**
 * Parameters for filtering patterns
 */
export interface PatternFilters {
  searchQuery?: string;
  skillLevel?: string;
  projectType?: string;
  tags?: string[];
  authorId?: number;
  favorite?: boolean;
}

/**
 * For future phases - represents a component within a pattern
 */
export interface Component {
  id: number;
  patternId: number;
  name: string;
  description: string;
  componentType: EnumTypes.ComponentType;
  attributes: Record<string, any>;
  pathData?: string; // SVG path data or coordinates for the component
  position?: { x: number; y: number };
  rotation?: number;
  isOptional: boolean;
}

/**
 * For future phases - represents material requirements for a component
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
 * Represents a component within a pattern
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
 * Represents a material requirement for a component
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
 * Filters for component search/filtering
 */
export interface ComponentFilters {
  searchQuery?: string;
  componentType?: EnumTypes.ComponentType;
  patternId?: number;
  hasMaterials?: boolean;
}
