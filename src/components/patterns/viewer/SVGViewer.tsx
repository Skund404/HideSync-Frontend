import React, { useEffect, useRef, useState } from 'react';
import { Annotation } from '../../../services/annotation-service';
import { handleApiError } from '../../../services/error-handler';
import { getPatternFile } from '../../../services/file-upload-service';
import { showError, showSuccess } from '../../../services/notification-service';
import ErrorMessage from '../../common/ErrorMessage';
import LoadingSpinner from '../../common/LoadingSpinner';
import AnnotationLayer from '../annotation/AnnotationLayer';

interface SVGViewerProps {
  filePath: string;
  annotations?: Annotation[];
  onAnnotationSelected?: (annotation: Annotation) => void;
  onAnnotationCreated?: (
    annotation: Omit<Annotation, 'id' | 'createdAt' | 'modifiedAt'>
  ) => void;
  onAnnotationUpdated?: (id: string, annotation: Partial<Annotation>) => void;
  onAnnotationDeleted?: (id: string) => void;
  activeAnnotationId?: string | undefined;
  setActiveAnnotationId?: (id?: string) => void;
  activeToolType?: 'text' | 'arrow' | 'measurement' | 'highlight' | null;
  showAnnotations?: boolean;
  readOnly?: boolean;
  onSVGLoaded?: (svgElement: SVGSVGElement) => void;
  onError?: (error: string) => void;
}

const SVGViewer: React.FC<SVGViewerProps> = ({
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
  onSVGLoaded,
  onError,
}) => {
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
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
  const [svgDimensions, setSvgDimensions] = useState<{
    width: number;
    height: number;
  }>({ width: 0, height: 0 });

  const svgContainerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Fetch and load SVG content
  useEffect(() => {
    const fetchSVG = async () => {
      if (!filePath) {
        setError('No file path provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const svgText = await getPatternFile<string>(filePath, 'text');

        // Basic validation that this is SVG content
        if (!svgText.trim().startsWith('<svg') && !svgText.includes('<svg')) {
          throw new Error('Invalid SVG file');
        }

        setSvgContent(svgText);
        setError(null);
      } catch (err) {
        const errorMessage = handleApiError(err, 'Failed to load SVG file');
        setError(errorMessage);

        if (onError) {
          onError(errorMessage);
        } else {
          showError(`Error loading SVG: ${errorMessage}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSVG();
  }, [filePath, onError]);

  // Extract SVG dimensions once loaded
  useEffect(() => {
    if (svgContent && svgRef.current) {
      const svg = svgRef.current;
      if (svg) {
        // Get SVG dimensions
        const width = svg.width.baseVal.value || svg.viewBox.baseVal.width;
        const height = svg.height.baseVal.value || svg.viewBox.baseVal.height;
        setSvgDimensions({ width, height });

        if (onSVGLoaded) {
          onSVGLoaded(svg);
        }
      }
    }
  }, [svgContent, onSVGLoaded]);

  // Handle mouse events for pan/zoom
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

  const downloadSVG = async () => {
    if (!svgContent) return;

    try {
      // Create a blob from the SVG content
      const blob = new Blob([svgContent], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);

      // Create a download link
      const a = document.createElement('a');
      a.href = url;
      a.download = filePath.split('/').pop() || 'pattern.svg';

      // Trigger download and clean up
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showSuccess('SVG file downloaded successfully');
    } catch (err) {
      const errorMessage = handleApiError(err, 'Failed to download SVG file');
      showError(`Error downloading SVG: ${errorMessage}`);
    }
  };

  // Transform screen coordinates to SVG coordinates considering zoom and pan
  const transformAnnotation = (x: number, y: number) => {
    // Adjust for the SVG's zoom and position
    return {
      x: (x - position.x) / zoom,
      y: (y - position.y) / zoom,
    };
  };

  // Custom handler for setActiveAnnotationId to match the expected function signature
  const handleSetActiveAnnotationId = (id?: string) => {
    if (setActiveAnnotationId) {
      setActiveAnnotationId(id);
    }
  };

  if (loading) {
    return (
      <LoadingSpinner size='medium' color='amber' message='Loading SVG...' />
    );
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={() => setSvgContent(null)} />;
  }

  if (!svgContent) {
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
          <h3 className='text-lg font-medium text-stone-700'>No SVG Content</h3>
          <p className='text-stone-500 mt-2'>
            The SVG file could not be loaded.
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
            onClick={() => setZoom((zoom) => Math.min(5, zoom + 0.1))}
            className='p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded-md'
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
            className='p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded-md'
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
            className='p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded-md'
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
          onClick={downloadSVG}
          className='p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded-md'
          title='Download SVG'
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

      {/* SVG Viewer with Annotation Layer */}
      <div
        ref={svgContainerRef}
        className='flex-1 overflow-hidden bg-white border border-stone-200 rounded-b-lg relative'
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <div
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
            height: '100%',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
          }}
        >
          <div
            ref={(el) => {
              if (el) {
                // Store the SVG element when it's loaded
                const svgEl = el.querySelector('svg');
                if (svgEl && svgRef.current !== svgEl) {
                  svgRef.current = svgEl as SVGSVGElement;
                }
              }
            }}
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        </div>

        {/* Annotation Layer */}
        {showAnnotations && svgContainerRef.current ? (
          <AnnotationLayer
            annotations={annotations}
            onAddAnnotation={onAnnotationCreated}
            onUpdateAnnotation={onAnnotationUpdated}
            onDeleteAnnotation={onAnnotationDeleted}
            activeAnnotationId={activeAnnotationId}
            setActiveAnnotationId={handleSetActiveAnnotationId}
            activeToolType={activeToolType}
            zoom={zoom}
            position={position}
            containerRef={svgContainerRef as React.RefObject<HTMLDivElement>}
            readOnly={readOnly}
            svgWidth={svgDimensions.width}
            svgHeight={svgDimensions.height}
            transformCoordinates={transformAnnotation}
          />
        ) : null}
      </div>
    </div>
  );
};

export default SVGViewer;
