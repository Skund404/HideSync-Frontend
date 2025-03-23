// src/pages/ArticlePage.tsx
import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { DocumentationProvider } from '@/context/DocumentationContext';
import EnhancedArticleView from '@/components/documentation/EnhancedArticleView';
import { ContextHelpProvider } from '@/components/documentation/contextual/ContextHelpProvider';
import ContextHelpModal from '@/components/documentation/contextual/ContextHelpModal';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import { ChevronLeft, Edit } from 'lucide-react';
import { useDocumentation } from '@/context/DocumentationContext';

// Inner component that uses the context
const ArticlePageContent: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    currentResource, 
    loading, 
    error, 
    fetchResourceById 
  } = useDocumentation();
  
  // Fetch the resource when component mounts or ID changes
  useEffect(() => {
    if (id) {
      fetchResourceById(id);
    }
  }, [id, fetchResourceById]);
  
  // Handle navigation back
  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };
  
  if (!id) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <ErrorMessage 
          message="Article ID is required" 
          onRetry={() => navigate('/documentation')} 
        />
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Navigation and actions */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={handleBack}
          className="flex items-center text-amber-600 hover:text-amber-800"
        >
          <ChevronLeft size={18} className="mr-1" />
          Back to Documentation
        </button>
        
        {currentResource && (
          <Link
            to={`/documentation/edit/${id}`}
            className="flex items-center text-stone-600 hover:text-stone-800"
          >
            <Edit size={18} className="mr-1" />
            Edit Article
          </Link>
        )}
      </div>
      
      {/* Content area */}
      {loading && !currentResource ? (
        <div className="py-12 flex justify-center">
          <LoadingSpinner size="large" message="Loading article..." />
        </div>
      ) : error ? (
        <ErrorMessage 
          message={`Failed to load article: ${error}`} 
          onRetry={() => id && fetchResourceById(id)} 
        />
      ) : (
        <EnhancedArticleView />
      )}
    </div>
  );
};

// Main component that provides the contexts
const ArticlePage: React.FC = () => {
  return (
    <DocumentationProvider>
      <ContextHelpProvider>
        <div className="min-h-screen bg-white">
          <ArticlePageContent />
          <ContextHelpModal />
        </div>
      </ContextHelpProvider>
    </DocumentationProvider>
  );
};

export default ArticlePage;