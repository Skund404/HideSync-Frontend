// src/context/ProjectTemplateContext.tsx

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ProjectStatus, ProjectType, SkillLevel } from '../types/enums';
import { Project } from '../types/models';
import {
  ProjectFromTemplate,
  ProjectTemplate,
  TemplateFilter,
} from '../types/projectTemplate';
import { useProjects } from './ProjectContext';

interface ProjectTemplateContextType {
  templates: ProjectTemplate[];
  loading: boolean;
  error: string | null;

  // Template operations
  getTemplateById: (id: string) => ProjectTemplate | undefined;
  getAllTemplates: () => ProjectTemplate[];
  createTemplate: (
    template: Omit<
      ProjectTemplate,
      'id' | 'createdAt' | 'updatedAt' | 'version'
    >
  ) => Promise<ProjectTemplate>;
  updateTemplate: (
    id: string,
    updates: Partial<ProjectTemplate>
  ) => Promise<ProjectTemplate>;
  deleteTemplate: (id: string) => Promise<void>;

  // Project from template operations
  createProjectFromTemplate: (data: ProjectFromTemplate) => Promise<Project>;
  saveProjectAsTemplate: (
    projectId: string,
    templateName: string,
    options?: {
      isPublic?: boolean;
      tags?: string[];
    }
  ) => Promise<ProjectTemplate>;

  // Filtering operations
  getFilteredTemplates: (filter: TemplateFilter) => ProjectTemplate[];
}

const ProjectTemplateContext = createContext<
  ProjectTemplateContextType | undefined
>(undefined);

