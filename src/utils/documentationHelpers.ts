import {
  DocumentationCategory,
  DocumentationResource,
  ResourceType,
  SkillLevel,
} from '../types/documentationTypes';

/**
 * Formats a category ID to a readable string
 * @param category The category ID to format
 * @returns Formatted category name
 */
export const formatCategoryName = (category: DocumentationCategory): string => {
  return category
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Formats a skill level to a readable string
 * @param skillLevel The skill level to format
 * @returns Formatted skill level name
 */
export const formatSkillLevel = (skillLevel: SkillLevel): string => {
  switch (skillLevel) {
    case SkillLevel.BEGINNER:
      return 'Beginner';
    case SkillLevel.INTERMEDIATE:
      return 'Intermediate';
    case SkillLevel.ADVANCED:
      return 'Advanced';
    default:
      return skillLevel;
  }
};

/**
 * Formats a resource type to a readable string
 * @param type The resource type to format
 * @returns Formatted resource type name
 */
export const formatResourceType = (type: ResourceType): string => {
  switch (type) {
    case ResourceType.GUIDE:
      return 'Guide';
    case ResourceType.TUTORIAL:
      return 'Tutorial';
    case ResourceType.REFERENCE:
      return 'Reference';
    case ResourceType.WORKFLOW:
      return 'Workflow';
    case ResourceType.TEMPLATE:
      return 'Template';
    case ResourceType.TROUBLESHOOTING:
      return 'Troubleshooting';
    case ResourceType.VIDEO:
      return 'Video';
    default:
      return type;
  }
};

/**
 * Gets an estimated reading time in minutes based on content length
 * @param content The content to calculate reading time for
 * @returns Estimated reading time in minutes
 */
export const getReadingTime = (content: string): number => {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / wordsPerMinute);
  return Math.max(1, readingTime); // Minimum 1 minute
};

/**
 * Extracts a plain text excerpt from markdown content
 * @param content The markdown content
 * @param maxLength The maximum length of the excerpt
 * @returns Plain text excerpt
 */
export const getContentExcerpt = (
  content: string,
  maxLength: number = 150
): string => {
  // Strip markdown formatting
  const plainText = content
    .replace(/#+\s+(.*)/g, '$1') // Remove headings
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1') // Remove italic
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links
    .replace(/\n/g, ' ') // Replace line breaks with spaces
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();

  if (plainText.length <= maxLength) {
    return plainText;
  }

  // Find a sensible cutoff point
  const excerpt = plainText.substring(0, maxLength);
  const lastSpace = excerpt.lastIndexOf(' ');

  if (lastSpace !== -1) {
    return excerpt.substring(0, lastSpace) + '...';
  }

  return excerpt + '...';
};

/**
 * Sorts resources by a specific property
 * @param resources The resources to sort
 * @param sortBy The property to sort by
 * @param sortDirection The direction to sort in
 * @returns Sorted resources
 */
export const sortResources = (
  resources: DocumentationResource[],
  sortBy: keyof DocumentationResource = 'title',
  sortDirection: 'asc' | 'desc' = 'asc'
): DocumentationResource[] => {
  return [...resources].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];

    if (aValue && bValue) {
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    }
    return 0;
  });
};

/**
 * Groups resources by category
 * @param resources The resources to group
 * @returns Resources grouped by category
 */
export const groupResourcesByCategory = (
  resources: DocumentationResource[]
): Record<string, DocumentationResource[]> => {
  return resources.reduce((groups, resource) => {
    const category = resource.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(resource);
    return groups;
  }, {} as Record<string, DocumentationResource[]>);
};

/**
 * Filters resources based on search criteria
 * @param resources The resources to filter
 * @param searchTerm The search term to filter by
 * @returns Filtered resources
 */
export const filterResourcesBySearchTerm = (
  resources: DocumentationResource[],
  searchTerm: string
): DocumentationResource[] => {
  if (!searchTerm.trim()) {
    return resources;
  }

  const normalizedTerm = searchTerm.toLowerCase();

  return resources.filter(
    (resource) =>
      resource.title.toLowerCase().includes(normalizedTerm) ||
      resource.description.toLowerCase().includes(normalizedTerm) ||
      resource.content.toLowerCase().includes(normalizedTerm) ||
      (resource.tags &&
        resource.tags.some((tag) => tag.toLowerCase().includes(normalizedTerm)))
  );
};

// Create a named object for export
const documentationHelpers = {
  formatCategoryName,
  formatSkillLevel,
  formatResourceType,
  getReadingTime,
  getContentExcerpt,
  sortResources,
  groupResourcesByCategory,
  filterResourcesBySearchTerm,
};

export default documentationHelpers;
