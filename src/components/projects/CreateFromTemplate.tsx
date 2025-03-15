// src/components/projects/CreateFromTemplate.tsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useProjects } from '../../context/ProjectContext';
import { useProjectTemplates } from '../../context/ProjectTemplateContext';
import { ProjectTemplate } from '../../types/projectTemplate';
import ProjectTemplateList from './ProjectTemplateList';

const CreateFromTemplate: React.FC = () => {
  const { templateId } = useParams<{ templateId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // Parse query parameters
  const queryParams = new URLSearchParams(location.search);
  const queryTemplateId = queryParams.get('template');

  // Get contexts
  const { getTemplateById, createProjectFromTemplate, loading, error } =
    useProjectTemplates();
  const { customers } = useProjects(); // Assuming you have a customers context

  // Component state
  const [selectedTemplate, setSelectedTemplate] =
    useState<ProjectTemplate | null>(null);
  const [projectName, setProjectName] = useState('');
  const [clientId, setClientId] = useState('');
  const [deadline, setDeadline] = useState('');
  const [notes, setNotes] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Load template if ID is provided in URL or query param
  useEffect(() => {
    const idToUse = templateId || queryTemplateId;

    if (idToUse) {
      const template = getTemplateById(idToUse);
      if (template) {
        setSelectedTemplate(template);
        setProjectName(`${template.name} - ${new Date().toLocaleDateString()}`);
        setNotes(template.notes || '');
      } else {
        setCreateError(`Template with ID ${idToUse} not found`);
      }
    }
  }, [templateId, queryTemplateId, getTemplateById]);

  // Handle template selection from list
  const handleSelectTemplate = (template: ProjectTemplate) => {
    setSelectedTemplate(template);
    setProjectName(`${template.name} - ${new Date().toLocaleDateString()}`);
    setNotes(template.notes || '');
    // Reset any previous errors
    setCreateError(null);
  };

  // Calculate default deadline based on template's estimated duration
  const getDefaultDeadline = (): string => {
    if (!selectedTemplate) return '';

    const date = new Date();
    date.setDate(date.getDate() + (selectedTemplate.estimatedDuration || 7));

    // Format as YYYY-MM-DD for input[type="date"]
    return date.toISOString().split('T')[0];
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTemplate) {
      setCreateError('Please select a template first');
      return;
    }

    try {
      setCreating(true);
      setCreateError(null);

      const project = await createProjectFromTemplate({
        templateId: selectedTemplate.id,
        projectName: projectName.trim(),
        clientId: clientId || undefined,
        deadline: deadline ? new Date(deadline) : undefined,
        customizations: {
          notes: notes.trim() || undefined,
        },
      });

      // Show success message
      setShowSuccess(true);

      // Redirect to the new project
      setTimeout(() => {
        navigate(`/projects/${project.id}`);
      }, 1500);
    } catch (err) {
      console.error('Error creating project from template:', err);
      setCreateError(
        `Failed to create project: ${
          err instanceof Error ? err.message : 'Unknown error'
        }`
      );
    } finally {
      setCreating(false);
    }
  };

  // Reset selection and form
  const handleChangeTemplate = () => {
    setSelectedTemplate(null);
    setProjectName('');
    setClientId('');
    setDeadline('');
    setNotes('');
    setCreateError(null);
  };

  return (
    <div className='space-y-6'>
      <h2 className='text-2xl font-bold'>Create Project from Template</h2>

      {error && (
        <div className='p-4 bg-red-50 text-red-700 rounded-lg mb-6'>
          <p className='font-medium'>Error loading templates</p>
          <p className='text-sm mt-1'>{error}</p>
        </div>
      )}

      {/* Template selection view */}
      {!selectedTemplate ? (
        <div>
          <p className='mb-4 text-stone-600'>
            Select a template to create your new project:
          </p>
          <ProjectTemplateList
            onSelectTemplate={handleSelectTemplate}
            showActions={false}
            title='Available Templates'
          />
        </div>
      ) : (
        <div className='bg-white shadow-sm rounded-lg border border-stone-200 p-6'>
          {/* Template info header */}
          <div className='flex justify-between items-start mb-6'>
            <div>
              <h3 className='text-lg font-medium'>{selectedTemplate.name}</h3>
              <p className='text-sm text-stone-500 mt-1'>
                {selectedTemplate.description || 'No description provided'}
              </p>
              <div className='mt-2 flex flex-wrap gap-1'>
                {selectedTemplate.tags.map((tag) => (
                  <span
                    key={tag}
                    className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-800'
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={handleChangeTemplate}
              className='text-sm text-amber-600 hover:text-amber-800 font-medium'
            >
              Change Template
            </button>
          </div>

          {/* Success message */}
          {showSuccess && (
            <div className='mb-6 p-4 bg-green-50 text-green-700 rounded-md'>
              <p className='font-medium'>Project created successfully!</p>
              <p className='text-sm mt-1'>Redirecting to project page...</p>
            </div>
          )}

          {/* Project creation form */}
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
              <label
                htmlFor='projectName'
                className='block text-sm font-medium text-stone-700 mb-1'
              >
                Project Name*
              </label>
              <input
                type='text'
                id='projectName'
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className='w-full border border-stone-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent'
                required
                disabled={creating || showSuccess}
              />
            </div>

            <div>
              <label
                htmlFor='client'
                className='block text-sm font-medium text-stone-700 mb-1'
              >
                Client
              </label>
              <select
                id='client'
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className='w-full border border-stone-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent'
                disabled={creating || showSuccess}
              >
                <option value=''>-- Select Client --</option>
                {customers?.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor='deadline'
                className='block text-sm font-medium text-stone-700 mb-1'
              >
                Deadline
              </label>
              <input
                type='date'
                id='deadline'
                value={deadline || getDefaultDeadline()}
                onChange={(e) => setDeadline(e.target.value)}
                className='w-full border border-stone-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent'
                disabled={creating || showSuccess}
              />
              <p className='text-xs text-stone-500 mt-1'>
                {!deadline &&
                  `Default: ${selectedTemplate.estimatedDuration} days from today`}
              </p>
            </div>

            <div>
              <label
                htmlFor='notes'
                className='block text-sm font-medium text-stone-700 mb-1'
              >
                Project Notes
              </label>
              <textarea
                id='notes'
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className='w-full border border-stone-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent'
                disabled={creating || showSuccess}
              />
            </div>

            {/* Creation error message */}
            {createError && (
              <div className='p-3 bg-red-50 text-red-700 rounded-md'>
                <p className='text-sm'>{createError}</p>
              </div>
            )}

            {/* Form actions */}
            <div className='pt-4 border-t border-stone-200 flex justify-end space-x-3'>
              <button
                type='button'
                onClick={() => navigate('/projects')}
                className='px-4 py-2 border border-stone-300 rounded-md text-stone-700 bg-white hover:bg-stone-50 text-sm font-medium'
                disabled={creating || showSuccess}
              >
                Cancel
              </button>
              <button
                type='submit'
                disabled={creating || showSuccess || !selectedTemplate}
                className='px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 flex items-center text-sm font-medium transition'
              >
                {creating ? (
                  <>
                    <svg
                      className='animate-spin -ml-1 mr-2 h-4 w-4 text-white'
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'
                    >
                      <circle
                        className='opacity-25'
                        cx='12'
                        cy='12'
                        r='10'
                        stroke='currentColor'
                        strokeWidth='4'
                      ></circle>
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                      ></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  'Create Project'
                )}
              </button>
            </div>
          </form>

          {/* Template details section */}
          <div className='mt-8 pt-6 border-t border-stone-200'>
            <h4 className='text-sm font-medium text-stone-700 mb-2'>
              Template Details
            </h4>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
              <div>
                <span className='text-stone-500'>Type:</span>{' '}
                <span className='text-stone-700'>
                  {selectedTemplate.type.replace(/_/g, ' ')}
                </span>
              </div>
              <div>
                <span className='text-stone-500'>Skill Level:</span>{' '}
                <span className='text-stone-700'>
                  {selectedTemplate.skillLevel.replace(/_/g, ' ')}
                </span>
              </div>
              <div>
                <span className='text-stone-500'>Estimated Duration:</span>{' '}
                <span className='text-stone-700'>
                  {selectedTemplate.estimatedDuration} days
                </span>
              </div>
              <div>
                <span className='text-stone-500'>Components:</span>{' '}
                <span className='text-stone-700'>
                  {selectedTemplate.components.length}
                </span>
              </div>
              <div>
                <span className='text-stone-500'>Materials:</span>{' '}
                <span className='text-stone-700'>
                  {selectedTemplate.materials.length}
                </span>
              </div>
              <div>
                <span className='text-stone-500'>Version:</span>{' '}
                <span className='text-stone-700'>
                  {selectedTemplate.version}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateFromTemplate;
