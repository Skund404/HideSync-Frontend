// src/components/patterns/annotation/AnnotationToolbar.tsx
import React from 'react';

type AnnotationToolType = 'text' | 'arrow' | 'measurement' | 'highlight' | null;

interface AnnotationToolbarProps {
  activeToolType: AnnotationToolType;
  setActiveToolType: (toolType: AnnotationToolType) => void;
  annotationCount: number;
  onClearAllAnnotations: () => void;
  onToggleAnnotationsVisibility: () => void;
  areAnnotationsVisible: boolean;
  disabled?: boolean;
}

const AnnotationToolbar: React.FC<AnnotationToolbarProps> = ({
  activeToolType,
  setActiveToolType,
  annotationCount,
  onClearAllAnnotations,
  onToggleAnnotationsVisibility,
  areAnnotationsVisible,
  disabled = false,
}) => {
  const handleToolClick = (toolType: AnnotationToolType) => {
    if (disabled) return;

    // Toggle off if the same tool is clicked again
    if (toolType === activeToolType) {
      setActiveToolType(null);
    } else {
      setActiveToolType(toolType);
    }
  };

  const handleClearAll = () => {
    if (disabled || annotationCount === 0) return;

    if (
      window.confirm(
        `Are you sure you want to delete all ${annotationCount} annotations?`
      )
    ) {
      onClearAllAnnotations();
    }
  };

  return (
    <div className='flex items-center bg-stone-100 border-b border-stone-200 p-1 space-x-1'>
      <div className='flex items-center mr-2'>
        <span className='text-xs text-stone-500 mr-2'>Annotations:</span>
        <button
          onClick={onToggleAnnotationsVisibility}
          className={`p-1 rounded text-stone-500 hover:text-stone-700 ${
            areAnnotationsVisible ? 'bg-stone-200' : 'hover:bg-stone-200'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          title={
            areAnnotationsVisible ? 'Hide annotations' : 'Show annotations'
          }
          disabled={disabled}
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-5 w-5'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            {areAnnotationsVisible ? (
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
              />
            ) : (
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21'
              />
            )}
          </svg>
        </button>
      </div>

      <div className='flex items-center space-x-1 border-l border-stone-300 pl-2'>
        <button
          onClick={() => handleToolClick('text')}
          className={`p-1 rounded ${
            activeToolType === 'text'
              ? 'bg-amber-100 text-amber-700'
              : 'text-stone-500 hover:text-stone-700 hover:bg-stone-200'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          title='Add text annotation'
          disabled={disabled}
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
              d='M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z'
            />
          </svg>
        </button>

        <button
          onClick={() => handleToolClick('arrow')}
          className={`p-1 rounded ${
            activeToolType === 'arrow'
              ? 'bg-amber-100 text-amber-700'
              : 'text-stone-500 hover:text-stone-700 hover:bg-stone-200'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          title='Add arrow annotation'
          disabled={disabled}
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
              d='M17 8l4 4m0 0l-4 4m4-4H3'
            />
          </svg>
        </button>

        <button
          onClick={() => handleToolClick('measurement')}
          className={`p-1 rounded ${
            activeToolType === 'measurement'
              ? 'bg-amber-100 text-amber-700'
              : 'text-stone-500 hover:text-stone-700 hover:bg-stone-200'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          title='Add measurement annotation'
          disabled={disabled}
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
          onClick={() => handleToolClick('highlight')}
          className={`p-1 rounded ${
            activeToolType === 'highlight'
              ? 'bg-amber-100 text-amber-700'
              : 'text-stone-500 hover:text-stone-700 hover:bg-stone-200'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          title='Add highlight annotation'
          disabled={disabled}
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
              d='M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z'
            />
          </svg>
        </button>
      </div>

      <div className='flex-1'></div>

      <div className='flex items-center'>
        <span className='text-xs text-stone-500 mr-2'>
          {annotationCount} annotation{annotationCount !== 1 ? 's' : ''}
        </span>

        <button
          onClick={handleClearAll}
          className={`p-1 rounded text-stone-500 hover:text-red-600 hover:bg-stone-200 ${
            disabled || annotationCount === 0
              ? 'opacity-50 cursor-not-allowed'
              : ''
          }`}
          title='Clear all annotations'
          disabled={disabled || annotationCount === 0}
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
              d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default AnnotationToolbar;
