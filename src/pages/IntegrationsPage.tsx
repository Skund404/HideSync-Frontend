// src/pages/IntegrationsPage.tsx
import {
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  Settings,
  Shield,
  ShoppingBag,
  Trash2,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useIntegrations } from '../context/IntegrationsContext';
import { SalesChannel } from '../types/salesTypes';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { PlatformIntegration } from '../services/integrations/integration-service';

// Platform information interface
interface PlatformInfo {
  key: SalesChannel;
  name: string;
  description: string;
  icon: string;
  color: string;
  url: string;
  docUrl: string;
}

// Platform information data
const PLATFORM_INFO: Record<SalesChannel, PlatformInfo> = {
  [SalesChannel.SHOPIFY]: {
    key: SalesChannel.SHOPIFY,
    name: 'Shopify',
    description: 'Connect your Shopify store to automatically import orders',
    icon: '🛍️',
    color: '#96bf48',
    url: 'https://shopify.com',
    docUrl: 'https://shopify.dev/docs/admin-api',
  },
  [SalesChannel.ETSY]: {
    key: SalesChannel.ETSY,
    name: 'Etsy',
    description: 'Connect your Etsy shop to automatically import orders',
    icon: '🧶',
    color: '#f56400',
    url: 'https://etsy.com',
    docUrl: 'https://developers.etsy.com/documentation/',
  },
  [SalesChannel.AMAZON]: {
    key: SalesChannel.AMAZON,
    name: 'Amazon',
    description: 'Connect your Amazon seller account to import orders',
    icon: '📦',
    color: '#ff9900',
    url: 'https://sellercentral.amazon.com',
    docUrl: 'https://developer-docs.amazon.com/sp-api/',
  },
  [SalesChannel.EBAY]: {
    key: SalesChannel.EBAY,
    name: 'eBay',
    description: 'Connect your eBay seller account to import orders',
    icon: '🏷️',
    color: '#e53238',
    url: 'https://ebay.com',
    docUrl: 'https://developer.ebay.com/develop/apis',
  },
  [SalesChannel.DIRECT]: {
    key: SalesChannel.DIRECT,
    name: 'Direct Sales',
    description: 'Manage orders from direct customer interactions',
    icon: '🤝',
    color: '#34d399',
    url: '',
    docUrl: '',
  },
  [SalesChannel.WHOLESALE]: {
    key: SalesChannel.WHOLESALE,
    name: 'Wholesale',
    description: 'Manage wholesale orders from business customers',
    icon: '🏭',
    color: '#818cf8',
    url: '',
    docUrl: '',
  },
  [SalesChannel.CUSTOM_ORDER]: {
    key: SalesChannel.CUSTOM_ORDER,
    name: 'Custom Orders',
    description: 'Manage custom order requests and commissions',
    icon: '✨',
    color: '#f59e0b',
    url: '',
    docUrl: '',
  },
};

