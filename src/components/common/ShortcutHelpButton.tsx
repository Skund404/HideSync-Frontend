// src/components/common/ShortcutHelpButton.tsx
import React from 'react';
import { useKeyboardShortcutsContext } from '../../context/KeyboardShortcutsContext';

interface ShortcutHelpButtonProps {
  className?: string;
}

/**
 * A button that opens the keyboard shortcuts help dialog
 */
const ShortcutHelpButton: React.FC<ShortcutHelpButtonProps> = ({
  className = '',
}) => {
  const { openShortcutsDialog } = useKeyboardShortcutsContext();

  return (
    <button
      onClick={openShortcutsDialog}
      className={`p-2 text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-full flex items-center justify-center transition-colors ${className}`}
      title='View keyboard shortcuts (Press ?)'
      aria-label='View keyboard shortcuts'
    >
      <KeyboardIcon />
      <span className='sr-only'>Keyboard Shortcuts</span>
    </button>
  );
};

const KeyboardIcon: React.FC = () => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='20'
    height='20'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <rect x='2' y='4' width='20' height='16' rx='2' ry='2'></rect>
    <path d='M6 8h.001'></path>
    <path d='M10 8h.001'></path>
    <path d='M14 8h.001'></path>
    <path d='M18 8h.001'></path>
    <path d='M8 12h.001'></path>
    <path d='M12 12h.001'></path>
    <path d='M16 12h.001'></path>
    <path d='M7 16h10'></path>
  </svg>
);

export default ShortcutHelpButton;
