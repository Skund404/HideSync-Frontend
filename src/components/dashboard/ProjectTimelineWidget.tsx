// src/components/dashboard/ProjectTimelineWidget.tsx
import React from 'react';
import { useProjects } from '../../context/ProjectContext';
import { ProjectStatus } from '../../types/projectTimeline';
import { matchProjectStatus } from '../../utils/projectTypeUtils';
import ErrorMessage from '../common/ErrorMessage';
import LoadingSpinner from '../common/LoadingSpinner';
import ProjectTimeline from '../projects/ProjectTimeline';

const ProjectTimelineWidget: React.FC = () => {
  const { projects, loading, error } = useProjects();

  // Find the most recent active project
  // Using our utility for safer enum comparison
  const currentProject = projects.find(
    (project) =>
      !matchProjectStatus(project.status, ProjectStatus.COMPLETED) &&
      !matchProjectStatus(project.status, ProjectStatus.CANCELLED)
  );

  if (loading) {
    return (
      <div className='bg-white rounded-lg shadow-sm border border-stone-200 p-6'>
        <LoadingSpinner color='amber' message='Loading project timeline...' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='bg-white rounded-lg shadow-sm border border-stone-200 p-6'>
        <ErrorMessage message={error} />
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className='bg-white rounded-lg shadow-sm border border-stone-200 p-6'>
        <div className='text-center text-stone-500 py-8'>
          <p>No active project timeline available</p>
          <p className='text-sm mt-2'>
            Start a new project to see timeline details here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white rounded-lg shadow-sm border border-stone-200 p-6'>
      <h3 className='font-medium text-lg text-stone-800 mb-4'>
        Current Project Timeline
      </h3>
      <ProjectTimeline project={currentProject} showCriticalPath={true} />
    </div>
  );
};

export default ProjectTimelineWidget;
