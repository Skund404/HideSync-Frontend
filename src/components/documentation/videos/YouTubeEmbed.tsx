import React from 'react';

interface YouTubeEmbedProps {
  videoId: string;
  title?: string;
  startTime?: number;
  autoplay?: boolean;
  showControls?: boolean;
  showRelated?: boolean;
  className?: string;
}

const YouTubeEmbed: React.FC<YouTubeEmbedProps> = ({
  videoId,
  title = 'YouTube video player',
  startTime = 0,
  autoplay = false,
  showControls = true,
  showRelated = false,
  className = '',
}) => {
  // Build URL with parameters
  const embedUrl = new URL(`https://www.youtube.com/embed/${videoId}`);

  // Add parameters
  if (startTime > 0) {
    embedUrl.searchParams.append('start', startTime.toString());
  }

  if (autoplay) {
    embedUrl.searchParams.append('autoplay', '1');
  }

  embedUrl.searchParams.append('controls', showControls ? '1' : '0');
  embedUrl.searchParams.append('rel', showRelated ? '1' : '0');

  // Add more features
  embedUrl.searchParams.append('modestbranding', '1');
  embedUrl.searchParams.append('origin', window.location.origin);

  return (
    <div className={`youtube-embed aspect-video ${className}`}>
      <iframe
        width='100%'
        height='100%'
        src={embedUrl.toString()}
        title={title}
        frameBorder='0'
        allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
        allowFullScreen
      />
    </div>
  );
};

export default YouTubeEmbed;
