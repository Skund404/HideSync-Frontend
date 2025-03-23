// src/components/documentation/printable/PrintableGuide.tsx
import { ArrowLeft, Printer, Save } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDocumentation } from '../../../context/DocumentationContext';
import ErrorMessage from '../../common/ErrorMessage';
import LoadingSpinner from '../../common/LoadingSpinner';
import ContentRenderer from '../ContentRenderer';

const PrintableGuide: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { fetchResourceById, currentResource, loading, error } =
    useDocumentation();
  const [isPrinting, setIsPrinting] = useState(false);
  const printableContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      fetchResourceById(id);
    }

    // Set up print media change detection
    const beforePrintHandler = () => setIsPrinting(true);
    const afterPrintHandler = () => setIsPrinting(false);

    window.addEventListener('beforeprint', beforePrintHandler);
    window.addEventListener('afterprint', afterPrintHandler);

    return () => {
      window.removeEventListener('beforeprint', beforePrintHandler);
      window.removeEventListener('afterprint', afterPrintHandler);
    };
  }, [id, fetchResourceById]);

  // Handle print click
  const handlePrint = () => {
    window.print();
  };

  // Handle save for offline use
  const handleSaveOffline = () => {
    if (!currentResource) return;

    try {
      // Get existing saved guides
      const savedGuidesJson =
        localStorage.getItem('hidesync_offline_guides') || '[]';
      const savedGuides = JSON.parse(savedGuidesJson);

      // Check if guide is already saved
      if (!savedGuides.includes(currentResource.id)) {
        // Add to saved guides index
        savedGuides.push(currentResource.id);
        localStorage.setItem(
          'hidesync_offline_guides',
          JSON.stringify(savedGuides)
        );

        // Save the resource content
        localStorage.setItem(
          `hidesync_guide_${currentResource.id}`,
          JSON.stringify(currentResource)
        );
        localStorage.setItem(
          `hidesync_guide_${currentResource.id}_saved_at`,
          new Date().toISOString()
        );

        alert('Guide saved for offline use');
      } else {
        alert('This guide is already saved for offline use');
      }
    } catch (error) {
      console.error('Error saving guide offline:', error);
      alert('Failed to save guide offline');
    }
  };

  if (loading) {
    return (
      <div className='flex justify-center my-12'>
        <LoadingSpinner message='Loading documentation...' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='max-w-4xl mx-auto p-6'>
        <ErrorMessage
          message={`Error loading printable guide: ${error}`}
          onRetry={() => id && fetchResourceById(id)}
        />
      </div>
    );
  }

  if (!currentResource) {
    return (
      <div className='max-w-4xl mx-auto p-6'>
        <p className='text-stone-600'>Resource not found.</p>
      </div>
    );
  }

  return (
    <div className={`printable-guide ${isPrinting ? 'is-printing' : ''}`}>
      {/* Print control buttons - hidden during printing */}
      <div className='print:hidden bg-white sticky top-0 z-10 border-b border-stone-200 p-4 flex justify-between items-center shadow-sm'>
        <Link
          to={`/documentation/article/${id}`}
          className='flex items-center text-stone-600 hover:text-stone-800'
        >
          <ArrowLeft size={16} className='mr-1' />
          Back to Article
        </Link>

        <div className='flex space-x-3'>
          <button
            onClick={handleSaveOffline}
            className='px-4 py-2 border border-stone-300 text-stone-700 rounded-md hover:bg-stone-50 flex items-center'
          >
            <Save size={16} className='mr-2' />
            Save Offline
          </button>

          <button
            onClick={handlePrint}
            className='px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 flex items-center'
          >
            <Printer size={16} className='mr-2' />
            Print this Guide
          </button>
        </div>
      </div>

      {/* Printed header - only visible during printing */}
      <div className='hidden print:block mb-8'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold'>{currentResource.title}</h1>
          <p className='text-stone-600 mt-2'>
            Generated from {window.location.origin} on{' '}
            {new Date().toLocaleDateString()}
          </p>
        </div>
        <hr className='my-4 border-stone-300' />
      </div>

      {/* Main content */}
      <div className='max-w-4xl mx-auto p-6 bg-white' ref={printableContentRef}>
        {/* Document metadata */}
        <div className='mb-8 print:hidden'>
          <h1 className='text-3xl font-bold'>{currentResource.title}</h1>

          <div className='mt-4 flex flex-wrap items-center text-stone-600 text-sm gap-x-4 gap-y-2'>
            <div>Author: {currentResource.author}</div>
            <div>
              Last Updated:{' '}
              {new Date(currentResource.lastUpdated).toLocaleDateString()}
            </div>
            <div>Category: {currentResource.category.replace(/_/g, ' ')}</div>
            <div>Type: {currentResource.type}</div>
          </div>

          {currentResource.tags?.length > 0 && (
            <div className='mt-4 flex flex-wrap gap-2'>
              {currentResource.tags.map((tag) => (
                <span
                  key={tag}
                  className='px-2 py-1 bg-stone-100 text-stone-700 rounded-full text-xs'
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className='prose max-w-none print:text-sm'>
          <ContentRenderer content={currentResource.content} />
        </div>

        {/* Videos section - if any */}
        {currentResource.videos && currentResource.videos.length > 0 && (
          <div className='mt-8 print:mt-12'>
            <h2 className='text-xl font-bold mb-4'>Related Videos</h2>
            <div className='space-y-4'>
              {currentResource.videos.map((video) => (
                <div key={video.videoId} className='border rounded-lg p-4'>
                  <h3 className='font-medium'>{video.title}</h3>
                  {video.description && (
                    <p className='text-stone-600 mt-1'>{video.description}</p>
                  )}
                  <p className='text-sm text-amber-600 mt-2'>
                    <a
                      href={`https://www.youtube.com/watch?v=${video.videoId}`}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='hover:underline'
                    >
                      View Video on YouTube
                    </a>
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer for print */}
        <div className='hidden print:block mt-8 pt-4 border-t border-stone-300 text-stone-600 text-xs'>
          <p>
            This document was printed from {window.location.origin}
            /documentation/article/{id}
          </p>
          <p className='mt-1'>
            © {new Date().getFullYear()} HideSync. All rights reserved.
          </p>
        </div>
      </div>

      {/* Print-specific styles */}
      <style>{`
        @media print {
          .printable-guide {
            font-size: 12pt;
          }
          
          .prose h1 {
            font-size: 18pt;
          }
          
          .prose h2 {
            font-size: 16pt;
          }
          
          .prose h3 {
            font-size: 14pt;
          }
          
          .prose pre, .prose code {
            font-size: 10pt;
          }
          
          @page {
            margin: 1.5cm;
          }
        }
      `}</style>
    </div>
  );
};

export default PrintableGuide;
