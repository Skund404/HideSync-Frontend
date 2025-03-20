// src/context/ProjectContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  createProject as createProjectService,
  deleteProject as deleteProjectService,
  getProjects as getProjectsService,
  updateProject as updateProjectService,
} from '../services/mock/projects';
import { ProjectStatus } from '../types/enums';
import { Project } from '../types/models';

// Define the context interface
interface ProjectContextType {
  projects: Project[];
  loading: boolean;
  error: string | null;
  getProjectById: (id: number) => Project | undefined;
  getAllProjects: () => Project[];
  createProject: (
    project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<Project>;
  updateProject: (id: number, updates: Partial<Project>) => Promise<Project>;
  deleteProject: (id: number) => Promise<void>;
  customers: { id: number; name: string }[]; // Simple customer structure
}

// Create the context
const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

// Create the provider component
export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Mock customer data - changed to numeric IDs
  const customers = [
    { id: 1, name: 'John Smith' },
    { id: 2, name: 'Emily Johnson' },
    { id: 3, name: 'Michael Williams' },
    { id: 4, name: 'Sarah Davis' },
    { id: 5, name: 'David Miller' },
    { id: 6, name: 'Robert Taylor' },
    { id: 7, name: 'Jennifer Anderson' },
  ];

  // Load initial projects
  useEffect(() => {
    const loadProjects = async () => {
      setLoading(true);
      try {
        const projectsData = await getProjectsService();
        setProjects(projectsData);
        setError(null);
      } catch (err) {
        console.error('Failed to load projects:', err);
        setError('Failed to load projects. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  // Get project by ID
  const getProjectById = (id: number): Project | undefined => {
    return projects.find((project) => project.id === id);
  };

  // Get all projects
  const getAllProjects = (): Project[] => {
    return projects;
  };

  // Create a new project
  const createProject = async (
    projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Project> => {
    try {
      setLoading(true);

      // Ensure required fields
      const projectToCreate = {
        ...projectData,
        status: projectData.status || ProjectStatus.CONCEPT,
      };

      const newProject = await createProjectService(
        projectToCreate as Omit<Project, 'id'>
      );

      setProjects((prev) => [...prev, newProject]);
      return newProject;
    } catch (err) {
      console.error('Failed to create project:', err);
      throw new Error('Failed to create project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Update an existing project
  const updateProject = async (
    id: number,
    updates: Partial<Project>
  ): Promise<Project> => {
    try {
      setLoading(true);

      const updatedProject = await updateProjectService(id, updates);

      setProjects((prev) =>
        prev.map((project) => (project.id === id ? updatedProject : project))
      );

      return updatedProject;
    } catch (err) {
      console.error('Failed to update project:', err);
      throw new Error('Failed to update project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Delete a project
  const deleteProject = async (id: number): Promise<void> => {
    try {
      setLoading(true);

      const success = await deleteProjectService(id);

      if (success) {
        setProjects((prev) => prev.filter((project) => project.id !== id));
      } else {
        throw new Error('Delete operation failed');
      }
    } catch (err) {
      console.error('Failed to delete project:', err);
      throw new Error('Failed to delete project. Please try again.');
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
