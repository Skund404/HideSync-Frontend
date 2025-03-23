// src/services/project-template-service.ts
// Import ProjectStatus from projectTimeline.ts instead of enums.ts to fix type mismatch
import { ProjectType, SkillLevel } from '@/types/enums';
import {
  ProjectFromTemplate,
  ProjectTemplate,
  TemplateFilter,
  TemplateMaterialWithAlternatives,
} from '@/types/projectTemplate';
import { Project, ProjectStatus } from '@/types/projectTimeline';
import { numberIdToString, stringIdToNumber } from '@/utils/idConversion';
import { apiClient } from './api-client';

// Helper functions to ensure we never return undefined for required string fields
const ensureString = (value: any): string => {
  return value === undefined || value === null ? '' : String(value);
};

function ensureStringId(value: any): string {
  if (value === undefined || value === null) {
    return '0';
  }
  // Use nullish coalescing to handle undefined return values from numberIdToString
  const result = numberIdToString(typeof value === 'number' ? value : 0);
  return result ?? '0'; // Ensure we always return a string
}

const ensureNumber = (value: any): number => {
  return value === undefined || value === null ? 0 : Number(value) || 0;
};

const ensureBoolean = (value: any): boolean => {
  return Boolean(value);
};

const ensureArray = <T>(value: any, mapFn?: (item: any) => T): T[] => {
  if (!Array.isArray(value)) return [];
  return mapFn ? value.map(mapFn) : value;
};

const ensureDate = (value: any): Date => {
  if (!value) return new Date();
  return value instanceof Date ? value : new Date(value);
};

/**
 * Generate a temporary ID for new items
 * Used when backend doesn't return IDs for nested objects
 */
function generateTempId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

const BASE_URL = '/project-templates';

/**
 * Get all project templates
 * @returns Promise with array of project templates
 */
export const getTemplates = async (): Promise<ProjectTemplate[]> => {
  try {
    const response = await apiClient.get<{ data: any[] }>(BASE_URL);
    return response.data.data.map(mapApiTemplateToTemplate);
  } catch (error) {
    console.error('Error fetching templates:', error);
    throw formatApiError(error);
  }
};

/**
 * Get filtered project templates
 * @param filter Filter criteria for templates
 * @returns Promise with array of filtered templates
 */
export const getFilteredTemplates = async (
  filter: TemplateFilter
): Promise<ProjectTemplate[]> => {
  try {
    // Build query parameters for filtering
    const params: Record<string, string | boolean | number> = {};

    if (filter.searchQuery) {
      params.search = filter.searchQuery;
    }

    if (filter.searchText) {
      params.search = filter.searchText;
    }

    if (filter.projectType) {
      params.project_type = filter.projectType.toLowerCase(); // Backend uses lowercase
    }

    if (filter.skillLevel) {
      params.skill_level = filter.skillLevel.toLowerCase(); // Backend uses lowercase
    }

    if (filter.isPublic !== undefined) {
      params.is_public = filter.isPublic;
    }

    if (filter.tags && filter.tags.length > 0) {
      params.tags = filter.tags.join(',');
    }

    const response = await apiClient.get<{ data: any[] }>(BASE_URL, { params });
    return response.data.data.map(mapApiTemplateToTemplate);
  } catch (error) {
    console.error('Error fetching filtered templates:', error);
    throw formatApiError(error);
  }
};

/**
 * Get a template by ID
 * @param id Template ID
 * @returns Promise with template if found
 */
export const getTemplateById = async (id: string): Promise<ProjectTemplate> => {
  try {
    // Convert string ID to number for API
    const numericId = stringIdToNumber(id);

    const response = await apiClient.get<{ data: any }>(
      `${BASE_URL}/${numericId}`
    );
    return mapApiTemplateToTemplate(response.data.data);
  } catch (error) {
    console.error(`Error fetching template with ID ${id}:`, error);
    throw formatApiError(error);
  }
};

/**
 * Create a new project template
 * @param templateData Template data
 * @returns Promise with created template
 */
export const createTemplate = async (
  templateData: Omit<
    ProjectTemplate,
    'id' | 'createdAt' | 'updatedAt' | 'version'
  >
): Promise<ProjectTemplate> => {
  try {
    // Transform the template data to match API expectations
    const apiTemplate = mapTemplateToApiTemplate(templateData);

    const response = await apiClient.post<{ data: any }>(BASE_URL, apiTemplate);
    return mapApiTemplateToTemplate(response.data.data);
  } catch (error) {
    console.error('Error creating template:', error);
    throw formatApiError(error);
  }
};

/**
 * Update an existing template
 * @param id Template ID
 * @param updates Partial template data to update
 * @returns Promise with updated template
 */
