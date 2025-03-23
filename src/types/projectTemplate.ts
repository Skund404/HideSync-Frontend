// src/types/projectTemplate.ts
import {
  ComponentType,
  MaterialType,
  MeasurementUnit,
  ProjectType,
  SkillLevel,
} from './enums';

/**
 * Interface for template filtering options
 */
export interface TemplateFilter {
  searchQuery?: string;
  search?: string; // Alternative to searchQuery
  searchText?: string; // Used in ProjectTemplateList component
  projectType?: ProjectType;
  skillLevel?: SkillLevel;
  isPublic?: boolean;
  tags?: string[];
  categories?: string[];
  createdAfter?: string;
  createdBefore?: string;
  sortBy?:
    | 'name'
    | 'createdAt'
    | 'updatedAt'
    | 'estimatedCost'
    | 'estimatedDuration';
  sortDirection?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

/**
 * Interface for alternative materials
 */
export interface TemplateMaterialAlternative {
  id: string;
  materialId: string;
  templateMaterialId?: string;
  name: string;
  materialType: MaterialType | string;
  notes?: string;
  priority?: number;
}

/**
 * Interface for project template material
 * Aligns with ComponentMaterial entity in ER diagram
 */
export interface TemplateMaterial {
  id?: string;
  componentId?: string;
  materialId: string;
  materialType?: MaterialType | string;
  quantity: number;
  unit?: MeasurementUnit | string;
  isRequired: boolean;
  alternativeMaterialIds?: number[];
  alternatives?: string[] | TemplateMaterialAlternative[]; // Added to support service impl
  notes?: string;
}

/**
 * Extended TemplateMaterial with explicit alternatives for service use
 */
export interface TemplateMaterialWithAlternatives extends TemplateMaterial {
  alternatives: TemplateMaterialAlternative[];
}

/**
 * Interface for project template component
 * Aligns with Component entity in ER diagram
 */
export interface TemplateComponent {
  id?: string;
  name: string;
  description: string;
  componentType: ComponentType | string;
  quantity: number;
  patternId?: number;
  attributes?: Record<string, any>;
  pathData?: string;
  position?: { x: number; y: number };
  rotation?: number;
  isOptional?: boolean;
  createdAt?: Date;
  modifiedAt?: Date;
  authorName?: string;
  materials?: TemplateMaterial[];
}

/**
 * Interface for project template
 * Aligns with ProjectTemplate entity in ER diagram
 */
export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  projectType: ProjectType;
  type: ProjectType; // Alias for projectType for compatibility with existing code
  skillLevel: SkillLevel;
  estimatedDuration: number;
  estimatedCost: number;
  version: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  isPublic: boolean;
  tags: string[];
  notes: string;

  // Additional fields for UI/functionality that aren't in the ER diagram
  components: TemplateComponent[];
  materials: TemplateMaterial[];
}

/**
 * Interface for recurring project template
 * Aligns with RecurringProject entity in ER diagram
 */
export interface RecurringProjectTemplate {
  id: string;
  templateId: string;
  name: string;
  description: string;
  projectType: ProjectType;
  skillLevel: SkillLevel;
  duration: number;
  isActive: boolean;
  nextOccurrence?: string;
  lastOccurrence?: string;
  totalOccurrences: number;
  autoGenerate: boolean;
  advanceNoticeDays: number;
  projectSuffix?: string;
  clientId?: string;
  createdBy: string;
  createdAt: Date;
  modifiedAt: Date;
}

/**
 * Interface for creating a project from a template
 */
export interface ProjectFromTemplate {
  templateId: string;
  projectName?: string;
  name?: string; // Alternative to projectName
  clientId?: string;
  customerId?: string; // Alternative to clientId
  deadline?: Date | string;
  dueDate?: Date | string; // Alternative to deadline
  startDate?: Date | string;
  description?: string;
  notes?: string;
  customizations?: {
    components?: {
      add?: TemplateComponent[];
      remove?: string[];
      modify?: Partial<TemplateComponent>[];
    };
    materials?: {
      add?: TemplateMaterial[];
      remove?: string[];
      modify?: Partial<TemplateMaterial>[];
    };
    notes?: string;
  };
  modifications?: {
    // Alternative to customizations
    addedComponents?: TemplateComponent[];
    removedComponentIds?: string[];
    modifiedMaterials?: TemplateMaterial[];
  };
}

/**
 * Interface for generated project from recurring template
 * Aligns with GeneratedProject entity in ER diagram
 */
export interface GeneratedProject {
  id: string;
  projectId: string;
  recurringProjectId: string;
  occurrenceNumber: number;
  scheduledDate: Date;
  actualGenerationDate?: Date;
  status: 'scheduled' | 'generated' | 'skipped' | 'failed';
  notes?: string;
}

/**
 * Interface for recurrence patterns
 * Aligns with RecurrencePattern entity in ER diagram
 */
export interface RecurrencePattern {
  id: string;
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
  interval: number;
  startDate: Date;
  endDate?: Date;
  endAfterOccurrences?: number;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  weekOfMonth?: number;
  month?: number;
  customDates?: Date[];
  skipWeekends: boolean;
  skipHolidays: boolean;
}

/**
 * Template category enum
 */
export enum TemplateCategory {
  WALLETS = 'wallets',
  BAGS = 'bags',
  BELTS = 'belts',
  ACCESSORIES = 'accessories',
  APPAREL = 'apparel',
  CUSTOM = 'custom',
  OTHER = 'other',
}

// Export default to satisfy import statements that use default import
export default ProjectTemplate;
