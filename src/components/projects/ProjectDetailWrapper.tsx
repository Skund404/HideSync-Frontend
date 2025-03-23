// src/components/projects/ProjectDetailWrapper.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProjects } from '../../context/ProjectContext';
import ErrorMessage from '../common/ErrorMessage';
import LoadingSpinner from '../common/LoadingSpinner';
import ProjectDetail from './ProjectDetail';

import {
  convertToDetailProject,
  DetailProject,
} from '../../utils/projectTypeUtils';

const ProjectDetailWrapper: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { getProjectById, loading: contextLoading } = useProjects();
  const [project, setProject] = useState<DetailProject | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) {
      setError('No project ID provided');
      setLoading(false);
      return;
    }

    const loadProject = async () => {
      setLoading(true);
      try {
        // Attempt to get the project by ID
        const loadedProject = getProjectById(projectId);

        if (loadedProject) {
          // Adapt the project to the format ProjectDetail expects
          setProject(convertToDetailProject(loadedProject));
          setError(null);
        } else {
          setError(`Project with ID ${projectId} not found`);
          setProject(null);
        }
      } catch (err) {
        console.error('Error loading project:', err);
        setError('Failed to load project details');
        setProject(null);
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [projectId, getProjectById]);

  if (loading || contextLoading) {
    return (
      <div className='bg-white shadow-sm rounded-lg border border-stone-200 p-6'>
        <LoadingSpinner
          message='Loading project details...'
          size='medium'
          color='amber'
        />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className='bg-white shadow-sm rounded-lg border border-stone-200 p-6'>
        <ErrorMessage
          message={error || 'Project not found'}
          variant='critical'
        />
      </div>
    );
  }

  return (
    <div className='bg-white shadow-sm rounded-lg border border-stone-200 p-6'>
      <ProjectDetail project={project} />
    </div>
  );
};

export default ProjectDetailWrapper;
