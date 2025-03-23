// src/components/documentation/EnhancedArticleView.tsx
import ErrorMessage from '@/components/common/ErrorMessage';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useDocumentation } from '@/context/DocumentationContext';
import {
  documentationHelpers,
  DocumentationResource,
} from '@/types/documentationTypes';
import {
  AlertTriangle,
  Bookmark,
  ChevronLeft,
  Clock,
  Tag,
  Youtube,
} from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ContentRenderer from './ContentRenderer';
import ResourceCard from './ResourceCard';

// Enhanced interface to support both route-based and prop-based usage
interface EnhancedArticleViewProps {
  resourceId?: string; // Optional for direct passing from parent components
  onBack?: () => void; // Optional callback for parent navigation control
}

const EnhancedArticleView: React.FC<EnhancedArticleViewProps> = ({
  resourceId: propResourceId,
  onBack,
}) => {
  const { id: routeId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Use prop resourceId if provided, otherwise use route parameter
  const id = propResourceId || routeId;

  const {
    currentResource,
    resources,
    loading,
    error,
    fetchResourceById,
    isOffline,
  } = useDocumentation();

  const [relatedResources, setRelatedResources] = useState<
    DocumentationResource[]
  >([]);
  const [performance, setPerformance] = useState({
    startTime: 0,
    loadTime: 0,
    now: () => window.performance.now(),
  });
  const [bookmarked, setBookmarked] = useState(false);
  const [viewHistory, setViewHistory] = useState<string[]>([]);
  const articleRef = useRef<HTMLDivElement>(null);

  // Handle navigation back
  const handleBack = useCallback(() => {
    if (onBack) {
      // Use the provided callback if available
      onBack();
    } else {
      // Default navigation
      navigate('/documentation');
    }
  }, [onBack, navigate]);

  // Load view history from localStorage
  useEffect(() => {
    try {
      const history = localStorage.getItem('docViewHistory');
      if (history) {
        setViewHistory(JSON.parse(history));
      }
    } catch (err) {
      console.error('Failed to load view history', err);
    }
  }, []);

  // Check if article is bookmarked
  useEffect(() => {
    if (id) {
      try {
        const bookmarks = localStorage.getItem('docBookmarks');
        if (bookmarks) {
          const bookmarkList = JSON.parse(bookmarks);
          setBookmarked(bookmarkList.includes(id));
        }
      } catch (err) {
        console.error('Failed to load bookmarks', err);
      }
    }
  }, [id]);

  // Toggle bookmark status
  const toggleBookmark = useCallback(() => {
    if (!id) return;

    try {
      const bookmarks = localStorage.getItem('docBookmarks');
      let bookmarkList = bookmarks ? JSON.parse(bookmarks) : [];

      if (bookmarked) {
        // Remove from bookmarks
        bookmarkList = bookmarkList.filter(
          (bookmarkId: string) => bookmarkId !== id
        );
      } else {
        // Add to bookmarks
        bookmarkList.push(id);
      }

      localStorage.setItem('docBookmarks', JSON.stringify(bookmarkList));
      setBookmarked(!bookmarked);
    } catch (err) {
      console.error('Failed to update bookmarks', err);
    }
  }, [id, bookmarked]);

  // Add to view history
  useEffect(() => {
    if (id && currentResource) {
      try {
        let history = viewHistory.filter((historyId) => historyId !== id);
        history = [id, ...history].slice(0, 20); // Keep only last 20 viewed articles

        localStorage.setItem('docViewHistory', JSON.stringify(history));
        setViewHistory(history);
      } catch (err) {
        console.error('Failed to update view history', err);
      }
    }
  }, [id, currentResource, viewHistory]);

  // Load current resource
  useEffect(() => {
    if (id) {
      const startTime = window.performance.now();
      setPerformance((prev) => ({ ...prev, startTime }));

      fetchResourceById(id).finally(() => {
        const loadTime = window.performance.now() - startTime;
        setPerformance((prev) => ({ ...prev, loadTime }));

        // Log performance for monitoring
        if (loadTime > 1000) {
          console.warn(
            `Slow article load: ${loadTime.toFixed(2)}ms for ID ${id}`
          );
        }
      });
    }
  }, [id, fetchResourceById]);

  // Scroll to top when article changes
  useEffect(() => {
    if (articleRef.current) {
      articleRef.current.scrollTo(0, 0);
    }
  }, [id]);

  // Populate related resources when current resource changes
  useEffect(() => {
    if (currentResource?.relatedResources && resources.length > 0) {
      const related = resources.filter((r) =>
        currentResource.relatedResources.includes(r.id)
      );

      setRelatedResources(related);

      // Prefetch missing related resources
      currentResource.relatedResources.forEach((relatedId) => {
        if (!resources.some((r) => r.id === relatedId) && !loading) {
          // Prefetch in background with low priority
          setTimeout(() => {
            fetchResourceById(relatedId).catch(() => {
              // Silently fail prefetching
            });
          }, 200);
        }
      });
    }
  }, [currentResource, resources, loading, fetchResourceById]);

  if (loading && !currentResource) {
    return <LoadingSpinner size='large' message='Loading article...' />;
  }

  if (error) {
    return (
      <ErrorMessage
        message={`Failed to load article: ${error}`}
        onRetry={() => id && fetchResourceById(id)}
      />
    );
  }

  if (!currentResource) {
    return (
      <div className='p-8 text-center bg-stone-50 rounded-lg'>
        <p className='text-stone-600 mb-4'>Article not found</p>
        <button
          onClick={handleBack}
          className='inline-block text-amber-600 hover:text-amber-800 px-4 py-2 border border-amber-600 rounded-md'
        >
          Back to Documentation
        </button>
      </div>
    );
  }

  return (
    <div ref={articleRef} className='overflow-auto'>
      {/* Back button */}
      <div className='mb-6'>
        <button
          onClick={handleBack}
          className='flex items-center text-amber-600 hover:text-amber-800'
        >
          <ChevronLeft size={16} className='mr-1' />
          Back to Documentation
        </button>
      </div>

      {/* Offline warning */}
      {isOffline && (
        <div className='mb-6 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center text-amber-800'>
          <AlertTriangle size={20} className='mr-2 flex-shrink-0' />
          <span>
            You're viewing this article offline. Some features may be limited.
          </span>
        </div>
      )}

      {/* Article metadata */}
      <div className='mb-8'>
        <h1 className='text-3xl font-bold mb-3'>{currentResource.title}</h1>

        <div className='flex flex-wrap gap-y-3 text-sm text-stone-500 mb-4'>
          <div className='flex items-center mr-6'>
            <Clock size={16} className='mr-1' />
            <span>
              Updated{' '}
              {documentationHelpers.formatDate(currentResource.lastUpdated)}
            </span>
          </div>

          {currentResource.author && (
            <div className='mr-6'>
              By{' '}
              <span className='text-stone-700'>{currentResource.author}</span>
            </div>
          )}

          <button
            onClick={toggleBookmark}
            className={`flex items-center ${
              bookmarked ? 'text-amber-600' : 'hover:text-amber-600'
            }`}
          >
            <Bookmark
              size={16}
              className='mr-1'
              fill={bookmarked ? 'currentColor' : 'none'}
            />
            <span>{bookmarked ? 'Bookmarked' : 'Bookmark'}</span>
          </button>
        </div>

        {/* Description */}
        {currentResource.description && (
          <p className='text-lg text-stone-600 mb-6 border-l-4 border-amber-200 pl-4 py-2 bg-amber-50 rounded-r-md'>
            {currentResource.description}
          </p>
        )}

        {/* Type and tags */}
        <div className='flex flex-wrap items-center gap-2 mb-6'>
          <span className='inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm'>
            {currentResource.type.charAt(0).toUpperCase() +
              currentResource.type.slice(1).toLowerCase()}
          </span>

          <span className='inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm'>
            {currentResource.skillLevel.charAt(0).toUpperCase() +
              currentResource.skillLevel.slice(1).toLowerCase()}
          </span>

          {currentResource.tags?.length > 0 && (
            <div className='flex items-center gap-2 ml-2'>
              <Tag size={16} className='text-stone-400' />
              {currentResource.tags.map((tag) => (
                <span
                  key={tag}
                  className='inline-block px-2 py-1 bg-stone-100 text-stone-600 text-xs rounded-full'
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main content with lazy loading images */}
      <div className='prose max-w-none mb-12'>
        <ContentRenderer content={currentResource.content} />
      </div>

      {/* Videos section */}
      {currentResource.videos && currentResource.videos.length > 0 && (
        <div className='mb-12'>
          <h2 className='text-xl font-semibold mb-4 flex items-center'>
            <Youtube size={20} className='mr-2 text-red-600' />
            Related Videos
          </h2>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {currentResource.videos.map((video) => (
              <div
                key={video.id}
                className='border border-stone-200 rounded-lg overflow-hidden'
              >
                <a
                  href={video.url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='block'
                >
                  <div className='aspect-video bg-stone-100 relative'>
                    {video.thumbnail ? (
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className='w-full h-full object-cover'
                      />
                    ) : (
                      <div className='flex items-center justify-center h-full'>
                        <Youtube size={48} className='text-stone-300' />
                      </div>
                    )}
                    <div className='absolute inset-0 bg-black bg-opacity-10 flex items-center justify-center'>
                      <div className='w-16 h-16 bg-red-600 bg-opacity-90 rounded-full flex items-center justify-center'>
                        <div className='w-0 h-0 border-t-8 border-b-8 border-t-transparent border-b-transparent border-l-[16px] border-l-white ml-1'></div>
                      </div>
                    </div>
                  </div>
                  <div className='p-3'>
                    <h3 className='font-medium'>{video.title}</h3>
                    {video.description && (
                      <p className='text-sm text-stone-600 mt-1'>
                        {video.description}
                      </p>
                    )}
                  </div>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related resources */}
      {relatedResources.length > 0 && (
        <div className='mt-12 border-t border-stone-200 pt-6'>
          <h2 className='text-xl font-semibold mb-4'>Related Resources</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {relatedResources.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                compact={true}
                onClick={() => id && fetchResourceById(resource.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Performance debugging in development */}
      {process.env.NODE_ENV === 'development' && performance.loadTime > 0 && (
        <div className='mt-8 text-xs text-stone-400'>
          Loaded in {performance.loadTime.toFixed(2)}ms
        </div>
      )}
    </div>
  );
};

export default EnhancedArticleView;
