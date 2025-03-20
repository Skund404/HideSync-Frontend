// src/components/patterns/PatternShortcuts.tsx
import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useKeyboardShortcutsContext } from '../../context/KeyboardShortcutsContext';
import { usePatternContext } from '../../context/PatternContext';
import { ShortcutDefinition } from '../../hooks/useKeyboardShortcuts';

interface PatternShortcutsProps {
  patternId?: number;
  onToggleFavorite?: () => void;
  onPrint?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetView?: () => void;
  onToggleAnnotationMode?: () => void;
}

const PatternShortcuts: React.FC<PatternShortcutsProps> = ({
  patternId,
  onToggleFavorite,
  onPrint,
  onDownload,
  onShare,
  onZoomIn,
  onZoomOut,
  onResetView,
  onToggleAnnotationMode,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { registerShortcuts, unregisterShortcuts, openShortcutsDialog } =
    useKeyboardShortcutsContext();
  const { patterns, toggleFavorite } = usePatternContext();

  // Determine if we're in pattern detail view
  const isDetailView =
    location.pathname.includes('/patterns/') &&
    !location.pathname.endsWith('/patterns');

  // Define shortcuts for the list view (patterns library)
  const defineListViewShortcuts = (): ShortcutDefinition[] => {
    return [
      {
        key: 'g',
        action: () => navigate('/patterns?view=grid'),
        description: 'Switch to grid view',
        scope: 'Pattern Library',
      },
      {
        key: 'l',
        action: () => navigate('/patterns?view=list'),
        description: 'Switch to list view',
        scope: 'Pattern Library',
      },
      {
        key: 'f',
        action: () =>
          document
            .querySelector<HTMLInputElement>('[placeholder*="Search patterns"]')
            ?.focus(),
        description: 'Focus search box',
        scope: 'Pattern Library',
      },
      {
        key: 'n',
        action: () => navigate('/patterns/new'),
        description: 'Create new pattern',
        scope: 'Pattern Library',
      },
      {
        key: 'shift+f',
        action: () => {
          const favoritesTab = document.querySelector(
            '[role="tab"]:nth-child(2)'
          ) as HTMLElement;
          if (favoritesTab) favoritesTab.click();
        },
        description: 'Show favorites',
        scope: 'Pattern Library',
      },
      {
        key: '?',
        action: () => openShortcutsDialog(), // Using captured hook value
        description: 'Show keyboard shortcuts',
        scope: 'Pattern Library',
      },
    ];
  };

  // Define shortcuts for the detail view (single pattern)
  const defineDetailViewShortcuts = (): ShortcutDefinition[] => {
    return [
      // Navigation shortcuts
      {
        key: 'escape',
        action: () => navigate('/patterns'),
        description: 'Back to pattern list',
        scope: 'Pattern Detail',
      },
      {
        key: 'ctrl+left',
        action: () => navigateToPreviousPattern(),
        description: 'Previous pattern',
        scope: 'Pattern Detail',
      },
      {
        key: 'ctrl+right',
        action: () => navigateToNextPattern(),
        description: 'Next pattern',
        scope: 'Pattern Detail',
      },

      // Action shortcuts
      {
        key: 'p',
        action: () => onPrint?.() || console.log('Print shortcut triggered'),
        description: 'Print pattern',
        scope: 'Pattern Detail',
      },
      {
        key: 'd',
        action: () =>
          onDownload?.() || console.log('Download shortcut triggered'),
        description: 'Download pattern',
        scope: 'Pattern Detail',
      },
      {
        key: 'f',
        action: () => {
          if (onToggleFavorite) {
            onToggleFavorite();
          } else if (patternId) {
            toggleFavorite(patternId);
          }
        },
        description: 'Toggle favorite',
        scope: 'Pattern Detail',
      },
      {
        key: 's',
        action: () => onShare?.() || console.log('Share shortcut triggered'),
        description: 'Share pattern',
        scope: 'Pattern Detail',
      },

      // Viewer shortcuts
      {
        key: '=',
        action: () => onZoomIn?.() || console.log('Zoom in shortcut triggered'),
        description: 'Zoom in',
        scope: 'Pattern Detail',
      },
      {
        key: '-',
        action: () =>
          onZoomOut?.() || console.log('Zoom out shortcut triggered'),
        description: 'Zoom out',
        scope: 'Pattern Detail',
      },
      {
        key: 'r',
        action: () =>
          onResetView?.() || console.log('Reset view shortcut triggered'),
        description: 'Reset view',
        scope: 'Pattern Detail',
      },
      {
        key: 'a',
        action: () =>
          onToggleAnnotationMode?.() ||
          console.log('Annotation mode shortcut triggered'),
        description: 'Toggle annotation mode',
        scope: 'Pattern Detail',
      },

      // Tab shortcuts
      {
        key: '1',
        action: () => {
          const patternTab = document.querySelector(
            '[role="tab"]:nth-child(1)'
          ) as HTMLElement;
          if (patternTab) patternTab.click();
        },
        description: 'Pattern tab',
        scope: 'Pattern Detail',
      },
      {
        key: '2',
        action: () => {
          const componentsTab = document.querySelector(
            '[role="tab"]:nth-child(2)'
          ) as HTMLElement;
          if (componentsTab) componentsTab.click();
        },
        description: 'Components tab',
        scope: 'Pattern Detail',
      },
      {
        key: '3',
        action: () => {
          const materialsTab = document.querySelector(
            '[role="tab"]:nth-child(3)'
          ) as HTMLElement;
          if (materialsTab) materialsTab.click();
        },
        description: 'Materials tab',
        scope: 'Pattern Detail',
      },
      {
        key: '4',
        action: () => {
          const notesTab = document.querySelector(
            '[role="tab"]:nth-child(4)'
          ) as HTMLElement;
          if (notesTab) notesTab.click();
        },
        description: 'Notes tab',
        scope: 'Pattern Detail',
      },

      // Project integration
      {
        key: 'ctrl+p',
        action: () => navigate(`/projects/new?pattern=${patternId}`),
        description: 'Add to project',
        scope: 'Pattern Detail',
      },

      // Help shortcut
      {
        key: '?',
        action: () => openShortcutsDialog(), // Using captured hook value
        description: 'Show keyboard shortcuts',
        scope: 'Pattern Detail',
      },
    ];
  };

  // Navigate to previous pattern in the list
  const navigateToPreviousPattern = () => {
    if (!patternId || patterns.length === 0) return;

    const currentIndex = patterns.findIndex((p) => p.id === patternId);
    if (currentIndex <= 0) return;

    const prevPattern = patterns[currentIndex - 1];
    navigate(`/patterns/${prevPattern.id}`);
  };

  // Navigate to next pattern in the list
  const navigateToNextPattern = () => {
    if (!patternId || patterns.length === 0) return;

    const currentIndex = patterns.findIndex((p) => p.id === patternId);
    if (currentIndex === -1 || currentIndex >= patterns.length - 1) return;

    const nextPattern = patterns[currentIndex + 1];
    navigate(`/patterns/${nextPattern.id}`);
  };

  // Store shortcut definition functions in refs to avoid dependency issues
  const listViewShortcutsRef = useRef(defineListViewShortcuts);
  const detailViewShortcutsRef = useRef(defineDetailViewShortcuts);

  useEffect(() => {
    // Define different shortcuts based on whether we're in list or detail view
    const shortcuts: ShortcutDefinition[] = isDetailView
      ? detailViewShortcutsRef.current()
      : listViewShortcutsRef.current();

    // Register shortcuts
    registerShortcuts(shortcuts, 'patterns');

    // Clean up when component unmounts
    return () => {
      unregisterShortcuts('patterns');
    };
  }, [
    registerShortcuts,
    unregisterShortcuts,
    isDetailView,
    patternId,
    onToggleFavorite,
    onPrint,
    onDownload,
    onShare,
    onZoomIn,
    onZoomOut,
    onResetView,
    onToggleAnnotationMode,
  ]);

  // This is a presentation-less component
  return null;
};

export default PatternShortcuts;
