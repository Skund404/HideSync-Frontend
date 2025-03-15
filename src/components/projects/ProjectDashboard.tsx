// src/components/projects/ProjectDashboard.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../../context/ProjectContext';
import { useProjectTemplates } from '../../context/ProjectTemplateContext';
import { useRecurringProjects } from '../../context/RecurringProjectContext';
import { ProjectStatus } from '../../types/enums';

const ProjectDashboard: React.FC = () => {
  const { projects, loading: projectsLoading } = useProjects();
  const { templates, loading: templatesLoading } = useProjectTemplates();
  const { recurringProjects, loading: recurringLoading } =
    useRecurringProjects();
  const navigate = useNavigate();

  const activeProjects = projects.filter(
    (p) =>
      p.status !== ProjectStatus.COMPLETED &&
      p.status !== ProjectStatus.CANCELLED
  );

  // Fix for date sorting - handle undefined dates safely
  const upcomingDeadlines = [...activeProjects]
    .sort((a, b) => {
      const dateA = a.dueDate
        ? new Date(a.dueDate).getTime()
        : Number.MAX_SAFE_INTEGER;
      const dateB = b.dueDate
        ? new Date(b.dueDate).getTime()
        : Number.MAX_SAFE_INTEGER;
      return dateA - dateB;
    })
    .slice(0, 5);

  const loading = projectsLoading || templatesLoading || recurringLoading;

  if (loading) {
    return (
      <div className='p-8 flex justify-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600'></div>
      </div>
    );
  }

  return (
    <div className='p-6'>
      <h1 className='text-2xl font-bold mb-6'>Project Dashboard</h1>

      {/* Quick stats */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
        <div className='bg-white p-6 rounded-lg shadow-sm border border-stone-200'>
          <h2 className='text-lg font-medium mb-2'>Active Projects</h2>
          <p className='text-3xl font-bold text-amber-600'>
            {activeProjects.length}
          </p>
          <button
            onClick={() => navigate('/projects')}
            className='mt-4 text-amber-600 hover:text-amber-800 text-sm font-medium'
          >
            View All
          </button>
        </div>

        <div className='bg-white p-6 rounded-lg shadow-sm border border-stone-200'>
          <h2 className='text-lg font-medium mb-2'>Project Templates</h2>
          <p className='text-3xl font-bold text-blue-600'>{templates.length}</p>
          <button
            onClick={() => navigate('/projects/templates')}
            className='mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium'
          >
            View Templates
          </button>
        </div>

        <div className='bg-white p-6 rounded-lg shadow-sm border border-stone-200'>
          <h2 className='text-lg font-medium mb-2'>Recurring Projects</h2>
          <p className='text-3xl font-bold text-green-600'>
            {recurringProjects.length}
          </p>
          <button
            onClick={() => navigate('/projects/recurring')}
            className='mt-4 text-green-600 hover:text-green-800 text-sm font-medium'
          >
            Manage Recurring
          </button>
        </div>
      </div>

      {/* Upcoming deadlines */}
      <div className='bg-white p-6 rounded-lg shadow-sm border border-stone-200 mb-8'>
        <h2 className='text-lg font-medium mb-4'>Upcoming Deadlines</h2>
        {upcomingDeadlines.length > 0 ? (
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-stone-200'>
              <thead className='bg-stone-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'>
                    Project
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'>
                    Due Date
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'>
                    Status
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider'>
                    Progress
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-stone-200'>
                {upcomingDeadlines.map((project) => (
                  <tr key={project.id} className='hover:bg-stone-50'>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <button
                        className='text-amber-600 hover:text-amber-800 font-medium'
                        onClick={() => navigate(`/projects/${project.id}`)}
                      >
                        {project.name}
                      </button>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      {project.dueDate
                        ? new Date(project.dueDate).toLocaleDateString()
                        : 'No deadline'}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${
                          project.status === ProjectStatus.IN_PROGRESS
                            ? 'bg-green-100 text-green-800'
                            : project.status === ProjectStatus.PLANNING
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {project.status}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='w-full bg-stone-200 rounded-full h-2.5'>
                        <div
                          className='bg-amber-600 h-2.5 rounded-full'
                          style={{
                            width: `${
                              (project as any).completionPercentage ?? 0
                            }%`,
                          }}
                        ></div>
                      </div>
                      <span className='text-xs text-stone-500 mt-1'>
                        {(project as any).completionPercentage ?? 0}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className='text-stone-500'>No upcoming deadlines.</p>
        )}
      </div>

      {/* Quick actions */}
      <div className='bg-white p-6 rounded-lg shadow-sm border border-stone-200'>
        <h2 className='text-lg font-medium mb-4'>Quick Actions</h2>
        <div className='flex flex-wrap gap-4'>
          <button
            onClick={() => navigate('/projects/new')}
            className='px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700'
          >
            New Project
          </button>
          <button
            onClick={() => navigate('/projects/templates/new')}
            className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'
          >
            Create Template
          </button>
          <button
            onClick={() => navigate('/projects/recurring/new')}
            className='px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700'
          >
            Setup Recurring Project
          </button>
          <button
            onClick={() => navigate('/projects/picking-lists')}
            className='px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700'
          >
            Picking Lists
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectDashboard;
