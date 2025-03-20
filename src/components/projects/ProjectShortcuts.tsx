// src/components/projects/ProjectShortcuts.tsx
import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useKeyboardShortcutsContext } from '../../context/KeyboardShortcutsContext';
import { useProjects } from '../../context/ProjectContext';
import { ShortcutDefinition } from '../../hooks/useKeyboardShortcuts';
import { ProjectStatus } from '../../types/enums';

interface ProjectShortcutsProps {
  projectId?: number; // Changed to number to match the Project model
  onStatusChange?: (status: string) => void;
  onGeneratePickingList?: () => void;
  onSaveNote?: () => void;
  onSendUpdate?: () => void;
  onScheduleFollowUp?: () => void;
}

const ProjectShortcuts: React.FC<ProjectShortcutsProps> = ({
  projectId,
  onStatusChange,
  onGeneratePickingList,
  onSaveNote,
  onSendUpdate,
  onScheduleFollowUp,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { registerShortcuts, unregisterShortcuts, openShortcutsDialog } =
    useKeyboardShortcutsContext();
  const { projects, getProjectById, updateProject } = useProjects();

  // Determine if we're in project detail view
  const isDetailView =
    location.pathname.includes('/projects/') &&
    !location.pathname.endsWith('/projects') &&
    !location.pathname.includes('/templates') &&
    !location.pathname.includes('/recurring');

  // Determine if we're in templates view
  const isTemplatesView = location.pathname.includes('/projects/templates');

  // Determine if we're in recurring projects view
  const isRecurringView = location.pathname.includes('/projects/recurring');

  // Define shortcuts for the list view (projects dashboard)
  const defineListViewShortcuts = (): ShortcutDefinition[] => {
    return [
      {
        key: 'n',
        action: () => navigate('/projects/new'),
        description: 'Create new project',
        scope: 'Projects Dashboard',
      },
      {
        key: 't',
        action: () => navigate('/projects/templates'),
        description: 'View templates',
        scope: 'Projects Dashboard',
      },
      {
        key: 'r',
        action: () => navigate('/projects/recurring'),
        description: 'View recurring projects',
        scope: 'Projects Dashboard',
      },
      {
        key: 'p',
        action: () => navigate('/projects/picking-lists'),
        description: 'View picking lists',
        scope: 'Projects Dashboard',
      },
      {
        key: 'f',
        action: () =>
          document
            .querySelector<HTMLInputElement>('[placeholder*="Search projects"]')
            ?.focus(),
        description: 'Focus search box',
        scope: 'Projects Dashboard',
      },
      {
        key: '?',
        action: () => openShortcutsDialog(), // Fixed: Use the captured hook value
        description: 'Show keyboard shortcuts',
        scope: 'Projects Dashboard',
      },
    ];
  };

  // Define shortcuts for the project detail view
  const defineDetailViewShortcuts = (): ShortcutDefinition[] => {
    return [
      // Navigation shortcuts
      {
        key: 'escape',
        action: () => navigate('/projects'),
        description: 'Back to projects list',
        scope: 'Project Detail',
      },
      {
        key: 'ctrl+left',
        action: () => navigateToPreviousProject(),
        description: 'Previous project',
        scope: 'Project Detail',
      },
      {
        key: 'ctrl+right',
        action: () => navigateToNextProject(),
        description: 'Next project',
        scope: 'Project Detail',
      },

      // Status shortcuts
      {
        key: 's+p',
        action: () => handleStatusChange(ProjectStatus.PLANNING),
        description: 'Set status: Planning',
        scope: 'Project Detail',
      },
      {
        key: 's+i',
        action: () => handleStatusChange(ProjectStatus.IN_PROGRESS),
        description: 'Set status: In Progress',
        scope: 'Project Detail',
      },
      {
        key: 's+m',
        action: () => handleStatusChange(ProjectStatus.MATERIAL_PREPARATION),
        description: 'Set status: Material Preparation',
        scope: 'Project Detail',
      },
      {
        key: 's+c',
        action: () => handleStatusChange(ProjectStatus.COMPLETED),
        description: 'Set status: Completed',
        scope: 'Project Detail',
      },

      // Action shortcuts
      {
        key: 'g',
        action: () =>
          onGeneratePickingList?.() ||
          console.log('Generate picking list shortcut triggered'),
        description: 'Generate picking list',
        scope: 'Project Detail',
      },
      {
        key: 'ctrl+s',
        action: () =>
          onSaveNote?.() || console.log('Save note shortcut triggered'),
        description: 'Save notes',
        scope: 'Project Detail',
      },
      {
        key: 'ctrl+u',
        action: () =>
          onSendUpdate?.() || console.log('Send update shortcut triggered'),
        description: 'Send client update',
        scope: 'Project Detail',
      },
      {
        key: 'ctrl+f',
        action: () =>
          onScheduleFollowUp?.() ||
          console.log('Schedule follow-up shortcut triggered'),
        description: 'Schedule follow-up',
        scope: 'Project Detail',
      },

      // Templates and recurring
      {
        key: 'ctrl+t',
        action: () => navigate(`/projects/${projectId}/save-as-template`),
        description: 'Save as template',
        scope: 'Project Detail',
      },
      {
        key: 'ctrl+r',
        action: () =>
          navigate(`/projects/recurring/new?projectId=${projectId}`),
        description: 'Create recurring project',
        scope: 'Project Detail',
      },

      // Help shortcut
      {
        key: '?',
        action: () => openShortcutsDialog(), // Fixed: Use the captured hook value
        description: 'Show keyboard shortcuts',
        scope: 'Project Detail',
      },
    ];
  };

  // Define shortcuts for the templates view
  const defineTemplatesViewShortcuts = (): ShortcutDefinition[] => {
    return [
      {
        key: 'n',
        action: () => navigate('/projects/templates/new'),
        description: 'Create new template',
        scope: 'Project Templates',
      },
      {
        key: 'f',
        action: () =>
          document
            .querySelector<HTMLInputElement>(
              '[placeholder*="Search templates"]'
            )
            ?.focus(),
        description: 'Focus search box',
        scope: 'Project Templates',
      },
      {
        key: 'escape',
        action: () => navigate('/projects'),
        description: 'Back to projects',
        scope: 'Project Templates',
      },
      {
        key: '?',
        action: () => openShortcutsDialog(), // Fixed: Use the captured hook value
        description: 'Show keyboard shortcuts',
        scope: 'Project Templates',
      },
    ];
  };

  // Define shortcuts for the recurring projects view
  const defineRecurringViewShortcuts = (): ShortcutDefinition[] => {
    return [
      {
        key: 'n',
        action: () => navigate('/projects/recurring/new'),
        description: 'Create new recurring project',
        scope: 'Recurring Projects',
      },
      {
        key: 'f',
        action: () =>
          document
            .querySelector<HTMLInputElement>(
              '[placeholder*="Search recurring"]'
            )
            ?.focus(),
        description: 'Focus search box',
        scope: 'Recurring Projects',
      },
      {
        key: 'escape',
        action: () => navigate('/projects'),
        description: 'Back to projects',
        scope: 'Recurring Projects',
      },
      {
        key: '?',
        action: () => openShortcutsDialog(), // Fixed: Use the captured hook value
        description: 'Show keyboard shortcuts',
        scope: 'Recurring Projects',
      },
    ];
  };

  // Navigate to previous project in the list
  const navigateToPreviousProject = () => {
    if (!projectId || projects.length === 0) return;

    const currentIndex = projects.findIndex((p) => p.id === projectId);
    if (currentIndex <= 0) return;

    const prevProject = projects[currentIndex - 1];
    navigate(`/projects/${prevProject.id}`);
  };

  // Navigate to next project in the list
  const navigateToNextProject = () => {
    if (!projectId || projects.length === 0) return;

    const currentIndex = projects.findIndex((p) => p.id === projectId);
    if (currentIndex === -1 || currentIndex >= projects.length - 1) return;

    const nextProject = projects[currentIndex + 1];
    navigate(`/projects/${nextProject.id}`);
  };

  // Handle status change
  const handleStatusChange = (status: ProjectStatus) => {
    if (onStatusChange) {
      onStatusChange(status);
      return;
    }

    if (projectId) {
      const project = getProjectById(projectId);
      if (project) {
        updateProject(projectId, { status });
      }
    }
  };

  // Store shortcut definition functions in refs to avoid dependency issues
  const listViewShortcutsRef = useRef(defineListViewShortcuts);
  const detailViewShortcutsRef = useRef(defineDetailViewShortcuts);
  const templatesViewShortcutsRef = useRef(defineTemplatesViewShortcuts);
  const recurringViewShortcutsRef = useRef(defineRecurringViewShortcuts);

  useEffect(() => {
    // Define different shortcuts based on which view we're in
    let shortcuts: ShortcutDefinition[];

    if (isDetailView) {
      shortcuts = detailViewShortcutsRef.current();
    } else if (isTemplatesView) {
      shortcuts = templatesViewShortcutsRef.current();
    } else if (isRecurringView) {
      shortcuts = recurringViewShortcutsRef.current();
    } else {
      shortcuts = listViewShortcutsRef.current();
    }

    // Register shortcuts
    registerShortcuts(shortcuts, 'projects');

    // Clean up when component unmounts
    return () => {
      unregisterShortcuts('projects');
    };
  }, [
    registerShortcuts,
    unregisterShortcuts,
    isDetailView,
    isTemplatesView,
    isRecurringView,
    projectId,
    onStatusChange,
    onGeneratePickingList,
    onSaveNote,
    onSendUpdate,
    onScheduleFollowUp,
  ]);

  // This is a presentation-less component
  return null;
};

export default ProjectShortcuts;
