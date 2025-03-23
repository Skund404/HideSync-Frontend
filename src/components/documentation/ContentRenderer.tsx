import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

// Manually create type declarations for missing modules
declare module 'remark-gfm';
declare module 'rehype-raw';

interface ContentRendererProps {
  content: string;
  className?: string;
  onImageLoad?: () => void;
}

// Extend the default ReactMarkdown types to include the optional "inline" prop.
interface CodeProps extends React.HTMLAttributes<HTMLElement> {
  inline?: boolean;
  className?: string;
}

// Image component extracted to properly use hooks
const LazyImage: React.FC<{
  src?: string;
  alt?: string;
  onImageLoad?: () => void;
  props?: React.ImgHTMLAttributes<HTMLImageElement>;
}> = ({ src, alt, onImageLoad, ...props }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <img
      alt={alt || 'Documentation image'}
      loading='lazy'
      data-src={src}
      src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 3 2'%3E%3C/svg%3E"
      className={`
        max-w-full rounded-lg border border-stone-200 shadow-sm
        transition-opacity duration-300 opacity-0
        ${isExpanded ? 'cursor-zoom-out' : 'cursor-zoom-in'}
      `}
      onClick={() => setIsExpanded(!isExpanded)}
      style={{
        maxHeight: isExpanded ? 'none' : '400px',
      }}
      onLoad={(e) => {
        e.currentTarget.classList.remove('opacity-0');
        if (onImageLoad) onImageLoad();
      }}
      {...props}
    />
  );
};

