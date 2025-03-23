// src/services/file-upload-service.ts
import { apiClient, ApiError } from './api-client';
import { handleApiError } from './error-handler';
import { showError } from './notification-service';

// Supported file types for patterns
export const SUPPORTED_PATTERN_EXTENSIONS = ['.svg', '.pdf', '.dxf', '.ai', '.eps'];
// Supported file types for thumbnails
export const SUPPORTED_THUMBNAIL_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

/**
 * Validates if the file is of an allowed type
 * @param file The file to validate
 * @param allowedExtensions Array of allowed file extensions (including the dot)
 * @returns Boolean indicating if the file type is valid
 */
export const isValidFileType = (file: File, allowedExtensions: string[]): boolean => {
  const fileName = file.name.toLowerCase();
  return allowedExtensions.some(ext => fileName.endsWith(ext));
};

/**
 * Uploads a pattern file to the server
 * @param file The file to upload
 * @param patternId The ID of the pattern this file belongs to
 * @returns Promise with the file path of the uploaded file
 */
export const uploadPatternFile = async (file: File, patternId: number): Promise<string> => {
  try {
    // Validate file type
    if (!isValidFileType(file, SUPPORTED_PATTERN_EXTENSIONS)) {
      const errorMsg = `Invalid file type. Supported types: ${SUPPORTED_PATTERN_EXTENSIONS.join(', ')}`;
      showError(errorMsg);
      throw new Error(errorMsg);
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('patternId', patternId.toString());
    
    const response = await apiClient.post('/upload/pattern-file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data.filePath;
  } catch (error) {
    const errorMessage = handleApiError(error, 'Failed to upload pattern file');
    showError(`Upload error: ${errorMessage}`);
    throw error;
  }
};

/**
 * Uploads a thumbnail image for a pattern
 * @param file The thumbnail image file
 * @param patternId The ID of the pattern this thumbnail belongs to
 * @returns Promise with the file path of the uploaded thumbnail
 */
export const uploadThumbnail = async (file: File, patternId: number): Promise<string> => {
  try {
    // Validate file type
    if (!isValidFileType(file, SUPPORTED_THUMBNAIL_EXTENSIONS)) {
      const errorMsg = `Invalid thumbnail format. Supported types: ${SUPPORTED_THUMBNAIL_EXTENSIONS.join(', ')}`;
      showError(errorMsg);
      throw new Error(errorMsg);
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('patternId', patternId.toString());
    
    const response = await apiClient.post('/upload/thumbnail', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      // Add upload progress tracking if needed
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total!);
        console.log(`Upload progress: ${percentCompleted}%`);
      }
    });
    
    return response.data.thumbnailPath;
  } catch (error) {
    const errorMessage = handleApiError(error, 'Failed to upload thumbnail');
    showError(`Thumbnail upload error: ${errorMessage}`);
    throw error;
  }
};

/**
 * Fetches a pattern file from the server
 * @param filePath The path of the file to fetch
 * @param responseType The expected response type (blob, text, etc.)
 * @returns Promise with the file content
 */
export const getPatternFile = async <T>(
  filePath: string, 
  responseType: 'blob' | 'text' | 'arraybuffer' | 'json' = 'blob'
): Promise<T> => {
  if (!filePath) {
    const errorMsg = 'No file path provided';
    showError(errorMsg);
    throw new Error(errorMsg);
  }

  try {
    const response = await apiClient.get<T>(`/files/${filePath}`, {
      responseType: responseType as any,
      // Add download progress tracking if needed
      onDownloadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total!);
        console.log(`Download progress: ${percentCompleted}%`);
      }
    });
    
    return response.data;
  } catch (error) {
    const errorMessage = handleApiError(error, `Failed to fetch file: ${filePath}`);
    showError(`File fetch error: ${errorMessage}`);
    throw error;
  }
};

/**
 * Checks if a file exists on the server without downloading it
 * @param filePath The path of the file to check
 * @returns Promise with a boolean indicating if the file exists
 */
export const checkFileExists = async (filePath: string): Promise<boolean> => {
  try {
    await apiClient.head(`/files/${filePath}`);
    return true;
  } catch (error) {
    if ((error as ApiError).status === 404) {
      return false;
    }
    throw error;
  }
};

/**
 * Uploads multiple files at once
 * @param files Array of files to upload
 * @param patternId The ID of the pattern these files belong to
 * @returns Promise with an array of file paths
 */
export const uploadMultipleFiles = async (
  files: File[], 
  patternId: number
): Promise<string[]> => {
  try {
    const formData = new FormData();
    
    // Add each file to the form data
    files.forEach((file, index) => {
      formData.append(`file${index}`, file);
    });
    
    formData.append('patternId', patternId.toString());
    
    const response = await apiClient.post('/upload/multiple-files', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data.filePaths;
  } catch (error) {
    const errorMessage = handleApiError(error, 'Failed to upload multiple files');
    showError(`Upload error: ${errorMessage}`);
    throw error;
  }
};

/**
 * Deletes a file from the server
 * @param filePath The path of the file to delete
 * @returns Promise with a boolean indicating success
 */
export const deleteFile = async (filePath: string): Promise<boolean> => {
  try {
    await apiClient.delete(`/files/${filePath}`);
    return true;
  } catch (error) {
    const errorMessage = handleApiError(error, `Failed to delete file: ${filePath}`);
    showError(`File deletion error: ${errorMessage}`);
    throw error;
  }
};