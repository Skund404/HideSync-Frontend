// src/components/documentation/contextual/ViewModeHelp.tsx

import { HelpCircle } from 'lucide-react';
import React from 'react';
import { useContextHelp } from './ContextHelpProvider';

interface ViewModeHelpProps {
  moduleKey: string;
  viewMode: string;
  children: React.ReactNode;
  helpPosition?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left';
}

const ViewModeHelp: React.FC<ViewModeHelpProps> = ({
  moduleKey,
  viewMode,
  children,
  helpPosition = 'top-right',
}) => {
  const { showHelp } = useContextHelp();

  // Create a context key that combines the module and view mode
  const contextKey = `${moduleKey}-${viewMode}`;

  const handleHelp = () => {
    showHelp(contextKey);
  };

  // Get position classes
  const getPositionClasses = () => {
    switch (helpPosition) {
      case 'top-right':
        return 'top-2 right-2';
      case 'bottom-right':
        return 'bottom-2 right-2';
      case 'top-left':
        return 'top-2 left-2';
      case 'bottom-left':
        return 'bottom-2 left-2';
      default:
        return 'top-2 right-2';
    }
  };

  return (
    <div className='relative'>
      {children}
      <button
        className={`absolute ${getPositionClasses()} bg-amber-100 text-amber-800 hover:bg-amber-200 p-1 rounded-full z-10`}
        onClick={handleHelp}
        aria-label={`Help for ${viewMode} view`}
        title={`Get help for ${viewMode} view`}
      >
        <HelpCircle size={18} />
      </button>
    </div>
  );
};

export default ViewModeHelp;
