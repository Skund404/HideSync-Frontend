// src/components/documentation/contextual/ContextHelpModal.tsx

import { ExternalLink, X } from 'lucide-react';
import React, { useEffect, useRef } from 'react';
import ContentRenderer from '../ContentRenderer';
import { useContextHelp } from './ContextHelpProvider';

const ContextHelpModal: React.FC = () => {
  const { isHelpVisible, helpResources, hideHelp, currentContextKey } =
    useContextHelp();
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isHelpVisible) {
        hideHelp();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isHelpVisible, hideHelp]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(e.target as Node) &&
        isHelpVisible
      ) {
        hideHelp();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isHelpVisible, hideHelp]);

  if (!isHelpVisible) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4'>
      <div
        ref={modalRef}
        className='bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col'
      >
        <div className='flex justify-between items-center border-b p-4'>
          <h2 className='text-lg font-medium'>
            {helpResources.length > 0 ? helpResources[0].title : 'Help'}
          </h2>
          <button
            onClick={hideHelp}
            className='text-gray-500 hover:text-gray-700'
            aria-label='Close help'
          >
            <X size={20} />
          </button>
        </div>

        <div className='flex-1 overflow-y-auto p-4'>
          {helpResources.length > 0 ? (
            helpResources.map((resource) => (
              <div key={resource.id} className='mb-6'>
                {helpResources.length > 1 && (
                  <h3 className='text-lg font-medium mb-2'>{resource.title}</h3>
                )}
                <p className='text-gray-600 mb-4'>{resource.description}</p>
                <ContentRenderer content={resource.content} />
              </div>
            ))
          ) : (
            <div className='text-center text-gray-500 py-8'>
              <p className='mb-2'>
                No help content available for "{currentContextKey}".
              </p>
              <p className='text-sm'>
                Please check the documentation for general guidance.
              </p>
            </div>
          )}
        </div>

        <div className='border-t p-4 flex justify-between'>
          <a
            href='/documentation'
            className='text-amber-600 hover:text-amber-800 flex items-center'
            onClick={(e) => {
              hideHelp();
              // Allow the link to work normally
            }}
          >
            <ExternalLink size={16} className='mr-1' />
            Open full documentation
          </a>
          <button
            onClick={hideHelp}
            className='px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded'
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContextHelpModal;
