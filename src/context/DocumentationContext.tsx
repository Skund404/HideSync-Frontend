// src/context/DocumentationContext.tsx

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  // Add new imports for content management
  addDocumentationResource,
  deleteDocumentationResource,
  getContextualHelp as getContextualHelpApi,
  getDocumentationCategories,
  getDocumentationResources,
  getResourceById,
  searchDocumentation as searchDocApi,
  updateDocumentationResource,
} from '../services/mock/documentation';
import {
  CategoryDefinition,
  DocumentationResource,
  DocumentationSearchQuery,
  DocumentationSearchResult,
} from '../types/documentationTypes';

interface DocumentationContextProps {
  resources: DocumentationResource[];
  categories: CategoryDefinition[];
  loading: boolean;
  error: string | null;
  currentResource: DocumentationResource | null;
  searchResults: DocumentationSearchResult | null;
  loadResource: (id: string) => Promise<DocumentationResource | null>;
  searchDocumentation: (
    query: DocumentationSearchQuery
  ) => Promise<DocumentationSearchResult>;
  getContextualHelp: (contextKey: string) => Promise<DocumentationResource[]>;
  // New functions for content management
  addResource: (
    resource: DocumentationResource
  ) => Promise<DocumentationResource>;
  updateResource: (
    resource: DocumentationResource
  ) => Promise<DocumentationResource>;
  deleteResource: (resourceId: string) => Promise<boolean>;
}

const DocumentationContext = createContext<
  DocumentationContextProps | undefined
>(undefined);

export const DocumentationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [resources, setResources] = useState<DocumentationResource[]>([]);
  const [categories, setCategories] = useState<CategoryDefinition[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentResource, setCurrentResource] =
    useState<DocumentationResource | null>(null);
  const [searchResults, setSearchResults] =
    useState<DocumentationSearchResult | null>(null);

  // Load initial documentation data
  useEffect(() => {
    const fetchDocumentation = async () => {
      try {
        setLoading(true);
        const [resourcesData, categoriesData] = await Promise.all([
          getDocumentationResources(),
          getDocumentationCategories(),
        ]);

        setResources(resourcesData);
        setCategories(categoriesData);
        setError(null);
      } catch (err) {
        setError('Failed to load documentation');
        console.error('Documentation loading error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDocumentation();
  }, []);

  // Load a specific resource
  const loadResource = async (id: string) => {
    try {
      setLoading(true);
      const resource = await getResourceById(id);
      setCurrentResource(resource);
      return resource;
    } catch (err) {
      setError('Failed to load resource');
      console.error('Resource loading error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Search documentation
  const searchDocs = async (
    query: DocumentationSearchQuery
  ): Promise<DocumentationSearchResult> => {
    try {
      setLoading(true);
      const results = await searchDocApi(query.term || '', {
        category: query.category,
        type: query.type,
        skillLevel: query.skillLevel,
        tags: query.tags,
      });

      // Type assertion to ensure correct type
      const typedResults = results as DocumentationSearchResult;
      setSearchResults(typedResults);
      return typedResults;
    } catch (err) {
      setError('Search failed');
      console.error('Documentation search error:', err);
      // Return empty result set with correct type
      return { resources: [], totalCount: 0 };
    } finally {
      setLoading(false);
    }
  };

  // Get contextual help
  const getContextHelp = async (contextKey: string) => {
    try {
      return await getContextualHelpApi(contextKey);
    } catch (err) {
      console.error('Contextual help error:', err);
      return [];
    }
  };

  // Add a new resource
  const addResource = async (resource: DocumentationResource) => {
    try {
      setLoading(true);
      const newResource = await addDocumentationResource(resource);
      setResources((prevResources) => [...prevResources, newResource]);
      return newResource;
    } catch (err) {
      setError('Failed to add resource');
      console.error('Add resource error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update an existing resource
  const updateResource = async (resource: DocumentationResource) => {
    try {
      setLoading(true);
      const updatedResource = await updateDocumentationResource(resource);
      setResources((prevResources) =>
        prevResources.map((r) => (r.id === resource.id ? updatedResource : r))
      );
      return updatedResource;
    } catch (err) {
      setError('Failed to update resource');
      console.error('Update resource error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete a resource
  const deleteResource = async (resourceId: string) => {
    try {
      setLoading(true);
      const success = await deleteDocumentationResource(resourceId);
      if (success) {
        setResources((prevResources) =>
          prevResources.filter((r) => r.id !== resourceId)
        );
      }
      return success;
    } catch (err) {
      setError('Failed to delete resource');
      console.error('Delete resource error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value: DocumentationContextProps = {
    resources,
    categories,
    loading,
    error,
    currentResource,
    searchResults,
    loadResource,
    searchDocumentation: searchDocs,
    getContextualHelp: getContextHelp,
    // Add new functions to the context value
    addResource,
    updateResource,
    deleteResource,
  };

  return (
    <DocumentationContext.Provider value={value}>
      {children}
    </DocumentationContext.Provider>
  );
};

export const useDocumentation = () => {
  const context = useContext(DocumentationContext);
  if (context === undefined) {
    throw new Error(
      'useDocumentation must be used within a DocumentationProvider'
    );
  }
  return context;
};
