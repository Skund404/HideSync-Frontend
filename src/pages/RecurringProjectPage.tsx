import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import RecurringProjectList from '../components/projects/RecurringProjectList';
import SetupRecurringProject from '../components/projects/SetupRecurringProject';
import RecurringProjectContext from '../context/RecurringProjectContext';
import { RecurringProject } from '../types/recurringProject';

const RecurringProjectPage: React.FC = () => {
  const { id, mode } = useParams<{ id?: string; mode?: string }>();
  const navigate = useNavigate();
  // Remove unused location variable

  // Get context
  const recurringProjectsContext = useContext(RecurringProjectContext);
  // Remove unused projectTemplatesContext

  const [loading, setLoading] = useState<boolean>(true);
  const [project, setProject] = useState<RecurringProject | null>(null);

  useEffect(() => {
    // Add a check for recurringProjectsContext being undefined
    if (!recurringProjectsContext) {
      console.error('Recurring Project Context not available');
      return;
    }

    const loadData = async () => {
      setLoading(true);

      try {
        // Load project if editing
        if (id && id !== 'new') {
          const fetchedProject =
            await recurringProjectsContext.getRecurringProjectById(id);
          if (fetchedProject) {
            setProject(fetchedProject);
          } else {
            console.error(`Recurring project with ID ${id} not found`);
            navigate('/projects/recurring');
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, recurringProjectsContext, navigate]);

  // Add early return if context is not available
  if (!recurringProjectsContext) {
    return <div>Error: Recurring Project Context not available</div>;
  }

  // Determine which view to show
  const renderContent = () => {
    // Show loading state
    if (loading) {
      return (
        <div className='flex justify-center items-center h-64'>
          <div className='spinner'></div>
        </div>
      );
    }

    // New project mode
    if (id === 'new' || mode === 'new') {
      return (
        <div>
          <h1 className='text-2xl font-bold mb-6'>Create Recurring Project</h1>
          <SetupRecurringProject
            existingId={undefined}
            onSave={(newId: string) => handleProjectCreated(newId)}
            onCancel={handleCancel}
          />
        </div>
      );
    }

    // Edit mode
    if (mode === 'edit' && project) {
      return (
        <div>
          <h1 className='text-2xl font-bold mb-6'>Edit Recurring Project</h1>
          <SetupRecurringProject
            existingId={id}
            onSave={(updatedId: string) => handleProjectUpdated(updatedId)}
            onCancel={handleCancel}
          />
        </div>
      );
    }

    // Detail view
    if (project) {
      return (
        <div>
          <div className='bg-white shadow rounded-lg overflow-hidden mb-6'>
            <div className='px-6 py-5 border-b border-gray-200 flex justify-between items-center'>
              <div>
                <h1 className='text-2xl font-bold text-gray-900'>
                  {project.name}
                </h1>
                <p className='mt-1 text-sm text-gray-500'>
                  {project.description}
                </p>
              </div>
              <div className='flex space-x-3'>
                <button
                  onClick={() =>
                    navigate(`/projects/recurring/${project.id}/edit`)
                  }
                  className='px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700'
                >
                  Edit
                </button>
                <button
                  onClick={() => handleGenerateProject()}
                  className='px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700'
                >
                  Generate Project
                </button>
              </div>
            </div>

            {/* Project details would go here */}
            <div className='px-6 py-5'>
              <h2 className='text-lg font-medium mb-4'>Project Details</h2>
              {/* Render project details */}
            </div>

            {/* Generated instances */}
            <div className='px-6 py-5 border-t border-gray-200'>
              <h2 className='text-lg font-medium mb-4'>Generated Instances</h2>
              {project.generatedProjects.length > 0 ? (
                <div className='space-y-2'>{/* List generated projects */}</div>
              ) : (
                <p className='text-gray-500'>
                  No instances have been generated yet.
                </p>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Default: List view
    return (
      <div>
        <div className='flex justify-between items-center mb-6'>
          <h1 className='text-2xl font-bold'>Recurring Projects</h1>
          <button
            onClick={() => navigate('/projects/recurring/new')}
            className='px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700'
          >
            Create Recurring Project
          </button>
        </div>
        <RecurringProjectList />
      </div>
    );
  };

  // Event handlers
  const handleProjectCreated = (recurringProjectId: string) => {
    navigate(`/projects/recurring/${recurringProjectId}`);
  };

  const handleProjectUpdated = (recurringProjectId: string) => {
    navigate(`/projects/recurring/${recurringProjectId}`);
  };

  const handleCancel = () => {
    if (id) {
      navigate(`/projects/recurring/${id}`);
    } else {
      navigate('/projects/recurring');
    }
  };

  const handleGenerateProject = async () => {
    if (!project) return;

    try {
      // Now we know recurringProjectsContext is defined because of the early return
      const projectId = await recurringProjectsContext.generateManualOccurrence(
        {
          recurringProjectId: project.id,
          scheduledDate: new Date().toISOString(),
        }
      );

      navigate(`/projects/${projectId}`);
    } catch (error) {
      console.error('Error generating project:', error);
    }
  };

  return <div className='container mx-auto px-4 py-6'>{renderContent()}</div>;
};

export default RecurringProjectPage;
