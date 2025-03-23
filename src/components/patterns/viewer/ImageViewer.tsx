// src/components/patterns/viewer/ImageViewer.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Annotation } from '../../../services/annotation-service';
import { handleApiError } from '../../../services/error-handler';
import { getPatternFile } from '../../../services/file-upload-service';
import { showError, showSuccess } from '../../../services/notification-service';
import ErrorBoundary from '../../common/ErrorBoundary';
import ErrorMessage from '../../common/ErrorMessage';
import LoadingSpinner from '../../common/LoadingSpinner';
import AnnotationLayer from '../annotation/AnnotationLayer';

interface ImageViewerProps {
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

const ImageViewer: React.FC<ImageViewerProps> = ({
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
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [position, setPosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [imageDimensions, setImageDimensions] = useState<{
    width: number;
    height: number;
  }>({ width: 0, height: 0 });
  const [loadingRetries, setLoadingRetries] = useState<number>(0);

  const imageContainerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const fetchImage = async () => {
      if (!filePath) {
        setError('No file path provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const imageBlob = await getPatternFile<Blob>(filePath, 'blob');

        // Verify that it's an image file
        if (!imageBlob.type.startsWith('image/')) {
          throw new Error('Invalid image file type');
        }

        // Create an object URL from the blob
        const url = URL.createObjectURL(imageBlob);
        setImageUrl(url);
        setError(null);
      } catch (err) {
        const errorMessage = handleApiError(err, 'Failed to load image file');
        setError(errorMessage);

        if (onError) {
          onError(errorMessage);
        } else {
          showError(`Error loading image: ${errorMessage}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchImage();

    // Clean up the URL when the component unmounts
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [filePath, onError, loadingRetries, imageUrl]);

  // Get image dimensions once it's loaded
  const handleImageLoad = () => {
    if (imageRef.current) {
      setImageDimensions({
        width: imageRef.current.naturalWidth,
        height: imageRef.current.naturalHeight,
      });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      // Left mouse button
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;

      setPosition({
        x: position.x + deltaX,
        y: position.y + deltaY,
      });

      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();

    // Calculate zoom factor
    const zoomFactor = 0.1;
    const delta = e.deltaY < 0 ? zoomFactor : -zoomFactor;
    const newZoom = Math.max(0.1, Math.min(5, zoom + delta));

    setZoom(newZoom);
  };

  const resetView = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleDownload = async () => {
    if (!imageUrl) return;

    try {
      // Create a download link
      const a = document.createElement('a');
      a.href = imageUrl;
      a.download = filePath.split('/').pop() || 'pattern.jpg';

      // Trigger download
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      showSuccess('Image downloaded successfully');
    } catch (err) {
      const errorMessage = handleApiError(err, 'Failed to download image file');
      showError(`Error downloading image: ${errorMessage}`);
    }
  };

  const handleRetry = () => {
    setLoadingRetries((prev) => prev + 1);
  };

  // Custom handler for setActiveAnnotationId to match the expected function signature
  const handleSetActiveAnnotationId = (id?: string) => {
    if (setActiveAnnotationId) {
      setActiveAnnotationId(id);
    }
  };

  if (loading) {
    return (
      <LoadingSpinner size='medium' color='amber' message='Loading image...' />
    );
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={handleRetry} />;
  }

  if (!imageUrl) {
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
          <h3 className='text-lg font-medium text-stone-700'>
            No Image Content
          </h3>
          <p className='text-stone-500 mt-2'>
            The image file could not be loaded.
          </p>
          <button
            onClick={handleRetry}
            className='mt-4 px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors'
          >
            Try Again
          </button>
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
            onClick={() => setZoom((zoom) => Math.min(5, zoom + 0.1))}
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
            onClick={() => setZoom((zoom) => Math.max(0.1, zoom - 0.1))}
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
          <button
            onClick={resetView}
            className='p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded-md transition-colors'
            title='Reset View'
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
                d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
              />
            </svg>
          </button>
          <span className='text-sm text-stone-600'>
            Zoom: {Math.round(zoom * 100)}%
          </span>
        </div>
        <button
          onClick={handleDownload}
          className='p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded-md transition-colors'
          title='Download Image'
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

      {/* Image Viewer with Annotations */}
      <ErrorBoundary>
        <div
          ref={imageContainerRef}
          className='flex-1 overflow-hidden bg-stone-200 border border-stone-200 rounded-b-lg flex justify-center items-center relative'
          onMouseDown={(e) => {
            // Only initiate drag if not clicking on an annotation
            if (
              e.target === imageRef.current ||
              e.target === imageContainerRef.current
            ) {
              handleMouseDown(e);
            }
          }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          <img
            ref={imageRef}
            src={imageUrl}
            alt='Pattern'
            className='max-w-full max-h-full'
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
              transition: isDragging ? 'none' : 'transform 0.1s ease-out',
            }}
            onLoad={handleImageLoad}
            onDragStart={(e) => e.preventDefault()} // Prevent browser's default drag behavior
            onError={() => {
              setError('Failed to load image content');
              if (onError) {
                onError('Failed to load image content');
              }
            }}
          />

          {/* Annotation Layer */}
          {showAnnotations && imageContainerRef.current ? (
            <AnnotationLayer
              annotations={annotations || []}
              onAddAnnotation={onAnnotationCreated}
              onUpdateAnnotation={onAnnotationUpdated}
              onDeleteAnnotation={onAnnotationDeleted}
              activeAnnotationId={activeAnnotationId}
              setActiveAnnotationId={handleSetActiveAnnotationId}
              activeToolType={activeToolType}
              zoom={zoom}
              position={position}
              containerRef={
                imageContainerRef as React.RefObject<HTMLDivElement>
              }
              readOnly={readOnly}
              svgWidth={imageDimensions.width}
              svgHeight={imageDimensions.height}
            />
          ) : null}
        </div>
      </ErrorBoundary>
    </div>
  );
};

export default ImageViewer;
