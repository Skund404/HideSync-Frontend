import React from 'react';

interface OfflineBannerProps {
  count: number;
}

const OfflineBanner: React.FC<OfflineBannerProps> = ({ count }) => {
  return (
    <div className='bg-amber-100 text-amber-800 p-3 flex justify-between items-center'>
      <div className='flex items-center'>
        <span className='mr-2'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-5 w-5'
            viewBox='0 0 20 20'
            fill='currentColor'
          >
            <path
              fillRule='evenodd'
              d='M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z'
              clipRule='evenodd'
            />
          </svg>
        </span>
        <span>
          You have <strong>{count}</strong> guide{count !== 1 ? 's' : ''} saved
          for offline use
        </span>
      </div>
      <a
        href='/documentation/offline'
        className='text-amber-800 hover:text-amber-900 font-medium text-sm'
      >
        Manage Offline Guides
      </a>
    </div>
  );
};

export default OfflineBanner;
