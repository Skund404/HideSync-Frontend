import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ProjectTemplateList from '../components/projects/ProjectTemplateList';
import { useProjectTemplates } from '../context/ProjectTemplateContext';
import { ProjectTemplate } from '../types/projectTemplate';

// These components need to be created or imported properly
// Let's assume they exist for now
const TemplateForm = ({
  template,
  onSave,
  onCancel,
}: {
  template?: ProjectTemplate;
  onSave: (templateId: string) => void;
  onCancel: () => void;
}) => <div>Template Form</div>;

const TemplateDetail = ({ template }: { template: ProjectTemplate }) => (
  <div>Template Detail</div>
);

const ProjectTemplatePage: React.FC = () => {
  const { id, mode } = useParams<{ id?: string; mode?: string }>();
  const navigate = useNavigate();

  // Get context properly
  const templateContext = useProjectTemplates();

  const [loading, setLoading] = useState<boolean>(true);
  const [template, setTemplate] = useState<ProjectTemplate | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      try {
        // Load template if editing
        if (id && id !== 'new') {
          const fetchedTemplate = templateContext.getTemplateById(id);
          if (fetchedTemplate) {
            setTemplate(fetchedTemplate);
          } else {
            console.error(`Template with ID ${id} not found`);
            navigate('/templates');
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, templateContext, navigate]);

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

    // New template mode
    if (id === 'new' || mode === 'new') {
      return (
        <div>
          <h1 className='text-2xl font-bold mb-6'>Create Project Template</h1>
          <TemplateForm
            onSave={(templateId: string) => handleTemplateSaved(templateId)}
            onCancel={handleCancel}
          />
        </div>
      );
    }

    // Edit mode
    if (mode === 'edit' && template) {
      return (
        <div>
          <h1 className='text-2xl font-bold mb-6'>Edit Project Template</h1>
          <TemplateForm
            template={template}
            onSave={(templateId: string) => handleTemplateSaved(templateId)}
            onCancel={handleCancel}
          />
        </div>
      );
    }

    // Detail view
    if (template) {
      return (
        <div>
          <div className='bg-white shadow rounded-lg overflow-hidden mb-6'>
            <div className='px-6 py-5 border-b border-gray-200 flex justify-between items-center'>
              <div>
                <h1 className='text-2xl font-bold text-gray-900'>
                  {template.name}
                </h1>
                <p className='mt-1 text-sm text-gray-500'>
                  {template.description}
                </p>
              </div>
              <div className='flex space-x-3'>
                <button
                  onClick={() => navigate(`/templates/${template.id}/edit`)}
                  className='px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700'
                >
                  Edit
                </button>
                <button
                  onClick={() => handleUseTemplate()}
                  className='px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700'
                >
                  Use Template
                </button>
              </div>
            </div>

            {/* Template details */}
            <div className='px-6 py-5'>
              <TemplateDetail template={template} />
            </div>
          </div>
        </div>
      );
    }

    // Default: List view
    return (
      <div>
        <div className='flex justify-between items-center mb-6'>
          <h1 className='text-2xl font-bold'>Project Templates</h1>
          <button
            onClick={() => navigate('/templates/new')}
            className='px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700'
          >
            Create Template
          </button>
        </div>
        <ProjectTemplateList />
      </div>
    );
  };

  // Event handlers
  const handleTemplateSaved = (templateId: string) => {
    navigate(`/templates/${templateId}`);
  };

  const handleCancel = () => {
    if (id) {
      navigate(`/templates/${id}`);
    } else {
      navigate('/templates');
    }
  };

  const handleUseTemplate = () => {
    if (!template) return;
    navigate(`/projects/new?template=${template.id}`);
  };

  // Handle creating from template
  const renderCreateFromTemplate = () => {
    return (
      <div>
        <h1 className='text-2xl font-bold mb-6'>Create Template</h1>
        <TemplateForm
          onSave={(templateId: string) => handleTemplateSaved(templateId)}
          onCancel={handleCancel}
        />
      </div>
    );
  };

  return <div className='container mx-auto px-4 py-6'>{renderContent()}</div>;
};

export default ProjectTemplatePage;
