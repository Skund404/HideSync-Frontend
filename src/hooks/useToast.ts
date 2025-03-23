// src/hooks/useToast.ts
//
// A custom hook for displaying toast notifications.
// This hook can be implemented with any toast library of your choice
// (e.g., react-toastify, react-hot-toast, etc.)

import { useCallback } from 'react';

// Toast types
type ToastType = 'success' | 'error' | 'warning' | 'info';

// This is a placeholder implementation.
// In an actual application, you would integrate this with a real toast library.
export const useToast = () => {
  /**
   * Shows a toast notification
   * @param type The type of toast (success, error, warning, info)
   * @param message The message to display
   * @param duration Optional duration in milliseconds (default: 3000)
   */
  const showToast = useCallback((type: ToastType, message: string, duration = 3000) => {
    // This implementation can be replaced with your preferred toast library
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    // Example integration with react-toastify:
    // toast[type](message, { autoClose: duration });
    
    // Example integration with react-hot-toast:
    // toast[type](message, { duration });
    
    // For now, use browser alert for testing
    if (type === 'error') {
      console.error(message);
    }
    
    // You can uncomment this to see the toasts during development
    // alert(`${type.toUpperCase()}: ${message}`);
  }, []);

  return { showToast };
};

export default useToast;