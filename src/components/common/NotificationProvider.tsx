// src/components/common/NotificationProvider.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  Notification,
  NotificationType,
  onNotification,
} from '../../services/notification-service';

interface NotificationContextType {
  notifications: Notification[];
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  removeNotification: () => {},
});

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Register for notifications
    const unsubscribe = onNotification((notification) => {
      setNotifications((prevNotifications) => [
        ...prevNotifications,
        notification,
      ]);

      // Auto-remove non-dismissible notifications after their duration
      if (notification.options.duration && !notification.options.dismissible) {
        setTimeout(() => {
          removeNotification(notification.id);
        }, notification.options.duration);
      }
    });

    // Clean up subscription
    return () => unsubscribe();
  }, []);

  const removeNotification = (id: string) => {
    setNotifications((prevNotifications) =>
      prevNotifications.filter((notification) => notification.id !== id)
    );
  };

  return (
    <NotificationContext.Provider value={{ notifications, removeNotification }}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};

const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotifications();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className='fixed bottom-4 right-4 z-50 flex flex-col-reverse gap-2 max-h-screen overflow-hidden'>
      {notifications.map((notification) => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

interface NotificationToastProps {
  notification: Notification;
  onClose: () => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onClose,
}) => {
  // Using all properties from notification except id which we use differently
  const { type, message, options, timestamp } = notification;

  // Auto-remove dismissible notifications after their duration
  useEffect(() => {
    if (options.duration && options.dismissible) {
      const timer = setTimeout(() => {
        onClose();
      }, options.duration);

      return () => clearTimeout(timer);
    }
  }, [options.duration, options.dismissible, onClose]);

  // Get the appropriate background color based on the notification type
  const getBackgroundColor = () => {
    switch (type) {
      case NotificationType.SUCCESS:
        return 'bg-green-50 border-green-400';
      case NotificationType.ERROR:
        return 'bg-red-50 border-red-400';
      case NotificationType.WARNING:
        return 'bg-amber-50 border-amber-400';
      case NotificationType.INFO:
      default:
        return 'bg-blue-50 border-blue-400';
    }
  };

  // Get the appropriate icon based on the notification type
  const getIcon = () => {
    switch (type) {
      case NotificationType.SUCCESS:
        return (
          <svg
            className='h-5 w-5 text-green-400'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M5 13l4 4L19 7'
            />
          </svg>
        );
      case NotificationType.ERROR:
        return (
          <svg
            className='h-5 w-5 text-red-400'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M6 18L18 6M6 6l12 12'
            />
          </svg>
        );
      case NotificationType.WARNING:
        return (
          <svg
            className='h-5 w-5 text-amber-400'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
            />
          </svg>
        );
      case NotificationType.INFO:
      default:
        return (
          <svg
            className='h-5 w-5 text-blue-400'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
            />
          </svg>
        );
    }
  };

  // Get the appropriate text color based on the notification type
  const getTextColor = () => {
    switch (type) {
      case NotificationType.SUCCESS:
        return 'text-green-800';
      case NotificationType.ERROR:
        return 'text-red-800';
      case NotificationType.WARNING:
        return 'text-amber-800';
      case NotificationType.INFO:
      default:
        return 'text-blue-800';
    }
  };

  // Format notification timestamp for display
  const formattedTime = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(timestamp);

  return (
    <div
      className={`max-w-md w-full shadow-lg rounded-lg pointer-events-auto border-l-4 ${getBackgroundColor()}`}
      role='alert'
      aria-live='assertive'
      aria-atomic='true'
    >
      <div className='p-4'>
        <div className='flex items-start'>
          <div className='flex-shrink-0'>{getIcon()}</div>
          <div className='ml-3 w-0 flex-1 pt-0.5'>
            <p className={`text-sm font-medium ${getTextColor()}`}>{message}</p>
            <p className='mt-1 text-xs text-stone-500'>{formattedTime}</p>
          </div>
          {options.dismissible && (
            <div className='ml-4 flex-shrink-0 flex'>
              <button
                className={`rounded-md inline-flex ${getTextColor()} hover:text-opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${type}-500`}
                onClick={onClose}
                aria-label='Close notification'
              >
                <span className='sr-only'>Close</span>
                <svg
                  className='h-5 w-5'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                >
                  <path
                    fillRule='evenodd'
                    d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
                    clipRule='evenodd'
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationProvider;
