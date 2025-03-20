// src/components/projects/ProjectDetailWrapper.tsx
import { useProjects } from '@context/ProjectContext';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Project } from '../../types/models';
import ProjectDetail from './ProjectDetail';

// Define an interface that matches the expected Project type in ProjectDetail
interface ProjectWithStringId extends Omit<Project, 'id'> {
  id: string;
}

const ProjectDetailWrapper: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { getProjectById } = useProjects();
  const [project, setProject] = useState<ProjectWithStringId | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) {
      setError('No project ID provided');
      setLoading(false);
      return;
    }

    try {
      // Convert string ID from URL params to number for the service call
      const numericId = parseInt(projectId, 10);

      if (isNaN(numericId)) {
        setError('Invalid project ID');
        setLoading(false);
        return;
      }

      const loadedProject = getProjectById(numericId);
      if (loadedProject) {
        // Convert the project to have a string ID as expected by ProjectDetail
        const projectWithStringId: ProjectWithStringId = {
          ...loadedProject,
          id: loadedProject.id.toString(), // Convert number id to string
        };

        setProject(projectWithStringId);
      } else {
        setError(`Project with ID ${projectId} not found`);
      }
    } catch (err) {
      console.error('Error loading project:', err);
      setError('Failed to load project');
    } finally {
      setLoading(false);
    }
  }, [projectId, getProjectById]);

  if (loading) {
    return <div className='flex justify-center py-10'>Loading project...</div>;
  }

  if (error || !project) {
    return (
      <div className='bg-red-50 text-red-700 p-4 rounded-md'>
        {error || 'Project not found'}
      </div>
    );
  }

  return <ProjectDetail project={project} />;
};

export default ProjectDetailWrapper;
