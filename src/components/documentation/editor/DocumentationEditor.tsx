// src/components/documentation/editor/DocumentationEditor.tsx
import ErrorMessage from '@/components/common/ErrorMessage';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import {
  DocumentationCategory,
  DocumentationResource,
  DocumentationType,
  SkillLevel,
  VideoResource,
} from '@/types/documentationTypes';
import {
  AlertTriangle,
  Edit,
  Eye,
  Key,
  Link as LinkIcon,
  Plus,
  Save,
  Tag,
  Trash,
  X,
  Youtube,
} from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import ContentRenderer from '../ContentRenderer';

interface DocumentationEditorProps {
  resource?: DocumentationResource | null;
  onSave: (
    resource: DocumentationResource | Omit<DocumentationResource, 'id'>
  ) => Promise<void>;
  onCancel?: () => void;
}

// Create arrays for enum values since we can't use Object.values() with const enums
const DOCUMENTATION_CATEGORIES = [
  DocumentationCategory.GETTING_STARTED,
  DocumentationCategory.INVENTORY,
  DocumentationCategory.MATERIALS,
  DocumentationCategory.PROJECTS,
  DocumentationCategory.SALES,
  DocumentationCategory.PURCHASES,
  DocumentationCategory.TOOLS,
  DocumentationCategory.PATTERNS,
  DocumentationCategory.STORAGE,
  DocumentationCategory.SUPPLIERS,
  DocumentationCategory.INTEGRATIONS,
  DocumentationCategory.SECURITY,
  DocumentationCategory.SETTINGS,
  DocumentationCategory.TROUBLESHOOTING,
  DocumentationCategory.OTHER,
];

const DOCUMENTATION_TYPES = [
  DocumentationType.GUIDE,
  DocumentationType.TUTORIAL,
  DocumentationType.REFERENCE,
  DocumentationType.WORKFLOW,
  DocumentationType.FAQ,
  DocumentationType.TROUBLESHOOTING,
  DocumentationType.API,
  DocumentationType.BEST_PRACTICE,
];

const SKILL_LEVELS = [
  SkillLevel.BEGINNER,
  SkillLevel.INTERMEDIATE,
  SkillLevel.ADVANCED,
];

