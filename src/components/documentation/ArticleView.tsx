// src/components/documentation/ArticleView.tsx

import {
  Bookmark,
  ChevronLeft,
  ExternalLink,
  Printer,
  Share,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useDocumentation } from '../../context/DocumentationContext';
import {
  DocumentationResource,
  ResourceType,
  SkillLevel,
} from '../../types/documentationTypes';
import ContentRenderer from './ContentRenderer';

interface ArticleViewProps {
  resourceId: string;
  onBack: () => void;
}

const ArticleView: React.FC<ArticleViewProps> = ({ resourceId, onBack }) => {
  const { loadResource, resources } = useDocumentation();
  const [resource, setResource] = useState<DocumentationResource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResource = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await loadResource(resourceId);
        setResource(result);
      } catch (err) {
        setError('Failed to load article');
        console.error('Error loading article:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResource();
  }, [resourceId, loadResource]);

  const getSkillLevelLabel = (level: SkillLevel) => {
    switch (level) {
      case SkillLevel.BEGINNER:
        return { label: 'Beginner', color: 'bg-green-100 text-green-800' };
      case SkillLevel.INTERMEDIATE:
        return { label: 'Intermediate', color: 'bg-blue-100 text-blue-800' };
      case SkillLevel.ADVANCED:
        return { label: 'Advanced', color: 'bg-purple-100 text-purple-800' };
      default:
        return { label: 'All Levels', color: 'bg-gray-100 text-gray-800' };
    }
  };

  const getTypeLabel = (type: ResourceType) => {
    switch (type) {
      case ResourceType.GUIDE:
        return { label: 'Guide', color: 'bg-blue-100 text-blue-800' };
      case ResourceType.TUTORIAL:
        return { label: 'Tutorial', color: 'bg-green-100 text-green-800' };
      case ResourceType.REFERENCE:
        return { label: 'Reference', color: 'bg-gray-100 text-gray-800' };
      case ResourceType.WORKFLOW:
        return { label: 'Workflow', color: 'bg-purple-100 text-purple-800' };
      case ResourceType.TEMPLATE:
        return { label: 'Template', color: 'bg-yellow-100 text-yellow-800' };
      case ResourceType.TROUBLESHOOTING:
        return { label: 'Troubleshooting', color: 'bg-red-100 text-red-800' };
      case ResourceType.VIDEO:
        return { label: 'Video', color: 'bg-pink-100 text-pink-800' };
      default:
        return { label: 'Article', color: 'bg-gray-100 text-gray-800' };
    }
  };

  const getRelatedResources = () => {
    if (!resource?.relatedResources.length) return [];

    return resource.relatedResources
      .map((id) => resources.find((r) => r.id === id))
      .filter((r) => r) as DocumentationResource[];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <div className='animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600'></div>
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className='bg-red-50 p-4 rounded-md text-red-800'>
        <h3 className='font-medium'>Error</h3>
        <p>{error || 'Article not found'}</p>
        <button
          onClick={onBack}
          className='mt-3 px-4 py-2 bg-white border border-red-300 rounded-md text-red-700 hover:bg-red-50'
        >
          Go back
        </button>
      </div>
    );
  }

  const skillLevel = getSkillLevelLabel(resource.skillLevel);
  const resourceType = getTypeLabel(resource.type);
  const relatedResources = getRelatedResources();

  return (
    <div className='article-view'>
      <div className='mb-6'>
        <button
          onClick={onBack}
          className='flex items-center text-amber-600 hover:text-amber-800'
        >
          <ChevronLeft size={16} className='mr-1' />
          Back to Documentation
        </button>
      </div>

      <div className='bg-white rounded-lg shadow-sm overflow-hidden'>
        <div className='p-6'>
          <div className='flex items-center mb-3'>
            <span
              className={`text-xs font-medium px-2.5 py-0.5 rounded ${resourceType.color} mr-2`}
            >
              {resourceType.label}
            </span>
            <span
              className={`text-xs font-medium px-2.5 py-0.5 rounded ${skillLevel.color}`}
            >
              {skillLevel.label}
            </span>
            <div className='ml-auto flex space-x-2'>
              <button
                className='text-gray-400 hover:text-gray-600'
                title='Print'
              >
                <Printer size={16} />
              </button>
              <button
                className='text-gray-400 hover:text-gray-600'
                title='Save'
              >
                <Bookmark size={16} />
              </button>
              <button
                className='text-gray-400 hover:text-gray-600'
                title='Share'
              >
                <Share size={16} />
              </button>
            </div>
          </div>

          <h1 className='text-2xl font-bold mb-2'>{resource.title}</h1>

          <div className='text-gray-500 text-sm mb-6'>
            Last updated: {formatDate(resource.lastUpdated)} • Author:{' '}
            {resource.author}
          </div>

          <div className='mb-6'>
            <p className='text-gray-700'>{resource.description}</p>
          </div>

          <div className='prose max-w-none'>
            <ContentRenderer content={resource.content} />
          </div>
        </div>

        {resource.tags.length > 0 && (
          <div className='px-6 py-3 border-t border-gray-200 bg-gray-50'>
            <div className='text-sm text-gray-500 mb-2'>Tags:</div>
            <div className='flex flex-wrap gap-2'>
              {resource.tags.map((tag) => (
                <span
                  key={tag}
                  className='px-2 py-1 rounded-full bg-gray-200 text-gray-700 text-xs'
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {relatedResources.length > 0 && (
          <div className='px-6 py-4 border-t border-gray-200 bg-gray-50'>
            <h3 className='text-lg font-medium mb-3'>Related Resources</h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {relatedResources.map((related) => (
                <div
                  key={related.id}
                  className='flex p-3 border rounded-md bg-white hover:border-amber-300 cursor-pointer'
                  onClick={() => loadResource(related.id)}
                >
                  <div>
                    <h4 className='font-medium text-gray-900'>
                      {related.title}
                    </h4>
                    <p className='text-sm text-gray-600 line-clamp-2'>
                      {related.description}
                    </p>
                    <div className='mt-1 flex items-center text-amber-600 text-xs'>
                      <ExternalLink size={12} className='mr-1' />
                      View resource
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticleView;
