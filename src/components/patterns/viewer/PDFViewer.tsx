// src/components/patterns/viewer/PDFViewer.tsx
import React, { useState } from 'react';
import LoadingSpinner from '../../common/LoadingSpinner';

interface PDFViewerProps {
  filePath: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ filePath }) => {
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages] = useState(3); // Mock total pages
  const [zoom, setZoom] = useState(1);

  // For a real implementation, we would use a PDF rendering library like pdf.js
  // This is a simplified mock version

  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 0.25, 0.5));
  };

  const handleResetZoom = () => {
    setZoom(1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Mock PDF rendering - in a real app, we would render the actual PDF
  const renderPdfPagePreview = () => {
    const getPagePreview = () => {
      if (filePath.includes('custom_belt')) {
        return (
          <div
            className='bg-white border border-stone-200 shadow-sm p-4 rounded'
            style={{ transform: `scale(${zoom})` }}
          >
            <div className='text-center mb-4 text-stone-500 text-xs'>
              Custom Belt Pattern - Page {currentPage} of {totalPages}
            </div>

            {currentPage === 1 && (
              <div className='text-center'>
                <h2 className='text-lg font-bold mb-4'>Custom Belt Pattern</h2>
                <p className='mb-2'>Materials:</p>
                <ul className='list-disc text-left pl-8 mb-4'>
                  <li>8-10 oz Vegetable Tanned Leather (1.5" strip)</li>
                  <li>Belt Buckle of Choice</li>
                  <li>2 Chicago Screws</li>
                  <li>Edge Paint/Burnishing Gum</li>
                </ul>

                <div className='border-t border-stone-200 pt-4 mt-4'>
                  <p className='text-sm mb-4'>
                    This pattern includes templates for standard belt sizes from
                    28" to 44". Templates can be adjusted for custom sizing.
                  </p>
                </div>
              </div>
            )}

            {currentPage === 2 && (
              <div>
                <h3 className='text-md font-bold mb-4'>
                  Belt Dimensions & Cutting Template
                </h3>
                <div className='flex justify-center mb-6'>
                  <div className='h-40 w-full max-w-md border border-dashed border-stone-500 rounded flex flex-col items-center justify-center'>
                    <div className='h-8 border-y-2 border-stone-600 w-full flex items-center justify-between px-4'>
                      <span className='text-xs'>Buckle End</span>
                      <span className='text-xs'>1.5" Width</span>
                      <span className='text-xs'>Tip End</span>
                    </div>
                    <div className='my-4 text-sm'>Belt Length: 36" - 44"</div>
                    <div className='flex space-x-2'>
                      <div className='h-4 w-4 rounded-full border-2 border-stone-600'></div>
                      <div className='h-4 w-4 rounded-full border-2 border-stone-600'></div>
                    </div>
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div className='border border-stone-200 rounded p-2'>
                    <h4 className='text-sm font-medium mb-2'>
                      Buckle End Template
                    </h4>
                    <div className='h-20 bg-stone-100 rounded'></div>
                  </div>

                  <div className='border border-stone-200 rounded p-2'>
                    <h4 className='text-sm font-medium mb-2'>
                      Belt Tip Template
                    </h4>
                    <div className='h-20 bg-stone-100 rounded'></div>
                  </div>
                </div>
              </div>
            )}

            {currentPage === 3 && (
              <div>
                <h3 className='text-md font-bold mb-4'>
                  Assembly Instructions
                </h3>
                <ol className='list-decimal pl-6 mb-4 text-sm space-y-2'>
                  <li>
                    Cut leather strip to desired length plus 4" for overlap and
                    finishing
                  </li>
                  <li>Use templates to mark and cut buckle end and tip end</li>
                  <li>Mark hole positions starting 3" from the buckle end</li>
                  <li>Space holes 1" apart, with at least 7 holes total</li>
                  <li>
                    Punch holes with appropriate sized punch (typically 1/8")
                  </li>
                  <li>Attach buckle with chicago screws through the fold</li>
                  <li>Bevel all edges with edge beveler</li>
                  <li>
                    Sand edges smooth starting with 400 grit, up to 1000 grit
                  </li>
                  <li>
                    Burnish edges with water/gum tragacanth and wood slicker
                  </li>
                  <li>Apply edge paint if desired</li>
                </ol>

                <div className='mt-6 border border-stone-200 rounded p-4 text-xs text-center text-stone-500'>
                  <p>Custom Belt Pattern v1.2 - Created by John Smith</p>
                  <p>©2025 HideSync Leather Patterns</p>
                </div>
              </div>
            )}
          </div>
        );
      } else {
        return (
          <div
            className='bg-white border border-stone-200 shadow-sm p-4 rounded'
            style={{ transform: `scale(${zoom})` }}
          >
            <div className='text-center mb-4 text-stone-500 text-xs'>
              PDF Preview - Page {currentPage} of {totalPages}
            </div>

            <div className='text-center'>
              <h2 className='text-lg font-bold mb-4'>Pattern Preview</h2>
              <p className='mb-6'>
                This is a demonstration of the PDF preview functionality.
              </p>

              <div className='h-40 w-full border border-dashed border-stone-400 rounded flex items-center justify-center mb-6'>
                <p className='text-stone-500'>
                  Pattern diagram would appear here
                </p>
              </div>

              <p className='text-sm'>
                Page {currentPage} of {totalPages}
              </p>
            </div>
          </div>
        );
      }
    };

    return (
      <div
        className='flex items-center justify-center transition-all duration-200 ease-in-out p-2'
        style={{ minHeight: '300px' }}
      >
        {getPagePreview()}
      </div>
    );
  };

  if (loading) {
    return <LoadingSpinner message='Loading PDF...' />;
  }

  return (
    <div className='bg-white rounded-lg border border-stone-200 overflow-hidden'>
      {/* Toolbar */}
      <div className='flex items-center justify-between bg-stone-50 border-b border-stone-200 p-2'>
        <div className='flex items-center space-x-2'>
          <button
            className='p-1 text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded disabled:opacity-50 disabled:cursor-not-allowed'
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            aria-label='Previous page'
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
            Page {currentPage} of {totalPages}
          </span>

          <button
            className='p-1 text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded disabled:opacity-50 disabled:cursor-not-allowed'
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            aria-label='Next page'
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

        <div className='flex items-center space-x-2'>
          <span className='text-sm text-stone-600'>
            Zoom: {(zoom * 100).toFixed(0)}%
          </span>

          <button
            className='p-1 text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded'
            onClick={handleZoomOut}
            aria-label='Zoom out'
            disabled={zoom <= 0.5}
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
            onClick={handleResetZoom}
            aria-label='Reset zoom'
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

          <button
            className='p-1 text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded'
            onClick={handleZoomIn}
            aria-label='Zoom in'
            disabled={zoom >= 3}
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
        </div>
      </div>

      {/* PDF Viewer */}
      <div className='relative overflow-auto bg-stone-100'>
        {renderPdfPagePreview()}
      </div>

      {/* Page Thumbnails */}
      <div className='bg-stone-50 border-t border-stone-200 p-2 flex items-center space-x-2 overflow-x-auto'>
        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index}
            className={`h-16 w-12 border ${
              currentPage === index + 1
                ? 'border-amber-500 bg-amber-50'
                : 'border-stone-200 hover:border-stone-400'
            } rounded flex items-center justify-center text-xs`}
            onClick={() => setCurrentPage(index + 1)}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PDFViewer;
