import React, { useState } from 'react';

// Explicitly define types to avoid import issues
interface Client {
  name: string;
}

interface Component {
  name?: string;
}

interface Material {
  name?: string;
}

interface Project {
  id: string;
  name: string;
  status: string;
  type: string;
  client?: Client;
  startDate?: Date | string;
  deadline?: Date | string;
  completedDate?: Date | string;
  skillLevel?: string;
  progress?: number;
  components?: Component[];
  materials?: Material[];
  notes?: string;
}

interface ProjectDetailProps {
  project: Project;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ project }) => {
  const [showCriticalPath, setShowCriticalPath] = useState(true);

  // Simplified ProjectTimeline component for type safety
  const ProjectTimeline: React.FC<{
    project: Project;
    showCriticalPath: boolean;
  }> = () => null;

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <h2 className='text-2xl font-bold'>{project.name}</h2>
        <div>
          <button
            className='px-4 py-2 bg-amber-100 text-amber-800 rounded-md text-sm font-medium'
            onClick={() => setShowCriticalPath(!showCriticalPath)}
          >
            {showCriticalPath ? 'Hide Critical Path' : 'Show Critical Path'}
          </button>
        </div>
      </div>

      <ProjectTimeline project={project} showCriticalPath={showCriticalPath} />

      {/* Project details section */}
      <div className='bg-white p-6 rounded-lg shadow-sm border border-stone-200'>
        <h3 className='font-medium text-lg mb-4'>Project Details</h3>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* Left column - general info */}
          <div className='space-y-4'>
            <div>
              <h4 className='text-sm font-medium text-stone-500'>Status</h4>
              <div className='mt-1'>
                <span className='px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                  {formatStatus(project.status)}
                </span>
              </div>
            </div>

            <div>
              <h4 className='text-sm font-medium text-stone-500'>Type</h4>
              <p className='mt-1 text-sm text-stone-700'>
                {formatType(project.type)}
              </p>
            </div>

            <div>
              <h4 className='text-sm font-medium text-stone-500'>Client</h4>
              <p className='mt-1 text-sm text-stone-700'>
                {project.client?.name || 'No client assigned'}
              </p>
            </div>

            <div>
              <h4 className='text-sm font-medium text-stone-500'>Timeline</h4>
              <div className='mt-1 text-sm text-stone-700 space-y-1'>
                <div>Start: {formatDate(project.startDate)}</div>
                {project.deadline && (
                  <div>Deadline: {formatDate(project.deadline)}</div>
                )}
                {project.completedDate && (
                  <div>Completed: {formatDate(project.completedDate)}</div>
                )}
              </div>
            </div>

            <div>
              <h4 className='text-sm font-medium text-stone-500'>
                Skill Level
              </h4>
              <p className='mt-1 text-sm text-stone-700'>
                {formatSkillLevel(project.skillLevel)}
              </p>
            </div>
          </div>

          {/* Right column - additional details */}
          <div className='space-y-4'>
            <div>
              <h4 className='text-sm font-medium text-stone-500'>Progress</h4>
              <div className='mt-2'>
                <div className='flex justify-between text-xs text-stone-500 mb-1'>
                  <span>Progress</span>
                  <span>{project.progress || 0}%</span>
                </div>
                <div className='w-full bg-stone-200 rounded-full h-2'>
                  <div
                    className='bg-amber-500 h-2 rounded-full'
                    style={{ width: `${project.progress || 0}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div>
              <h4 className='text-sm font-medium text-stone-500'>Components</h4>
              <div className='mt-1'>
                {project.components && project.components.length > 0 ? (
                  <div className='flex flex-wrap gap-2 mt-2'>
                    {project.components.slice(0, 5).map((component, index) => (
                      <span
                        key={index}
                        className='px-2 py-1 bg-stone-100 rounded-md text-xs text-stone-700'
                      >
                        {component.name || `Component ${index + 1}`}
                      </span>
                    ))}
                    {project.components.length > 5 && (
                      <span className='px-2 py-1 bg-stone-100 rounded-md text-xs text-stone-700'>
                        +{project.components.length - 5} more
                      </span>
                    )}
                  </div>
                ) : (
                  <p className='text-sm text-stone-500'>
                    No components added yet
                  </p>
                )}
              </div>
            </div>

            <div>
              <h4 className='text-sm font-medium text-stone-500'>Materials</h4>
              <div className='mt-1'>
                {project.materials && project.materials.length > 0 ? (
                  <div className='flex flex-wrap gap-2 mt-2'>
                    {project.materials.slice(0, 5).map((material, index) => (
                      <span
                        key={index}
                        className='px-2 py-1 bg-blue-50 rounded-md text-xs text-blue-700'
                      >
                        {material.name || `Material ${index + 1}`}
                      </span>
                    ))}
                    {project.materials.length > 5 && (
                      <span className='px-2 py-1 bg-blue-50 rounded-md text-xs text-blue-700'>
                        +{project.materials.length - 5} more
                      </span>
                    )}
                  </div>
                ) : (
                  <p className='text-sm text-stone-500'>
                    No materials assigned yet
                  </p>
                )}
              </div>
            </div>

            <div>
              <h4 className='text-sm font-medium text-stone-500'>Notes</h4>
              <p className='mt-1 text-sm text-stone-700 whitespace-pre-line'>
                {project.notes || 'No notes added'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className='flex justify-end space-x-3'>
        <button className='px-4 py-2 border border-stone-300 rounded-md text-stone-700 bg-white hover:bg-stone-50'>
          Edit Project
        </button>
        <button className='px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700'>
          Update Status
        </button>
      </div>
    </div>
  );
};

// Helper functions for formatting display text
const formatStatus = (status?: string): string => {
  if (!status) return 'No Status';
  return status
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());
};

const formatType = (type?: string): string => {
  if (!type) return 'No Type';
  return type
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());
};

const formatSkillLevel = (level?: string): string => {
  if (!level) return 'Not Specified';
  return level
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());
};

const formatDate = (date?: Date | string): string => {
  if (!date) return '';

  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export default ProjectDetail;