export const updateTemplate = async (
  id: string,
  updates: Partial<ProjectTemplate>
): Promise<ProjectTemplate> => {
  try {
    // Convert string ID to number for API
    const numericId = stringIdToNumber(id);

    // Transform the update data to match API expectations
    const apiTemplateUpdates = mapPartialTemplateToApiTemplate(updates);

    const response = await apiClient.patch<{ data: any }>(
      `${BASE_URL}/${numericId}`,
      apiTemplateUpdates
    );
    return mapApiTemplateToTemplate(response.data.data);
  } catch (error) {
    console.error(`Error updating template with ID ${id}:`, error);
    throw formatApiError(error);
  }
};

/**
 * Delete a template
 * @param id Template ID
 * @returns Promise that resolves when successful
 */
export const deleteTemplate = async (id: string): Promise<void> => {
  try {
    // Convert string ID to number for API
    const numericId = stringIdToNumber(id);

    await apiClient.delete(`${BASE_URL}/${numericId}`);
  } catch (error) {
    console.error(`Error deleting template with ID ${id}:`, error);
    throw formatApiError(error);
  }
};

/**
 * Create a project from a template
 * @param data Project from template data
 * @returns Promise with created project
 */
export const createProjectFromTemplate = async (
  data: ProjectFromTemplate
): Promise<Project> => {
  try {
    // Convert template ID to number
    const numericTemplateId = stringIdToNumber(data.templateId);

    // Build request payload
    const payload = {
      template_id: numericTemplateId,
      project_name: data.projectName || data.name,
      client_id: data.clientId
        ? stringIdToNumber(data.clientId)
        : data.customerId
        ? stringIdToNumber(data.customerId)
        : undefined,
      deadline: data.deadline
        ? data.deadline instanceof Date
          ? data.deadline.toISOString()
          : data.deadline
        : data.dueDate
        ? data.dueDate instanceof Date
          ? data.dueDate.toISOString()
          : data.dueDate
        : undefined,
      customizations: data.customizations
        ? {
            components: data.customizations.components
              ? {
                  add: data.customizations.components.add,
                  remove: data.customizations.components.remove,
                  modify: data.customizations.components.modify,
                }
              : undefined,
            materials: data.customizations.materials
              ? {
                  add: data.customizations.materials.add,
                  remove: data.customizations.materials.remove,
                  modify: data.customizations.materials.modify,
                }
              : undefined,
            notes: data.customizations.notes || data.notes,
          }
        : data.modifications
        ? {
            components: {
              add: data.modifications.addedComponents,
              remove: data.modifications.removedComponentIds,
            },
            materials: {
              modify: data.modifications.modifiedMaterials,
            },
            notes: data.notes,
          }
        : undefined,
    };

    const response = await apiClient.post<{ data: any }>(
      '/projects/from-template',
      payload
    );

    // Return created project (assuming it's in the same format as getProjectById)
    const projectId = response.data.data.id;

    return {
      id: ensureStringId(projectId),
      name: ensureString(response.data.data.name),
      description: ensureString(response.data.data.description),
      status: ensureString(
        response.data.data.status
      ).toUpperCase() as ProjectStatus,
      startDate: response.data.data.start_date || new Date().toISOString(),
      dueDate: response.data.data.due_date || new Date().toISOString(),
      completedDate: response.data.data.completed_date,
      progress: ensureNumber(response.data.data.progress),
      completionPercentage: ensureNumber(
        response.data.data.completion_percentage
      ),
      projectType: ensureString(response.data.data.project_type),
      salesId: response.data.data.sales_id
        ? ensureStringId(response.data.data.sales_id)
        : undefined,
      templateId: response.data.data.template_id
        ? ensureStringId(response.data.data.template_id)
        : undefined,
      customer: ensureString(response.data.data.customer?.name),
      notes: ensureString(response.data.data.notes),
    };
  } catch (error) {
    console.error('Error creating project from template:', error);
    throw formatApiError(error);
  }
};

/**
 * Save an existing project as a template
 * @param projectId Project ID
 * @param templateName Name for the new template
 * @param options Additional options for the template
 * @returns Promise with created template
 */
export const saveProjectAsTemplate = async (
  projectId: string,
  templateName: string,
  options?: {
    isPublic?: boolean;
    tags?: string[];
  }
): Promise<ProjectTemplate> => {
  try {
    // Convert project ID to number
    const numericProjectId = stringIdToNumber(projectId);

    // Build request payload
    const payload = {
      project_id: numericProjectId,
      template_name: templateName,
      is_public: options?.isPublic,
      tags: options?.tags,
    };

    const response = await apiClient.post<{ data: any }>(
      `${BASE_URL}/from-project`,
      payload
    );
    return mapApiTemplateToTemplate(response.data.data);
  } catch (error) {
    console.error('Error saving project as template:', error);
    throw formatApiError(error);
  }
};

