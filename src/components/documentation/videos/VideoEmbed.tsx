// src/components/documentation/videos/VideoEmbed.tsx
import { ExternalLink, Maximize2, Play } from 'lucide-react';
import React, { useState } from 'react';
import { VideoResource } from '../../../types/documentationTypes';

export interface VideoEmbedProps {
  video: VideoResource;
  autoplay?: boolean;
  className?: string;
}

const VideoEmbed: React.FC<VideoEmbedProps> = ({
  video,
  autoplay = false,
  className = '',
}) => {
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Calculate video URL with optional start time
  const videoUrl = `https://www.youtube.com/embed/${video.videoId}?rel=0${
    video.startTime ? `&start=${video.startTime}` : ''
  }${autoplay ? '&autoplay=1' : ''}`;

  // External link to YouTube
  const externalUrl = `https://www.youtube.com/watch?v=${video.videoId}${
    video.startTime ? `&t=${video.startTime}` : ''
  }`;

  // Thumbnail URL
  const thumbnailUrl = `https://img.youtube.com/vi/${video.videoId}/${
    video.thumbnailQuality || 'hqdefault'
  }.jpg`;

  const handleThumbnailClick = () => {
    setIsPlaying(true);
  };

  const toggleFullscreen = () => {
    const iframe = document.getElementById(`video-${video.videoId}`);
    if (iframe) {
      if (!isFullscreen) {
        if (iframe.requestFullscreen) {
          iframe.requestFullscreen();
        }
      }
      setIsFullscreen(!isFullscreen);
    }
  };

  return (
    <div className={`video-embed rounded-lg overflow-hidden ${className}`}>
      {!isPlaying ? (
        <div
          className='relative cursor-pointer group'
          onClick={handleThumbnailClick}
        >
          <img
            src={thumbnailUrl}
            alt={video.title}
            className='w-full object-cover aspect-video'
          />
          <div className='absolute inset-0 flex items-center justify-center'>
            <div className='bg-black bg-opacity-60 rounded-full p-4 group-hover:bg-opacity-80 transition-all'>
              <Play size={32} className='text-white' />
            </div>
          </div>
          <div className='absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 p-3'>
            <h4 className='text-white font-medium'>{video.title}</h4>
            {video.description && (
              <p className='text-white text-sm opacity-80'>
                {video.description}
              </p>
            )}
            {video.duration && (
              <span className='absolute top-3 right-3 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded'>
                {video.duration}
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className='relative'>
          <iframe
            id={`video-${video.videoId}`}
            src={videoUrl}
            title={video.title}
            frameBorder='0'
            allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
            allowFullScreen
            className='w-full aspect-video'
          ></iframe>
          <div className='absolute top-2 right-2 flex space-x-2'>
            <button
              onClick={toggleFullscreen}
              className='bg-black bg-opacity-70 text-white p-1 rounded hover:bg-opacity-90'
              title='Fullscreen'
            >
              <Maximize2 size={16} />
            </button>
            <a
              href={externalUrl}
              target='_blank'
              rel='noopener noreferrer'
              className='bg-black bg-opacity-70 text-white p-1 rounded hover:bg-opacity-90'
              title='Open in YouTube'
            >
              <ExternalLink size={16} />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoEmbed;
