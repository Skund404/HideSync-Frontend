// src/types/documentationTypes.ts

/**
 * Type definitions for the HideSync documentation and knowledge base system.
 */

// Documentation resource types
export enum ResourceType {
  GUIDE = 'guide',
  TUTORIAL = 'tutorial',
  REFERENCE = 'reference',
  WORKFLOW = 'workflow',
  TEMPLATE = 'template',
  TROUBLESHOOTING = 'troubleshooting',
  VIDEO = 'video',
}

// Target audience skill levels
export enum SkillLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

// Documentation categories
export enum DocumentationCategory {
  GETTING_STARTED = 'getting_started',
  INVENTORY = 'inventory',
  MATERIALS = 'materials',
  PROJECTS = 'projects',
  PATTERNS = 'patterns',
  SALES = 'sales',
  PURCHASES = 'purchases',
  TOOLS = 'tools',
  STORAGE = 'storage',
  WORKFLOWS = 'workflows',
  TECHNIQUES = 'techniques',
  REFERENCE = 'reference',
}

// Documentation tag interface
export interface DocumentationTag {
  id: string;
  name: string;
  color?: string;
}

// Video resource interface
export interface VideoResource {
  videoId: string; // YouTube video ID
  title: string; // Video title
  description?: string; // Optional description
  startTime?: number; // Optional start time in seconds
  thumbnailQuality?: 'default' | 'medium' | 'high' | 'standard' | 'maxres';
  duration?: string; // Optional duration in MM:SS format
}

// Main documentation resource interface
export interface DocumentationResource {
  id: string;
  title: string;
  description: string;
  content: string;
  category: DocumentationCategory;
  type: ResourceType;
  skillLevel: SkillLevel;
  tags: string[];
  relatedResources: string[];
  lastUpdated: string; // ISO date string
  author: string;
  contextualHelpKeys?: string[]; // Keys for contextual help linking
  videos?: VideoResource[]; // Associated video resources
}

// Category definition
export interface CategoryDefinition {
  id: DocumentationCategory;
  name: string;
  description: string;
  icon: string;
  resources: string[]; // Resource IDs
  subCategories?: CategoryDefinition[];
}

// Search query interface
export interface DocumentationSearchQuery {
  term?: string;
  category?: DocumentationCategory;
  type?: ResourceType;
  skillLevel?: SkillLevel;
  tags?: string[];
  hasVideos?: boolean; // Filter for resources with videos
}

// Search result interface
export interface DocumentationSearchResult {
  resources: DocumentationResource[];
  totalCount: number;
}

// Workflow step interface
export interface WorkflowStep {
  id: string;
  title: string;
  content: string;
  image?: string;
  video?: VideoResource;
  estimatedTime?: number; // Estimated minutes to complete
  dependencies?: string[]; // IDs of steps that must be completed first
}

// Workflow guide interface
export interface WorkflowGuide {
  id: string;
  title: string;
  description: string;
  category: DocumentationCategory;
  steps: WorkflowStep[];
  totalEstimatedTime: number; // Total workflow time in minutes
  difficulty: SkillLevel;
  prerequisites: string[];
  introVideo?: VideoResource;
}
