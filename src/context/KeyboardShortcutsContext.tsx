// src/context/KeyboardShortcutsContext.tsx
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import {
  ShortcutDefinition,
  useKeyboardShortcuts,
} from '../hooks/useKeyboardShortcuts';

// Interface for the shortcuts context
interface KeyboardShortcutsContextType {
  registerShortcuts: (shortcuts: ShortcutDefinition[], scope: string) => void;
  unregisterShortcuts: (scope: string) => void;
  getAllShortcuts: () => ShortcutDefinition[];
  setEnabled: (enabled: boolean) => void;
  isEnabled: boolean;
  openShortcutsDialog: () => void;
  closeShortcutsDialog: () => void;
  isShortcutsDialogOpen: boolean;
}

// Create the context
const KeyboardShortcutsContext = createContext<
  KeyboardShortcutsContextType | undefined
>(undefined);

// Provider component
export const KeyboardShortcutsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isEnabled, setEnabled] = useState<boolean>(true);
  const [isShortcutsDialogOpen, setShortcutsDialogOpen] =
    useState<boolean>(false);
  const [shortcutsByScope, setShortcutsByScope] = useState<
    Record<string, ShortcutDefinition[]>
  >({});

  // Flatten all shortcuts from all scopes
  const allShortcuts = useMemo(() => {
    return Object.values(shortcutsByScope).flat();
  }, [shortcutsByScope]);

  // Register keyboard shortcuts using our hook
  useKeyboardShortcuts(allShortcuts, isEnabled);

  // Register shortcuts for a specific scope
  const registerShortcuts = useCallback(
    (shortcuts: ShortcutDefinition[], scope: string) => {
      setShortcutsByScope((prev) => ({
        ...prev,
        [scope]: shortcuts,
      }));
    },
    []
  );

  // Unregister shortcuts for a specific scope
  const unregisterShortcuts = useCallback((scope: string) => {
    setShortcutsByScope((prev) => {
      const newShortcuts = { ...prev };
      delete newShortcuts[scope];
      return newShortcuts;
    });
  }, []);

  // Get all registered shortcuts
  const getAllShortcuts = useCallback(() => {
    return allShortcuts;
  }, [allShortcuts]);

  // Open the shortcuts help dialog
  const openShortcutsDialog = useCallback(() => {
    setShortcutsDialogOpen(true);
  }, []);

  // Close the shortcuts help dialog
  const closeShortcutsDialog = useCallback(() => {
    setShortcutsDialogOpen(false);
  }, []);

  // Create context value
  const value = useMemo(
    () => ({
      registerShortcuts,
      unregisterShortcuts,
      getAllShortcuts,
      setEnabled,
      isEnabled,
      openShortcutsDialog,
      closeShortcutsDialog,
      isShortcutsDialogOpen,
    }),
    [
      registerShortcuts,
      unregisterShortcuts,
      getAllShortcuts,
      isEnabled,
      openShortcutsDialog,
      closeShortcutsDialog,
      isShortcutsDialogOpen,
    ]
  );

  return (
    <KeyboardShortcutsContext.Provider value={value}>
      {children}
      {isShortcutsDialogOpen && (
        <ShortcutsDialog
          onClose={closeShortcutsDialog}
          shortcuts={allShortcuts}
        />
      )}
    </KeyboardShortcutsContext.Provider>
  );
};

// Helper hook to use the shortcuts context
export const useKeyboardShortcutsContext = () => {
  const context = useContext(KeyboardShortcutsContext);
  if (context === undefined) {
    throw new Error(
      'useKeyboardShortcutsContext must be used within a KeyboardShortcutsProvider'
    );
  }
  return context;
};

// Keyboard shortcuts help dialog component
const ShortcutsDialog: React.FC<{
  onClose: () => void;
  shortcuts: ShortcutDefinition[];
}> = ({ onClose, shortcuts }) => {
  // Group shortcuts by scope
  const shortcutsByScope = useMemo(() => {
    const grouped: Record<string, ShortcutDefinition[]> = {};

    shortcuts.forEach((shortcut) => {
      const scope = shortcut.scope || 'General';
      if (!grouped[scope]) {
        grouped[scope] = [];
      }
      grouped[scope].push(shortcut);
    });

    return grouped;
  }, [shortcuts]);

  // Format key for display
  const formatKey = (key: string): string => {
    return key
      .split('+')
      .map((part) => {
        if (part === 'ctrl') return 'Ctrl';
        if (part === 'alt') return 'Alt';
        if (part === 'shift') return 'Shift';
        if (part === 'meta')
          return navigator.platform.includes('Mac') ? '⌘' : 'Win';
        return part.charAt(0).toUpperCase() + part.slice(1);
      })
      .join(' + ');
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto'>
        <div className='border-b border-gray-200 px-6 py-4 flex justify-between items-center'>
          <h2 className='text-lg font-medium'>Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-500'
          >
            <svg
              className='h-6 w-6'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>
        </div>

        <div className='px-6 py-4'>
          {Object.entries(shortcutsByScope).map(([scope, scopeShortcuts]) => (
            <div key={scope} className='mb-6'>
              <h3 className='text-md font-medium text-gray-700 mb-3'>
                {scope}
              </h3>
              <div className='bg-gray-50 rounded-md'>
                {scopeShortcuts.map((shortcut, index) => (
                  <div
                    key={index}
                    className={`flex justify-between items-center px-4 py-2 ${
                      index !== scopeShortcuts.length - 1
                        ? 'border-b border-gray-200'
                        : ''
                    }`}
                  >
                    <span className='text-sm text-gray-600'>
                      {shortcut.description}
                    </span>
                    <span className='ml-4 text-xs bg-gray-200 px-2 py-1 rounded font-mono'>
                      {formatKey(shortcut.key)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className='border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end'>
          <button
            onClick={onClose}
            className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