const ContentRenderer: React.FC<ContentRendererProps> = ({
  content,
  className = '',
  onImageLoad,
}) => {
  const [renderedContent, setRenderedContent] = useState(content);
  const rendererRef = useRef<HTMLDivElement>(null);

  // Process the content for custom components.
  useEffect(() => {
    let processed = content;
    // Replace custom alert syntax with div elements.
    // Using a multiline regex for compatibility.
    processed = processed.replace(
      /:::(\w+)\s+([\s\S]*?):::/g,
      (_, type, content) =>
        `<div class="custom-alert custom-alert-${type}">${content}</div>`
    );
    setRenderedContent(processed);
  }, [content]);

  // Observer for lazy loading images.
  useEffect(() => {
    if (rendererRef.current) {
      const lazyImages = rendererRef.current.querySelectorAll('img');
      if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                const image = entry.target as HTMLImageElement;
                if (image.dataset.src) {
                  image.src = image.dataset.src;
                  if (onImageLoad) image.onload = onImageLoad;
                  imageObserver.unobserve(image);
                }
              }
            });
          },
          { rootMargin: '200px 0px' }
        );
        lazyImages.forEach((img) => imageObserver.observe(img));
        return () => {
          lazyImages.forEach((img) => imageObserver.unobserve(img));
          imageObserver.disconnect();
        };
      }
    }
  }, [renderedContent, onImageLoad]);

  return (
    <div ref={rendererRef} className={`documentation-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h1: ({ children, ...props }) => (
            <h1
              className='text-3xl font-bold mt-8 mb-4 border-b pb-2 border-stone-200'
              {...props}
            >
              {children}
            </h1>
          ),
          h2: ({ children, ...props }) => (
            <h2 className='text-2xl font-bold mt-8 mb-3' {...props}>
              {children}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3 className='text-xl font-bold mt-6 mb-3' {...props}>
              {children}
            </h3>
          ),
          h4: ({ children, ...props }) => (
            <h4 className='text-lg font-bold mt-5 mb-2' {...props}>
              {children}
            </h4>
          ),
          h5: ({ children, ...props }) => (
            <h5 className='text-base font-bold mt-4 mb-2' {...props}>
              {children}
            </h5>
          ),
          h6: ({ children, ...props }) => (
            <h6 className='text-sm font-bold mt-4 mb-2' {...props}>
              {children}
            </h6>
          ),
          p: ({ children, ...props }) => (
            <p className='my-4' {...props}>
              {children}
            </p>
          ),
          a: ({ children, href, ...props }) => {
            // Internal documentation links.
            if (href && !href.startsWith('http') && !href.startsWith('#')) {
              if (
                href.startsWith('/documentation') ||
                href.startsWith('documentation')
              ) {
                return (
                  <Link
                    to={href}
                    className='text-amber-600 hover:text-amber-800 underline'
                    {...props}
                  >
                    {children}
                  </Link>
                );
              }
            }
            // External links or anchors.
            return (
              <a
                href={href}
                className='text-amber-600 hover:text-amber-800 underline'
                target={href?.startsWith('http') ? '_blank' : undefined}
                rel={
                  href?.startsWith('http') ? 'noopener noreferrer' : undefined
                }
                {...props}
              >
                {children}
              </a>
            );
          },
          img: ({ src, alt, ...props }) => {
            return (
              <div className='my-6 flex justify-center'>
                <LazyImage
                  src={src}
                  alt={alt}
                  onImageLoad={onImageLoad}
                  {...props}
                />
              </div>
            );
          },
          ul: ({ children, ...props }) => (
            <ul className='list-disc pl-6 my-4 space-y-2' {...props}>
              {children}
            </ul>
          ),
          ol: ({ children, ...props }) => (
            <ol className='list-decimal pl-6 my-4 space-y-2' {...props}>
              {children}
            </ol>
          ),
          li: ({ children, ...props }) => (
            <li className='pl-1' {...props}>
              {children}
            </li>
          ),
          blockquote: ({ children, ...props }) => (
            <blockquote
              className='border-l-4 border-amber-200 pl-4 py-1 my-4 bg-amber-50 italic text-stone-700'
              {...props}
            >
              {children}
            </blockquote>
          ),
          code: ({ inline, className, children, ...props }: CodeProps) => {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <div className='my-4 rounded-lg overflow-hidden'>
                <div className='bg-stone-800 text-stone-200 text-xs px-4 py-1'>
                  {match[1]}
                </div>
                <SyntaxHighlighter
                  // @ts-ignore - atomDark is compatible but TypeScript can't infer it correctly
                  style={atomDark as any}
                  language={match[1]}
                  PreTag='div'
                  className='rounded-b-lg'
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code
                className={`${
                  inline
                    ? 'bg-stone-100 text-amber-700 px-1.5 py-0.5 rounded text-sm'
                    : 'block bg-stone-100 p-4 rounded-lg overflow-x-auto my-4'
                } ${className}`}
                {...props}
              >
                {children}
              </code>
            );
          },
          table: ({ children, ...props }) => (
            <div className='overflow-x-auto my-4'>
              <table
                className='min-w-full border-collapse border border-stone-200 rounded-lg'
                {...props}
              >
                {children}
              </table>
            </div>
          ),
          thead: ({ children, ...props }) => (
            <thead className='bg-stone-100' {...props}>
              {children}
            </thead>
          ),
          tbody: ({ children, ...props }) => (
            <tbody {...props}>{children}</tbody>
          ),
          tr: ({ children, ...props }) => (
            <tr
              className='border-b border-stone-200 last:border-b-0'
              {...props}
            >
              {children}
            </tr>
          ),
          th: ({ children, ...props }) => (
            <th
              className='px-4 py-2 text-left font-semibold border-r border-stone-200 last:border-r-0'
              {...props}
            >
              {children}
            </th>
          ),
          td: ({ children, ...props }) => (
            <td
              className='px-4 py-2 border-r border-stone-200 last:border-r-0'
              {...props}
            >
              {children}
            </td>
          ),
          hr: ({ ...props }) => (
            <hr className='my-6 border-stone-200' {...props} />
          ),
          div: ({ className, children, ...props }) => {
            // Handle custom alert components.
            if (className?.includes('custom-alert')) {
              let icon = <Info size={20} />;
              let alertClass = 'bg-blue-50 border-blue-200 text-blue-700';
              if (className.includes('custom-alert-warning')) {
                icon = <AlertTriangle size={20} />;
                alertClass = 'bg-amber-50 border-amber-200 text-amber-700';
              } else if (className.includes('custom-alert-success')) {
                icon = <CheckCircle size={20} />;
                alertClass = 'bg-green-50 border-green-200 text-green-700';
              } else if (className.includes('custom-alert-error')) {
                icon = <AlertTriangle size={20} />;
                alertClass = 'bg-red-50 border-red-200 text-red-700';
              }
              return (
                <div
                  className={`my-6 p-4 border-l-4 rounded-r-lg ${alertClass}`}
                >
                  <div className='flex'>
                    <div className='flex-shrink-0 mr-3'>{icon}</div>
                    <div>{children}</div>
                  </div>
                </div>
              );
            }
            return (
              <div className={className} {...props}>
                {children}
              </div>
            );
          },
        }}
      >
        {renderedContent}
      </ReactMarkdown>
    </div>
  );
};

export default ContentRenderer;
