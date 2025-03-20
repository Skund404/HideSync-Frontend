// src/components/dashboard/ProjectTimelineWidget.tsx
import React from 'react';
import { useProjects } from '../../context/ProjectContext';
import { ProjectStatus } from '../../types/enums';
import { Project } from '../../types/models';
import ProjectTimeline from '../projects/ProjectTimeline';

// Create an interface that matches what ProjectTimeline expects
interface ProjectWithStringId extends Omit<Project, 'id'> {
  id: string;
}

const ProjectTimelineWidget: React.FC = () => {
  const { projects, loading, error } = useProjects();

  // Find the most recent active project
  const activeProject = projects.find(
    (project) =>
      project.status !== ProjectStatus.COMPLETED &&
      project.status !== ProjectStatus.CANCELLED
  );

  // Convert the project to have a string ID if found
  const currentProject: ProjectWithStringId | undefined = activeProject
    ? {
        ...activeProject,
        id: activeProject.id.toString(), // Convert number ID to string
      }
    : undefined;

  if (loading) {
    return (
      <div className='bg-white rounded-lg shadow-sm border border-stone-200 p-6'>
        <div className='animate-pulse'>
          <div className='h-4 bg-stone-200 rounded w-1/3 mb-6'></div>
          <div className='space-y-4'>
            <div className='h-10 bg-stone-200 rounded'></div>
            <div className='h-20 bg-stone-200 rounded'></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !currentProject) {
    return (
      <div className='bg-white rounded-lg shadow-sm border border-stone-200 p-6'>
        <div className='text-center text-stone-500'>
          No active project timeline available
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
