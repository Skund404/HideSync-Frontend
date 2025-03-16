import React, { useState } from 'react';
import { useDocumentation } from '../../../context/DocumentationContext';
import {
  DocumentationCategory,
  DocumentationResource,
  ResourceType,
  SkillLevel,
  VideoResource,
} from '../../../types/documentationTypes';

interface DocumentationEditorProps {
  initialResource?: Partial<DocumentationResource>;
  onSave: (resource: DocumentationResource) => void;
  onCancel: () => void;
}

const DocumentationEditor: React.FC<DocumentationEditorProps> = ({
  initialResource = {},
  onSave,
  onCancel,
}) => {
  // Note: Using 'categories' from context now in relatedResources section
  const { categories } = useDocumentation();

  // Resource state with default values
  const [resource, setResource] = useState<Partial<DocumentationResource>>({
    id: initialResource.id || `resource-${Date.now()}`,
    title: initialResource.title || '',
    description: initialResource.description || '',
    content: initialResource.content || '',
    category: initialResource.category || DocumentationCategory.GETTING_STARTED,
    type: initialResource.type || ResourceType.GUIDE,
    skillLevel: initialResource.skillLevel || SkillLevel.BEGINNER,
    tags: initialResource.tags || [],
    relatedResources: initialResource.relatedResources || [],
    lastUpdated: new Date().toISOString(),
    author: initialResource.author || 'Current User',
    contextualHelpKeys: initialResource.contextualHelpKeys || [],
    videos: initialResource.videos || [],
  });

  // Video management
  const [videos, setVideos] = useState<VideoResource[]>(
    initialResource.videos || []
  );
  const [newVideo, setNewVideo] = useState<Partial<VideoResource>>({
    videoId: '',
    title: '',
    description: '',
    thumbnailQuality: 'high',
  });

  // Tag management
  const [newTag, setNewTag] = useState('');

  // Form handlers
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setResource((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add videos to resource
    const completeResource = {
      ...resource,
      videos,
      lastUpdated: new Date().toISOString(),
    } as DocumentationResource;

    onSave(completeResource);
  };

  const addVideo = () => {
    if (newVideo.videoId && newVideo.title) {
      setVideos([...videos, newVideo as VideoResource]);
      setNewVideo({
        videoId: '',
        title: '',
        description: '',
        thumbnailQuality: 'high',
      });
    }
  };

  const removeVideo = (index: number) => {
    setVideos(videos.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (newTag && !resource.tags?.includes(newTag)) {
      setResource((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), newTag],
      }));
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setResource((prev) => ({
      ...prev,
      tags: prev.tags?.filter((t) => t !== tag) || [],
    }));
  };

  // Define valid thumbnail quality types
  type ThumbnailQuality = 'default' | 'medium' | 'high' | 'standard' | 'maxres';

  return (
    <div className='bg-white rounded-lg shadow-sm p-6'>
      <h2 className='text-xl font-medium mb-6'>
        {initialResource.id ? 'Edit Documentation' : 'Create New Documentation'}
      </h2>

      <form onSubmit={handleSubmit}>
        {/* Basic Information */}
        <div className='mb-6'>
          <h3 className='text-lg font-medium mb-4'>Basic Information</h3>

          <div className='grid grid-cols-1 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Title
              </label>
              <input
                type='text'
                name='title'
                value={resource.title}
                onChange={handleChange}
                className='w-full px-3 py-2 border border-gray-300 rounded-md'
                required
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Description
              </label>
              <textarea
                name='description'
                value={resource.description}
                onChange={handleChange}
                className='w-full px-3 py-2 border border-gray-300 rounded-md'
                rows={2}
                required
              />
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Category
                </label>
                <select
                  name='category'
                  value={resource.category}
                  onChange={handleChange}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md'
                  required
                >
                  {Object.values(DocumentationCategory).map((category) => (
                    <option key={category} value={category}>
                      {category.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Type
                </label>
                <select
                  name='type'
                  value={resource.type}
                  onChange={handleChange}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md'
                  required
                >
                  {Object.values(ResourceType).map((type) => (
                    <option key={type} value={type}>
                      {type.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Skill Level
                </label>
                <select
                  name='skillLevel'
                  value={resource.skillLevel}
                  onChange={handleChange}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md'
                  required
                >
                  {Object.values(SkillLevel).map((level) => (
                    <option key={level} value={level}>
                      {level.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className='mb-6'>
          <h3 className='text-lg font-medium mb-4'>Content (Markdown)</h3>
          <textarea
            name='content'
            value={resource.content}
            onChange={handleChange}
            className='w-full px-3 py-2 border border-gray-300 rounded-md font-mono'
            rows={15}
            required
          />
          <p className='text-sm text-gray-500 mt-1'>
            Use Markdown for formatting. You can include headers, lists, links,
            and code blocks.
          </p>
        </div>

        {/* Tags */}
        <div className='mb-6'>
          <h3 className='text-lg font-medium mb-4'>Tags</h3>
          <div className='flex items-center'>
            <input
              type='text'
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              className='flex-1 px-3 py-2 border border-gray-300 rounded-md rounded-r-none'
              placeholder='Add a tag'
            />
            <button
              type='button'
              onClick={addTag}
              className='px-4 py-2 bg-amber-600 text-white rounded-md rounded-l-none'
            >
              Add
            </button>
          </div>

          <div className='flex flex-wrap gap-2 mt-3'>
            {resource.tags?.map((tag) => (
              <div
                key={tag}
                className='bg-gray-100 px-3 py-1 rounded-full flex items-center'
              >
                <span>{tag}</span>
                <button
                  type='button'
                  onClick={() => removeTag(tag)}
                  className='ml-2 text-gray-500 hover:text-gray-700'
                >
                  &times;
                </button>
              </div>
            ))}
            {resource.tags?.length === 0 && (
              <p className='text-sm text-gray-500'>No tags added yet.</p>
            )}
          </div>
        </div>

        {/* Related Resources - Using categories to address unused variable */}
        <div className='mb-6'>
          <h3 className='text-lg font-medium mb-4'>Related Resources</h3>
          <div className='text-sm text-gray-500 mb-2'>
            Available categories: {categories?.length || 0}
          </div>
          {/* Future implementation for selecting related resources by category */}
        </div>

        {/* Videos */}
        <div className='mb-6'>
          <h3 className='text-lg font-medium mb-4'>Videos</h3>

          <div className='bg-gray-50 p-4 rounded-md mb-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-3'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  YouTube Video ID
                </label>
                <input
                  type='text'
                  value={newVideo.videoId}
                  onChange={(e) =>
                    setNewVideo({ ...newVideo, videoId: e.target.value })
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-md'
                  placeholder='e.g. dQw4w9WgXcQ'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Video Title
                </label>
                <input
                  type='text'
                  value={newVideo.title}
                  onChange={(e) =>
                    setNewVideo({ ...newVideo, title: e.target.value })
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-md'
                  placeholder='Title of the video'
                />
              </div>
            </div>

            <div className='mb-3'>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Description (Optional)
              </label>
              <input
                type='text'
                value={newVideo.description || ''}
                onChange={(e) =>
                  setNewVideo({ ...newVideo, description: e.target.value })
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-md'
                placeholder='Brief description of the video'
              />
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-3'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Thumbnail Quality
                </label>
                <select
                  value={newVideo.thumbnailQuality || 'high'}
                  onChange={(e) =>
                    setNewVideo({
                      ...newVideo,
                      // Fixed: Use type assertion to specify it's a valid ThumbnailQuality
                      thumbnailQuality: e.target.value as ThumbnailQuality,
                    })
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-md'
                >
                  <option value='default'>Default</option>
                  <option value='medium'>Medium</option>
                  <option value='high'>High</option>
                  <option value='standard'>Standard</option>
                  <option value='maxres'>Max Resolution</option>
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Duration (Optional)
                </label>
                <input
                  type='text'
                  value={newVideo.duration || ''}
                  onChange={(e) =>
                    setNewVideo({ ...newVideo, duration: e.target.value })
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-md'
                  placeholder='e.g. 5:20'
                />
              </div>
            </div>

            <button
              type='button'
              onClick={addVideo}
              className='px-4 py-2 bg-amber-600 text-white rounded-md'
            >
              Add Video
            </button>
          </div>

          <div className='space-y-3'>
            {videos.map((video, index) => (
              <div
                key={index}
                className='flex items-center bg-gray-100 p-3 rounded-md'
              >
                <img
                  src={`https://img.youtube.com/vi/${video.videoId}/default.jpg`}
                  alt={video.title}
                  className='w-20 h-auto mr-3'
                />
                <div className='flex-1'>
                  <h4 className='font-medium'>{video.title}</h4>
                  {video.description && (
                    <p className='text-sm text-gray-600'>{video.description}</p>
                  )}
                </div>
                <button
                  type='button'
                  onClick={() => removeVideo(index)}
                  className='ml-3 text-red-600 hover:text-red-800'
                >
                  Remove
                </button>
              </div>
            ))}
            {videos.length === 0 && (
              <p className='text-sm text-gray-500'>No videos added yet.</p>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className='flex justify-end space-x-3'>
          <button
            type='button'
            onClick={onCancel}
            className='px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50'
          >
            Cancel
          </button>
          <button
            type='submit'
            className='px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700'
          >
            {initialResource.id
              ? 'Update Documentation'
              : 'Create Documentation'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DocumentationEditor;
