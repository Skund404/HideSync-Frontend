// src/components/documentation/videos/EnhancedVideoPlayer.tsx

import {
  Clock,
  ExternalLink,
  Maximize2,
  MessageSquare,
  Pause,
  Play,
  Settings,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  VideoNote,
  VideoResource,
  VideoTimestamp,
} from '../../../types/documentationTypes';

// Extend Window interface to include YouTube IFrame API properties
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface EnhancedVideoPlayerProps {
  video: VideoResource;
  onClose?: () => void;
  timestamps?: VideoTimestamp[];
  autoplay?: boolean;
  loop?: boolean;
  width?: string | number;
  height?: string | number;
  onTimeUpdate?: (currentTime: number) => void;
  className?: string;
}

const EnhancedVideoPlayer: React.FC<EnhancedVideoPlayerProps> = ({
  video,
  onClose,
  timestamps = [],
  autoplay = false,
  loop = false,
  width = '100%',
  height = 'auto',
  onTimeUpdate,
  className = '',
}) => {
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(100);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [showTimestamps, setShowTimestamps] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState<VideoNote[]>([]);
  const [newNote, setNewNote] = useState('');

  const playerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLIFrameElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get video ID from URL if not directly provided
  const getVideoId = () => {
    if (video.videoId) return video.videoId;

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

  // YouTube IFrame API player instance
  const [player, setPlayer] = useState<any>(null);

  // Player event handlers - using useCallback to memoize them
  const onPlayerReady = useCallback(
    (event: any) => {
      setDuration(event.target.getDuration());
      if (autoplay) {
        event.target.playVideo();
      }
    },
    [autoplay]
  );

  const onPlayerStateChange = useCallback(
    (event: any) => {
      // YouTube states: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (video cued)
      if (event.data === 1) {
        setIsPlaying(true);
      } else if (event.data === 2) {
        setIsPlaying(false);
      } else if (event.data === 0) {
        setIsPlaying(false);
        if (loop && player) {
          player.playVideo();
        }
      }
    },
    [loop, player]
  );

  // Initialize player function
  const initPlayer = useCallback(() => {
    if (videoRef.current) {
      const newPlayer = new window.YT.Player(videoRef.current, {
        events: {
          onStateChange: onPlayerStateChange,
          onReady: onPlayerReady,
        },
      });
      setPlayer(newPlayer);
    }
  }, [onPlayerStateChange, onPlayerReady]);

  // Load YouTube API and initialize player
  useEffect(() => {
    // Load YouTube API if not already loaded
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = initPlayer;
    } else {
      initPlayer();
    }

    // Clean up
    return () => {
      if (player) {
        player.destroy();
      }
    };
  }, [videoId, initPlayer, player]);

  // Load saved notes
  useEffect(() => {
    try {
      const savedNotes = localStorage.getItem(`video_notes_${videoId}`);
      if (savedNotes) {
        setNotes(JSON.parse(savedNotes));
      }
    } catch (error) {
      console.error('Error loading video notes:', error);
    }
  }, [videoId]);

  // Save notes when they change
  useEffect(() => {
    try {
      localStorage.setItem(`video_notes_${videoId}`, JSON.stringify(notes));
    } catch (error) {
      console.error('Error saving video notes:', error);
    }
  }, [notes, videoId]);

  // Update current time
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isPlaying && player) {
      interval = setInterval(() => {
        const time = player.getCurrentTime();
        setCurrentTime(time);

        if (onTimeUpdate) {
          onTimeUpdate(time);
        }
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isPlaying, player, onTimeUpdate]);

  // Auto-hide controls
  useEffect(() => {
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    } else {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    }

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying, currentTime]);

  // Calculate video URL with options
  const baseVideoUrl = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0&modestbranding=1&playsinline=1`;

  // Player control functions
  const togglePlay = () => {
    if (player) {
      if (isPlaying) {
        player.pauseVideo();
      } else {
        player.playVideo();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (player) {
      if (isMuted) {
        player.unMute();
        player.setVolume(volume);
      } else {
        player.mute();
      }
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    if (player) {
      player.setVolume(newVolume);
      setVolume(newVolume);
      if (newVolume === 0) {
        setIsMuted(true);
      } else if (isMuted) {
        setIsMuted(false);
        player.unMute();
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = parseFloat(e.target.value);
    if (player) {
      player.seekTo(seekTime);
      setCurrentTime(seekTime);
    }
  };

  const toggleFullscreen = () => {
    if (playerRef.current) {
      if (!isFullscreen) {
        if (playerRef.current.requestFullscreen) {
          playerRef.current.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
      setIsFullscreen(!isFullscreen);
    }
  };

  const setPlaybackSpeed = (speed: number) => {
    if (player) {
      player.setPlaybackRate(speed);
      setPlaybackRate(speed);
      setIsSettingsOpen(false);
    }
  };

  const jumpToTimestamp = (time: number) => {
    if (player) {
      player.seekTo(time);
      setCurrentTime(time);

      // If the video is paused, start playing
      if (!isPlaying) {
        player.playVideo();
        setIsPlaying(true);
      }
    }
  };

  const skipForward = () => {
    if (player) {
      const newTime = Math.min(currentTime + 10, duration);
      player.seekTo(newTime);
      setCurrentTime(newTime);
    }
  };

  const skipBackward = () => {
    if (player) {
      const newTime = Math.max(currentTime - 10, 0);
      player.seekTo(newTime);
      setCurrentTime(newTime);
    }
  };

  const handleAddNote = () => {
    if (newNote.trim() && player) {
      const newNoteObj: VideoNote = {
        id: Date.now().toString(),
        timeInSeconds: player.getCurrentTime(),
        text: newNote.trim(),
        createdAt: new Date().toISOString(),
      };

      setNotes((prev) => [...prev, newNoteObj]);
      setNewNote('');
    }
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== noteId));
  };

  // Format time (seconds) to MM:SS format
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Build external YouTube URL
  const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}${
    video.startTime ? `&t=${video.startTime}` : ''
  }`;

  // Handle mouse movement to show controls
  const handleMouseMove = () => {
    setShowControls(true);

    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
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

  return (
    <div
      ref={playerRef}
      className={`enhanced-video-player relative ${className}`}
      onMouseMove={handleMouseMove}
    >
      {/* YouTube IFrame */}
      <div className='aspect-video bg-black'>
        <iframe
          ref={videoRef}
          id={`player-${videoId}`}
          src={baseVideoUrl}
          width={width}
          height={height}
          title={video.title}
          frameBorder='0'
          allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
          allowFullScreen
          className='w-full h-full'
        ></iframe>
      </div>

      {/* Video Controls */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Progress Bar */}
        <div className='flex items-center mb-2'>
          <span className='text-white text-xs mr-2'>
            {formatTime(currentTime)}
          </span>
          <input
            type='range'
            min='0'
            max={duration}
            value={currentTime}
            onChange={handleSeek}
            className='flex-1 h-1.5 rounded-full'
          />
          <span className='text-white text-xs ml-2'>
            {formatTime(duration)}
          </span>
        </div>

        {/* Control Buttons */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-3'>
            <button onClick={togglePlay} className='text-white'>
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>

            <button
              onClick={skipBackward}
              className='text-white hidden sm:inline-block'
            >
              <SkipBack size={20} />
            </button>

            <button
              onClick={skipForward}
              className='text-white hidden sm:inline-block'
            >
              <SkipForward size={20} />
            </button>

            <div className='items-center ml-1 hidden sm:flex'>
              <button onClick={toggleMute} className='text-white mr-1'>
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <input
                type='range'
                min='0'
                max='100'
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className='w-20 h-1 rounded-full'
              />
            </div>
          </div>

          <div className='flex items-center space-x-3'>
            <button
              onClick={() => setShowTimestamps(!showTimestamps)}
              className={`text-white p-1 rounded ${
                showTimestamps ? 'bg-amber-600' : ''
              }`}
              title='Show timestamps'
            >
              <Clock size={18} />
            </button>

            <button
              onClick={() => setShowNotes(!showNotes)}
              className={`text-white p-1 rounded ${
                showNotes ? 'bg-amber-600' : ''
              }`}
              title='Show notes'
            >
              <MessageSquare size={18} />
            </button>

            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className='text-white'
              title='Settings'
            >
              <Settings size={18} />
            </button>

            <a
              href={youtubeUrl}
              target='_blank'
              rel='noopener noreferrer'
              className='text-white'
              title='View on YouTube'
            >
              <ExternalLink size={18} />
            </a>

            <button
              onClick={toggleFullscreen}
              className='text-white'
              title='Fullscreen'
            >
              <Maximize2 size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Settings Menu */}
      {isSettingsOpen && (
        <div className='absolute bottom-16 right-4 bg-black bg-opacity-90 rounded p-2 shadow-lg z-10'>
          <h4 className='text-white text-sm font-medium mb-2'>
            Playback Speed
          </h4>
          <div className='grid grid-cols-3 gap-1'>
            {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
              <button
                key={speed}
                onClick={() => setPlaybackSpeed(speed)}
                className={`px-2 py-1 text-xs rounded ${
                  playbackRate === speed
                    ? 'bg-amber-600 text-white'
                    : 'text-white hover:bg-gray-700'
                }`}
              >
                {speed === 1 ? 'Normal' : `${speed}x`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Timestamps */}
      {showTimestamps && timestamps.length > 0 && (
        <div className='absolute top-0 right-0 bg-black bg-opacity-90 w-64 max-h-[60%] overflow-y-auto rounded-bl shadow-lg z-10'>
          <h4 className='text-white text-sm font-medium p-3 border-b border-gray-700'>
            Timestamps
          </h4>
          <ul className='divide-y divide-gray-700'>
            {timestamps.map((timestamp, index) => (
              <li key={index} className='p-2 hover:bg-gray-800'>
                <button
                  onClick={() => jumpToTimestamp(timestamp.time)}
                  className='w-full text-left'
                >
                  <div className='flex items-start'>
                    <span className='text-amber-500 text-xs font-mono mt-1 mr-2'>
                      {formatTime(timestamp.time)}
                    </span>
                    <div>
                      <span className='text-white text-sm'>
                        {timestamp.label}
                      </span>
                      {timestamp.description && (
                        <p className='text-gray-400 text-xs mt-0.5'>
                          {timestamp.description}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Notes */}
      {showNotes && (
        <div className='absolute top-0 left-0 bg-black bg-opacity-90 w-64 max-h-[60%] overflow-y-auto rounded-br shadow-lg z-10'>
          <h4 className='text-white text-sm font-medium p-3 border-b border-gray-700'>
            Your Notes
          </h4>

          {/* Add note */}
          <div className='p-2 border-b border-gray-700'>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder='Add a note at current timestamp...'
              className='w-full p-2 text-sm bg-gray-800 text-white border border-gray-700 rounded resize-none'
              rows={2}
            />
            <button
              onClick={handleAddNote}
              className='w-full mt-1 px-2 py-1 bg-amber-600 text-white text-xs rounded hover:bg-amber-700'
            >
              Add Note
            </button>
          </div>

          {/* Notes list */}
          {notes.length > 0 ? (
            <ul className='divide-y divide-gray-700'>
              {notes.map((note) => (
                <li key={note.id} className='p-2 hover:bg-gray-800 group'>
                  <div className='flex justify-between items-start'>
                    <button
                      onClick={() => jumpToTimestamp(note.timeInSeconds)}
                      className='text-amber-500 text-xs font-mono hover:underline'
                    >
                      {formatTime(note.timeInSeconds)}
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className='text-red-500 text-xs opacity-0 group-hover:opacity-100 transition-opacity'
                    >
                      Delete
                    </button>
                  </div>
                  <p className='text-white text-sm mt-1'>{note.text}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className='text-gray-400 text-xs p-3 text-center'>
              No notes yet. Add one while watching the video.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default EnhancedVideoPlayer;
