// src/components/projects/SaveAsTemplate.tsx
import { useProjects } from '@context/ProjectContext';
import { useProjectTemplates } from '@context/ProjectTemplateContext';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const SaveAsTemplate: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { getProjectById } = useProjects();
  const { saveProjectAsTemplate, loading } = useProjectTemplates();
  const navigate = useNavigate();

  const [templateName, setTemplateName] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [tags, setTags] = useState('');

  // Convert string ID to number for API call
  const numericProjectId = projectId ? parseInt(projectId, 10) : undefined;
  const project =
    numericProjectId && !isNaN(numericProjectId)
      ? getProjectById(numericProjectId)
      : null;

  // Pre-fill template name based on project
  useEffect(() => {
    if (templateName === '' && project) {
      setTemplateName(`${project.name} Template`);
    }
  }, [project, templateName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!projectId) return;

    try {
      // Process tags
      const tagArray = tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);

      // Create options object with tags and isPublic
      const options = {
        isPublic,
        tags: tagArray,
      };

      // Make sure projectId is properly converted to the expected type
      // This depends on how saveProjectAsTemplate is implemented
      // If it expects a number:
      if (numericProjectId && !isNaN(numericProjectId)) {
        await saveProjectAsTemplate(
          numericProjectId.toString(),
          templateName,
          options
        );
      } else {
        throw new Error('Invalid project ID');
      }

      // Navigate to templates page
      navigate('/templates');
    } catch (error) {
      console.error('Failed to save project as template', error);
    }
  };

  if (!project) {
    return <div className='p-4 text-red-600'>Project not found</div>;
  }

  return (
    <div className='max-w-2xl mx-auto p-6'>
      <h2 className='text-2xl font-bold mb-6'>Save Project as Template</h2>

      <div className='bg-white shadow-sm rounded-lg border border-stone-200 p-6'>
        <div className='mb-6'>
          <h3 className='text-lg font-medium'>Project: {project.name}</h3>
          <p className='text-sm text-stone-500 mt-1'>
            Creating a template will allow you to quickly start similar projects
            in the future.
          </p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label
              htmlFor='templateName'
              className='block text-sm font-medium text-stone-700 mb-1'
            >
              Template Name*
            </label>
            <input
              type='text'
              id='templateName'
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className='w-full border border-stone-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent'
              required
            />
          </div>

          <div>
            <label
              htmlFor='tags'
              className='block text-sm font-medium text-stone-700 mb-1'
            >
              Tags (comma separated)
            </label>
            <input
              type='text'
              id='tags'
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder='wallet, leather, handmade'
              className='w-full border border-stone-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent'
            />
          </div>

          <div className='flex items-center'>
            <input
              type='checkbox'
              id='isPublic'
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className='h-4 w-4 text-amber-600 focus:ring-amber-500 border-stone-300 rounded'
            />
            <label
              htmlFor='isPublic'
              className='ml-2 block text-sm text-stone-700'
            >
              Make this template available to all team members
            </label>
          </div>

          <div className='pt-4 border-t border-stone-200 flex justify-end space-x-3'>
            <button
              type='button'
              onClick={() => navigate(`/projects/${projectId}`)}
              className='px-4 py-2 border border-stone-300 rounded-md text-stone-700 bg-white hover:bg-stone-50'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={loading}
              className='px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 flex items-center'
            >
              {loading ? (
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
                  Saving...
                </>
              ) : (
                'Save as Template'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SaveAsTemplate;
