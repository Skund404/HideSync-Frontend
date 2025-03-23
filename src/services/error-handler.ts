// src/services/error-handler.ts
import { ApiError } from './api-client';
import { showError } from './notification-service';

/**
 * Handles API errors and provides a consistent error message
 * @param error The error object to handle
 * @param defaultMessage Default message to show if error is not an ApiError
 * @returns A user-friendly error message
 */
export const handleApiError = (error: unknown, defaultMessage: string = 'An error occurred'): string => {
  // Handle the case when error is not an ApiError object
  if (!error || typeof error !== 'object') {
    return typeof error === 'string' ? error : defaultMessage;
  }

  // Check for network connectivity errors
  if (isNetworkError(error)) {
    return 'Network connection error. Please check your internet connection and try again.';
  }

  // Check for timeout errors
  if (isTimeoutError(error)) {
    return 'The server took too long to respond. Please try again later.';
  }

  // Extract most useful error message
  if (isApiError(error)) {
    // If we have detailed error data, use that
    if (error.data?.detail) {
      return error.data.detail;
    }

    // Provide user-friendly messages based on HTTP status code
    if (error.status) {
      switch (error.status) {
        case 400:
          return `${defaultMessage}: Bad request. Please check your input data.`;
        case 401:
          return 'Your session has expired. Please log in again.';
        case 403:
          return 'You do not have permission to perform this action.';
        case 404:
          return 'The requested resource could not be found.';
        case 409:
          return 'This operation could not be completed due to a conflict with the current state.';
        case 422:
          return 'The submitted data is invalid. Please check your input and try again.';
        case 429:
          return 'Too many requests. Please try again later.';
        case 500:
        case 502:
        case 503:
        case 504:
          return 'The server encountered an error. Please try again later or contact support.';
      }
    }

    // If there's a general error message, use that
    if (error.message) {
      return error.message;
    }

    // Include the status in the default message if available
    return `${defaultMessage} (${error.status})`;
  }

  // For Error objects, use their message
  if (error instanceof Error) {
    return error.message;
  }

  // Default fallback message
  return defaultMessage;
};

/**
 * Type guard for ApiError
 * @param error The error to check
 * @returns Boolean indicating if the error is an ApiError
 */
export const isApiError = (error: unknown): error is ApiError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    'status' in error
  );
};

/**
 * Checks if the error is a network connectivity error
 * @param error The error to check
 * @returns Boolean indicating if it's a network error
 */
export const isNetworkError = (error: unknown): boolean => {
  if (error instanceof Error) {
    const errorMessage = error.message.toLowerCase();
    return (
      errorMessage.includes('network error') ||
      errorMessage.includes('failed to fetch') ||
      errorMessage.includes('network request failed') ||
      // Axios specific network error
      errorMessage.includes('network') ||
      // Add more specific network error messages as needed
      (typeof navigator !== 'undefined' && !navigator.onLine)
    );
  }
  
  // Check if browser is offline
  return typeof navigator !== 'undefined' && !navigator.onLine;
};

/**
 * Checks if the error is a timeout error
 * @param error The error to check
 * @returns Boolean indicating if it's a timeout error
 */
export const isTimeoutError = (error: unknown): boolean => {
  if (error instanceof Error) {
    const errorMessage = error.message.toLowerCase();
    return (
      errorMessage.includes('timeout') ||
      errorMessage.includes('timed out') ||
      errorMessage.includes('etimedout') ||
      // Axios specific timeout error
      (isApiError(error) && error.status === 408)
    );
  }
  return false;
};

/**
 * Creates a standard error object for consistent error handling
 * @param message The error message
 * @param status HTTP status code
 * @param data Additional error data
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

/**
 * Enhanced error handling with retry mechanism
 * @param operation The async function to execute with retry
 * @param retryCount Maximum number of retry attempts
 * @param delay Delay between retries in milliseconds
 * @returns Promise with the operation result
 */
export const withRetry = async <T>(
  operation: () => Promise<T>,
  retryCount: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: unknown;
  
  for (let attempt = 0; attempt < retryCount; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Only retry on network errors and certain status codes
      if (
        isNetworkError(error) || 
        isTimeoutError(error) || 
        (isApiError(error) && [408, 429, 500, 502, 503, 504].includes(error.status))
      ) {
        // Add increasing delay between retries
        await new Promise(resolve => setTimeout(resolve, delay * (attempt + 1)));
        continue;
      }
      
      // For other errors, don't retry
      throw error;
    }
  }
  
  // If we've exhausted all retry attempts
  throw lastError;
};

/**
 * Log errors to the console and possibly to a remote error tracking service
 * @param error The error to log
 * @param context Additional context about where the error occurred
 */
export const logError = (error: unknown, context: string): void => {
  if (isApiError(error)) {
    console.error(`API Error in ${context}:`, {
      message: error.message,
      status: error.status,
      data: error.data
    });
  } else if (error instanceof Error) {
    console.error(`Error in ${context}:`, error.message, error.stack);
  } else {
    console.error(`Unknown error in ${context}:`, error);
  }
  
  // In a real app, you would also send these errors to a service like Sentry
  // Example pseudo-code:
  // if (typeof window !== 'undefined' && window.Sentry) {
  //   window.Sentry.captureException(error, { tags: { context } });
  // }
};

/**
 * Show an error notification and log the error
 * @param error The error to handle
 * @param context The context in which the error occurred
 * @param defaultMessage A default message to show if no specific message is available
 */
export const handleAndNotifyError = (
  error: unknown, 
  context: string, 
  defaultMessage: string = 'An error occurred'
): void => {
  // Log the error
  logError(error, context);
  
  // Get a user-friendly error message
  const errorMessage = handleApiError(error, defaultMessage);
  
  // Show the error notification
  showError(errorMessage);
};

/**
 * Handles offline errors gracefully by storing operations for later retry
 * @param operation The operation to perform
 * @param fallbackData Optional fallback data to use when offline
 * @returns Promise that resolves with operation result or fallback data
 */
export const handleOfflineOperation = async <T>(
  operation: () => Promise<T>,
  fallbackData?: T
): Promise<T> => {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    // Store operation for later execution when back online
    storeOfflineOperation(operation);
    
    // If fallback data is provided, return it
    if (fallbackData !== undefined) {
      return fallbackData;
    }
    
    throw new Error('You are currently offline. This operation will be completed when you reconnect.');
  }
  
  // If online, perform the operation normally
  return operation();
};

/**
 * Store an operation to be executed when back online
 * Uses local storage to persist operations across page refreshes
 * @param operation The operation to store
 */
const storeOfflineOperation = (operation: Function): void => {
  // This is a simplified implementation
  // In a real app, you would serialize the operation and its parameters
  // And store them in localStorage or IndexedDB
  
  if (typeof window !== 'undefined') {
    const pendingOperations = JSON.parse(
      localStorage.getItem('pendingOperations') || '[]'
    );
    
    // For demonstration purposes only - in a real app you would need
    // to serialize the function and its arguments properly
    pendingOperations.push({
      timestamp: Date.now(),
      type: operation.name || 'unknown'
    });
    
    localStorage.setItem('pendingOperations', JSON.stringify(pendingOperations));
  }
};