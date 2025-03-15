// src/context/ProjectContext.tsx

import React, { createContext, useContext, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ProjectStatus } from '../types/enums';

// Define Project interface if it's not already defined elsewhere
interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  startDate: Date;
  dueDate?: Date;
  clientId?: string;
  type: string;
  skillLevel?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define the context interface
interface ProjectContextType {
  projects: Project[];
  loading: boolean;
  error: string | null;
  getProjectById: (id: string) => Project | undefined;
  getAllProjects: () => Project[];
  createProject: (
    project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<Project>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  customers: { id: string; name: string }[]; // Simple customer structure
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

  // Mock customer data
  const customers = [
    { id: 'cust1', name: 'John Smith' },
    { id: 'cust2', name: 'Emily Johnson' },
    { id: 'cust3', name: 'Michael Brown' },
  ];

  // Load initial projects
  useEffect(() => {
    const loadProjects = async () => {
      setLoading(true);
      try {
        // In a real app, this would fetch from an API
        const storedProjects = localStorage.getItem('projects');
        if (storedProjects) {
          setProjects(JSON.parse(storedProjects));
        }
      } catch (err) {
        setError('Failed to load projects');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  // Save projects to storage when changed
  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem('projects', JSON.stringify(projects));
    }
  }, [projects]);

  // Get project by ID
  const getProjectById = (id: string): Project | undefined => {
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

      const newProject: Project = {
        ...projectData,
        id: uuidv4(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setProjects((prev) => [...prev, newProject]);
      setLoading(false);
      return newProject;
    } catch (err) {
      setError('Failed to create project');
      setLoading(false);
      throw err;
    }
  };

  // Update an existing project
  const updateProject = async (
    id: string,
    updates: Partial<Project>
  ): Promise<Project> => {
    try {
      setLoading(true);

      const existingProject = getProjectById(id);
      if (!existingProject) {
        throw new Error('Project not found');
      }

      const updatedProject: Project = {
        ...existingProject,
        ...updates,
        updatedAt: new Date(),
      };

      setProjects((prev) =>
        prev.map((project) => (project.id === id ? updatedProject : project))
      );

      setLoading(false);
      return updatedProject;
    } catch (err) {
      setError('Failed to update project');
      setLoading(false);
      throw err;
    }
  };

  // Delete a project
  const deleteProject = async (id: string): Promise<void> => {
    try {
      setLoading(true);

      setProjects((prev) => prev.filter((project) => project.id !== id));

      setLoading(false);
    } catch (err) {
      setError('Failed to delete project');
      setLoading(false);
      throw err;
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