/**
 * Adds alternative materials to a template material
 * @param templateId The template ID
 * @param materialId The template material ID
 * @param alternativeMaterialIds Array of material IDs to add as alternatives
 * @returns Promise with success message
 */
export const addAlternativeMaterials = async (
  templateId: number,
  materialId: number,
  alternativeMaterialIds: number[]
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await apiClient.post(
      `/templates/${templateId}/materials/${materialId}/alternatives`,
      { alternativeMaterialIds }
    );
    return response.data;
  } catch (error) {
    console.error('Failed to add alternative materials:', error);
    throw error;
  }
};

/**
 * Updates a template material's details
 * @param templateId The template ID
 * @param materialId The template material ID
 * @param updates Partial update object for the template material
 */
export const updateTemplateMaterial = async (
  templateId: number,
  materialId: number,
  updates: Partial<TemplateMaterialWithAlternatives>
): Promise<TemplateMaterialWithAlternatives> => {
  try {
    // Handle alternatives specially if they exist
    let payload = { ...updates };
    if (updates.alternatives !== undefined) {
      // Process alternatives before sending them to the API
      // Some transformations may be required based on your API expectations
      payload.alternatives = updates.alternatives;
    }

    const response = await apiClient.put<TemplateMaterialWithAlternatives>(
      `/templates/${templateId}/materials/${materialId}`,
      payload
    );
    return response.data;
  } catch (error) {
    console.error(`Failed to update template material ${materialId}:`, error);
    throw error;
  }
};

/**
 * Removes an alternative material from a template material
 * @param templateId The template ID
 * @param materialId The template material ID
 * @param alternativeId The alternative material ID to remove
 */
export const removeAlternativeMaterial = async (
  templateId: number,
  materialId: number,
  alternativeId: number
): Promise<{ success: boolean }> => {
  try {
    const response = await apiClient.delete(
      `/templates/${templateId}/materials/${materialId}/alternatives/${alternativeId}`
    );
    return response.data;
  } catch (error) {
    console.error('Failed to remove alternative material:', error);
    throw error;
  }
};

/**
 * Reorders alternative materials for a template material
 * @param templateId The template ID
 * @param materialId The template material ID
 * @param orderedIds Array of alternative IDs in desired order
 */
export const reorderAlternativeMaterials = async (
  templateId: number,
  materialId: number,
  orderedIds: number[]
): Promise<{ success: boolean }> => {
  try {
    const response = await apiClient.put(
      `/templates/${templateId}/materials/${materialId}/alternatives/reorder`,
      { orderedIds }
    );
    return response.data;
  } catch (error) {
    console.error('Failed to reorder alternative materials:', error);
    throw error;
  }
};

// ============ Helper Functions ============

/**
 * Maps API template data to our frontend ProjectTemplate type
 * @param apiTemplate Template data from API
 * @returns ProjectTemplate object for frontend
 */
function mapApiTemplateToTemplate(apiTemplate: any): ProjectTemplate {
  return {
    id: ensureStringId(apiTemplate.id),
    name: ensureString(apiTemplate.name),
    description: ensureString(apiTemplate.description),
    projectType:
      (ensureString(apiTemplate.project_type).toUpperCase() as ProjectType) ||
      ProjectType.OTHER,
    type:
      (ensureString(apiTemplate.project_type).toUpperCase() as ProjectType) ||
      ProjectType.OTHER,
    skillLevel:
      (ensureString(apiTemplate.skill_level).toUpperCase() as SkillLevel) ||
      SkillLevel.INTERMEDIATE,
    estimatedDuration: ensureNumber(apiTemplate.estimated_duration),
    components: ensureArray(apiTemplate.components, (comp: any) => ({
      id: comp.id ? ensureStringId(comp.id) : generateTempId('comp'),
      name: ensureString(comp.name),
      description: ensureString(comp.description),
      componentType: ensureString(comp.component_type),
      quantity: ensureNumber(comp.quantity),
    })),
    materials: ensureArray(apiTemplate.materials, (mat: any) => ({
      id: mat.id ? ensureStringId(mat.id) : generateTempId('mat'),
      materialId: ensureStringId(mat.material_id),
      quantity: ensureNumber(mat.quantity),
      isRequired: ensureBoolean(mat.is_required),
      alternatives: mat.alternatives
        ? Array.isArray(mat.alternatives) && mat.alternatives.length > 0
          ? mat.alternatives.map((alt: any) =>
              typeof alt === 'string'
                ? alt
                : typeof alt === 'number'
                ? alt.toString()
                : alt.id
                ? alt.id.toString()
                : alt.materialId
                ? alt.materialId.toString()
                : ''
            )
          : []
        : [],
      notes: ensureString(mat.notes),
    })),
    estimatedCost: ensureNumber(apiTemplate.estimated_cost),
    version: ensureString(apiTemplate.version),
    createdAt: ensureDate(apiTemplate.created_at),
    updatedAt: ensureDate(apiTemplate.updated_at),
    isPublic: ensureBoolean(apiTemplate.is_public),
    tags: ensureArray(apiTemplate.tags),
    notes: ensureString(apiTemplate.notes),
  };
}

