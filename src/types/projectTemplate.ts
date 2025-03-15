// src/types/projectTemplate.ts
import { ProjectType, SkillLevel } from './enums';

/**
 * Interface for a project component used in templates
 */
export interface ProjectComponent {
  id: string;
  name: string;
  description?: string;
  type?: string;
  quantity?: number;
  // Add any other properties needed
}

/**
 * Interface for materials required in a template
 */
export interface TemplateMaterial {
  id: string;
  materialId: string;
  quantity: number;
  required: boolean;
  alternatives?: string[]; // IDs of alternative materials
  notes?: string;
}

/**
 * Interface for a project template
 */
export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  type: ProjectType;
  skillLevel: SkillLevel;
  estimatedDuration: number; // in days
  components: ProjectComponent[];
  materials: TemplateMaterial[];
  estimatedCost: number;
  version: string;
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  tags: string[];
  notes: string;
}

/**
 * Interface for filtering project templates
 */
export interface TemplateFilter {
  searchText: string;
  projectType?: ProjectType;
  skillLevel?: SkillLevel;
  tags?: string[];
  isPublic?: boolean; // Added this property
}

/**
 * Interface for creating a project from a template
 */
export interface ProjectFromTemplate {
  templateId: string;
  projectName: string;
  clientId?: string;
  deadline?: Date;
  customizations?: {
    components?: {
      add?: ProjectComponent[];
      remove?: string[]; // component IDs to remove
      modify?: Partial<ProjectComponent>[];
    };
    materials?: {
      add?: TemplateMaterial[];
      remove?: string[]; // material IDs to remove
      modify?: Partial<TemplateMaterial>[];
    };
    notes?: string;
  };
}
