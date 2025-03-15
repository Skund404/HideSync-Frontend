// src/components/patterns/detail/PatternActions.tsx
import React, { useState } from 'react';
import { Pattern } from '../../../types/patternTypes';

interface PatternActionsProps {
  pattern: Pattern;
  onToggleFavorite: () => void;
}

const PatternActions: React.FC<PatternActionsProps> = ({
  pattern,
  onToggleFavorite,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const handlePrint = () => {
    console.log('Print functionality to be implemented');
    setShowMenu(false);
  };

  const handleDownload = () => {
    console.log('Download functionality to be implemented');
    setShowMenu(false);
  };

  const handleExport = () => {
    console.log('Export functionality to be implemented');
    setShowMenu(false);
  };

  const handleShare = () => {
    console.log('Share functionality to be implemented');
    setShowMenu(false);
  };

  const handleDelete = () => {
    console.log('Delete functionality to be implemented');
    setShowMenu(false);
  };

  return (
    <div className='flex items-center space-x-2'>
      {/* Print Button */}
      <button
        className='text-stone-500 hover:text-stone-700 p-2 rounded-md hover:bg-stone-100'
        aria-label='Print pattern'
        onClick={handlePrint}
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
            d='M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z'
          />
        </svg>
      </button>

      {/* Download Button */}
      <button
        className='text-stone-500 hover:text-stone-700 p-2 rounded-md hover:bg-stone-100'
        aria-label='Download pattern'
        onClick={handleDownload}
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

      {/* Favorite Button */}
      <button
        className={`${
          pattern.isFavorite
            ? 'text-amber-500'
            : 'text-stone-500 hover:text-stone-700'
        } p-2 rounded-md hover:bg-stone-100`}
        aria-label={
          pattern.isFavorite ? 'Remove from favorites' : 'Add to favorites'
        }
        onClick={onToggleFavorite}
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className='h-5 w-5'
          fill={pattern.isFavorite ? 'currentColor' : 'none'}
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z'
          />
        </svg>
      </button>

      {/* Share Button */}
      <button
        className='text-stone-500 hover:text-stone-700 p-2 rounded-md hover:bg-stone-100'
        aria-label='Share pattern'
        onClick={handleShare}
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
            d='M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z'
          />
        </svg>
      </button>

      {/* More Actions Button with Dropdown */}
      <div className='relative'>
        <button
          className='text-stone-500 hover:text-stone-700 p-2 rounded-md hover:bg-stone-100'
          aria-label='More options'
          onClick={toggleMenu}
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
              d='M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z'
            />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {showMenu && (
          <div className='absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-stone-200'>
            <div className='py-1'>
              <button
                className='flex items-center w-full px-4 py-2 text-sm text-stone-700 hover:bg-stone-100'
                onClick={handleExport}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-4 w-4 mr-2 text-stone-500'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4'
                  />
                </svg>
                Export Pattern
              </button>

              <button
                className='flex items-center w-full px-4 py-2 text-sm text-stone-700 hover:bg-stone-100'
                onClick={() => console.log('Create project from pattern')}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-4 w-4 mr-2 text-stone-500'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
                  />
                </svg>
                Create Project
              </button>

              <button
                className='flex items-center w-full px-4 py-2 text-sm text-stone-700 hover:bg-stone-100'
                onClick={() => console.log('Duplicate pattern')}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-4 w-4 mr-2 text-stone-500'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z'
                  />
                </svg>
                Duplicate
              </button>

              <hr className='my-1 border-stone-200' />

              <button
                className='flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-stone-100'
                onClick={handleDelete}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-4 w-4 mr-2 text-red-500'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                  />
                </svg>
                Delete Pattern
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatternActions;
