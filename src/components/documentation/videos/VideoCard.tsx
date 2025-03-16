import { Clock, ExternalLink } from 'lucide-react';
import React from 'react';
import { VideoResource } from '../../../types/documentationTypes';

interface VideoCardProps {
  video: VideoResource & {
    resourceId?: string;
    resourceTitle?: string;
    category?: string;
  };
  onClick?: () => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, onClick }) => {
  // Thumbnail URL
  const thumbnailUrl = `https://img.youtube.com/vi/${video.videoId}/${
    video.thumbnailQuality || 'hqdefault'
  }.jpg`;

  // External link to YouTube
  const youtubeUrl = `https://www.youtube.com/watch?v=${video.videoId}${
    video.startTime ? `&t=${video.startTime}` : ''
  }`;

  return (
    <div className='video-card bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow'>
      <div
        className='relative cursor-pointer aspect-video overflow-hidden bg-gray-200'
        onClick={onClick}
      >
        <img
          src={thumbnailUrl}
          alt={video.title}
          className='w-full h-full object-cover transition-transform hover:scale-105'
        />

        <div className='absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity'>
          <div className='w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center'>
            <svg
              className='w-8 h-8 text-white'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
            >
              <polygon points='5 3 19 12 5 21 5 3' fill='currentColor' />
            </svg>
          </div>
        </div>

        {video.duration && (
          <div className='absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded flex items-center'>
            <Clock size={12} className='mr-1' />
            {video.duration}
          </div>
        )}
      </div>

      <div className='p-4'>
        <h3 className='font-medium text-gray-900 mb-1'>{video.title}</h3>

        {video.description && (
          <p className='text-sm text-gray-600 mb-2 line-clamp-2'>
            {video.description}
          </p>
        )}

        {video.resourceId && (
          <div className='flex justify-between items-center text-xs'>
            <a
              href={`/documentation/${video.resourceId}`}
              className='text-amber-600 hover:text-amber-800 font-medium'
            >
              View Documentation
            </a>

            <a
              href={youtubeUrl}
              target='_blank'
              rel='noopener noreferrer'
              className='text-gray-500 hover:text-gray-700 flex items-center'
            >
              <ExternalLink size={12} className='mr-1' />
              YouTube
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoCard;
