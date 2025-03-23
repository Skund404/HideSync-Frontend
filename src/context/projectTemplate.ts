// src/context/projectTemplate.ts
// This file re-exports types from the types directory to maintain compatibility
// with existing imports in the codebase

// Export default type for compatibility with default imports
export type {
  default,
  GeneratedProject,
  ProjectFromTemplate,
  ProjectTemplate,
  RecurrencePattern,
  RecurringProjectTemplate,
  TemplateCategory,
  TemplateComponent,
  TemplateFilter,
  TemplateMaterial,
  TemplateMaterialAlternative,
  TemplateMaterialWithAlternatives,
} from '@/types/projectTemplate';
// Re-export the hook
export { useProjectTemplates } from './ProjectTemplateContext';
