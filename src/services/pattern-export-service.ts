// src/services/pattern-export-service.ts
import { apiClient } from './api-client';

/**
 * Options for exporting a pattern
 */
export interface ExportOptions {
  format: 'pdf' | 'svg' | 'dxf' | 'image';
  includeMetadata: boolean;
  includeNotes: boolean;
  includeAnnotations?: boolean;
  quality?: 'draft' | 'standard' | 'high';
  scale?: number;
}

/**
 * Exports a pattern to the specified format
 * @param patternId The ID of the pattern to export
 * @param options Export configuration options
 * @returns Promise with the exported file as a Blob
 */
export const exportPattern = async (patternId: number, options: ExportOptions): Promise<Blob> => {
  try {
    const response = await apiClient.post(`/patterns/${patternId}/export`, options, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error(`Error exporting pattern ${patternId}:`, error);
    throw error;
  }
};

/**
 * Generates a download URL for the exported pattern
 * @param blob The blob containing the exported pattern
 * @param filename Suggested filename for the download
 * @returns Object URL that can be used for downloading
 */
export const generateDownloadUrl = (blob: Blob, filename: string): string => {
  const url = URL.createObjectURL(blob);
  return url;
};

/**
 * Initiates a download of the exported pattern
 * @param patternId The ID of the pattern to export
 * @param options Export configuration options
 * @param filename Suggested filename for the download
 */
export const downloadPattern = async (
  patternId: number,
  options: ExportOptions,
  filename: string
): Promise<void> => {
  try {
    const blob = await exportPattern(patternId, options);
    
    // Create a download link
    const url = generateDownloadUrl(blob, filename);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    
    // Trigger download and clean up
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error(`Error downloading pattern ${patternId}:`, error);
    throw error;
  }
};

/**
 * Generates a shareable link for the pattern
 * @param patternId The ID of the pattern to share
 * @param expiresInDays Optional number of days until the link expires
 * @returns Promise with the shareable link
 */
export const generateShareableLink = async (
  patternId: number,
  expiresInDays?: number
): Promise<string> => {
  try {
    const response = await apiClient.post<{ url: string }>(`/patterns/${patternId}/share`, {
      expiresInDays
    });
    return response.data.url;
  } catch (error) {
    console.error(`Error generating shareable link for pattern ${patternId}:`, error);
    throw error;
  }
};