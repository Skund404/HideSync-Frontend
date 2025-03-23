// src/components/documentation/offline/OfflineBanner.tsx
import { Check, RefreshCw, WifiOff, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useDocumentation } from '../../../context/DocumentationContext';

interface OfflineBannerProps {
  onManageOffline?: () => void;
}

const OfflineBanner: React.FC<OfflineBannerProps> = ({ onManageOffline }) => {
  const { isOffline, syncOfflineChanges } = useDocumentation();
  const [showBanner, setShowBanner] = useState(false);
  const [syncStatus, setSyncStatus] = useState<
    'idle' | 'syncing' | 'success' | 'error'
  >('idle');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Only show the banner when offline
  useEffect(() => {
    if (isOffline) {
      setShowBanner(true);
    } else {
      // When coming back online, don't immediately hide the banner
      // to allow for sync operation
      if (syncStatus === 'idle' || syncStatus === 'success') {
        const timer = setTimeout(() => {
          setShowBanner(false);
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [isOffline, syncStatus]);

  // Handle sync
  const handleSync = async () => {
    if (!isOffline) {
      try {
        setSyncStatus('syncing');
        await syncOfflineChanges();
        setSyncStatus('success');
        setShowSuccessMessage(true);

        // Hide success message after a delay
        setTimeout(() => {
          setShowSuccessMessage(false);
          setTimeout(() => {
            setShowBanner(false);
          }, 1000);
        }, 3000);
      } catch (error) {
        console.error('Sync failed:', error);
        setSyncStatus('error');
      }
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div
      className={`
      fixed bottom-4 right-4 z-50 max-w-md shadow-lg rounded-lg 
      ${
        isOffline
          ? 'bg-amber-50 border border-amber-200'
          : syncStatus === 'error'
          ? 'bg-red-50 border border-red-200'
          : 'bg-green-50 border border-green-200'
      }
      ${showSuccessMessage ? 'animate-pulse' : ''}
    `}
    >
      <div className='p-4 flex items-start'>
        {isOffline ? (
          <WifiOff
            className='text-amber-500 mt-0.5 mr-3 flex-shrink-0'
            size={20}
          />
        ) : syncStatus === 'success' ? (
          <Check
            className={`text-green-500 mt-0.5 mr-3 flex-shrink-0 ${
              showSuccessMessage ? 'animate-bounce' : ''
            }`}
            size={20}
          />
        ) : (
          <RefreshCw
            className={`text-amber-500 mt-0.5 mr-3 flex-shrink-0 ${
              syncStatus === 'syncing' ? 'animate-spin' : ''
            }`}
            size={20}
          />
        )}

        <div className='flex-1'>
          {isOffline ? (
            <>
              <h3 className='font-medium text-amber-800'>You're offline</h3>
              <p className='text-sm text-amber-700 mt-1'>
                You can still browse documentation that has been previously
                loaded. Any changes you make will be synchronized when you go
                back online.
              </p>
              {onManageOffline && (
                <button
                  onClick={onManageOffline}
                  className='text-sm text-amber-800 hover:text-amber-900 font-medium mt-2 underline'
                >
                  Manage offline documentation
                </button>
              )}
            </>
          ) : syncStatus === 'syncing' ? (
            <>
              <h3 className='font-medium text-amber-800'>Syncing changes</h3>
              <p className='text-sm text-amber-700 mt-1'>
                Synchronizing your offline changes...
              </p>
            </>
          ) : syncStatus === 'success' ? (
            <>
              <h3 className='font-medium text-green-800'>
                {showSuccessMessage
                  ? 'All changes synchronized successfully!'
                  : 'Changes synchronized'}
              </h3>
              <p className='text-sm text-green-700 mt-1'>
                {showSuccessMessage
                  ? 'Your data is now fully up-to-date across all devices.'
                  : 'Your offline changes have been successfully synchronized.'}
              </p>
            </>
          ) : syncStatus === 'error' ? (
            <>
              <h3 className='font-medium text-red-800'>Sync failed</h3>
              <p className='text-sm text-red-700 mt-1'>
                There was an error synchronizing your changes. Please try again
                or check your connection.
              </p>
            </>
          ) : (
            <>
              <h3 className='font-medium text-amber-800'>You're back online</h3>
              <p className='text-sm text-amber-700 mt-1'>
                Click 'Sync Now' to upload your offline changes.
              </p>
            </>
          )}
        </div>

        <div className='ml-4 flex-shrink-0'>
          {!isOffline && syncStatus === 'idle' && (
            <button
              onClick={handleSync}
              className='px-3 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 text-sm font-medium rounded'
            >
              Sync Now
            </button>
          )}
          {syncStatus === 'error' && (
            <button
              onClick={handleSync}
              className='px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 text-sm font-medium rounded'
            >
              Retry
            </button>
          )}
          <button
            onClick={handleDismiss}
            className='ml-2 text-stone-400 hover:text-stone-600'
            aria-label='Dismiss'
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OfflineBanner;
