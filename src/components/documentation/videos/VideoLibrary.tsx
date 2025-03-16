import React, { useState } from 'react';
import { useDocumentation } from '../../../context/DocumentationContext';
import VideoEmbed from './VideoEmbed';

export interface VideoLibraryProps {
  onVideoSelect?: (resourceId: string) => void;
}

const VideoLibrary: React.FC<VideoLibraryProps> = ({ onVideoSelect }) => {
  const { resources } = useDocumentation();
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Extract all videos from documentation resources
  const allVideos = resources.reduce((videos, resource) => {
    if (resource.videos && resource.videos.length > 0) {
      return [
        ...videos,
        ...resource.videos.map((video) => ({
          ...video,
          category: resource.category,
          resourceId: resource.id,
          resourceTitle: resource.title,
        })),
      ];
    }
    return videos;
  }, [] as Array<any>);

  // Apply category filter
  const filteredVideos =
    categoryFilter === 'all'
      ? allVideos
      : allVideos.filter((video) => video.category === categoryFilter);

  // Get unique categories for filter (fix for Set iteration issue)
  const uniqueCategories: string[] = [];
  allVideos.forEach((video) => {
    if (video.category && !uniqueCategories.includes(video.category)) {
      uniqueCategories.push(video.category);
    }
  });

  return (
    <div className='video-library'>
      <div className='mb-6'>
        <h2 className='text-xl font-medium mb-4'>Video Tutorials</h2>

        <div className='flex flex-wrap gap-2 mb-4'>
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1 rounded-full text-sm ${
              categoryFilter === 'all'
                ? 'bg-amber-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            All Videos
          </button>

          {uniqueCategories.map((category) => (
            <button
              key={category}
              onClick={() => setCategoryFilter(category)}
              className={`px-3 py-1 rounded-full text-sm ${
                categoryFilter === category
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {filteredVideos.map((video) => (
          <div
            key={video.videoId}
            className='video-card bg-white rounded-lg shadow-sm overflow-hidden'
          >
            <div
              className='cursor-pointer'
              onClick={() => onVideoSelect && onVideoSelect(video.resourceId)}
            >
              <VideoEmbed video={video} />
            </div>
            <div className='p-4'>
              <h3 className='font-medium'>{video.title}</h3>
              {video.description && (
                <p className='text-sm text-gray-600 mt-1'>
                  {video.description}
                </p>
              )}
              <a
                href={`/documentation/${video.resourceId}`}
                className='text-sm text-amber-600 hover:text-amber-800 mt-2 inline-block'
                onClick={(e) => {
                  if (onVideoSelect) {
                    e.preventDefault();
                    onVideoSelect(video.resourceId);
                  }
                }}
              >
                View in {video.resourceTitle}
              </a>
            </div>
          </div>
        ))}
      </div>

      {filteredVideos.length === 0 && (
        <div className='text-center p-8 bg-gray-50 rounded-lg'>
          <p className='text-gray-600'>
            No videos found for the selected category.
          </p>
        </div>
      )}
    </div>
  );
};

export default VideoLibrary;
