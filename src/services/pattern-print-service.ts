// src/services/pattern-print-service.ts
import { apiClient } from './api-client';

/**
 * Options for printing a pattern
 */
export interface PrintOptions {
  paperSize: 'letter' | 'a4' | 'legal' | 'tabloid';
  orientation: 'portrait' | 'landscape';
  scale: number;
  margins: number;
  includeMetadata: boolean;
  fitToPage: boolean;
  includeAnnotations?: boolean;
  cropMarks?: boolean;
  quality?: 'draft' | 'standard' | 'high';
}

/**
 * Generates a printable PDF of the pattern
 * @param patternId The ID of the pattern to print
 * @param options Print configuration options
 * @returns Promise with the PDF file as a Blob
 */
export const printPattern = async (patternId: number, options: PrintOptions): Promise<Blob> => {
  try {
    const response = await apiClient.post(`/patterns/${patternId}/print`, options, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error(`Error printing pattern ${patternId}:`, error);
    throw error;
  }
};

/**
 * Generates a printable PDF and opens it in a new window
 * @param patternId The ID of the pattern to print
 * @param options Print configuration options
 * @returns Promise with the URL to the generated PDF
 */
export const generatePrintablePattern = async (
  patternId: number,
  options: PrintOptions
): Promise<string> => {
  try {
    const blob = await printPattern(patternId, options);
    const url = URL.createObjectURL(blob);
    return url;
  } catch (error) {
    console.error(`Error generating printable pattern ${patternId}:`, error);
    throw error;
  }
};

/**
 * Sends the pattern directly to the printer
 * @param patternId The ID of the pattern to print
 * @param options Print configuration options
 * @returns Promise indicating print success
 */
export const printPatternDirectly = async (
  patternId: number,
  options: PrintOptions
): Promise<boolean> => {
  try {
    const url = await generatePrintablePattern(patternId, options);
    
    // Open in a new window and trigger print
    const printWindow = window.open(url, '_blank');
    if (printWindow) {
      printWindow.addEventListener('load', () => {
        printWindow.print();
      });
      return true;
    } else {
      throw new Error('Failed to open print window. Please check your popup blocker settings.');
    }
  } catch (error) {
    console.error(`Error directly printing pattern ${patternId}:`, error);
    throw error;
  }
};

/**
 * Gets default print settings based on the pattern type
 * @param patternId The ID of the pattern
 * @returns Promise with the default print options
 */
export const getDefaultPrintSettings = async (patternId: number): Promise<PrintOptions> => {
  try {
    const response = await apiClient.get<PrintOptions>(`/patterns/${patternId}/print-settings`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching print settings for pattern ${patternId}:`, error);
    // Return sensible defaults if API fails
    return {
      paperSize: 'letter',
      orientation: 'portrait',
      scale: 100,
      margins: 0.5,
      includeMetadata: true,
      fitToPage: true
    };
  }
};