/**
 * Maps our frontend ProjectTemplate type to API expected format
 * @param template Template from frontend
 * @returns Formatted template data for API
 */
function mapTemplateToApiTemplate(
  template: Omit<ProjectTemplate, 'id' | 'createdAt' | 'updatedAt' | 'version'>
): any {
  return {
    name: template.name,
    description: template.description,
    project_type: template.projectType.toLowerCase(), // Backend uses lowercase
    skill_level: template.skillLevel.toLowerCase(), // Backend uses lowercase
    estimated_duration: template.estimatedDuration,
    components: template.components.map((comp) => ({
      name: comp.name,
      description: comp.description,
      component_type: comp.componentType,
      quantity: comp.quantity,
    })),
    materials: template.materials.map((mat) => ({
      material_id: stringIdToNumber(mat.materialId),
      quantity: mat.quantity,
      is_required: mat.isRequired,
      alternatives: mat.alternatives
        ? Array.isArray(mat.alternatives) && mat.alternatives.length > 0
          ? mat.alternatives.map((alt) => {
              if (typeof alt === 'string') {
                return stringIdToNumber(alt);
              } else if (typeof alt === 'object' && alt.materialId) {
                return stringIdToNumber(alt.materialId);
              }
              return 0; // Default value if conversion fails
            })
          : []
        : [],
      notes: mat.notes,
    })),
    estimated_cost: template.estimatedCost,
    is_public: template.isPublic,
    tags: template.tags,
    notes: template.notes,
  };
}

/**
 * Maps partial template updates to API format
 * @param updates Partial template updates from frontend
 * @returns Formatted partial template data for API
 */
function mapPartialTemplateToApiTemplate(
  updates: Partial<ProjectTemplate>
): any {
  const apiUpdates: Record<string, any> = {};

  if (updates.name !== undefined) apiUpdates.name = updates.name;
  if (updates.description !== undefined)
    apiUpdates.description = updates.description;
  if (updates.projectType !== undefined)
    apiUpdates.project_type = updates.projectType.toLowerCase();
  if (updates.skillLevel !== undefined)
    apiUpdates.skill_level = updates.skillLevel.toLowerCase();
  if (updates.estimatedDuration !== undefined)
    apiUpdates.estimated_duration = updates.estimatedDuration;

  if (updates.components !== undefined) {
    apiUpdates.components = updates.components.map((comp) => ({
      id: comp.id ? stringIdToNumber(comp.id) : undefined,
      name: comp.name,
      description: comp.description,
      component_type: comp.componentType,
      quantity: comp.quantity,
    }));
  }

  if (updates.materials !== undefined) {
    apiUpdates.materials = updates.materials.map((mat) => ({
      id: mat.id ? stringIdToNumber(mat.id) : undefined,
      material_id: stringIdToNumber(mat.materialId),
      quantity: mat.quantity,
      is_required: mat.isRequired,
      alternatives: mat.alternatives
        ? Array.isArray(mat.alternatives) && mat.alternatives.length > 0
          ? mat.alternatives.map((alt) => {
              if (typeof alt === 'string') {
                return stringIdToNumber(alt);
              } else if (typeof alt === 'object' && alt.materialId) {
                return stringIdToNumber(alt.materialId);
              }
              return 0; // Default value if conversion fails
            })
          : []
        : [],
      notes: mat.notes,
    }));
  }

  if (updates.estimatedCost !== undefined)
    apiUpdates.estimated_cost = updates.estimatedCost;
  if (updates.isPublic !== undefined) apiUpdates.is_public = updates.isPublic;
  if (updates.tags !== undefined) apiUpdates.tags = updates.tags;
  if (updates.notes !== undefined) apiUpdates.notes = updates.notes;

  return apiUpdates;
}

/**
 * Format API error into a consistent structure
 * @param error Error from API request
 * @returns Formatted error
 */
function formatApiError(error: any): Error {
  if (error.message) {
    return new Error(error.message);
  }
  return new Error('An error occurred while communicating with the server');
}
