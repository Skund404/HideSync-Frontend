// src/services/notification-service.ts

/**
 * Types of notifications that can be shown
 */
export enum NotificationType {
    SUCCESS = 'success',
    ERROR = 'error',
    WARNING = 'warning',
    INFO = 'info'
  }
  
  /**
   * Configuration options for notifications
   */
  export interface NotificationOptions {
    /** Duration in milliseconds to show the notification */
    duration?: number;
    /** Whether the notification can be dismissed by the user */
    dismissible?: boolean;
    /** Additional data to pass with the notification */
    data?: Record<string, any>;
  }
  
  /**
   * A notification object
   */
  export interface Notification {
    id: string;
    type: NotificationType;
    message: string;
    options: NotificationOptions;
    timestamp: Date;
  }
  
  // Default notification options
  const DEFAULT_OPTIONS: NotificationOptions = {
    duration: 5000, // 5 seconds
    dismissible: true
  };
  
  // Store for notifications (would be replaced with a proper state management system in a real app)
  let notificationCallbacks: ((notification: Notification) => void)[] = [];
  
  /**
   * Register a callback to be notified when a new notification is created
   * @param callback Function to call when a new notification is created
   * @returns Function to unregister the callback
   */
  export const onNotification = (
    callback: (notification: Notification) => void
  ): (() => void) => {
    notificationCallbacks.push(callback);
    
    // Return a function to unregister the callback
    return () => {
      notificationCallbacks = notificationCallbacks.filter(cb => cb !== callback);
    };
  };
  
  /**
   * Creates a new notification and notifies all registered callbacks
   * @param type Type of notification
   * @param message Notification message
   * @param options Notification options
   * @returns The created notification
   */
  const createNotification = (
    type: NotificationType,
    message: string,
    options?: NotificationOptions
  ): Notification => {
    const notification: Notification = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type,
      message,
      options: { ...DEFAULT_OPTIONS, ...options },
      timestamp: new Date()
    };
    
    // Notify all registered callbacks
    notificationCallbacks.forEach(callback => {
      callback(notification);
    });
    
    // If we're in a browser environment and no callbacks are registered,
    // fall back to console messages
    if (notificationCallbacks.length === 0 && typeof window !== 'undefined') {
      switch (type) {
        case NotificationType.SUCCESS:
          console.log('%c✅ ' + message, 'color: green; font-weight: bold;');
          break;
        case NotificationType.ERROR:
          console.error('%c❌ ' + message, 'color: red; font-weight: bold;');
          break;
        case NotificationType.WARNING:
          console.warn('%c⚠️ ' + message, 'color: orange; font-weight: bold;');
          break;
        case NotificationType.INFO:
          console.info('%cℹ️ ' + message, 'color: blue; font-weight: bold;');
          break;
      }
    }
    
    return notification;
  };
  
  /**
   * Shows a success notification
   * @param message The message to show
   * @param options Optional configuration for the notification
   * @returns The created notification
   */
  export const showSuccess = (
    message: string,
    options?: NotificationOptions
  ): Notification => {
    return createNotification(NotificationType.SUCCESS, message, options);
  };
  
  /**
   * Shows an error notification
   * @param message The message to show
   * @param options Optional configuration for the notification
   * @returns The created notification
   */
  export const showError = (
    message: string,
    options?: NotificationOptions
  ): Notification => {
    return createNotification(NotificationType.ERROR, message, options);
  };
  
  /**
   * Shows a warning notification
   * @param message The message to show
   * @param options Optional configuration for the notification
   * @returns The created notification
   */
  export const showWarning = (
    message: string,
    options?: NotificationOptions
  ): Notification => {
    return createNotification(NotificationType.WARNING, message, options);
  };
  
  /**
   * Shows an info notification
   * @param message The message to show
   * @param options Optional configuration for the notification
   * @returns The created notification
   */
  export const showInfo = (
    message: string,
    options?: NotificationOptions
  ): Notification => {
    return createNotification(NotificationType.INFO, message, options);
  };