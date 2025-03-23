// src/services/pattern-import-export-service.ts
import { apiClient, ApiError } from './api-client';
import { Pattern, PatternFileType } from '../types/patternTypes';

/**
 * Service for handling pattern import and export operations
 */

const BASE_URL = '/patterns';

/**
 * Export a pattern to a specific file format
 * @param patternId The ID of the pattern to export
 * @param format The format to export to (SVG, PDF, etc.)
 * @param includeMetadata Whether to include pattern metadata in the export
 * @returns A promise with the file contents or blob URL
 */
export const exportPattern = async (
  patternId: number,
  format: PatternFileType | 'ZIP',
  includeMetadata: boolean = true
): Promise<string> => {
  try {
    const response = await apiClient.get(
      `${BASE_URL}/${patternId}/export`, 
      {
        params: { format, includeMetadata },
        responseType: 'blob'
      }
    );
    
    // Create a download URL from the blob
    const blob = new Blob([response.data], { 
      type: getContentType(format) 
    });
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error(`Error exporting pattern ${patternId}:`, error);
    throw error;
  }
};

/**
 * Import a pattern from a file
 * @param file The file to import
 * @param name Optional name for the pattern
 * @returns A promise with the created pattern data
 */
export const importPattern = async (
  file: File, 
  name?: string
): Promise<Pattern> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    if (name) {
      formData.append('name', name);
    }

    const response = await apiClient.post<Pattern>(
      `${BASE_URL}/import`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error importing pattern:', error);
    throw error;
  }
};

/**
 * Generate a printable version of a pattern
 * @param patternId The ID of the pattern to print
 * @param options Printing options
 * @returns A promise with the URL to the printable file
 */
export const generatePrintablePattern = async (
  patternId: number,
  options: {
    paperSize: 'letter' | 'a4' | 'legal' | 'tabloid';
    orientation: 'portrait' | 'landscape';
    scale: number;
    margins: number;
    includeMetadata: boolean;
    fitToPage: boolean;
  }
): Promise<string> => {
  try {
    const response = await apiClient.post(
      `${BASE_URL}/${patternId}/print`,
      options,
      { responseType: 'blob' }
    );
    
    // Create a download URL from the blob
    const blob = new Blob([response.data], { type: 'application/pdf' });
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error(`Error generating printable pattern ${patternId}:`, error);
    throw error;
  }
};

/**
 * Download a pattern file directly
 * @param patternId The ID of the pattern to download
 * @returns A promise with the URL to the downloaded file
 */
export const downloadPatternFile = async (patternId: number): Promise<string> => {
  try {
    const response = await apiClient.get(
      `${BASE_URL}/${patternId}/download`,
      { responseType: 'blob' }
    );
    
    // Create a download URL from the blob
    const contentType = response.headers['content-type'] || 'application/octet-stream';
    const blob = new Blob([response.data], { type: contentType });
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error(`Error downloading pattern ${patternId}:`, error);
    throw error;
  }
};

/**
 * Get the correct content type for the given format
 */
function getContentType(format: PatternFileType | 'ZIP'): string {
  switch (format) {
    case PatternFileType.SVG:
      return 'image/svg+xml';
    case PatternFileType.PDF:
      return 'application/pdf';
    case PatternFileType.IMAGE:
      return 'image/png'; // Default to PNG for image export
    case 'ZIP':
      return 'application/zip';
    default:
      return 'application/octet-stream';
  }
}