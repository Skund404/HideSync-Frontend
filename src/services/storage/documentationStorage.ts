import { DocumentationResource } from '../../types/documentationTypes';

/**
 * Saves a documentation resource for offline access
 * @param resource The resource to save
 * @returns True if successful, false otherwise
 */
export const saveResourceOffline = (
  resource: DocumentationResource
): boolean => {
  try {
    // Get existing saved resources
    const savedResources = getSavedResourceIds();

    // Don't add duplicates
    if (!savedResources.includes(resource.id)) {
      savedResources.push(resource.id);
      localStorage.setItem(
        'hidesync_offline_guides',
        JSON.stringify(savedResources)
      );
    }

    // Save the actual resource content
    localStorage.setItem(
      `hidesync_guide_${resource.id}`,
      JSON.stringify(resource)
    );
    return true;
  } catch (error) {
    console.error('Error saving resource offline:', error);
    return false;
  }
};

/**
 * Removes a resource from offline storage
 * @param resourceId ID of the resource to remove
 * @returns True if successful, false otherwise
 */
export const removeResourceOffline = (resourceId: string): boolean => {
  try {
    // Get existing saved resources
    const savedResources = getSavedResourceIds();

    // Filter out the removed resource
    const updatedResources = savedResources.filter((id) => id !== resourceId);
    localStorage.setItem(
      'hidesync_offline_guides',
      JSON.stringify(updatedResources)
    );

    // Remove the resource content
    localStorage.removeItem(`hidesync_guide_${resourceId}`);
    return true;
  } catch (error) {
    console.error('Error removing resource:', error);
    return false;
  }
};

/**
 * Gets all saved resource IDs
 * @returns Array of resource IDs saved for offline use
 */
export const getSavedResourceIds = (): string[] => {
  try {
    const savedResources = localStorage.getItem('hidesync_offline_guides');
    return savedResources ? JSON.parse(savedResources) : [];
  } catch (error) {
    console.error('Error getting saved resources:', error);
    return [];
  }
};

/**
 * Gets a specific offline resource by ID
 * @param resourceId ID of the resource to retrieve
 * @returns The resource if found, null otherwise
 */
export const getOfflineResource = (
  resourceId: string
): DocumentationResource | null => {
  try {
    const resourceData = localStorage.getItem(`hidesync_guide_${resourceId}`);
    return resourceData ? JSON.parse(resourceData) : null;
  } catch (error) {
    console.error('Error getting offline resource:', error);
    return null;
  }
};

/**
 * Gets all offline resources
 * @returns Array of offline resources
 */
export const getAllOfflineResources = (): DocumentationResource[] => {
  try {
    const resourceIds = getSavedResourceIds();
    const resources: DocumentationResource[] = [];

    for (const id of resourceIds) {
      const resource = getOfflineResource(id);
      if (resource) {
        resources.push(resource);
      }
    }

    return resources;
  } catch (error) {
    console.error('Error getting all offline resources:', error);
    return [];
  }
};

/**
 * Checks if a resource is saved for offline use
 * @param resourceId ID of the resource to check
 * @returns True if saved, false otherwise
 */
export const isResourceSavedOffline = (resourceId: string): boolean => {
  return getSavedResourceIds().includes(resourceId);
};

/**
 * Gets the total storage used by offline resources in bytes
 * @returns Size in bytes
 */
export const getOfflineStorageUsage = (): number => {
  try {
    let totalSize = 0;

    // Calculate size of index
    const index = localStorage.getItem('hidesync_offline_guides') || '';
    totalSize += index.length * 2; // Approximate bytes (2 bytes per character)

    // Calculate size of each resource
    const resourceIds = getSavedResourceIds();
    for (const id of resourceIds) {
      const resourceData = localStorage.getItem(`hidesync_guide_${id}`) || '';
      totalSize += resourceData.length * 2;
    }

    return totalSize;
  } catch (error) {
    console.error('Error calculating storage usage:', error);
    return 0;
  }
};

// Create a named object for export to avoid ESLint 'import/no-anonymous-default-export' warning
const documentationStorage = {
  saveResourceOffline,
  removeResourceOffline,
  getSavedResourceIds,
  getOfflineResource,
  getAllOfflineResources,
  isResourceSavedOffline,
  getOfflineStorageUsage,
};

export default documentationStorage;
