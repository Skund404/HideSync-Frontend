import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DocumentationEditor from '../components/documentation/editor/DocumentationEditor';
import { useDocumentation } from '../context/DocumentationContext';
import { DocumentationResource } from '../types/documentationTypes';

const EditDocumentation: React.FC = () => {
  const { resourceId } = useParams<{ resourceId: string }>();
  const navigate = useNavigate();
  const { resources, addResource, updateResource } = useDocumentation();
  const [initialResource, setInitialResource] = useState<
    Partial<DocumentationResource>
  >({});
  const [isLoading, setIsLoading] = useState(true);

  // Load resource data if editing existing resource
  useEffect(() => {
    if (resourceId === 'new') {
      setIsLoading(false);
      return;
    }

    const resource = resources.find((r) => r.id === resourceId);
    if (resource) {
      setInitialResource(resource);
    }
    setIsLoading(false);
  }, [resourceId, resources]);

  const handleSave = async (resource: DocumentationResource) => {
    try {
      if (resourceId === 'new') {
        await addResource(resource);
      } else {
        await updateResource(resource);
      }
      navigate('/documentation');
    } catch (error) {
      console.error('Error saving documentation:', error);
      // Show error message to user
    }
  };

  const handleCancel = () => {
    navigate('/documentation');
  };

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <div className='animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600'></div>
      </div>
    );
  }

  return (
    <div className='max-w-4xl mx-auto p-6'>
      <DocumentationEditor
        initialResource={initialResource}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default EditDocumentation;
