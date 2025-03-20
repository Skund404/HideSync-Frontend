// src/hooks/useKeyboardShortcuts.ts
import { useCallback, useEffect, useMemo } from 'react';

// Interface for shortcut definitions
export interface ShortcutDefinition {
  key: string; // Key or key combination (e.g., "p", "Shift+p")
  action: () => void; // Function to execute when shortcut is triggered
  description: string; // Description of what the shortcut does
  scope?: string; // Optional scope to group shortcuts
}

/**
 * Hook to handle keyboard shortcuts
 *
 * @param shortcuts Array of shortcut definitions
 * @param enabled Whether shortcuts are enabled (default: true)
 */
export const useKeyboardShortcuts = (
  shortcuts: ShortcutDefinition[],
  enabled: boolean = true
) => {
  // Parse key combinations from shortcut definitions
  const shortcutMap = useMemo(() => {
    const map = new Map<string, ShortcutDefinition>();

    shortcuts.forEach((shortcut) => {
      const normalizedKey = normalizeKey(shortcut.key);
      map.set(normalizedKey, shortcut);
    });

    return map;
  }, [shortcuts]);

  // Handle keydown event
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Skip if shortcuts are disabled or if focus is on form inputs
      if (!enabled || isInputElement(document.activeElement)) {
        return;
      }

      // Create normalized key from event
      const keyCombo = getKeyCombo(event);

      // Look up the shortcut and execute its action if found
      const shortcut = shortcutMap.get(keyCombo);
      if (shortcut) {
        event.preventDefault();
        shortcut.action();
      }
    },
    [enabled, shortcutMap]
  );

  // Set up and clean up event listeners
  useEffect(() => {
    if (enabled) {
      document.addEventListener('keydown', handleKeyDown);

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [enabled, handleKeyDown]);

  // Return all registered shortcuts for documentation/UI
  const getAllShortcuts = useCallback(() => {
    return Array.from(shortcutMap.values());
  }, [shortcutMap]);

  return {
    getAllShortcuts,
  };
};

// Helper functions

// Normalize key string to standardized format
function normalizeKey(key: string): string {
  const parts = key.split('+').map((part) => part.trim().toLowerCase());

  // Sort modifier keys in a consistent order
  const modifiers = parts
    .filter((part) =>
      ['ctrl', 'alt', 'shift', 'meta', 'command', 'cmd'].includes(part)
    )
    .sort();

  // Replace "command" or "cmd" with "meta" for consistency
  const normalizedModifiers = modifiers.map((mod) =>
    mod === 'command' || mod === 'cmd' ? 'meta' : mod
  );

  // The actual key (last part that's not a modifier)
  const mainKey =
    parts.find(
      (part) =>
        !['ctrl', 'alt', 'shift', 'meta', 'command', 'cmd'].includes(part)
    ) || '';

  return [...normalizedModifiers, mainKey].join('+');
}

// Check if the focused element is an input field
function isInputElement(element: Element | null): boolean {
  if (!element) return false;

  const tagName = element.tagName.toLowerCase();
  const isInput =
    tagName === 'input' || tagName === 'textarea' || tagName === 'select';
  const isContentEditable = element.hasAttribute('contenteditable');

  return isInput || isContentEditable;
}

// Extract key combination from keyboard event
function getKeyCombo(event: KeyboardEvent): string {
  const parts: string[] = [];

  if (event.ctrlKey) parts.push('ctrl');
  if (event.altKey) parts.push('alt');
  if (event.shiftKey) parts.push('shift');
  if (event.metaKey) parts.push('meta');

  // Get the actual key pressed (lowercase for non-special keys)
  const key = event.key.toLowerCase();

  // Don't include modifier keys twice
  if (!['control', 'alt', 'shift', 'meta'].includes(key)) {
    parts.push(key);
  }

  return parts.join('+');
}
