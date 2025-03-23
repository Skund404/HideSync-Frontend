// src/components/documentation/VideoEmbed.tsx
import { VideoResource } from '@/types/documentationTypes';
import { Play } from 'lucide-react';
import React, { useState } from 'react';

interface VideoEmbedProps {
  video: VideoResource;
  className?: string;
  autoPlay?: boolean;
}

const VideoEmbed: React.FC<VideoEmbedProps> = ({
  video,
  className = '',
  autoPlay = false,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(autoPlay);

  // Extract video ID from URL if not provided directly
  const getVideoId = () => {
    if (video.id) return video.id;

    // Extract ID from YouTube URL if provided
    if (video.url && video.url.includes('youtube.com')) {
      const urlParams = new URLSearchParams(new URL(video.url).search);
      return urlParams.get('v') || '';
    }

    // Extract ID from YouTube shortened URL
    if (video.url && video.url.includes('youtu.be')) {
      return video.url.split('/').pop() || '';
    }

    return '';
  };

  const videoId = getVideoId();

  // Handle click on thumbnail to play
  const handlePlay = () => {
    setIsPlaying(true);
  };

  // Create YouTube embed URL with optional start time
  const createEmbedUrl = () => {
    const baseUrl = 'https://www.youtube.com/embed/';
    let url = `${baseUrl}${videoId}?rel=0&modestbranding=1`;

    if (video.startTime && video.startTime > 0) {
      url += `&start=${video.startTime}`;
    }

    if (autoPlay) {
      url += '&autoplay=1';
    }

    return url;
  };

  // If no valid video ID, show placeholder
  if (!videoId) {
    return (
      <div
        className={`bg-stone-100 flex items-center justify-center ${className}`}
      >
        <div className='text-stone-500 text-center p-4'>
          <p>Video unavailable</p>
          <p className='text-sm'>{video.title || 'No video ID found'}</p>
        </div>
      </div>
    );
  }

  // If playing, show iframe, otherwise show thumbnail with play button
  if (isPlaying) {
    return (
      <div className={`relative ${className}`}>
        {!isLoaded && (
          <div className='absolute inset-0 bg-stone-100 flex items-center justify-center'>
            <div className='animate-pulse'>Loading video...</div>
          </div>
        )}
        <iframe
          src={createEmbedUrl()}
          title={video.title || 'Video'}
          allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
          allowFullScreen
          className='absolute top-0 left-0 w-full h-full border-0'
          onLoad={() => setIsLoaded(true)}
        />
      </div>
    );
  }

  // Create thumbnail URL or use provided one
  const thumbnailUrl =
    video.thumbnail ||
    `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  return (
    <div
      className={`relative cursor-pointer ${className}`}
      onClick={handlePlay}
    >
      <img
        src={thumbnailUrl}
        alt={video.title || 'Video thumbnail'}
        className='w-full h-full object-cover'
        loading='lazy'
      />
      <div className='absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center group'>
        <div className='w-16 h-16 rounded-full bg-amber-600 bg-opacity-90 flex items-center justify-center group-hover:bg-opacity-100 transition-all transform group-hover:scale-110'>
          <Play className='text-white ml-1' size={30} />
        </div>
        {video.title && (
          <div className='absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-3'>
            <h3 className='font-medium'>{video.title}</h3>
            {video.duration && (
              <div className='text-sm text-stone-300 mt-1'>
                {video.duration}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoEmbed;
