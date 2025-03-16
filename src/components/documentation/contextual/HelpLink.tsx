// src/components/documentation/contextual/HelpLink.tsx

import { HelpCircle } from 'lucide-react';
import React from 'react';
import { useContextHelp } from './ContextHelpProvider';

interface HelpLinkProps {
  contextKey: string;
  children: React.ReactNode;
  className?: string;
  icon?: boolean;
  iconSize?: number;
}

const HelpLink: React.FC<HelpLinkProps> = ({
  contextKey,
  children,
  className = '',
  icon = true,
  iconSize = 14,
}) => {
  const { showHelp } = useContextHelp();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    showHelp(contextKey);
  };

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center text-amber-600 hover:text-amber-800 hover:underline ${className}`}
    >
      {children}
      {icon && <HelpCircle size={iconSize} className='ml-1' />}
    </button>
  );
};

export default HelpLink;
