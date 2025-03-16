// src/components/documentation/ContentRenderer.tsx

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { VideoResource } from '../../types/documentationTypes';

// Using dynamic imports for syntax highlighter to avoid TS issues
// Install with: npm install react-syntax-highlighter @types/react-syntax-highlighter
let SyntaxHighlighter: any;
let tomorrow: any;

// Dynamically import syntax highlighter
try {
  // We use require here instead of import to avoid TypeScript errors
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  SyntaxHighlighter = require('react-syntax-highlighter').Prism;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  tomorrow = require('react-syntax-highlighter/dist/esm/styles/prism').tomorrow;
} catch (error) {
  console.warn('Syntax highlighter not available:', error);
}

interface VideoEmbedProps {
  video: VideoResource;
  className?: string;
}

// Simple video embed component for use within ContentRenderer
const VideoEmbed: React.FC<VideoEmbedProps> = ({ video, className = '' }) => {
  const videoUrl = `https://www.youtube.com/embed/${video.videoId}?rel=0${
    video.startTime ? `&start=${video.startTime}` : ''
  }`;

  return (
    <div className={`video-embed rounded-lg overflow-hidden ${className}`}>
      <iframe
        src={videoUrl}
        title={video.title}
        frameBorder='0'
        allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
        allowFullScreen
        className='w-full aspect-video'
      ></iframe>
      {(video.title || video.description) && (
        <div className='bg-gray-100 p-3'>
          {video.title && <h4 className='font-medium'>{video.title}</h4>}
          {video.description && (
            <p className='text-sm text-gray-600'>{video.description}</p>
          )}
        </div>
      )}
    </div>
  );
};

interface ContentRendererProps {
  content: string;
  className?: string;
}

const ContentRenderer: React.FC<ContentRendererProps> = ({
  content,
  className,
}) => {
  // Process YouTube video embeds
  const renderVideo = (videoId: string, title: string) => {
    return (
      <VideoEmbed
        video={{
          videoId,
          title: title || 'Video Tutorial',
        }}
        className='my-4'
      />
    );
  };

  return (
    <div className={`markdown-content ${className || ''}`}>
      <ReactMarkdown
        components={{
          h1: ({ children, ...props }) => (
            <h1 className='text-2xl font-bold mb-4 mt-6' {...props}>
              {children}
            </h1>
          ),
          h2: ({ children, ...props }) => (
            <h2 className='text-xl font-bold mb-3 mt-5' {...props}>
              {children}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3 className='text-lg font-bold mb-2 mt-4' {...props}>
              {children}
            </h3>
          ),
          p: ({ node, children, ...props }) => {
            const childArray = React.Children.toArray(children);

            // Check for custom YouTube embedding syntax
            if (childArray.length === 1 && typeof childArray[0] === 'string') {
              const text = childArray[0] as string;
              const youtubeMatch =
                /@\[youtube\]\(([a-zA-Z0-9_-]+)(?:\s+"([^"]+)")?\)/.exec(text);

              if (youtubeMatch) {
                const [, videoId, title] = youtubeMatch;
                return renderVideo(videoId, title || '');
              }
            }

            return (
              <p className='mb-4' {...props}>
                {children}
              </p>
            );
          },
          ul: ({ children, ...props }) => (
            <ul className='list-disc pl-6 mb-4' {...props}>
              {children}
            </ul>
          ),
          ol: ({ children, ...props }) => (
            <ol className='list-decimal pl-6 mb-4' {...props}>
              {children}
            </ol>
          ),
          li: ({ children, ...props }) => (
            <li className='mb-1' {...props}>
              {children}
            </li>
          ),
          blockquote: ({ children, ...props }) => (
            <blockquote
              className='border-l-4 border-gray-300 pl-4 italic my-4'
              {...props}
            >
              {children}
            </blockquote>
          ),
          a: ({ children, ...props }) => (
            <a className='text-amber-600 hover:text-amber-800' {...props}>
              {children}
            </a>
          ),
          code: ({ node, className, children, ...props }) => {
            // Check if inline code or code block
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match;

            if (!isInline && SyntaxHighlighter) {
              return (
                <SyntaxHighlighter
                  style={tomorrow}
                  language={match ? match[1] : ''}
                  PreTag='div'
                  className='rounded my-4'
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              );
            }

            return (
              <code className='bg-gray-100 px-1 py-0.5 rounded' {...props}>
                {children}
              </code>
            );
          },
          table: ({ children, ...props }) => (
            <div className='overflow-x-auto my-4'>
              <table className='min-w-full border border-gray-300' {...props}>
                {children}
              </table>
            </div>
          ),
          thead: ({ children, ...props }) => (
            <thead className='bg-gray-100' {...props}>
              {children}
            </thead>
          ),
          tr: ({ children, ...props }) => (
            <tr className='border-b border-gray-300' {...props}>
              {children}
            </tr>
          ),
          th: ({ children, ...props }) => (
            <th className='px-4 py-2 text-left font-semibold' {...props}>
              {children}
            </th>
          ),
          td: ({ children, ...props }) => (
            <td className='px-4 py-2' {...props}>
              {children}
            </td>
          ),
          img: ({ src, alt, ...props }) => (
            <img
              src={src}
              alt={alt || 'Documentation image'}
              className='max-w-full h-auto my-4 rounded'
              {...props}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default ContentRenderer;
