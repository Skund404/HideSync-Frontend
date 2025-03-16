// src/components/documentation/contextual/ContextHelpOverlay.tsx

import { ExternalLink, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useDocumentation } from '../../../context/DocumentationContext';
import ContentRenderer from '../ContentRenderer';
// Remove the unused import if you're not using it
// import { useContextHelp } from './ContextHelpProvider';

interface ContextHelpOverlayProps {
  targetSelector: string;
  contextKey: string;
  position?: 'top' | 'right' | 'bottom' | 'left';
  width?: number;
  maxHeight?: number;
  isVisible: boolean;
  onClose: () => void;
}

const ContextHelpOverlay: React.FC<ContextHelpOverlayProps> = ({
  targetSelector,
  contextKey,
  position = 'right',
  width = 300,
  maxHeight = 400,
  isVisible,
  onClose,
}) => {
  // Remove the unused contextHelp variable
  const { getContextualHelp } = useDocumentation();
  const [helpContent, setHelpContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [overlayPosition, setOverlayPosition] = useState({ top: 0, left: 0 });
  const overlayRef = useRef<HTMLDivElement>(null);

  // Fetch help content
  useEffect(() => {
    const fetchHelp = async () => {
      if (isVisible) {
        setLoading(true);
        try {
          const resources = await getContextualHelp(contextKey);
          setHelpContent(resources);
        } catch (error) {
          console.error('Error fetching help content:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchHelp();
  }, [isVisible, contextKey, getContextualHelp]);

  // Position the overlay relative to target element
  useEffect(() => {
    if (isVisible) {
      const targetElement = document.querySelector(targetSelector);
      if (!targetElement || !overlayRef.current) return;

      const targetRect = targetElement.getBoundingClientRect();
      const overlayRect = overlayRef.current.getBoundingClientRect();

      let top = 0;
      let left = 0;

      switch (position) {
        case 'top':
          top = targetRect.top - overlayRect.height - 10;
          left = targetRect.left + targetRect.width / 2 - overlayRect.width / 2;
          break;
        case 'right':
          top = targetRect.top + targetRect.height / 2 - overlayRect.height / 2;
          left = targetRect.right + 10;
          break;
        case 'bottom':
          top = targetRect.bottom + 10;
          left = targetRect.left + targetRect.width / 2 - overlayRect.width / 2;
          break;
        case 'left':
          top = targetRect.top + targetRect.height / 2 - overlayRect.height / 2;
          left = targetRect.left - overlayRect.width - 10;
          break;
      }

      // Ensure overlay stays within viewport
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight,
      };

      if (left < 10) left = 10;
      if (left + overlayRect.width > viewport.width - 10) {
        left = viewport.width - overlayRect.width - 10;
      }

      if (top < 10) top = 10;
      if (top + overlayRect.height > viewport.height - 10) {
        top = viewport.height - overlayRect.height - 10;
      }

      setOverlayPosition({ top, left });
    }
  }, [isVisible, position, targetSelector, helpContent]);

  if (!isVisible) return null;

  return (
    <div
      ref={overlayRef}
      className='fixed z-50 bg-white rounded-lg shadow-xl overflow-hidden'
      style={{
        top: `${overlayPosition.top}px`,
        left: `${overlayPosition.left}px`,
        width: `${width}px`,
        maxHeight: `${maxHeight}px`,
      }}
    >
      <div className='flex justify-between items-center border-b p-3'>
        <h3 className='font-medium text-sm'>
          {helpContent.length > 0 ? helpContent[0].title : 'Help'}
        </h3>
        <button onClick={onClose} className='text-gray-500 hover:text-gray-700'>
          <X size={16} />
        </button>
      </div>

      <div
        className='overflow-y-auto p-3'
        style={{ maxHeight: `${maxHeight - 100}px` }}
      >
        {loading ? (
          <div className='flex justify-center items-center p-4'>
            <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-amber-600'></div>
          </div>
        ) : helpContent.length > 0 ? (
          <div className='text-sm'>
            <p className='text-gray-600 mb-2'>{helpContent[0].description}</p>
            <ContentRenderer content={helpContent[0].content} />
          </div>
        ) : (
          <div className='text-center text-gray-500 py-4 text-sm'>
            <p>No help content available.</p>
          </div>
        )}
      </div>

      {helpContent.length > 0 && (
        <div className='border-t p-2 text-xs'>
          <a
            href={`/documentation/${helpContent[0].id}`}
            className='text-amber-600 hover:text-amber-800 flex items-center'
          >
            <ExternalLink size={12} className='mr-1' />
            View full documentation
          </a>
        </div>
      )}
    </div>
  );
};

export default ContextHelpOverlay;