export const ProjectTemplateProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [templates, setTemplates] = useState<ProjectTemplate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { createProject, getProjectById } = useProjects();

  // Load initial templates
  useEffect(() => {
    // In a real app, this would fetch from API
    const loadData = async () => {
      try {
        setLoading(true);
        // Simulate API fetch with local storage
        const storedTemplates = localStorage.getItem('projectTemplates');
        if (storedTemplates) {
          try {
            const parsed = JSON.parse(storedTemplates, (key, value) => {
              // Convert date strings back to Date objects
              if (key === 'createdAt' || key === 'updatedAt') {
                return value ? new Date(value) : null;
              }
              return value;
            });
            setTemplates(parsed);
          } catch (err) {
            console.error('Error parsing templates from localStorage:', err);
            setTemplates([]);
          }
        }
        setLoading(false);
      } catch (err) {
        setError('Failed to load templates');
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Save templates to storage when changed
  useEffect(() => {
    if (templates.length > 0) {
      try {
        localStorage.setItem('projectTemplates', JSON.stringify(templates));
      } catch (err) {
        console.error('Error storing templates to localStorage:', err);
      }
    }
  }, [templates]);

  // Template CRUD operations
  const getTemplateById = useCallback(
    (id: string) => {
      return templates.find((template) => template.id === id);
    },
    [templates]
  );

  const getAllTemplates = useCallback(() => {
    return templates;
  }, [templates]);

  const createTemplate = async (
    templateData: Omit<
      ProjectTemplate,
      'id' | 'createdAt' | 'updatedAt' | 'version'
    >
  ): Promise<ProjectTemplate> => {
    try {
      setLoading(true);

      const newTemplate: ProjectTemplate = {
        ...templateData,
        id: uuidv4(),
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0',
        // Set defaults for any missing fields
        materials: templateData.materials || [],
        tags: templateData.tags || [],
        isPublic: templateData.isPublic ?? false,
      };

      setTemplates((prev) => [...prev, newTemplate]);
      setLoading(false);
      return newTemplate;
    } catch (err) {
      setError('Failed to create template');
      setLoading(false);
      throw err;
    }
  };

  const updateTemplate = async (
    id: string,
    updates: Partial<ProjectTemplate>
  ): Promise<ProjectTemplate> => {
    try {
      setLoading(true);

      const existingTemplate = getTemplateById(id);
      if (!existingTemplate) {
        throw new Error('Template not found');
      }

      // Create new version if significant changes
      const needsVersionBump =
        updates.components !== undefined ||
        updates.materials !== undefined ||
        updates.type !== undefined;

      const versionParts = existingTemplate.version.split('.');
      const newVersion = needsVersionBump
        ? `${versionParts[0]}.${parseInt(versionParts[1]) + 1}`
        : existingTemplate.version;

      const updatedTemplate: ProjectTemplate = {
        ...existingTemplate,
        ...updates,
        updatedAt: new Date(),
        version: newVersion,
      };

      setTemplates((prev) =>
        prev.map((template) =>
          template.id === id ? updatedTemplate : template
        )
      );

      setLoading(false);
      return updatedTemplate;
    } catch (err) {
      setError('Failed to update template');
      setLoading(false);
      throw err;
    }
  };

  const deleteTemplate = async (id: string): Promise<void> => {
    try {
      setLoading(true);

      setTemplates((prev) => prev.filter((template) => template.id !== id));

      setLoading(false);
    } catch (err) {
      setError('Failed to delete template');
      setLoading(false);
      throw err;
    }
  };

  // Template filtering operations - memoized with useCallback to prevent unnecessary re-renders
  const getFilteredTemplates = useCallback(
    (filter: TemplateFilter): ProjectTemplate[] => {
      // Return all templates if no filter is specified
      if (
        !filter ||
        (!filter.searchText &&
          !filter.projectType &&
          !filter.skillLevel &&
          (!filter.tags || filter.tags.length === 0) &&
          filter.isPublic === undefined)
      ) {
        return templates;
      }

      return templates.filter((template) => {
        // Filter by search text
        if (
          filter.searchText &&
          !template.name
            .toLowerCase()
            .includes(filter.searchText.toLowerCase()) &&
          !template.description
            ?.toLowerCase()
            .includes(filter.searchText.toLowerCase())
        ) {
          return false;
        }

        // Filter by project type
        if (filter.projectType && template.type !== filter.projectType) {
          return false;
        }

        // Filter by skill level
        if (filter.skillLevel && template.skillLevel !== filter.skillLevel) {
          return false;
        }

        // Filter by public status
        if (
          filter.isPublic !== undefined &&
          template.isPublic !== filter.isPublic
        ) {
          return false;
        }

        // Filter by tags
        if (filter.tags && filter.tags.length > 0) {
          // Check if template has ALL the selected tags
          const hasAllTags = filter.tags.every((tag) =>
            template.tags.includes(tag)
          );
          if (!hasAllTags) return false;
        }

        return true;
      });
    },
    [templates]
  );

  // Project-Template operations
  const createProjectFromTemplate = async (
    data: ProjectFromTemplate
  ): Promise<Project> => {
    try {
      setLoading(true);

      const template = getTemplateById(data.templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      // Apply customizations to components
      let components = [...template.components];
      if (data.customizations?.components) {
        const { add, remove, modify } = data.customizations.components;

        // Remove components
        if (remove && remove.length > 0) {
          components = components.filter((comp) => !remove.includes(comp.id));
        }

        // Modify components
        if (modify && modify.length > 0) {
          modify.forEach((modification) => {
            const index = components.findIndex(
              (comp) => comp.id === modification.id
            );
            if (index !== -1) {
              components[index] = { ...components[index], ...modification };
            }
          });
        }

        // Add components
        if (add && add.length > 0) {
          components = [...components, ...add];
        }
      }

      // Calculate the due date based on estimated duration if not provided
      const dueDate =
        data.deadline ||
        (() => {
          const date = new Date();
          date.setDate(date.getDate() + template.estimatedDuration);
          return date;
        })();

      // Create a project object using ProjectContext's expected format
      const newProject = {
        name: data.projectName,
        description: template.description || '',
        status: ProjectStatus.CONCEPT,
        startDate: new Date(),
        dueDate: dueDate,
        clientId: data.clientId,
        type: template.type.toString(),
        skillLevel: SkillLevel.INTERMEDIATE.toString(),
        notes: data.customizations?.notes || template.notes || '',
      };

      // Create the project using the createProject function
      const project = await createProject(newProject);
      setLoading(false);
      return project as unknown as Project;
    } catch (err) {
      setError('Failed to create project from template');
      setLoading(false);
      throw err;
    }
  };

  const saveProjectAsTemplate = async (
    projectId: string,
    templateName: string,
    options?: {
      isPublic?: boolean;
      tags?: string[];
    }
  ): Promise<ProjectTemplate> => {
    try {
      setLoading(true);

      const project = getProjectById(projectId);
      if (!project) {
        throw new Error('Project not found');
      }

      // Process tags if provided
      const tagsList = options?.tags || [];

      // Calculate duration from project dates if available
      const estimatedDuration = calculateDurationFromProject(project);

      // Convert project to template format
      const newTemplate: Omit<
        ProjectTemplate,
        'id' | 'createdAt' | 'updatedAt' | 'version'
      > = {
        name: templateName,
        description: project.description || '',
        // Ensure these are proper enum values by converting strings to enum values or using defaults
        type: mapToProjectType(project.type),
        skillLevel: SkillLevel.INTERMEDIATE, // Default value if not available
        estimatedDuration,
        components: [], // Adapt this to match your actual component structure
        materials: [], // Adapt this to match your actual material structure
        estimatedCost: 0, // Would be calculated from materials
        isPublic: options?.isPublic || false,
        tags: tagsList,
        notes: project.notes || '',
      };

      const template = await createTemplate(newTemplate);
      setLoading(false);
      return template;
    } catch (err) {
      setError('Failed to save project as template');
      setLoading(false);
      throw err;
    }
  };

  // Helper function to calculate estimated duration from project
  const calculateDurationFromProject = (project: any): number => {
    // Default to 14 days if dates aren't available
    if (!project.startDate || !project.dueDate) return 14;

    try {
      const start = new Date(project.startDate);
      const end = new Date(project.dueDate);

      // Calculate days difference
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return diffDays > 0 ? diffDays : 14; // Ensure at least 1 day
    } catch (err) {
      console.error('Error calculating duration:', err);
      return 14; // Default to 14 days on error
    }
  };

  // Helper to map string type to ProjectType enum
  const mapToProjectType = (typeValue: string | ProjectType): ProjectType => {
    // If it's already a ProjectType enum value, return it
    if (
      typeof typeValue === 'object' ||
      Object.values(ProjectType).includes(typeValue as ProjectType)
    ) {
      return typeValue as ProjectType;
    }

    // Try to match the string to a ProjectType enum value
    const matchedType = Object.entries(ProjectType).find(
      ([key, value]) =>
        value.toLowerCase() === typeValue.toLowerCase() ||
        key.toLowerCase() === typeValue.toLowerCase()
    );

    // Return the matched type or default to WALLET
    return matchedType ? (matchedType[1] as ProjectType) : ProjectType.WALLET;
  };

  const value = {
    templates,
    loading,
    error,
    getTemplateById,
    getAllTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    createProjectFromTemplate,
    saveProjectAsTemplate,
    getFilteredTemplates,
  };

  return (
    <ProjectTemplateContext.Provider value={value}>
      {children}
    </ProjectTemplateContext.Provider>
  );
};

export const useProjectTemplates = () => {
  const context = useContext(ProjectTemplateContext);
  if (context === undefined) {
    throw new Error(
      'useProjectTemplates must be used within a ProjectTemplateProvider'
    );
  }
  return context;
};

export default ProjectTemplateContext;
