// src/types/documentationTypes.ts

export type ResourceId = string;
export type VideoResourceId = string;

// Enum Types
export const enum DocumentationCategory {
  GETTING_STARTED = 'GETTING_STARTED',
  INVENTORY = 'INVENTORY',
  MATERIALS = 'MATERIALS',
  PROJECTS = 'PROJECTS',
  SALES = 'SALES',
  PURCHASES = 'PURCHASES',
  TOOLS = 'TOOLS',
  PATTERNS = 'PATTERNS',
  STORAGE = 'STORAGE',
  SUPPLIERS = 'SUPPLIERS',
  INTEGRATIONS = 'INTEGRATIONS',
  SECURITY = 'SECURITY',
  SETTINGS = 'SETTINGS',
  TROUBLESHOOTING = 'TROUBLESHOOTING',
  OTHER = 'OTHER',
}

export const enum DocumentationType {
  GUIDE = 'GUIDE',
  TUTORIAL = 'TUTORIAL',
  REFERENCE = 'REFERENCE',
  WORKFLOW = 'WORKFLOW',
  FAQ = 'FAQ',
  TROUBLESHOOTING = 'TROUBLESHOOTING',
  API = 'API',
  BEST_PRACTICE = 'BEST_PRACTICE',
}

// ResourceType alias for backward compatibility
export const enum ResourceType {
  GUIDE = 'GUIDE',
  TUTORIAL = 'TUTORIAL',
  REFERENCE = 'REFERENCE',
  WORKFLOW = 'WORKFLOW',
  TEMPLATE = 'TEMPLATE',
  TROUBLESHOOTING = 'TROUBLESHOOTING',
  VIDEO = 'VIDEO',
}

export const enum SkillLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
}

export const enum DocumentationResourceStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
  UNDER_REVIEW = 'UNDER_REVIEW',
}

// Search result interface
export interface DocumentationSearchResult {
  resources: DocumentationResource[];
  totalCount: number;
}

// Pagination response interface
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
  };
}

// Comprehensive Interfaces
export interface VideoResource {
  id: VideoResourceId;
  title: string;
  url: string;
  videoId: string; // YouTube video ID
  startTime?: number; // Optional start time in seconds
  duration?: string; // Format: "MM:SS"
  thumbnailQuality?: string; // YouTube thumbnail quality: default, hqdefault, mqdefault, sddefault, maxresdefault
  thumbnail?: string;
  description?: string;
  uploadDate?: string;
  tags?: string[];
  skillLevel?: SkillLevel;
}

export interface DocumentationResource {
  id: ResourceId;
  title: string;
  description: string;
  content: string;

  // Categorization
  category: DocumentationCategory;
  type: DocumentationType;
  skillLevel: SkillLevel;

  // Metadata
  tags: string[];
  author: string;
  lastUpdated: string;
  relatedResources: ResourceId[];
  contextualHelpKeys: string[];

  // Multimedia
  videos: VideoResource[];
}

export interface DocumentationCategoryResource {
  id: ResourceId;
  name: string;
  description: string;
  icon: string;
  resources: ResourceId[];
}

export interface ContextualHelp {
  id: string;
  key: string;
  resourceId: ResourceId;
  context: string;
  type: 'TOOLTIP' | 'MODAL' | 'INLINE';
  skillLevel?: SkillLevel;
}

// Video-specific interfaces
export interface VideoTimestamp {
  time: number; // In seconds
  label: string;
  description?: string;
}

export interface VideoNote {
  id: string;
  timeInSeconds: number;
  text: string;
  createdAt: string;
}

export interface VideoItem extends VideoResource {
  resourceId?: string;
  category?: string;
  tags?: string[];
  skillLevel?: SkillLevel;
  popularity?: number; // 1-100 rating
}

export interface VideoCategory {
  id: string;
  name: string;
  description?: string;
  videos: VideoItem[];
}

export interface PlaylistItem extends VideoResource {
  resourceId?: string; // Optional reference to parent documentation
  completed?: boolean; // Track watched status
}

// Pagination and Filtering
export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface DocumentationFilters {
  category?: DocumentationCategory;
  type?: DocumentationType;
  skillLevel?: SkillLevel;
  tags?: string[];
  author?: string;
  search?: string;
  minLastUpdated?: string;
  maxLastUpdated?: string;
}

