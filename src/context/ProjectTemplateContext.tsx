// src/context/ProjectTemplateContext.tsx

import { ApiError } from '@/services/api-client';
import * as templateService from '@/services/project-template-service';
import {
  ProjectFromTemplate,
  ProjectTemplate,
  TemplateFilter,
} from '@/types/projectTemplate';
import { Project } from '@/types/projectTimeline';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

interface ProjectTemplateContextType {
  templates: ProjectTemplate[];
  loading: boolean;
  error: string | null;

  // Template operations
  getTemplateById: (id: string) => ProjectTemplate | undefined;
  getAllTemplates: () => Promise<ProjectTemplate[]>;
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
  getFilteredTemplates: (filter: TemplateFilter) => Promise<ProjectTemplate[]>;
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

  // Load initial templates
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Fetch templates from API
        const fetchedTemplates = await templateService.getTemplates();
        setTemplates(fetchedTemplates);
        setError(null);
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError.message || 'Failed to load templates');
        console.error('Error loading templates:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Get template by ID
  const getTemplateById = useCallback(
    (id: string) => {
      return templates.find((template) => template.id === id);
    },
    [templates]
  );

  // Get all templates
  const getAllTemplates = useCallback(async (): Promise<ProjectTemplate[]> => {
    try {
      setLoading(true);
      const fetchedTemplates = await templateService.getTemplates();

      // Update local state
      setTemplates(fetchedTemplates);

      return fetchedTemplates;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to fetch templates');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new template
  const createTemplate = async (
    templateData: Omit<
      ProjectTemplate,
      'id' | 'createdAt' | 'updatedAt' | 'version'
    >
  ): Promise<ProjectTemplate> => {
    try {
      setLoading(true);
      const newTemplate = await templateService.createTemplate(templateData);

      // Update local state
      setTemplates((prev) => [...prev, newTemplate]);

      return newTemplate;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to create template');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update an existing template
  const updateTemplate = async (
    id: string,
    updates: Partial<ProjectTemplate>
  ): Promise<ProjectTemplate> => {
    try {
      setLoading(true);
      const updatedTemplate = await templateService.updateTemplate(id, updates);

      // Update local state
      setTemplates((prev) =>
        prev.map((template) =>
          template.id === id ? updatedTemplate : template
        )
      );

      return updatedTemplate;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to update template');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete a template
  const deleteTemplate = async (id: string): Promise<void> => {
    try {
      setLoading(true);
      await templateService.deleteTemplate(id);

      // Update local state
      setTemplates((prev) => prev.filter((template) => template.id !== id));
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to delete template');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get filtered templates
  const getFilteredTemplates = useCallback(
    async (filter: TemplateFilter): Promise<ProjectTemplate[]> => {
      try {
        setLoading(true);
        const filteredTemplates = await templateService.getFilteredTemplates(
          filter
        );
        return filteredTemplates;
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError.message || 'Failed to filter templates');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Create project from template
  const createProjectFromTemplate = async (
    data: ProjectFromTemplate
  ): Promise<Project> => {
    try {
      setLoading(true);
      const project = await templateService.createProjectFromTemplate(data);
      return project;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to create project from template');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Save project as template
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
      const newTemplate = await templateService.saveProjectAsTemplate(
        projectId,
        templateName,
        options
      );

      // Update local state
      setTemplates((prev) => [...prev, newTemplate]);

      return newTemplate;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to save project as template');
      throw err;
    } finally {
      setLoading(false);
    }
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
