// src/context/ProjectContext.tsx

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ProjectStatus } from '@/types/enums';
import { Project } from '@/types/projectTimeline';
import * as projectService from '@/services/project-service';
import { ApiError } from '@/services/api-client';

// Define the context interface
interface ProjectContextType {
  projects: Project[];
  loading: boolean;
  error: string | null;
  getProjectById: (id: string) => Project | undefined;
  getAllProjects: (filters?: {
    status?: ProjectStatus;
    customerId?: number;
    searchQuery?: string;
    dateRange?: { start?: Date; end?: Date };
  }) => Promise<Project[]>;
  createProject: (
    project: Omit<Project, 'id'>
  ) => Promise<Project>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  updateProjectStatus: (id: string, status: ProjectStatus) => Promise<Project>;
  customers: { id: string; name: string }[];
}

// Create the context
const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

// Create the provider component
export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial projects
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Fetch projects from API
        const fetchedProjects = await projectService.getProjects();
        setProjects(fetchedProjects);
        
        // Fetch customers
        const fetchedCustomers = await projectService.getCustomers();
        setCustomers(fetchedCustomers);
        
        setError(null);
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError.message || 'Failed to load projects');
        console.error('Error loading projects:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Get project by ID
  const getProjectById = (id: string): Project | undefined => {
    return projects.find((project) => project.id === id);
  };

  // Get all projects with optional filters
  const getAllProjects = async (filters?: {
    status?: ProjectStatus;
    customerId?: number;
    searchQuery?: string;
    dateRange?: { start?: Date; end?: Date };
  }): Promise<Project[]> => {
    try {
      setLoading(true);
      const fetchedProjects = await projectService.getProjects(filters);
      
      // Update local state
      if (!filters) {
        setProjects(fetchedProjects);
      }
      
      return fetchedProjects;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to fetch projects');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Create a new project
  const createProject = async (
    projectData: Omit<Project, 'id'>
  ): Promise<Project> => {
    try {
      setLoading(true);
      const newProject = await projectService.createProject(projectData);
      
      // Update local state
      setProjects((prev) => [...prev, newProject]);
      
      return newProject;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to create project');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update an existing project
  const updateProject = async (
    id: string,
    updates: Partial<Project>
  ): Promise<Project> => {
    try {
      setLoading(true);
      const updatedProject = await projectService.updateProject(id, updates);
      
      // Update local state
      setProjects((prev) =>
        prev.map((project) => (project.id === id ? updatedProject : project))
      );
      
      return updatedProject;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to update project');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete a project
  const deleteProject = async (id: string): Promise<void> => {
    try {
      setLoading(true);
      await projectService.deleteProject(id);
      
      // Update local state
      setProjects((prev) => prev.filter((project) => project.id !== id));
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to delete project');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update project status
  const updateProjectStatus = async (
    id: string,
    status: ProjectStatus
  ): Promise<Project> => {
    try {
      setLoading(true);
      const updatedProject = await projectService.updateProjectStatus(id, status);
      
      // Update local state
      setProjects((prev) =>
        prev.map((project) => (project.id === id ? updatedProject : project))
      );
      
      return updatedProject;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to update project status');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Provider value
  const value = {
    projects,
    loading,
    error,
    getProjectById,
    getAllProjects,
    createProject,
    updateProject,
    deleteProject,
    updateProjectStatus,
    customers,
  };

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
};

// Create a hook for using the context
export const useProjects = (): ProjectContextType => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};

export default ProjectContext;