const DocumentationEditor: React.FC<DocumentationEditorProps> = ({
  resource,
  onSave,
  onCancel,
}) => {
  const [form, setForm] = useState<Partial<DocumentationResource>>({
    title: '',
    description: '',
    content: '',
    category: DocumentationCategory.GETTING_STARTED,
    type: DocumentationType.GUIDE,
    skillLevel: SkillLevel.BEGINNER,
    tags: [],
    relatedResources: [],
    author: '',
    contextualHelpKeys: [],
    videos: [],
  });

  const [newTag, setNewTag] = useState('');
  const [newContextKey, setNewContextKey] = useState('');
  const [newRelatedResource, setNewRelatedResource] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Video form state
  const [videoForm, setVideoForm] = useState<Partial<VideoResource>>({
    id: '',
    title: '',
    url: '',
    thumbnail: '',
    description: '',
  });
  const [showVideoForm, setShowVideoForm] = useState(false);

  // Initialize form with resource data if available
  useEffect(() => {
    if (resource) {
      setForm(resource);
    }
  }, [resource]);

  // Listen for browser navigation/reload with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue =
          'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Handle form field changes
  const handleChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const { name, value } = e.target;
      setForm((prev) => ({ ...prev, [name]: value }));
      setHasUnsavedChanges(true);
    },
    []
  );

  // Add a new tag
  const addTag = useCallback(() => {
    if (newTag.trim() && !form.tags?.includes(newTag.trim())) {
      setForm((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()],
      }));
      setNewTag('');
      setHasUnsavedChanges(true);
    }
  }, [form.tags, newTag]);

  // Remove a tag
  const removeTag = useCallback((tag: string) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags?.filter((t) => t !== tag) || [],
    }));
    setHasUnsavedChanges(true);
  }, []);

  // Add a contextual help key
  const addContextKey = useCallback(() => {
    if (
      newContextKey.trim() &&
      !form.contextualHelpKeys?.includes(newContextKey.trim())
    ) {
      setForm((prev) => ({
        ...prev,
        contextualHelpKeys: [
          ...(prev.contextualHelpKeys || []),
          newContextKey.trim(),
        ],
      }));
      setNewContextKey('');
      setHasUnsavedChanges(true);
    }
  }, [form.contextualHelpKeys, newContextKey]);

  // Remove a contextual help key
  const removeContextKey = useCallback((key: string) => {
    setForm((prev) => ({
      ...prev,
      contextualHelpKeys:
        prev.contextualHelpKeys?.filter((k) => k !== key) || [],
    }));
    setHasUnsavedChanges(true);
  }, []);

  // Add a related resource
  const addRelatedResource = useCallback(() => {
    if (
      newRelatedResource.trim() &&
      !form.relatedResources?.includes(newRelatedResource.trim())
    ) {
      setForm((prev) => ({
        ...prev,
        relatedResources: [
          ...(prev.relatedResources || []),
          newRelatedResource.trim(),
        ],
      }));
      setNewRelatedResource('');
      setHasUnsavedChanges(true);
    }
  }, [form.relatedResources, newRelatedResource]);

  // Remove a related resource
  const removeRelatedResource = useCallback((id: string) => {
    setForm((prev) => ({
      ...prev,
      relatedResources: prev.relatedResources?.filter((r) => r !== id) || [],
    }));
    setHasUnsavedChanges(true);
  }, []);

  // Add a video
  const addVideo = useCallback(() => {
    // Validate required fields
    if (!videoForm.title || !videoForm.url) {
      setError('Video title and URL are required');
      return;
    }

    // Create a unique ID if not provided
    const videoId = videoForm.id || `video-${Date.now()}`;

    setForm((prev) => ({
      ...prev,
      videos: [
        ...(prev.videos || []),
        { ...videoForm, id: videoId } as VideoResource,
      ],
    }));

    // Reset video form
    setVideoForm({
      id: '',
      title: '',
      url: '',
      thumbnail: '',
      description: '',
    });
    setShowVideoForm(false);
    setHasUnsavedChanges(true);
  }, [videoForm]);

  // Remove a video
  const removeVideo = useCallback((id: string) => {
    setForm((prev) => ({
      ...prev,
      videos: prev.videos?.filter((v) => v.id !== id) || [],
    }));
    setHasUnsavedChanges(true);
  }, []);

  // Handle video form changes
  const handleVideoFormChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setVideoForm((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  // Extract YouTube ID from URL
  const getYouTubeId = useCallback((url: string): string | null => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  }, []);

  // Auto-generate thumbnail URL when YouTube URL is entered
  useEffect(() => {
    if (videoForm.url) {
      const youtubeId = getYouTubeId(videoForm.url);
      if (youtubeId) {
        setVideoForm((prev) => ({
          ...prev,
          thumbnail: `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`,
        }));
      }
    }
  }, [videoForm.url, getYouTubeId]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!form.title || !form.content || !form.category) {
      setError('Please fill out all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onSave(form as any);
      setHasUnsavedChanges(false);
    } catch (err: any) {
      setError(err.message || 'Failed to save documentation');
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel button
  const handleCancel = () => {
    if (hasUnsavedChanges) {
      if (
        window.confirm(
          'You have unsaved changes. Are you sure you want to cancel?'
        )
      ) {
        onCancel?.();
      }
    } else {
      onCancel?.();
    }
  };

  return (
    <div className='bg-white rounded-lg border border-stone-200 overflow-hidden'>
      {/* Editor/Preview toggle */}
      <div className='bg-stone-50 border-b border-stone-200 px-4 py-3 flex justify-between items-center'>
        <div className='flex'>
          <button
            onClick={() => setPreviewMode(false)}
            className={`px-4 py-2 rounded-lg mr-2 ${
              !previewMode
                ? 'bg-white shadow text-amber-700'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Edit size={16} className='inline mr-2' />
            Edit
          </button>
          <button
            onClick={() => setPreviewMode(true)}
            className={`px-4 py-2 rounded-lg ${
              previewMode
                ? 'bg-white shadow text-amber-700'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Eye size={16} className='inline mr-2' />
            Preview
          </button>
        </div>

        {hasUnsavedChanges && (
          <div className='text-amber-600 text-sm flex items-center'>
            <AlertTriangle size={16} className='mr-1' />
            Unsaved changes
          </div>
        )}
      </div>

      {previewMode ? (
        <div className='p-6'>
          <h1 className='text-2xl font-bold mb-4'>
            {form.title || 'Untitled Document'}
          </h1>

          <div className='text-sm text-stone-500 mb-6'>
            <p>By {form.author || 'Unknown Author'}</p>
            <div className='mt-2 flex flex-wrap gap-2'>
              {form.tags?.map((tag) => (
                <span
                  key={tag}
                  className='px-2 py-1 bg-stone-100 rounded-full text-xs'
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className='prose max-w-none'>
            <ContentRenderer content={form.content || 'No content yet.'} />
          </div>

          {/* Videos preview */}
          {form.videos && form.videos.length > 0 && (
            <div className='mt-8 border-t border-stone-200 pt-6'>
              <h2 className='text-xl font-semibold mb-4'>Videos</h2>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {form.videos.map((video) => (
                  <div
                    key={video.id}
                    className='border border-stone-200 rounded-lg overflow-hidden'
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
                    </div>
                    <div className='p-3'>
                      <h3 className='font-medium'>{video.title}</h3>
                      {video.description && (
                        <p className='text-sm text-stone-600 mt-1'>
                          {video.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className='p-6 space-y-6'>
          {error && (
            <ErrorMessage message={error} onRetry={() => setError(null)} />
          )}

          {/* Basic information */}
          <div className='space-y-4'>
            <h2 className='text-lg font-semibold border-b pb-2'>
              Basic Information
            </h2>

            <div>
              <label className='block text-sm font-medium text-stone-700 mb-1'>
                Title*
              </label>
              <input
                type='text'
                name='title'
                value={form.title || ''}
                onChange={handleChange}
                required
                className='w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-stone-700 mb-1'>
                Description
              </label>
              <textarea
                name='description'
                value={form.description || ''}
                onChange={handleChange}
                rows={3}
                className='w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-stone-700 mb-1'>
                Author
              </label>
              <input
                type='text'
                name='author'
                value={form.author || ''}
                onChange={handleChange}
                className='w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500'
              />
            </div>
          </div>

          {/* Classification */}
          <div className='space-y-4'>
            <h2 className='text-lg font-semibold border-b pb-2'>
              Classification
            </h2>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div>
                <label className='block text-sm font-medium text-stone-700 mb-1'>
                  Category*
                </label>
                <select
                  name='category'
                  value={form.category || ''}
                  onChange={handleChange}
                  required
                  className='w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500'
                >
                  {DOCUMENTATION_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-stone-700 mb-1'>
                  Type
                </label>
                <select
                  name='type'
                  value={form.type || ''}
                  onChange={handleChange}
                  className='w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500'
                >
                  {DOCUMENTATION_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-stone-700 mb-1'>
                  Skill Level
                </label>
                <select
                  name='skillLevel'
                  value={form.skillLevel || ''}
                  onChange={handleChange}
                  className='w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500'
                >
                  {SKILL_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level.charAt(0).toUpperCase() +
                        level.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tags */}
            <div>
              <div className='flex items-center mb-1'>
                <Tag size={16} className='mr-2 text-stone-500' />
                <label className='block text-sm font-medium text-stone-700'>
                  Tags
                </label>
              </div>
              <div className='flex flex-wrap gap-2 mb-2'>
                {form.tags?.map((tag) => (
                  <span
                    key={tag}
                    className='inline-flex items-center px-2 py-1 rounded-full text-xs bg-stone-100'
                  >
                    {tag}
                    <button
                      type='button'
                      onClick={() => removeTag(tag)}
                      className='ml-1 text-stone-400 hover:text-stone-700'
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
              <div className='flex'>
                <input
                  type='text'
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder='Add a tag'
                  className='flex-grow px-3 py-2 border border-stone-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-amber-500'
                  onKeyDown={(e) =>
                    e.key === 'Enter' && (e.preventDefault(), addTag())
                  }
                />
                <button
                  type='button'
                  onClick={addTag}
                  className='px-3 py-2 bg-stone-100 text-stone-700 rounded-r-md hover:bg-stone-200'
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className='space-y-4'>
            <h2 className='text-lg font-semibold border-b pb-2'>Content</h2>

            <div>
              <label className='block text-sm font-medium text-stone-700 mb-1'>
                Markdown Content*
              </label>
              <textarea
                name='content'
                value={form.content || ''}
                onChange={handleChange}
                rows={15}
                required
                className='w-full px-3 py-2 font-mono text-sm border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500'
              />
              <p className='mt-1 text-xs text-stone-500'>
                Supports Markdown formatting including headers, lists, links,
                code blocks, and images.
              </p>
            </div>
          </div>

          {/* Videos */}
          <div className='space-y-4'>
            <h2 className='text-lg font-semibold border-b pb-2'>Videos</h2>

            {/* Video list */}
            {form.videos && form.videos.length > 0 ? (
              <div className='space-y-3 mb-4'>
                {form.videos.map((video) => (
                  <div
                    key={video.id}
                    className='flex items-center border border-stone-200 rounded-lg overflow-hidden'
                  >
                    <div className='w-24 h-16 bg-stone-100 flex-shrink-0'>
                      {video.thumbnail ? (
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className='w-full h-full object-cover'
                        />
                      ) : (
                        <div className='flex items-center justify-center h-full'>
                          <Youtube size={24} className='text-stone-300' />
                        </div>
                      )}
                    </div>
                    <div className='p-3 flex-grow'>
                      <h3 className='font-medium'>{video.title}</h3>
                      {video.description && (
                        <p className='text-xs text-stone-600 truncate'>
                          {video.description}
                        </p>
                      )}
                    </div>
                    <button
                      type='button'
                      onClick={() => removeVideo(video.id)}
                      className='p-3 text-stone-400 hover:text-red-600'
                      aria-label='Remove video'
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className='text-stone-500 text-sm italic mb-4'>
                No videos added yet.
              </p>
            )}

            {/* Video form */}
            {showVideoForm ? (
              <div className='bg-stone-50 p-4 rounded-lg border border-stone-200 mb-4'>
                <div className='flex justify-between items-center mb-3'>
                  <h3 className='font-medium'>Add Video</h3>
                  <button
                    type='button'
                    onClick={() => setShowVideoForm(false)}
                    className='text-stone-400 hover:text-stone-700'
                    aria-label='Close video form'
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className='space-y-3'>
                  <div>
                    <label className='block text-xs font-medium text-stone-700 mb-1'>
                      Video Title*
                    </label>
                    <input
                      type='text'
                      name='title'
                      value={videoForm.title || ''}
                      onChange={handleVideoFormChange}
                      className='w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500'
                      placeholder='Enter video title'
                    />
                  </div>

                  <div>
                    <label className='block text-xs font-medium text-stone-700 mb-1'>
                      Video URL* (YouTube)
                    </label>
                    <input
                      type='url'
                      name='url'
                      value={videoForm.url || ''}
                      onChange={handleVideoFormChange}
                      className='w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500'
                      placeholder='https://youtube.com/watch?v=...'
                    />
                  </div>

                  <div>
                    <label className='block text-xs font-medium text-stone-700 mb-1'>
                      Description
                    </label>
                    <textarea
                      name='description'
                      value={videoForm.description || ''}
                      onChange={handleVideoFormChange}
                      rows={2}
                      className='w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500'
                      placeholder='Brief description of the video'
                    />
                  </div>

                  <div className='pt-2 flex justify-end'>
                    <button
                      type='button'
                      onClick={addVideo}
                      className='px-3 py-1.5 bg-amber-600 text-white rounded-md hover:bg-amber-700'
                    >
                      Add Video
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                type='button'
                onClick={() => setShowVideoForm(true)}
                className='flex items-center text-amber-600 hover:text-amber-800'
              >
                <Plus size={16} className='mr-1' />
                Add Video
              </button>
            )}
          </div>

          {/* Advanced Settings */}
          <div className='space-y-4'>
            <h2 className='text-lg font-semibold border-b pb-2'>
              Advanced Settings
            </h2>

            {/* Contextual Help Keys */}
            <div>
              <div className='flex items-center mb-1'>
                <Key size={16} className='mr-2 text-stone-500' />
                <label className='block text-sm font-medium text-stone-700'>
                  Contextual Help Keys
                </label>
                <span className='ml-2 text-xs text-stone-500'>
                  (Used to show this article in contextual help)
                </span>
              </div>
              <div className='flex flex-wrap gap-2 mb-2'>
                {form.contextualHelpKeys?.map((key) => (
                  <span
                    key={key}
                    className='inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800'
                  >
                    {key}
                    <button
                      type='button'
                      onClick={() => removeContextKey(key)}
                      className='ml-1 text-blue-400 hover:text-blue-700'
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
              <div className='flex'>
                <input
                  type='text'
                  value={newContextKey}
                  onChange={(e) => setNewContextKey(e.target.value)}
                  placeholder='module.component.action'
                  className='flex-grow px-3 py-2 border border-stone-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-amber-500'
                  onKeyDown={(e) =>
                    e.key === 'Enter' && (e.preventDefault(), addContextKey())
                  }
                />
                <button
                  type='button'
                  onClick={addContextKey}
                  className='px-3 py-2 bg-stone-100 text-stone-700 rounded-r-md hover:bg-stone-200'
                >
                  <Plus size={16} />
                </button>
              </div>
              <p className='mt-1 text-xs text-stone-500'>
                Add dot-notation keys for specific UI elements or actions where
                this help article should appear.
              </p>
            </div>

            {/* Related Resources */}
            <div>
              <div className='flex items-center mb-1'>
                <LinkIcon size={16} className='mr-2 text-stone-500' />
                <label className='block text-sm font-medium text-stone-700'>
                  Related Resources
                </label>
              </div>
              <div className='flex flex-wrap gap-2 mb-2'>
                {form.relatedResources?.map((id) => (
                  <span
                    key={id}
                    className='inline-flex items-center px-2 py-1 rounded-full text-xs bg-stone-100 text-stone-600'
                  >
                    {id}
                    <button
                      type='button'
                      onClick={() => removeRelatedResource(id)}
                      className='ml-1 text-stone-400 hover:text-stone-700'
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
              <div className='flex'>
                <input
                  type='text'
                  value={newRelatedResource}
                  onChange={(e) => setNewRelatedResource(e.target.value)}
                  placeholder='Resource ID'
                  className='flex-grow px-3 py-2 border border-stone-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-amber-500'
                  onKeyDown={(e) =>
                    e.key === 'Enter' &&
                    (e.preventDefault(), addRelatedResource())
                  }
                />
                <button
                  type='button'
                  onClick={addRelatedResource}
                  className='px-3 py-2 bg-stone-100 text-stone-700 rounded-r-md hover:bg-stone-200'
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className='pt-4 border-t border-stone-200 flex justify-between'>
            {onCancel && (
              <button
                type='button'
                onClick={handleCancel}
                className='px-4 py-2 border border-stone-300 text-stone-700 rounded-md hover:bg-stone-50'
              >
                Cancel
              </button>
            )}

            <button
              type='submit'
              disabled={loading}
              className='px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 flex items-center'
            >
              {loading ? (
                <>
                  <LoadingSpinner size='small' color='amber' />
                  <span className='ml-2'>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={16} className='mr-2' />
                  Save Document
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default DocumentationEditor;
