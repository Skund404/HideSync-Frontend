// src/components/documentation/contextual/TourStep.tsx

import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

export interface Step {
  id: string;
  title: string;
  content: string;
  elementSelector: string;
  position: 'top' | 'right' | 'bottom' | 'left';
}

interface TourStepProps {
  step: Step;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onExit: () => void;
}

const TourStep: React.FC<TourStepProps> = ({
  step,
  currentStep,
  totalSteps,
  onNext,
  onPrev,
  onExit,
}) => {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [arrowPosition, setArrowPosition] = useState({ top: 0, left: 0 });
  const [targetElement, setTargetElement] = useState<Element | null>(null);

  // Find and position the tooltip relative to the target element
  useEffect(() => {
    const target = document.querySelector(step.elementSelector);
    setTargetElement(target);

    if (!target || !tooltipRef.current) return;

    const targetRect = target.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();

    let top = 0;
    let left = 0;
    let arrowTop = 0;
    let arrowLeft = 0;

    // Position the tooltip based on the specified position
    switch (step.position) {
      case 'top':
        top = targetRect.top - tooltipRect.height - 10;
        left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
        arrowTop = tooltipRect.height;
        arrowLeft = tooltipRect.width / 2;
        break;
      case 'right':
        top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
        left = targetRect.right + 10;
        arrowTop = tooltipRect.height / 2;
        arrowLeft = -10;
        break;
      case 'bottom':
        top = targetRect.bottom + 10;
        left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
        arrowTop = -10;
        arrowLeft = tooltipRect.width / 2;
        break;
      case 'left':
        top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
        left = targetRect.left - tooltipRect.width - 10;
        arrowTop = tooltipRect.height / 2;
        arrowLeft = tooltipRect.width;
        break;
    }

    // Adjust position to ensure the tooltip stays within viewport
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    if (left < 10) left = 10;
    if (left + tooltipRect.width > viewport.width - 10) {
      left = viewport.width - tooltipRect.width - 10;
    }

    if (top < 10) top = 10;
    if (top + tooltipRect.height > viewport.height - 10) {
      top = viewport.height - tooltipRect.height - 10;
    }

    setPosition({ top, left });
    setArrowPosition({ top: arrowTop, left: arrowLeft });

    // Add highlight to the target element
    const originalOutline = target.getAttribute('style') || '';
    target.setAttribute(
      'style',
      `${originalOutline}; outline: 2px solid #f59e0b; outline-offset: 2px; position: relative; z-index: 1;`
    );

    // Cleanup function
    return () => {
      target.setAttribute('style', originalOutline);
    };
  }, [step]);

  // Define the arrow style based on position
  const getArrowStyle = () => {
    switch (step.position) {
      case 'top':
        return {
          bottom: '-8px',
          left: `${arrowPosition.left}px`,
          transform: 'translateX(-50%)',
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderTop: '8px solid white',
        };
      case 'right':
        return {
          left: '-8px',
          top: `${arrowPosition.top}px`,
          transform: 'translateY(-50%)',
          borderTop: '8px solid transparent',
          borderBottom: '8px solid transparent',
          borderRight: '8px solid white',
        };
      case 'bottom':
        return {
          top: '-8px',
          left: `${arrowPosition.left}px`,
          transform: 'translateX(-50%)',
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderBottom: '8px solid white',
        };
      case 'left':
        return {
          right: '-8px',
          top: `${arrowPosition.top}px`,
          transform: 'translateY(-50%)',
          borderTop: '8px solid transparent',
          borderBottom: '8px solid transparent',
          borderLeft: '8px solid white',
        };
      default:
        return {};
    }
  };

  if (!targetElement) {
    return null;
  }

  return (
    <div
      ref={tooltipRef}
      className='fixed z-50 w-64 bg-white rounded-lg shadow-xl p-4'
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
    >
      <div className='absolute w-0 h-0' style={getArrowStyle()}></div>

      <div className='flex justify-between items-start mb-2'>
        <h3 className='font-medium text-gray-900'>{step.title}</h3>
        <button
          onClick={onExit}
          className='text-gray-400 hover:text-gray-600'
          aria-label='Close tour'
        >
          <X size={16} />
        </button>
      </div>

      <p className='text-sm text-gray-600 mb-4'>{step.content}</p>

      <div className='flex items-center justify-between'>
        <div className='text-xs text-gray-500'>
          {currentStep} of {totalSteps}
        </div>

        <div className='flex space-x-2'>
          {currentStep > 1 && (
            <button
              onClick={onPrev}
              className='flex items-center text-xs text-gray-600 hover:text-gray-800'
            >
              <ChevronLeft size={14} />
              Back
            </button>
          )}

          <button
            onClick={onNext}
            className='flex items-center text-xs px-3 py-1 bg-amber-600 text-white rounded hover:bg-amber-700'
          >
            {currentStep === totalSteps ? 'Finish' : 'Next'}
            {currentStep !== totalSteps && (
              <ChevronRight size={14} className='ml-1' />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TourStep;
