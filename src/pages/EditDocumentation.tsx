// src/pages/EditDocumentation.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { DocumentationProvider } from '@/context/DocumentationContext';
import { useDocumentation } from '@/context/DocumentationContext';
import DocumentationEditor from '@/components/documentation/editor/DocumentationEditor';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import { ChevronLeft } from 'lucide-react';
import { DocumentationResource } from '@/types/documentationTypes';

// Wrapper component to use the context
const EditDocumentationContent: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    currentResource, 
    loading, 
    error, 
    fetchResourceById,
    createResource,
    updateResource
  } = useDocumentation();
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  const isNew = id === 'new';
  
  useEffect(() => {
    if (!isNew && id) {
      fetchResourceById(id);
    }
  }, [isNew, id, fetchResourceById]);
  
  const handleSave = async (resource: Omit<DocumentationResource, 'id'> | DocumentationResource) => {
    setIsSaving(true);
    setSaveError(null);
    
    try {
      if (isNew) {
        // For new resources
        const newResource = await createResource(resource as Omit<DocumentationResource, 'id'>);
        navigate(`/documentation/article/${newResource.id}`);
      } else if (id) {
        // For existing resources
        await updateResource(id, resource as Partial<DocumentationResource>);
        navigate(`/documentation/article/${id}`);
      }
    } catch (err: any) {
      console.error('Failed to save document:', err);
      setSaveError(err.message || 'Failed to save document. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleCancel = () => {
    if (isNew) {
      navigate('/documentation');
    } else if (id) {
      navigate(`/documentation/article/${id}`);
    } else {
      navigate('/documentation');
    }
  };
  
  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6">
      <div className="mb-6">
        <Link 
          to={isNew ? '/documentation' : `/documentation/article/${id}`}
          className="inline-flex items-center text-amber-600 hover:text-amber-800"
        >
          <ChevronLeft size={16} className="mr-1" />
          {isNew ? 'Back to Documentation' : 'Back to Article'}
        </Link>
      </div>
      
      <h1 className="text-2xl font-bold mb-6">
        {isNew ? 'Create New Document' : `Edit: ${currentResource?.title || 'Loading...'}`}
      </h1>
      
      {saveError && (
        <div className="mb-6">
          <ErrorMessage message={saveError} onRetry={() => setSaveError(null)} />
        </div>
      )}
      
      {!isNew && loading && !currentResource ? (
        <div className="py-12">
          <LoadingSpinner message="Loading document..." />
        </div>
      ) : !isNew && error ? (
        <ErrorMessage 
          message={`Failed to load document: ${error}`} 
          onRetry={() => id && fetchResourceById(id)} 
        />
      ) : (
        <DocumentationEditor 
          resource={isNew ? null : currentResource} 
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
      
      {isSaving && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <LoadingSpinner size="medium" message="Saving document..." />
          </div>
        </div>
      )}
    </div>
  );
};

// Main component that provides the context
const EditDocumentation: React.FC = () => {
  return (
    <DocumentationProvider>
      <div className="min-h-screen bg-stone-50">
        <EditDocumentationContent />
      </div>
    </DocumentationProvider>
  );
};

export default EditDocumentation;