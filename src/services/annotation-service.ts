// src/services/annotation-service.ts
import { apiClient, ApiError } from './api-client';

/**
 * Represents an annotation on a pattern
 */
export interface Annotation {
    id: string;
    patternId: number;
    type: 'text' | 'arrow' | 'measurement' | 'highlight';
    position: { x: number; y: number };
    size?: { width: number; height: number };
    targetPosition?: { x: number; y: number }; // For arrows and measurements
    content?: string;
    color: string;
    measurement?: number; // For measurements
    unit?: string; // For measurements
    pageNumber?: number; // For PDF annotations
    createdAt: Date;
    modifiedAt: Date;
    createdBy?: string;
  }

/**
 * Fetches all annotations for a specific pattern
 * @param patternId The pattern ID to fetch annotations for
 * @returns Promise with array of annotations
 */
export const getAnnotationsByPatternId = async (patternId: number): Promise<Annotation[]> => {
  try {
    const response = await apiClient.get<Annotation[]>(`/annotations?patternId=${patternId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching annotations for pattern ${patternId}:`, error);
    throw error;
  }
};

/**
 * Fetches a single annotation by ID
 * @param id The annotation ID to fetch
 * @returns Promise with the annotation or null if not found
 */
export const getAnnotationById = async (id: string): Promise<Annotation | null> => {
  try {
    const response = await apiClient.get<Annotation>(`/annotations/${id}`);
    return response.data;
  } catch (error) {
    if ((error as ApiError).status === 404) {
      return null;
    }
    console.error(`Error fetching annotation with id ${id}:`, error);
    throw error;
  }
};

/**
 * Creates a new annotation
 * @param annotation The annotation data to create (without id)
 * @returns Promise with the created annotation
 */
export const createAnnotation = async (annotation: Omit<Annotation, 'id' | 'createdAt' | 'modifiedAt'>): Promise<Annotation> => {
  try {
    const response = await apiClient.post<Annotation>('/annotations', annotation);
    return response.data;
  } catch (error) {
    console.error('Error creating annotation:', error);
    throw error;
  }
};

/**
 * Updates an existing annotation
 * @param id The annotation ID to update
 * @param annotation The annotation data to update
 * @returns Promise with the updated annotation
 */
export const updateAnnotation = async (
  id: string,
  annotation: Partial<Omit<Annotation, 'id' | 'createdAt' | 'modifiedAt'>>
): Promise<Annotation> => {
  try {
    const response = await apiClient.patch<Annotation>(`/annotations/${id}`, annotation);
    return response.data;
  } catch (error) {
    console.error(`Error updating annotation with id ${id}:`, error);
    throw error;
  }
};

/**
 * Deletes an annotation
 * @param id The annotation ID to delete
 * @returns Promise with a boolean indicating success
 */
export const deleteAnnotation = async (id: string): Promise<boolean> => {
  try {
    await apiClient.delete(`/annotations/${id}`);
    return true;
  } catch (error) {
    console.error(`Error deleting annotation with id ${id}:`, error);
    throw error;
  }
};

/**
 * Deletes all annotations for a specific pattern
 * @param patternId The pattern ID to delete annotations for
 * @returns Promise with a boolean indicating success
 */
export const deleteAllAnnotationsByPatternId = async (patternId: number): Promise<boolean> => {
  try {
    await apiClient.delete(`/annotations?patternId=${patternId}`);
    return true;
  } catch (error) {
    console.error(`Error deleting all annotations for pattern ${patternId}:`, error);
    throw error;
  }
};