export interface DocumentationFilters {
  category?: DocumentationCategory;
  type?: DocumentationType;
  skillLevel?: SkillLevel;
  tags?: string[];
  author?: string;
  search?: string;
  minLastUpdated?: string;
  maxLastUpdated?: string;
  // Add pagination support
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}
// Comprehensive Documentation Helpers
export const documentationHelpers = {
  /**
   * Advanced date formatting with relative and absolute options
   * @param dateString - Date to format
   * @param format - Formatting style
   * @returns Formatted date string
   * @throws {Error} If the dateString is invalid.
   */
  formatDate(
    dateString: string,
    format: 'relative' | 'full' | 'short' = 'relative'
  ): string {
    if (!dateString) return 'Unknown date';

    const date = new Date(dateString);

    if (isNaN(date.getTime())) return 'Invalid date';

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHour / 24);

    if (format === 'relative') {
      if (diffSec < 60) return 'Just now';
      if (diffMin < 60)
        return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
      if (diffHour < 24)
        return `${diffHour} hour${diffHour !== 1 ? 's' : ''} ago`;
      if (diffDays < 7)
        return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }

    if (format === 'short') {
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }

    return date.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  },

  /**
   * Generate a preview of content with markdown stripping
   * @param content - Full content
   * @param length - Preview length
   * @returns Truncated preview
   * @throws {Error} If content is invalid
   */
  generatePreview(content: string, length = 150): string {
    if (!content) return '';

    // Markdown stripping logic
    const plainText = content
      .replace(/#+\s+(.*)/g, '$1')
      .replace(/\*\*(.*)\*\*/g, '$1')
      .replace(/\*(.*)\*/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/```[^`]*```/g, '')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/>\s+(.*)/g, '$1')
      .replace(/!\[(.*?)\]\(.*?\)/g, '[Image]')
      .replace(/\n/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return plainText.length > length
      ? plainText.substring(0, length) + '...'
      : plainText;
  },

  /**
   * Filter resources based on comprehensive criteria
   * @param resources - Array of documentation resources
   * @param filters - Filtering parameters
   * @returns Filtered resources
   * @throws {Error} If resource or filters is invalid
   */
  filterResources(
    resources: DocumentationResource[],
    filters: DocumentationFilters
  ): DocumentationResource[] {
    return resources.filter((resource) => {
      // Category filter
      if (filters.category && resource.category !== filters.category)
        return false;

      // Type filter
      if (filters.type && resource.type !== filters.type) return false;

      // Skill level filter
      if (filters.skillLevel && resource.skillLevel !== filters.skillLevel)
        return false;

      // Tags filter
      if (
        filters.tags &&
        !filters.tags.some((tag) => resource.tags.includes(tag))
      )
        return false;

      // Author filter
      if (filters.author && resource.author !== filters.author) return false;

      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        if (
          !resource.title.toLowerCase().includes(searchTerm) &&
          !resource.description.toLowerCase().includes(searchTerm) &&
          !resource.content.toLowerCase().includes(searchTerm) &&
          !resource.tags.some((tag) => tag.toLowerCase().includes(searchTerm))
        )
          return false;
      }

      // Date range filters
      if (
        filters.minLastUpdated &&
        resource.lastUpdated < filters.minLastUpdated
      )
        return false;
      if (
        filters.maxLastUpdated &&
        resource.lastUpdated > filters.maxLastUpdated
      )
        return false;

      return true;
    });
  },

  /**
   * Calculate relevance score for a resource
   * @param resource - Documentation resource
   * @param searchTerm - Search query
   * @returns Relevance score
   * @throws {Error} If the search term is invalid
   */
  calculateResourceRelevance(
    resource: DocumentationResource,
    searchTerm: string
  ): number {
    if (!searchTerm) return 0;

    const term = searchTerm.toLowerCase();
    let score = 0;

    // Title match
    if (resource.title.toLowerCase().includes(term)) score += 50;

    // Exact tag match
    if (resource.tags.some((tag) => tag.toLowerCase() === term)) score += 30;

    // Partial tag match
    if (resource.tags.some((tag) => tag.toLowerCase().includes(term)))
      score += 20;

    // Description match
    if (resource.description.toLowerCase().includes(term)) score += 15;

    // Content match
    if (resource.content.toLowerCase().includes(term)) score += 10;

    return score;
  },

  /**
   * Find related resources
   * @param resource - Base resource
   * @param allResources - All available resources
   * @returns Related resources
   * @throws {Error} if any of the parameters are invalid
   */
  findRelatedResources(
    resource: DocumentationResource,
    allResources: DocumentationResource[]
  ): DocumentationResource[] {
    // Direct related resources
    const directRelated = allResources.filter((r) =>
      resource.relatedResources.includes(r.id)
    );

    // Additional related by tags or category
    const additionalRelated = allResources
      .filter((r) => {
        if (directRelated.includes(r) || r.id === resource.id) return false;

        // Match by category
        if (r.category === resource.category) return true;

        // Match by tags
        const commonTags = r.tags.filter((tag) => resource.tags.includes(tag));
        return commonTags.length > 0;
      })
      .slice(0, 5); // Limit additional related resources

    return [...directRelated, ...additionalRelated];
  },

  /**
   * Estimate reading time for content
   * @param content - Content to estimate reading time for
   * @returns Estimated reading time in minutes
   * @throws {Error} If content is invalid
   */
  estimateReadingTime(content: string): number {
    if (!content) return 0;

    // Strip markdown
    const plainText = content
      .replace(/#+\s+(.*)/g, '$1')
      .replace(/\*\*(.*)\*\*/g, '$1')
      .replace(/\*(.*)\*/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/```[^`]*```/g, '')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/>\s+(.*)/g, '$1')
      .replace(/!\[(.*?)\]\(.*?\)/g, '')
      .trim();

    const wordCount = plainText.split(/\s+/).length;
    return Math.ceil(wordCount / 200); // Assume 200 words per minute
  },

  /**
   * Debounce function to limit execution rate
   * @param func - Function to debounce
   * @param wait - Wait time in milliseconds
   * @returns Debounced function
   */
  debounce: <F extends (...args: any[]) => any>(func: F, wait: number) => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    return (...args: Parameters<F>): void => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        func(...args);
      }, wait);
    };
  },
};

// No type re-exports needed at the end of the file
export {};
