// src/components/documentation/videos/VideoTranscript.tsx

import { Check, Clock, Copy, Download, Search } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

export interface TranscriptSegment {
  id: string;
  startTime: number; // In seconds
  endTime: number; // In seconds
  text: string;
  speaker?: string;
}

interface VideoTranscriptProps {
  videoId: string;
  transcript: TranscriptSegment[];
  currentTime?: number;
  onSegmentClick?: (startTime: number) => void;
  searchable?: boolean;
  downloadable?: boolean;
  title?: string;
  language?: string;
}

const VideoTranscript: React.FC<VideoTranscriptProps> = ({
  videoId,
  transcript,
  currentTime = 0,
  onSegmentClick,
  searchable = true,
  downloadable = true,
  title = 'Video Transcript',
  language = 'en',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSegmentId, setActiveSegmentId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const activeSegmentRef = useRef<HTMLDivElement>(null);

  // Find the active segment based on current playback time
  useEffect(() => {
    if (transcript.length && currentTime >= 0) {
      const active = transcript.find(
        (segment) =>
          currentTime >= segment.startTime && currentTime < segment.endTime
      );

      if (active) {
        setActiveSegmentId(active.id);
      }
    }
  }, [currentTime, transcript]);

  // Scroll to active segment
  useEffect(() => {
    if (activeSegmentId && activeSegmentRef.current) {
      activeSegmentRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeSegmentId]);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle segment click to seek video
  const handleSegmentClick = (startTime: number) => {
    if (onSegmentClick) {
      onSegmentClick(startTime);
    }
  };

  // Filter transcript based on search term
  const filteredTranscript = searchTerm
    ? transcript.filter(
        (segment) =>
          segment.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (segment.speaker &&
            segment.speaker.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : transcript;

  // Generate downloadable transcript
  const generateDownloadableTranscript = (): string => {
    let content = `# ${title}\n\n`;

    if (transcript.length > 0) {
      let currentSpeaker = '';

      transcript.forEach((segment) => {
        const timeStamp = formatTime(segment.startTime);

        if (segment.speaker && segment.speaker !== currentSpeaker) {
          currentSpeaker = segment.speaker;
          content += `\n[${timeStamp}] ${currentSpeaker}:\n`;
        }

        content += segment.speaker
          ? `${segment.text}\n`
          : `[${timeStamp}] ${segment.text}\n`;
      });
    } else {
      content += 'No transcript available.';
    }

    return content;
  };

  // Handle transcript download
  const handleDownload = () => {
    const content = generateDownloadableTranscript();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript-${videoId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle copy transcript to clipboard
  const handleCopy = () => {
    const content = generateDownloadableTranscript();
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className='video-transcript rounded-lg border shadow-sm overflow-hidden'>
      <div className='bg-gray-50 p-3 border-b flex justify-between items-center'>
        <h3 className='font-medium text-gray-900'>{title}</h3>

        <div className='flex space-x-2'>
          {downloadable && (
            <>
              <button
                onClick={handleCopy}
                className='text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-100'
                title='Copy transcript'
              >
                {copied ? (
                  <Check size={18} className='text-green-500' />
                ) : (
                  <Copy size={18} />
                )}
              </button>

              <button
                onClick={handleDownload}
                className='text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-100'
                title='Download transcript'
              >
                <Download size={18} />
              </button>
            </>
          )}
        </div>
      </div>

      {searchable && (
        <div className='p-3 border-b bg-white'>
          <div className='relative'>
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <Search size={16} className='text-gray-400' />
            </div>
            <input
              type='text'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder='Search transcript...'
              className='block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm'
            />
          </div>

          {searchTerm && (
            <div className='mt-2 text-xs text-gray-500'>
              Found {filteredTranscript.length} match
              {filteredTranscript.length !== 1 ? 'es' : ''}
            </div>
          )}
        </div>
      )}

      <div className='overflow-y-auto max-h-[400px] p-1'>
        {filteredTranscript.length > 0 ? (
          <div className='space-y-1'>
            {filteredTranscript.map((segment) => {
              const isActive = segment.id === activeSegmentId;

              // Highlight matching text if search is active
              let displayText = segment.text;
              if (searchTerm) {
                const regex = new RegExp(`(${searchTerm})`, 'gi');
                displayText = segment.text.replace(regex, '<mark>$1</mark>');
              }

              return (
                <div
                  key={segment.id}
                  ref={isActive ? activeSegmentRef : null}
                  className={`p-2 rounded hover:bg-gray-100 cursor-pointer ${
                    isActive ? 'bg-amber-50 border-l-4 border-amber-500' : ''
                  }`}
                  onClick={() => handleSegmentClick(segment.startTime)}
                >
                  <div className='flex'>
                    <div className='flex-shrink-0 text-amber-600 font-mono text-xs w-10 mt-1'>
                      <span className='inline-flex items-center'>
                        <Clock size={12} className='mr-1' />
                        {formatTime(segment.startTime)}
                      </span>
                    </div>

                    <div className='flex-1 min-w-0'>
                      {segment.speaker && (
                        <span className='text-xs font-semibold text-gray-700 block mb-1'>
                          {segment.speaker}:
                        </span>
                      )}
                      <span
                        className='text-sm text-gray-800'
                        dangerouslySetInnerHTML={{ __html: displayText }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className='p-4 text-center text-gray-500'>
            {searchTerm
              ? 'No matching segments found. Try a different search term.'
              : 'No transcript available for this video.'}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoTranscript;
