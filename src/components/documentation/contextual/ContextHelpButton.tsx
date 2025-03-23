// src/components/documentation/contextual/ContextHelpButton.tsx
import { HelpCircle } from 'lucide-react';
import React, { useState } from 'react';
import { useContextHelp } from './ContextHelpProvider';

interface ContextHelpButtonProps {
  contextKey: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  label?: string;
  showTooltip?: boolean;
  iconOnly?: boolean;
  position?: 'inline' | 'top-right' | 'floating';
}

/**
 * A button that opens the contextual help panel with information related
 * to a specific key. Can be displayed as icon-only or with a label, and can be
 * positioned in different ways.
 */
const ContextHelpButton: React.FC<ContextHelpButtonProps> = ({
  contextKey,
  size = 'medium',
  className = '',
  label = 'Get help',
  showTooltip = true,
  iconOnly = false,
  position = 'inline',
}) => {
  const { showHelp } = useContextHelp(); // Changed from openHelp to showHelp
  const [tooltipVisible, setTooltipVisible] = useState(false);

  // Size mappings
  const sizeMap = {
    small: { button: 'p-1', icon: 16 },
    medium: { button: 'p-2', icon: 20 },
    large: { button: 'p-3', icon: 24 },
  };

  // Position mappings
  const positionClasses = {
    inline: '',
    'top-right': 'absolute top-2 right-2',
    floating: 'fixed bottom-16 right-4 shadow-md',
  };

  const buttonSize = sizeMap[size].button;
  const iconSize = sizeMap[size].icon;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    showHelp(contextKey); // Changed from openHelp to showHelp
  };

  return (
    <div className={`relative ${positionClasses[position]}`}>
      <button
        onClick={handleClick}
        onMouseEnter={() => showTooltip && setTooltipVisible(true)}
        onMouseLeave={() => setTooltipVisible(false)}
        className={`
          rounded-full text-stone-500 hover:text-amber-600 hover:bg-amber-50 
          transition-colors duration-200 
          ${buttonSize} ${className} 
          ${iconOnly ? '' : 'flex items-center'}
        `}
        aria-label={`Open help for ${contextKey}`}
      >
        <HelpCircle size={iconSize} className={iconOnly ? '' : 'mr-2'} />
        {!iconOnly && <span>{label}</span>}
      </button>

      {/* Tooltip */}
      {showTooltip && tooltipVisible && (
        <div
          className='absolute left-1/2 transform -translate-x-1/2 -top-10 
          bg-stone-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10'
        >
          {label}
          <div
            className='absolute left-1/2 transform -translate-x-1/2 top-full 
            w-0 h-0 border-l-4 border-r-4 border-t-4 
            border-l-transparent border-r-transparent border-t-stone-800'
          ></div>
        </div>
      )}
    </div>
  );
};

export default ContextHelpButton;
