// src/components/patterns/viewer/SVGViewer.tsx
import React, { useEffect, useRef, useState } from 'react';
import LoadingSpinner from '../../common/LoadingSpinner';

interface SVGViewerProps {
  filePath: string;
}

const SVGViewer: React.FC<SVGViewerProps> = ({ filePath }) => {
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

  const containerRef = useRef<HTMLDivElement>(null);

  // For demo purposes, we'll use a placeholder SVG since we don't have actual files
  useEffect(() => {
    // Simulating loading SVG from server
    setLoading(true);

    const demoTimeout = setTimeout(() => {
      // This would normally be a fetch to get the SVG file
      // For the demo, we'll create a simple SVG

      // Simple wallet pattern SVG for demo
      if (filePath.includes('bifold_wallet')) {
        const walletSvg = `
          <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
            <title>Bifold Wallet Pattern</title>
            <!-- Outer Wallet Body -->
            <rect x="50" y="50" width="300" height="180" fill="none" stroke="#333" stroke-width="2" />
            
            <!-- Inner Fold Line -->
            <line x1="200" y1="50" x2="200" y2="230" stroke="#333" stroke-dasharray="5,5" stroke-width="1" />
            
            <!-- Card Slots (Left Side) -->
            <rect x="60" y="60" width="130" height="20" fill="none" stroke="#555" stroke-width="1" />
            <rect x="60" y="90" width="130" height="20" fill="none" stroke="#555" stroke-width="1" />
            <rect x="60" y="120" width="130" height="20" fill="none" stroke="#555" stroke-width="1" />
            
            <!-- Card Slots (Right Side) -->
            <rect x="210" y="60" width="130" height="20" fill="none" stroke="#555" stroke-width="1" />
            <rect x="210" y="90" width="130" height="20" fill="none" stroke="#555" stroke-width="1" />
            <rect x="210" y="120" width="130" height="20" fill="none" stroke="#555" stroke-width="1" />
            
            <!-- Cash Pocket -->
            <rect x="210" y="150" width="130" height="70" fill="none" stroke="#555" stroke-width="1" />
            
            <!-- ID Window -->
            <rect x="60" y="150" width="130" height="70" fill="none" stroke="#555" stroke-width="1" />
            <rect x="70" y="160" width="110" height="50" fill="none" stroke="#777" stroke-dasharray="3,3" stroke-width="1" />
            
            <!-- Stitch Lines -->
            <rect x="45" y="45" width="310" height="190" fill="none" stroke="#777" stroke-dasharray="2,2" stroke-width="1" />
            
            <!-- Dimensions -->
            <text x="200" y="20" text-anchor="middle" font-family="Arial" font-size="12">9.5 inches</text>
            <line x1="50" y1="30" x2="350" y2="30" stroke="#999" stroke-width="1" />
            <line x1="50" y1="25" x2="50" y2="35" stroke="#999" stroke-width="1" />
            <line x1="350" y1="25" x2="350" y2="35" stroke="#999" stroke-width="1" />
            
            <text x="25" y="140" text-anchor="middle" font-family="Arial" font-size="12" transform="rotate(-90, 25, 140)">5.75 inches</text>
            <line x1="35" y1="50" x2="35" y2="230" stroke="#999" stroke-width="1" />
            <line x1="30" y1="50" x2="40" y2="50" stroke="#999" stroke-width="1" />
            <line x1="30" y1="230" x2="40" y2="230" stroke="#999" stroke-width="1" />
          </svg>
        `;
        setSvgContent(walletSvg);
      }
      // Card holder pattern SVG for demo
      else if (filePath.includes('card_holder')) {
        const cardHolderSvg = `
          <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
            <title>Card Holder Pattern</title>
            <!-- Outer Body -->
            <rect x="100" y="50" width="200" height="160" fill="none" stroke="#333" stroke-width="2" />
            
            <!-- Card Slots -->
            <rect x="110" y="60" width="180" height="25" fill="none" stroke="#555" stroke-width="1" />
            <rect x="110" y="95" width="180" height="25" fill="none" stroke="#555" stroke-width="1" />
            <rect x="110" y="130" width="180" height="25" fill="none" stroke="#555" stroke-width="1" />
            <rect x="110" y="165" width="180" height="25" fill="none" stroke="#555" stroke-width="1" />
            
            <!-- Fold Line -->
            <line x1="100" y1="130" x2="300" y2="130" stroke="#333" stroke-dasharray="5,5" stroke-width="1" />
            
            <!-- Stitch Lines -->
            <rect x="95" y="45" width="210" height="170" fill="none" stroke="#777" stroke-dasharray="2,2" stroke-width="1" />
            
            <!-- Dimensions -->
            <text x="200" y="30" text-anchor="middle" font-family="Arial" font-size="12">4.25 inches</text>
            <line x1="100" y1="40" x2="300" y2="40" stroke="#999" stroke-width="1" />
            <line x1="100" y1="35" x2="100" y2="45" stroke="#999" stroke-width="1" />
            <line x1="300" y1="35" x2="300" y2="45" stroke="#999" stroke-width="1" />
            
            <text x="75" y="130" text-anchor="middle" font-family="Arial" font-size="12" transform="rotate(-90, 75, 130)">3.5 inches</text>
            <line x1="85" y1="50" x2="85" y2="210" stroke="#999" stroke-width="1" />
            <line x1="80" y1="50" x2="90" y2="50" stroke="#999" stroke-width="1" />
            <line x1="80" y1="210" x2="90" y2="210" stroke="#999" stroke-width="1" />
          </svg>
        `;
        setSvgContent(cardHolderSvg);
      }
      // Default pattern
      else {
        const defaultSvg = `
          <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
            <title>Sample Pattern</title>
            <!-- Basic Rectangle Pattern -->
            <rect x="50" y="50" width="300" height="200" fill="none" stroke="#333" stroke-width="2" />
            
            <!-- Pattern Details -->
            <line x1="50" y1="150" x2="350" y2="150" stroke="#333" stroke-dasharray="5,5" stroke-width="1" />
            <rect x="75" y="75" width="250" height="150" fill="none" stroke="#555" stroke-width="1" />
            
            <!-- Pattern Labels -->
            <text x="200" y="40" text-anchor="middle" font-family="Arial" font-size="12">Sample Pattern</text>
            
            <!-- Stitch Lines -->
            <rect x="45" y="45" width="310" height="210" fill="none" stroke="#777" stroke-dasharray="2,2" stroke-width="1" />
            
            <!-- Dimensions -->
            <text x="200" y="275" text-anchor="middle" font-family="Arial" font-size="12">10 inches</text>
            <line x1="50" y1="265" x2="350" y2="265" stroke="#999" stroke-width="1" />
            <line x1="50" y1="260" x2="50" y2="270" stroke="#999" stroke-width="1" />
            <line x1="350" y1="260" x2="350" y2="270" stroke="#999" stroke-width="1" />
            
            <text x="25" y="150" text-anchor="middle" font-family="Arial" font-size="12" transform="rotate(-90, 25, 150)">7 inches</text>
            <line x1="35" y1="50" x2="35" y2="250" stroke="#999" stroke-width="1" />
            <line x1="30" y1="50" x2="40" y2="50" stroke="#999" stroke-width="1" />
            <line x1="30" y1="250" x2="40" y2="250" stroke="#999" stroke-width="1" />
          </svg>
        `;
        setSvgContent(defaultSvg);
      }

      setLoading(false);
    }, 1000);

    return () => clearTimeout(demoTimeout);
  }, [filePath]);

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

    // Adjust zoom level based on wheel direction
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    const newZoom = Math.max(0.5, Math.min(3, zoom + delta));

    setZoom(newZoom);
  };

  // Reset zoom and position
  const handleReset = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  if (loading) {
    return <LoadingSpinner message='Loading pattern...' />;
  }

  if (error) {
    return (
      <div className='bg-red-50 p-4 rounded-lg text-center'>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className='h-8 w-8 text-red-500 mx-auto mb-2'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
          />
        </svg>
        <p className='text-red-700'>{error}</p>
      </div>
    );
  }

  return (
    <div className='bg-white rounded-lg border border-stone-200 overflow-hidden'>
      {/* Toolbar */}
      <div className='flex items-center justify-between bg-stone-50 border-b border-stone-200 p-2'>
        <div className='text-sm text-stone-600'>
          Zoom: {(zoom * 100).toFixed(0)}%
        </div>

        <div className='flex items-center space-x-2'>
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
      </div>

      {/* SVG Viewer */}
      <div
        className='h-96 overflow-hidden'
        ref={containerRef}
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
            transformOrigin: 'center',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          }}
          className='h-full w-full flex items-center justify-center'
          dangerouslySetInnerHTML={{ __html: svgContent || '' }}
        />
      </div>

      {/* Bottom Tools */}
      <div className='bg-stone-50 border-t border-stone-200 p-2 text-sm text-stone-500'>
        <div className='flex items-center justify-between'>
          <div>Pan: Click and drag • Zoom: Mouse wheel or buttons</div>
          <div>
            <button className='px-2 py-1 text-amber-600 hover:text-amber-800 font-medium'>
              Download SVG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SVGViewer;
