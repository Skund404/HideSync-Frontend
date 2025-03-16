// src/components/documentation/contextual/ContextHelpButton.tsx

import { HelpCircle } from 'lucide-react';
import React from 'react';
import { useContextHelp } from './ContextHelpProvider';

interface ContextHelpButtonProps {
  contextKey: string;
  label?: string;
  className?: string;
  iconOnly?: boolean;
  size?: number;
  position?: 'top-right' | 'inline' | 'floating';
}

const ContextHelpButton: React.FC<ContextHelpButtonProps> = ({
  contextKey,
  label = 'Help',
  className = '',
  iconOnly = false,
  size = 18,
  position = 'inline',
}) => {
  const { showHelp } = useContextHelp();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    showHelp(contextKey);
  };

  // Determine position-based classes
  const positionClasses = {
    'top-right': 'absolute top-1 right-1',
    inline: '',
    floating: 'fixed bottom-4 right-4 z-10',
  };

  if (iconOnly) {
    return (
      <button
        onClick={handleClick}
        className={`text-amber-600 hover:text-amber-800 p-1 rounded-full hover:bg-amber-100 ${positionClasses[position]} ${className}`}
        aria-label={label}
        title={label}
      >
        <HelpCircle size={size} />
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`flex items-center text-sm text-amber-600 hover:text-amber-800 ${positionClasses[position]} ${className}`}
    >
      <HelpCircle size={size} className='mr-1' />
      {label}
    </button>
  );
};

export default ContextHelpButton;
