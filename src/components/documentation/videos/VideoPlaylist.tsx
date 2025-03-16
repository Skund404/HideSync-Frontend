// src/components/documentation/videos/VideoPlaylist.tsx

import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  List,
  Play,
} from 'lucide-react';
import React, { useState } from 'react';
import { VideoResource } from '../../../types/documentationTypes';
import EnhancedVideoPlayer from './EnhancedVideoPlayer';

export interface PlaylistItem extends VideoResource {
  resourceId?: string; // Optional reference to parent documentation
  completed?: boolean; // Track watched status
}

interface VideoPlaylistProps {
  title: string;
  description?: string;
  videos: PlaylistItem[];
  autoPlay?: boolean;
  saveProgress?: boolean;
}

const VideoPlaylist: React.FC<VideoPlaylistProps> = ({
  title,
  description,
  videos,
  autoPlay = false,
  saveProgress = true,
}) => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [playlistVisibility, setPlaylistVisibility] = useState(true);
  const [completedVideos, setCompletedVideos] = useState<string[]>(() => {
    // Load completed videos from localStorage
    if (saveProgress) {
      try {
        const saved = localStorage.getItem(
          `playlist_progress_${title.replace(/\s+/g, '_')}`
        );
        return saved ? JSON.parse(saved) : [];
      } catch (error) {
        console.error('Error loading playlist progress:', error);
        return [];
      }
    }
    return [];
  });

  // Get the current video
  const currentVideo = videos[currentVideoIndex];

  // Calculate total duration
  const getTotalDuration = () => {
    let totalMinutes = 0;

    videos.forEach((video) => {
      if (video.duration) {
        const [minutes, seconds] = video.duration
          .split(':')
          .map((num) => parseInt(num));
        totalMinutes += minutes + seconds / 60;
      }
    });

    if (totalMinutes < 60) {
      return `${Math.round(totalMinutes)} minutes`;
    } else {
      const hours = Math.floor(totalMinutes / 60);
      const mins = Math.round(totalMinutes % 60);
      return `${hours} hour${hours !== 1 ? 's' : ''} ${
        mins > 0 ? `${mins} minutes` : ''
      }`;
    }
  };

  // Handle video completion
  const handleVideoComplete = (videoId: string) => {
    if (saveProgress && !completedVideos.includes(videoId)) {
      const updatedCompleted = [...completedVideos, videoId];
      setCompletedVideos(updatedCompleted);

      // Save to localStorage
      try {
        localStorage.setItem(
          `playlist_progress_${title.replace(/\s+/g, '_')}`,
          JSON.stringify(updatedCompleted)
        );
      } catch (error) {
        console.error('Error saving playlist progress:', error);
      }
    }
  };

  // Check if a video is marked as completed
  const isVideoCompleted = (videoId: string) => {
    return completedVideos.includes(videoId);
  };

  // Navigate to previous video
  const prevVideo = () => {
    if (currentVideoIndex > 0) {
      setCurrentVideoIndex(currentVideoIndex - 1);
    }
  };

  // Navigate to next video
  const nextVideo = () => {
    if (currentVideoIndex < videos.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);

      // Mark current video as completed when moving to next
      if (saveProgress && !completedVideos.includes(currentVideo.videoId)) {
        handleVideoComplete(currentVideo.videoId);
      }
    }
  };

  // Jump to specific video
  const jumpToVideo = (index: number) => {
    setCurrentVideoIndex(index);
  };

  // Format time for display
  const formatDuration = (duration: string) => {
    if (!duration) return '';

    const [minutes, seconds] = duration.split(':').map((num) => parseInt(num));

    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}:${mins.toString().padStart(2, '0')}:${seconds
        .toString()
        .padStart(2, '0')}`;
    }

    return duration;
  };

  // Reset progress
  const resetProgress = () => {
    if (saveProgress) {
      setCompletedVideos([]);
      try {
        localStorage.removeItem(
          `playlist_progress_${title.replace(/\s+/g, '_')}`
        );
      } catch (error) {
        console.error('Error resetting playlist progress:', error);
      }
    }
  };

  // Calculate completion percentage
  const completionPercentage =
    videos.length > 0
      ? Math.round((completedVideos.length / videos.length) * 100)
      : 0;

  return (
    <div className='video-playlist bg-white rounded-lg shadow-md overflow-hidden'>
      <div className='border-b p-4 flex justify-between items-center'>
        <div>
          <h2 className='text-xl font-medium'>{title}</h2>
          {description && (
            <p className='text-gray-600 text-sm mt-1'>{description}</p>
          )}
        </div>

        <div className='flex items-center space-x-3'>
          <div className='text-sm text-gray-600 hidden md:block'>
            {videos.length} video{videos.length !== 1 ? 's' : ''} •{' '}
            {getTotalDuration()}
          </div>

          <button
            onClick={() => setPlaylistVisibility(!playlistVisibility)}
            className='p-2 hover:bg-gray-100 rounded-full'
            title={playlistVisibility ? 'Hide playlist' : 'Show playlist'}
          >
            <List size={20} />
          </button>
        </div>
      </div>

      <div className='flex flex-col lg:flex-row'>
        {/* Video player section */}
        <div className={`${playlistVisibility ? 'lg:w-3/4' : 'w-full'}`}>
          <div className='aspect-video bg-black relative'>
            <EnhancedVideoPlayer video={currentVideo} autoplay={autoPlay} />
          </div>

          <div className='p-4 border-b'>
            <h3 className='font-medium'>{currentVideo.title}</h3>
            {currentVideo.description && (
              <p className='text-gray-600 mt-1'>{currentVideo.description}</p>
            )}

            <div className='flex justify-between items-center mt-4'>
              <button
                onClick={prevVideo}
                disabled={currentVideoIndex === 0}
                className={`flex items-center px-3 py-1 rounded ${
                  currentVideoIndex === 0
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <ChevronLeft size={18} className='mr-1' />
                Previous
              </button>

              <div className='text-sm text-gray-600'>
                {currentVideoIndex + 1} of {videos.length}
              </div>

              <button
                onClick={nextVideo}
                disabled={currentVideoIndex === videos.length - 1}
                className={`flex items-center px-3 py-1 rounded ${
                  currentVideoIndex === videos.length - 1
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-amber-600 hover:bg-amber-50'
                }`}
              >
                Next
                <ChevronRight size={18} className='ml-1' />
              </button>
            </div>
          </div>
        </div>

        {/* Playlist sidebar */}
        {playlistVisibility && (
          <div className='lg:w-1/4 border-l'>
            <div className='p-3 bg-gray-50 border-b'>
              <div className='flex justify-between items-center'>
                <h3 className='font-medium'>Playlist</h3>
                <div className='text-sm text-gray-600'>
                  {completionPercentage}% complete
                </div>
              </div>

              <div className='w-full bg-gray-200 rounded-full h-1.5 mt-2'>
                <div
                  className='bg-amber-600 h-1.5 rounded-full'
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>

              {saveProgress && (
                <button
                  onClick={resetProgress}
                  className='text-xs text-amber-600 hover:text-amber-800 mt-1'
                >
                  Reset progress
                </button>
              )}
            </div>

            <ul className='overflow-y-auto max-h-[500px] divide-y'>
              {videos.map((video, index) => {
                const isCompleted = isVideoCompleted(video.videoId);
                const isCurrent = index === currentVideoIndex;

                return (
                  <li
                    key={video.videoId}
                    className={`hover:bg-gray-50 ${
                      isCurrent ? 'bg-amber-50' : ''
                    }`}
                  >
                    <button
                      onClick={() => jumpToVideo(index)}
                      className='p-3 w-full flex items-start text-left'
                    >
                      <div className='flex-shrink-0 w-10 mr-3 flex items-center justify-center'>
                        {isCompleted ? (
                          <CheckCircle size={20} className='text-green-500' />
                        ) : isCurrent ? (
                          <Play size={20} className='text-amber-600' />
                        ) : (
                          <div className='rounded-full bg-gray-200 w-6 h-6 flex items-center justify-center text-xs text-gray-600'>
                            {index + 1}
                          </div>
                        )}
                      </div>

                      <div className='flex-1 min-w-0'>
                        <span
                          className={`block font-medium truncate ${
                            isCompleted ? 'text-gray-500' : 'text-gray-900'
                          }`}
                        >
                          {video.title}
                        </span>

                        {video.duration && (
                          <span className='text-xs text-gray-500 flex items-center mt-1'>
                            <Clock size={12} className='mr-1' />
                            {formatDuration(video.duration)}
                          </span>
                        )}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlaylist;
