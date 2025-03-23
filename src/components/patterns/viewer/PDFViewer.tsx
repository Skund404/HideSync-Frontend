// src/components/patterns/viewer/PDFViewer.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Annotation } from '../../../services/annotation-service';
import { handleApiError } from '../../../services/error-handler';
import { getPatternFile } from '../../../services/file-upload-service';
import { showError, showSuccess } from '../../../services/notification-service';
import ErrorBoundary from '../../common/ErrorBoundary';
import ErrorMessage from '../../common/ErrorMessage';
import LoadingSpinner from '../../common/LoadingSpinner';
import AnnotationLayer from '../annotation/AnnotationLayer';

interface PDFViewerProps {
  filePath: string;
  annotations?: Annotation[];
  onAnnotationSelected?: (annotation: Annotation) => void;
  onAnnotationCreated?: (
    annotation: Omit<Annotation, 'id' | 'createdAt' | 'modifiedAt'>
  ) => void;
  onAnnotationUpdated?: (id: string, annotation: Partial<Annotation>) => void;
  onAnnotationDeleted?: (id: string) => void;
  activeAnnotationId?: string;
  setActiveAnnotationId?: (id?: string) => void;
  activeToolType?: 'text' | 'arrow' | 'measurement' | 'highlight' | null;
  showAnnotations?: boolean;
  readOnly?: boolean;
  onError?: (error: string) => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({
  filePath,
  annotations = [],
  onAnnotationSelected,
  onAnnotationCreated,
  onAnnotationUpdated,
  onAnnotationDeleted,
  activeAnnotationId,
  setActiveAnnotationId,
  activeToolType,
  showAnnotations = true,
  readOnly = false,
  onError,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [pageDimensions, setPageDimensions] = useState<{
    width: number;
    height: number;
  }>({ width: 0, height: 0 });
  const [currentPageAnnotations, setCurrentPageAnnotations] = useState<
    Annotation[]
  >([]);

  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const fetchPDF = async () => {
      if (!filePath) {
        setError('No file path provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const pdfBlob = await getPatternFile<Blob>(filePath, 'blob');

        // Verify that it's a PDF file
        if (pdfBlob.type !== 'application/pdf') {
          throw new Error('Invalid PDF file type');
        }

        // Create an object URL from the blob
        const url = URL.createObjectURL(pdfBlob);
        setPdfUrl(url);
        setError(null);

        // For PDF.js integration, we would handle page count here
        // For now, using a simplified approach
        try {
          // In a real integration with PDF.js, we would get actual page count
          // Mocking with a timeout for demonstration
          setTimeout(() => {
            const pages = Math.floor(Math.random() * 5) + 1;
            setTotalPages(pages);
            setLoading(false);
          }, 1000);
        } catch (innerError) {
          console.error('Error getting PDF page count:', innerError);
          setTotalPages(1);
          setLoading(false);
        }
      } catch (err) {
        const errorMessage = handleApiError(err, 'Failed to load PDF file');
        setError(errorMessage);

        if (onError) {
          onError(errorMessage);
        } else {
          showError(`Error loading PDF: ${errorMessage}`);
        }
        setLoading(false);
      }
    };

    fetchPDF();

    // Clean up the URL when the component unmounts
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [filePath, onError, pdfUrl]);

  // Filter annotations for the current page
  useEffect(() => {
    if (annotations && annotations.length > 0) {
      // Filter annotations for the current page
      const filteredAnnotations = annotations.filter(
        (ann) => ann.pageNumber === undefined || ann.pageNumber === pageNumber
      );
      setCurrentPageAnnotations(filteredAnnotations);
    } else {
      setCurrentPageAnnotations([]);
    }
  }, [annotations, pageNumber]);

  // Handle PDF iframe load to get dimensions
  const handleIframeLoad = () => {
    if (iframeRef.current) {
      try {
        // Try to get dimensions from iframe content
        // This may not work across all browsers due to security restrictions
        setTimeout(() => {
          // Standard PDF page dimensions (US Letter)
          setPageDimensions({
            width: 800, // Default width for display
            height: 1100, // Default height for display
          });
        }, 500);
      } catch (e) {
        console.warn('Unable to get PDF dimensions:', e);
        // Use default dimensions
        setPageDimensions({
          width: 800,
          height: 1100,
        });
      }
    }
  };

  const handlePreviousPage = () => {
    if (pageNumber > 1) {
      // Save any unsaved annotations before changing pages
      setPageNumber(pageNumber - 1);
    }
  };

  const handleNextPage = () => {
    if (pageNumber < totalPages) {
      // Save any unsaved annotations before changing pages
      setPageNumber(pageNumber + 1);
    }
  };

  const handleZoomIn = () => {
    setScale((scale) => Math.min(2.0, scale + 0.1));
  };

  const handleZoomOut = () => {
    setScale((scale) => Math.max(0.5, scale - 0.1));
  };

  const handleDownload = async () => {
    if (!pdfUrl) return;

    try {
      // Create a download link
      const a = document.createElement('a');
      a.href = pdfUrl;
      a.download = filePath.split('/').pop() || 'pattern.pdf';

      // Trigger download
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      showSuccess('PDF file downloaded successfully');
    } catch (err) {
      const errorMessage = handleApiError(err, 'Failed to download PDF file');
      showError(`Error downloading PDF: ${errorMessage}`);
    }
  };

  // Wrap annotation creation to include page number
  const handleAnnotationCreated = (
    annotation: Omit<Annotation, 'id' | 'createdAt' | 'modifiedAt'>
  ) => {
    if (onAnnotationCreated) {
      // Add current page number to the annotation
      onAnnotationCreated({
        ...annotation,
        pageNumber: pageNumber,
      });
    }
  };

  // Custom handler for setActiveAnnotationId to match the expected function signature
  const handleSetActiveAnnotationId = (id?: string) => {
    if (setActiveAnnotationId) {
      setActiveAnnotationId(id);
    }
  };

  if (loading) {
    return (
      <LoadingSpinner size='medium' color='amber' message='Loading PDF...' />
    );
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={() => setPdfUrl(null)} />;
  }

  if (!pdfUrl) {
    return (
      <div className='flex items-center justify-center h-96 bg-stone-100 rounded-lg'>
        <div className='text-center p-6'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-12 w-12 text-stone-400 mx-auto mb-4'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
            />
          </svg>
          <h3 className='text-lg font-medium text-stone-700'>No PDF Content</h3>
          <p className='text-stone-500 mt-2'>
            The PDF file could not be loaded.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col h-full'>
      {/* Controls */}
      <div className='flex justify-between items-center p-2 bg-stone-100 rounded-t-lg'>
        <div className='flex items-center space-x-2'>
          <button
            onClick={handleZoomIn}
            className='p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded-md transition-colors'
            title='Zoom In'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-5 w-5'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7'
              />
            </svg>
          </button>
          <button
            onClick={handleZoomOut}
            className='p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded-md transition-colors'
            title='Zoom Out'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-5 w-5'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7'
              />
            </svg>
          </button>
          <span className='text-sm text-stone-600'>
            Zoom: {Math.round(scale * 100)}%
          </span>
        </div>

        <div className='flex items-center space-x-2'>
          <button
            onClick={handlePreviousPage}
            disabled={pageNumber <= 1}
            className={`p-2 rounded-md transition-colors ${
              pageNumber <= 1
                ? 'text-stone-400 cursor-not-allowed'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200'
            }`}
            title='Previous Page'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-5 w-5'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M15 19l-7-7 7-7'
              />
            </svg>
          </button>
          <span className='text-sm text-stone-600'>
            Page {pageNumber} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={pageNumber >= totalPages}
            className={`p-2 rounded-md transition-colors ${
              pageNumber >= totalPages
                ? 'text-stone-400 cursor-not-allowed'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200'
            }`}
            title='Next Page'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-5 w-5'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9 5l7 7-7 7'
              />
            </svg>
          </button>
        </div>

        <button
          onClick={handleDownload}
          className='p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded-md transition-colors'
          title='Download PDF'
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-5 w-5'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4'
            />
          </svg>
        </button>
      </div>

      {/* PDF Viewer with Annotations */}
      <ErrorBoundary>
        <div className='flex-1 overflow-auto bg-stone-200 border border-stone-200 rounded-b-lg flex justify-center relative'>
          <div
            ref={pdfContainerRef}
            style={{
              transform: `scale(${scale})`,
              transformOrigin: 'top center',
              transition: 'transform 0.2s ease-out',
              padding: '20px',
              position: 'relative',
            }}
          >
            <iframe
              ref={iframeRef}
              src={`${pdfUrl}#page=${pageNumber}`}
              title='PDF Viewer'
              className='bg-white shadow-lg'
              style={{ width: '800px', height: '1100px' }}
              onLoad={handleIframeLoad}
            />

            {/* Annotation Layer */}
            {showAnnotations && pdfContainerRef.current ? (
              <AnnotationLayer
                annotations={currentPageAnnotations}
                onAddAnnotation={handleAnnotationCreated}
                onUpdateAnnotation={onAnnotationUpdated}
                onDeleteAnnotation={onAnnotationDeleted}
                activeAnnotationId={activeAnnotationId}
                setActiveAnnotationId={handleSetActiveAnnotationId}
                activeToolType={activeToolType}
                zoom={scale}
                position={{ x: 0, y: 0 }} // PDF doesn't support panning, just scaling
                containerRef={
                  pdfContainerRef as React.RefObject<HTMLDivElement>
                }
                readOnly={readOnly}
                svgWidth={pageDimensions.width}
                svgHeight={pageDimensions.height}
              />
            ) : null}
          </div>
        </div>
      </ErrorBoundary>
    </div>
  );
};

export default PDFViewer;
