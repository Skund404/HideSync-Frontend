// src/utils/errorHandler.ts
import { ApiError } from '../services/api-client';

/**
 * Extracts the most useful error message from an API error
 * @param error - The API error object
 * @param defaultMessage - Default message to show if no specific error message is found
 * @returns A user-friendly error message
 */
export const handleApiError = (error: ApiError | any, defaultMessage: string = 'An error occurred'): string => {
  // Handle the case when error is not an ApiError object
  if (!error || typeof error !== 'object') {
    return typeof error === 'string' ? error : defaultMessage;
  }

  // Extract most useful error message
  if (error.data?.detail) {
    return error.data.detail;
  }

  if (error.message) {
    return error.message;
  }

  // If error response has a status code, include it in the default message
  if (error.status) {
    return `${defaultMessage} (${error.status})`;
  }

  return defaultMessage;
};

/**
 * Creates a standard error object for consistent error handling
 * @param message - The error message
 * @param status - HTTP status code
 * @param data - Additional error data
 * @returns A standardized error object
 */
export const createApiError = (
  message: string,
  status: number = 500,
  data?: any
): ApiError => {
  return {
    message,
    status,
    data
  };
};

/**
 * Format API errors for display in UI components
 * @param error Error object or message
 * @returns Formatted error object with consistent structure
 */
export const formatApiError = (error: any): { message: string; status?: number } => {
  if (!error) {
    return { message: 'Unknown error occurred' };
  }
  
  // If it's already an ApiError, use it directly
  if (error.message && error.status) {
    return {
      message: error.message,
      status: error.status
    };
  }
  
  // If it's an Error object
  if (error instanceof Error) {
    return { message: error.message };
  }
  
  // If it's a string
  if (typeof error === 'string') {
    return { message: error };
  }
  
  // Default case
  return { message: 'An error occurred while processing your request' };
};