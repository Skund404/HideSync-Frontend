// src/components/projects/ProjectDetailWrapper.tsx
import { useProjects } from '@context/ProjectContext';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ProjectDetail from './ProjectDetail';

const ProjectDetailWrapper: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { getProjectById } = useProjects();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) {
      setError('No project ID provided');
      setLoading(false);
      return;
    }

    try {
      const loadedProject = getProjectById(projectId);
      if (loadedProject) {
        setProject(loadedProject);
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
