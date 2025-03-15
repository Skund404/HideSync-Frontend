// src/components/patterns/viewer/ImageViewer.tsx
import React, { useRef, useState } from 'react';
import LoadingSpinner from '../../common/LoadingSpinner';

interface ImageViewerProps {
  filePath: string;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ filePath }) => {
  const [loading, setLoading] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [showGrid, setShowGrid] = useState(false);
  const [showRuler, setShowRuler] = useState(false);

  const imageRef = useRef<HTMLImageElement>(null);

  // For a real implementation, we would fetch the actual image
  // For demo purposes, we'll use a placeholder image
  const getImageUrl = () => {
    // For demo, we'll use different placeholders based on the pattern type
    if (filePath.includes('knife_sheath')) {
      return '/api/placeholder/800/600';
    }
    return '/api/placeholder/600/400';
  };

  // Handle mouse down for dragging
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; // Only left mouse button

    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });

    // Prevent text selection during drag
    e.preventDefault();
  };

  // Handle mouse move for dragging
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;

    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;

    setPosition({
      x: position.x + dx,
      y: position.y + dy,
    });

    setDragStart({ x: e.clientX, y: e.clientY });
  };

  // Handle mouse up to end dragging
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle mouse wheel for zooming
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();

    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    const newZoom = Math.max(0.5, Math.min(3, zoom + delta));

    setZoom(newZoom);
  };

  // Reset zoom and position
  const handleReset = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  // Toggle grid overlay
  const handleToggleGrid = () => {
    setShowGrid(!showGrid);
  };

  // Toggle ruler overlay
  const handleToggleRuler = () => {
    setShowRuler(!showRuler);
  };

  // Handle brightness adjustment
  const handleBrightnessAdjust = () => {
    // In a real app, this would adjust image brightness
    console.log('Brightness adjustment would be implemented here');
  };

  // Handle contrast adjustment
  const handleContrastAdjust = () => {
    // In a real app, this would adjust image contrast
    console.log('Contrast adjustment would be implemented here');
  };

  if (loading) {
    return <LoadingSpinner message='Loading image...' />;
  }

  return (
    <div className='bg-white rounded-lg border border-stone-200 overflow-hidden'>
      {/* Toolbar */}
      <div className='flex flex-wrap items-center justify-between bg-stone-50 border-b border-stone-200 p-2'>
        <div className='flex items-center space-x-2 mb-2 sm:mb-0'>
          <div className='text-sm text-stone-600'>
            Zoom: {(zoom * 100).toFixed(0)}%
          </div>

          <button
            className='p-1 text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded'
            onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
            aria-label='Zoom out'
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
                d='M20 12H4'
              />
            </svg>
          </button>

          <button
            className='p-1 text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded'
            onClick={() => setZoom(Math.min(3, zoom + 0.1))}
            aria-label='Zoom in'
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
                d='M12 4v16m8-8H4'
              />
            </svg>
          </button>

          <button
            className='p-1 text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded'
            onClick={handleReset}
            aria-label='Reset view'
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
        </div>

        <div className='flex items-center space-x-2'>
          <button
            className={`p-1 rounded ${
              showGrid
                ? 'bg-amber-100 text-amber-700'
                : 'text-stone-500 hover:text-stone-700 hover:bg-stone-100'
            }`}
            onClick={handleToggleGrid}
            aria-label='Toggle grid'
            title='Toggle grid overlay'
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
                d='M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z'
              />
            </svg>
          </button>

          <button
            className={`p-1 rounded ${
              showRuler
                ? 'bg-amber-100 text-amber-700'
                : 'text-stone-500 hover:text-stone-700 hover:bg-stone-100'
            }`}
            onClick={handleToggleRuler}
            aria-label='Toggle ruler'
            title='Toggle ruler overlay'
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
                d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
              />
            </svg>
          </button>

          <button
            className='p-1 text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded'
            onClick={handleBrightnessAdjust}
            aria-label='Adjust brightness'
            title='Adjust brightness'
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
                d='M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z'
              />
            </svg>
          </button>

          <button
            className='p-1 text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded'
            onClick={handleContrastAdjust}
            aria-label='Adjust contrast'
            title='Adjust contrast'
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
                d='M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z'
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Image Viewer */}
      <div
        className='h-96 bg-stone-800 relative overflow-hidden'
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        {/* Grid Overlay */}
        {showGrid && (
          <div className='absolute inset-0 pointer-events-none z-10'>
            <div
              className='w-full h-full'
              style={{
                backgroundImage:
                  'linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)',
                backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
                transform: `translate(${position.x % (20 * zoom)}px, ${
                  position.y % (20 * zoom)
                }px)`,
              }}
            ></div>
          </div>
        )}

        {/* Rulers Overlay */}
        {showRuler && (
          <>
            {/* Horizontal Ruler */}
            <div className='absolute top-0 left-0 right-0 h-6 bg-stone-700 border-b border-stone-600 flex items-center z-10'>
              {[...Array(30)].map((_, i) => (
                <div
                  key={`h-${i}`}
                  className='relative'
                  style={{ left: `${i * 50 * zoom + position.x}px` }}
                >
                  <div className='absolute h-3 border-l border-stone-400'></div>
                  <div
                    className='absolute top-3 text-stone-400 text-xs'
                    style={{ transform: 'translateX(-50%)' }}
                  >
                    {i * 5}cm
                  </div>
                </div>
              ))}
            </div>

            {/* Vertical Ruler */}
            <div className='absolute top-6 left-0 bottom-0 w-6 bg-stone-700 border-r border-stone-600 flex flex-col items-center z-10'>
              {[...Array(20)].map((_, i) => (
                <div
                  key={`v-${i}`}
                  className='relative'
                  style={{ top: `${i * 50 * zoom + position.y}px` }}
                >
                  <div className='absolute w-3 border-t border-stone-400'></div>
                  <div
                    className='absolute left-3 text-stone-400 text-xs'
                    style={{ transform: 'translateY(-50%)' }}
                  >
                    {i * 5}cm
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Image */}
        <div
          className='h-full w-full flex items-center justify-center'
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
            transformOrigin: 'center',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
            paddingTop: showRuler ? '24px' : '0',
            paddingLeft: showRuler ? '24px' : '0',
          }}
        >
          <img
            ref={imageRef}
            src={getImageUrl()}
            alt='Pattern'
            className='max-h-full max-w-full'
            onLoad={() => setLoading(false)}
          />
        </div>
      </div>

      {/* Bottom Tools */}
      <div className='bg-stone-50 border-t border-stone-200 p-2 text-sm text-stone-500'>
        <div className='flex items-center justify-between'>
          <div>Pan: Click and drag • Zoom: Mouse wheel or buttons</div>
          <div>
            <button className='px-2 py-1 text-amber-600 hover:text-amber-800 font-medium'>
              Download Image
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageViewer;
