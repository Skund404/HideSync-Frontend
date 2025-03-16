import { Maximize2, MinusCircle, Volume2, VolumeX, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { VideoResource } from '../../../types/documentationTypes';

interface VideoPlayerProps {
  video: VideoResource;
  onClose: () => void;
  autoplay?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  video,
  onClose,
  autoplay = true,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);

  // Handle escape key to exit fullscreen or modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, onClose]);

  // Calculate video URL with options
  const videoUrl = `https://www.youtube.com/embed/${
    video.videoId
  }?rel=0&modestbranding=1${
    video.startTime ? `&start=${video.startTime}` : ''
  }${autoplay ? '&autoplay=1' : ''}${isMuted ? '&mute=1' : ''}`;

  const toggleFullscreen = () => {
    if (playerRef.current) {
      if (!isFullscreen) {
        if (playerRef.current.requestFullscreen) {
          playerRef.current.requestFullscreen();
        }
      }
      setIsFullscreen(!isFullscreen);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4'>
      <div className='relative bg-black rounded-lg overflow-hidden max-w-4xl w-full max-h-[90vh]'>
        <div className='absolute top-0 right-0 z-10 flex space-x-2 p-3'>
          <button
            onClick={toggleMute}
            className='text-white bg-black bg-opacity-50 p-2 rounded-full hover:bg-opacity-70'
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          <button
            onClick={toggleFullscreen}
            className='text-white bg-black bg-opacity-50 p-2 rounded-full hover:bg-opacity-70'
            title='Toggle fullscreen'
          >
            {isFullscreen ? <MinusCircle size={18} /> : <Maximize2 size={18} />}
          </button>

          <button
            onClick={onClose}
            className='text-white bg-black bg-opacity-50 p-2 rounded-full hover:bg-opacity-70'
            title='Close'
          >
            <X size={18} />
          </button>
        </div>

        <div ref={playerRef} className='aspect-video'>
          <iframe
            src={videoUrl}
            title={video.title}
            frameBorder='0'
            allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
            allowFullScreen
            className='w-full h-full'
          ></iframe>
        </div>

        <div className='bg-gray-900 p-4'>
          <h3 className='text-white font-medium text-lg'>{video.title}</h3>
          {video.description && (
            <p className='text-gray-300 mt-1'>{video.description}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
