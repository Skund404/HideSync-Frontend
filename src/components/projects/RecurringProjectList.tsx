// src/components/projects/RecurringProjectList.tsx
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RecurringProjectContext, {
  RecurringProjectContextType,
} from '../../context/RecurringProjectContext';
import { ProjectType } from '../../types/enums';
import {
  calculateNextOccurrence,
  GeneratedProject,
  RecurringProject,
  RecurringProjectFilter,
} from '../../types/recurringProject';
import LoadingSpinner from '../common/LoadingSpinner';

interface RecurringProjectListProps {
  onSelectProject?: (recurringProjectId: string) => void;
  onCreateNew?: () => void;
  showCreateButton?: boolean;
  filterByClient?: string;
}

const RecurringProjectList: React.FC<RecurringProjectListProps> = ({
  onSelectProject,
  onCreateNew,
  showCreateButton = true,
  filterByClient,
}) => {
  const navigate = useNavigate();
  const context = useContext(
    RecurringProjectContext
  ) as RecurringProjectContextType;

  if (!context) {
    throw new Error(
      'RecurringProjectList must be used within a RecurringProjectProvider'
    );
  }

  const {
    getAllRecurringProjects,
    toggleRecurringProjectActive,
    deleteRecurringProject,
    generateManualOccurrence,
  } = context;

  const [recurringProjects, setRecurringProjects] = useState<
    RecurringProject[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filters, setFilters] = useState<RecurringProjectFilter>({
    clientId: filterByClient,
    isActive: undefined,
    searchText: '',
    projectType: undefined,
  });

  // Load recurring projects with filters
  useEffect(() => {
    const fetchRecurringProjects = async () => {
      setLoading(true);
      try {
        const fetchedProjects = await getAllRecurringProjects(filters);
        setRecurringProjects(fetchedProjects);
      } catch (error) {
        console.error('Error fetching recurring projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecurringProjects();
  }, [getAllRecurringProjects, filters]);

  // Handle selecting a recurring project
  const handleSelectProject = (projectId: string) => {
    if (onSelectProject) {
      onSelectProject(projectId);
    } else {
      navigate(`/projects/recurring/${projectId}`);
    }
  };

  // Handle toggling project active state
  const handleToggleActive = async (
    projectId: string,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();

    try {
      // Find the current project
      const project = recurringProjects.find((p) => p.id === projectId);
      if (!project) return;

      // Toggle the active state
      await toggleRecurringProjectActive(projectId, !project.isActive);

      // Update the projects list
      setRecurringProjects(
        recurringProjects.map((p) =>
          p.id === projectId ? { ...p, isActive: !p.isActive } : p
        )
      );
    } catch (error) {
      console.error('Error toggling recurring project active state:', error);
    }
  };

  // Handle deleting a recurring project
  const handleDeleteProject = async (
    projectId: string,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();

    if (
      window.confirm('Are you sure you want to delete this recurring project?')
    ) {
      try {
        await deleteRecurringProject(projectId);
        // Update the projects list
        setRecurringProjects(
          recurringProjects.filter((p) => p.id !== projectId)
        );
      } catch (error) {
        console.error('Error deleting recurring project:', error);
      }
    }
  };

  // Handle generating a manual occurrence
  const handleGenerateOccurrence = async (
    projectId: string,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();

    try {
      // Generate a new occurrence for this date (today as default)
      const generatedProjectId = await generateManualOccurrence({
        recurringProjectId: projectId,
        scheduledDate: new Date().toISOString(),
      });

      // Update UI to show success message or navigate to the new project
      navigate(`/projects/${generatedProjectId}`);
    } catch (error) {
      console.error('Error generating project occurrence:', error);
    }
  };

  // Handle creating a new recurring project
  const handleCreateNew = () => {
    if (onCreateNew) {
      onCreateNew();
    } else {
      navigate('/projects/recurring/new');
    }
  };

  // Handle filter change
  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name } = e.target;
    let value: string | undefined;

    if (e.target instanceof HTMLSelectElement) {
      value = e.target.value;
    } else {
      value = (e.target as HTMLInputElement).value; // Explicit cast to HTMLInputElement
    }

    setFilters((prev: RecurringProjectFilter) => ({
      ...prev,
      [name]: value || undefined,
    }));
  };

  // Handle activity filter change
  const handleActivityChange = (isActive: boolean | undefined) => {
    setFilters((prev: RecurringProjectFilter) => ({
      // Explicitly type 'prev'
      ...prev,
      isActive,
    }));
  };

  // Render filter panel
  const renderFilterPanel = () => (
    <div className='bg-white shadow rounded-lg p-4 mb-6'>
      <h3 className='text-lg font-medium text-gray-800 mb-3'>Filters</h3>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        {/* Search by name/description */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Search
          </label>
          <input
            type='text'
            name='searchText'
            className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
            value={filters.searchText || ''}
            onChange={handleFilterChange}
            placeholder='Search by name or description'
          />
        </div>

        {/* Filter by project type */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Project Type
          </label>
          <select
            name='projectType'
            className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
            value={filters.projectType || ''}
            onChange={handleFilterChange}
          >
            <option value=''>Any Type</option>
            {Object.values(ProjectType).map((type) => (
              <option key={type} value={type}>
                {type.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>

        {/* Filter by active status */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Status
          </label>
          <div className='flex space-x-4'>
            <label className='inline-flex items-center'>
              <input
                type='radio'
                className='form-radio'
                checked={filters.isActive === undefined}
                onChange={() => handleActivityChange(undefined)}
              />
              <span className='ml-2'>All</span>
            </label>
            <label className='inline-flex items-center'>
              <input
                type='radio'
                className='form-radio'
                checked={filters.isActive === true}
                onChange={() => handleActivityChange(true)}
              />
              <span className='ml-2'>Active</span>
            </label>
            <label className='inline-flex items-center'>
              <input
                type='radio'
                className='form-radio'
                checked={filters.isActive === false}
                onChange={() => handleActivityChange(false)}
              />
              <span className='ml-2'>Inactive</span>
            </label>
          </div>
        </div>
      </div>

      <div className='mt-4 flex justify-between'>
        <button
          className='px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
          onClick={() =>
            setFilters({
              clientId: filterByClient,
              isActive: undefined,
              searchText: '',
              projectType: undefined,
            })
          }
        >
          Clear Filters
        </button>

        {showCreateButton && (
          <button
            className='px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
            onClick={handleCreateNew}
          >
            Create Recurring Project
          </button>
        )}
      </div>
    </div>
  );

  // Render generated projects list
  const renderGeneratedProjects = (generatedProjects: GeneratedProject[]) => {
    if (generatedProjects.length === 0) {
      return (
        <p className='text-sm text-gray-500'>No projects generated yet.</p>
      );
    }

    // Sort by scheduled date (newest first)
    const sortedProjects = [...generatedProjects].sort((a, b) => {
      return (
        new Date(b.scheduledDate).getTime() -
        new Date(a.scheduledDate).getTime()
      );
    });

    // Show only the last 3 generated projects
    const recentProjects = sortedProjects.slice(0, 3);

    return (
      <div className='space-y-2'>
        {recentProjects.map((genProject) => (
          <div
            key={genProject.id}
            className='flex justify-between items-center p-2 bg-gray-50 rounded-md text-sm'
          >
            <div>
              <span className='font-medium'>
                {new Date(genProject.scheduledDate).toLocaleDateString()}
              </span>
              <span
                className={`ml-2 ${
                  genProject.status === 'generated'
                    ? 'text-green-600'
                    : genProject.status === 'scheduled'
                    ? 'text-blue-600'
                    : genProject.status === 'skipped'
                    ? 'text-yellow-600'
                    : 'text-red-600'
                }`}
              >
                {genProject.status}
              </span>
            </div>
            <button
              onClick={() => navigate(`/projects/${genProject.projectId}`)}
              className='text-xs text-indigo-600 hover:text-indigo-800'
            >
              View Project
            </button>
          </div>
        ))}
        {sortedProjects.length > 3 && (
          <p className='text-xs text-gray-500 text-right'>
            +{sortedProjects.length - 3} more
          </p>
        )}
      </div>
    );
  };

  // Render recurring project card
  const renderProjectCard = (project: RecurringProject) => {
    // Calculate next occurrence date
    const nextDate = project.nextOccurrence
      ? new Date(project.nextOccurrence)
      : project.recurrencePattern
      ? calculateNextOccurrence(project.recurrencePattern)
      : null;

    return (
      <div
        key={project.id}
        className='bg-white shadow rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-200'
        onClick={() => handleSelectProject(project.id)}
      >
        <div className='px-4 py-5 sm:px-6 flex justify-between items-start'>
          <div>
            <h3 className='text-lg font-medium text-gray-900'>
              {project.name}
            </h3>
            <p className='text-sm text-gray-500 mt-1'>{project.description}</p>
          </div>
          <div className='flex'>
            {project.isActive ? (
              <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
                Active
              </span>
            ) : (
              <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800'>
                Inactive
              </span>
            )}
          </div>
        </div>
        <div className='border-t border-gray-200 px-4 py-5 sm:p-0'>
          <dl className='sm:divide-y sm:divide-gray-200'>
            <div className='py-3 sm:py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
              <dt className='text-sm font-medium text-gray-500'>
                Project Type
              </dt>
              <dd className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2'>
                {project.projectType.replace(/_/g, ' ')}
              </dd>
            </div>
            <div className='py-3 sm:py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
              <dt className='text-sm font-medium text-gray-500'>Recurrence</dt>
              <dd className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2'>
                Every {project.recurrencePattern.interval}{' '}
                {project.recurrencePattern.frequency.toLowerCase()}
                {project.recurrencePattern.interval > 1 ? 's' : ''}
              </dd>
            </div>
            <div className='py-3 sm:py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
              <dt className='text-sm font-medium text-gray-500'>
                Next Occurrence
              </dt>
              <dd className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2'>
                {nextDate
                  ? nextDate.toLocaleDateString()
                  : project.isActive
                  ? 'Calculating...'
                  : 'Not scheduled (inactive)'}
              </dd>
            </div>
            <div className='py-3 sm:py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
              <dt className='text-sm font-medium text-gray-500'>
                Generated Projects
              </dt>
              <dd className='mt-1 text-sm sm:mt-0 sm:col-span-2'>
                {renderGeneratedProjects(project.generatedProjects)}
              </dd>
            </div>
            <div className='py-3 sm:py-4 sm:px-6'>
              <div className='flex justify-end space-x-3'>
                <button
                  onClick={(e) => handleToggleActive(project.id, e)}
                  className={`inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md ${
                    project.isActive
                      ? 'text-amber-700 bg-amber-100 hover:bg-amber-200'
                      : 'text-green-700 bg-green-100 hover:bg-green-200'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                >
                  {project.isActive ? 'Deactivate' : 'Activate'}
                </button>

                {project.isActive && (
                  <button
                    onClick={(e) => handleGenerateOccurrence(project.id, e)}
                    className='inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                  >
                    Generate Now
                  </button>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/projects/recurring/${project.id}/edit`);
                  }}
                  className='inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                >
                  Edit
                </button>

                <button
                  onClick={(e) => handleDeleteProject(project.id, e)}
                  className='inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                >
                  Delete
                </button>
              </div>
            </div>
          </dl>
        </div>
      </div>
    );
  };

  return (
    <div className='space-y-6'>
      {renderFilterPanel()}

      {loading ? (
        <div className='flex justify-center my-12'>
          <LoadingSpinner />
        </div>
      ) : (
        <div>
          {recurringProjects.length > 0 ? (
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              {recurringProjects.map(renderProjectCard)}
            </div>
          ) : (
            <div className='text-center py-12 bg-white shadow rounded-lg'>
              <p className='text-sm text-gray-500'>
                No recurring projects found matching your filters.
              </p>
              {showCreateButton && (
                <button
                  className='mt-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                  onClick={handleCreateNew}
                >
                  Create Recurring Project
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RecurringProjectList;