const IntegrationsPage: React.FC = () => {
  const {
    integrations,
    isLoading,
    error,
    syncStatus,
    syncPlatform,
    disconnectPlatform,
    refreshIntegrations,
  } = useIntegrations();

  const [configModalOpen, setConfigModalOpen] = useState<SalesChannel | null>(
    null
  );

  // Get platform info with integration status
  const getPlatformsWithStatus = (): (PlatformInfo & { isConfigured: boolean; integration?: PlatformIntegration })[] => {
    return Object.values(SalesChannel).map((platform) => {
      const platformInfo = PLATFORM_INFO[platform];
      const integration = integrations.find(i => i.platform === platform);
      
      return {
        ...platformInfo,
        isConfigured: !!integration,
        integration,
      };
    });
  };

  // Retry loading integrations
  const handleRetry = () => {
    refreshIntegrations();
  };

  // Open configuration modal
  const openConfigModal = (platform: SalesChannel) => {
    setConfigModalOpen(platform);
  };

  // Handle disconnect platform
  const handleDisconnectPlatform = (integrationId: string, platformName: string) => {
    if (
      window.confirm(
        `Are you sure you want to disconnect ${platformName}? This will remove all integration settings.`
      )
    ) {
      disconnectPlatform(integrationId);
    }
  };

  if (isLoading) {
    return (
      <div className='container mx-auto p-6'>
        <LoadingSpinner size="large" color="amber" message="Loading integrations..." />
      </div>
    );
  }

  const platforms = getPlatformsWithStatus();

  return (
    <div className='container mx-auto p-6'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold'>Platform Integrations</h1>
        <Link
          to='/documentation/integrations'
          className='text-blue-600 hover:text-blue-800'
        >
          View Documentation
        </Link>
      </div>

      {error && (
        <div className='mb-6'>
          <ErrorMessage message={error} onRetry={handleRetry} />
        </div>
      )}

      <div className='bg-white rounded-lg shadow'>
        <div className='p-4 border-b'>
          <p className='text-gray-600'>
            Connect HideSync with your sales platforms to automatically import
            orders and sync inventory.
          </p>
          <div className='mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md'>
            <div className='flex items-start'>
              <Shield className='h-5 w-5 text-yellow-600 mr-2 mt-0.5' />
              <p className='text-sm text-yellow-800'>
                Your API keys and access tokens are securely stored with
                encryption. Never share these credentials with anyone.
              </p>
            </div>
          </div>
        </div>

        <div className='divide-y'>
          {/* Connected platforms */}
          {platforms
            .filter(platform => platform.isConfigured)
            .map((platform) => (
              <div
                key={platform.key}
                className='p-6 flex flex-col md:flex-row md:items-center gap-4'
              >
                <div
                  className='flex-shrink-0 w-16 h-16 flex items-center justify-center rounded-full'
                  style={{ backgroundColor: `${platform.color}20` }}
                >
                  <span className='text-3xl' style={{ color: platform.color }}>
                    {platform.icon}
                  </span>
                </div>

                <div className='flex-grow'>
                  <h2 className='text-xl font-semibold'>{platform.name}</h2>
                  <p className='text-gray-600'>{platform.description}</p>
                  {platform.integration && platform.integration.id && (
                    <div className='mt-2'>
                      {renderSyncStatus(platform.integration.id)}
                    </div>
                  )}
                </div>

                <div className='flex flex-col gap-2'>
                  {platform.integration && platform.integration.id && (
                    <>
                      <button
                        onClick={() => syncPlatform(platform.integration!.id)}
                        disabled={syncStatus[platform.integration.id]?.isSyncing}
                        className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 flex items-center justify-center'
                      >
                        <RefreshCw className={`h-4 w-4 mr-2 ${syncStatus[platform.integration.id]?.isSyncing ? 'animate-spin' : ''}`} />
                        Sync Now
                      </button>
                      <button
                        onClick={() => openConfigModal(platform.key)}
                        className='px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 flex items-center justify-center'
                      >
                        <Settings className='h-4 w-4 mr-2' />
                        Settings
                      </button>
                      <button
                        onClick={() => handleDisconnectPlatform(platform.integration!.id, platform.name)}
                        className='px-4 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 flex items-center justify-center'
                      >
                        <Trash2 className='h-4 w-4 mr-2' />
                        Disconnect
                      </button>
                    </>
                  )}

                  {platform.url && (
                    <a
                      href={platform.url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='px-4 py-2 border border-gray-300 text-gray-600 rounded-md hover:bg-gray-50 flex items-center justify-center'
                    >
                      <ExternalLink className='h-4 w-4 mr-2' />
                      Visit Platform
                    </a>
                  )}
                </div>
              </div>
            ))}

          {/* No connected platforms message */}
          {platforms.filter(p => p.isConfigured).length === 0 && (
            <div className='p-6 text-center text-gray-500'>
              No platforms connected yet. Connect a marketplace below to start importing orders.
            </div>
          )}

          {/* Available platforms to connect */}
          {platforms
            .filter(platform => 
              !platform.isConfigured && 
              platform.key !== SalesChannel.DIRECT && 
              platform.key !== SalesChannel.WHOLESALE && 
              platform.key !== SalesChannel.CUSTOM_ORDER
            )
            .map((platform) => (
              <div
                key={platform.key}
                className='p-6 flex flex-col md:flex-row md:items-center gap-4'
              >
                <div
                  className='flex-shrink-0 w-16 h-16 flex items-center justify-center rounded-full'
                  style={{ backgroundColor: `${platform.color}20` }}
                >
                  <span className='text-3xl' style={{ color: platform.color }}>
                    {platform.icon}
                  </span>
                </div>

                <div className='flex-grow'>
                  <h2 className='text-xl font-semibold'>{platform.name}</h2>
                  <p className='text-gray-600'>{platform.description}</p>
                </div>

                <div className='flex flex-col gap-2'>
                  <button
                    onClick={() => openConfigModal(platform.key)}
                    className='px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center justify-center'
                  >
                    <ShoppingBag className='h-4 w-4 mr-2' />
                    Connect
                  </button>

                  {platform.url && (
                    <a
                      href={platform.url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='px-4 py-2 border border-gray-300 text-gray-600 rounded-md hover:bg-gray-50 flex items-center justify-center'
                    >
                      <ExternalLink className='h-4 w-4 mr-2' />
                      Visit Platform
                    </a>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Documentation and resources section */}
      <div className='mt-8 bg-white rounded-lg shadow p-6'>
        <h2 className='text-xl font-semibold mb-4'>Integration Resources</h2>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {Object.values(SalesChannel)
            .filter(channel => 
              channel !== SalesChannel.DIRECT && 
              channel !== SalesChannel.WHOLESALE && 
              channel !== SalesChannel.CUSTOM_ORDER
            )
            .map(channel => {
              const platform = PLATFORM_INFO[channel];
              return (
                <div key={platform.key} className='border border-gray-200 rounded-lg p-4'>
                  <h3 className='font-semibold text-lg mb-2'>{platform.name} Integration</h3>
                  <p className='text-gray-600 text-sm mb-4'>{platform.description}</p>
                  {platform.docUrl && (
                    <a 
                      href={platform.docUrl}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-blue-600 hover:text-blue-800 text-sm flex items-center'
                    >
                      <ExternalLink className='h-4 w-4 mr-1' />
                      API Documentation
                    </a>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );

  // Helper to render sync status
  function renderSyncStatus(integrationId: string) {
    const status = syncStatus[integrationId];
    if (!status) return null;

    if (status.isSyncing) {
      return (
        <span className='text-blue-500 flex items-center'>
          <RefreshCw className='animate-spin h-4 w-4 mr-1' /> Syncing...
        </span>
      );
    }

    if (status.error) {
      return (
        <span className='text-red-500 flex items-center'>
          <AlertTriangle className='h-4 w-4 mr-1' /> {status.error}
        </span>
      );
    }

    if (status.lastSynced) {
      return (
        <span className='text-green-600'>
          Last synced: {new Date(status.lastSynced).toLocaleString()}
        </span>
      );
    }

    return <span className='text-gray-500'>Not synced yet</span>;
  }
};

export default IntegrationsPage;