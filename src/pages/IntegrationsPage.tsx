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
import {
  fetchOrdersFromPlatform,
  getAllPlatforms,
  PlatformAuthConfig,
  PlatformInfo,
  removePlatformConfig,
  updatePlatformConfig,
} from '../services/integrations/platformIntegration';
import { SalesChannel } from '../types/salesTypes';

interface SyncStatus {
  platform: SalesChannel;
  status: 'idle' | 'syncing' | 'success' | 'error';
  lastSync?: Date;
  ordersCount?: number;
  errorMessage?: string;
}

const IntegrationsPage: React.FC = () => {
  const [platforms, setPlatforms] = useState<PlatformInfo[]>([]);
  const [syncStatus, setSyncStatus] = useState<
    Record<SalesChannel, SyncStatus>
  >({} as Record<SalesChannel, SyncStatus>);
  const [configModalOpen, setConfigModalOpen] = useState<SalesChannel | null>(
    null
  );
  const [configForm, setConfigForm] = useState<PlatformAuthConfig>({});

  // Initialize platforms and sync status
  useEffect(() => {
    const allPlatforms = getAllPlatforms();
    setPlatforms(allPlatforms);

    // Initialize sync status
    const initialSyncStatus: Record<SalesChannel, SyncStatus> = {} as Record<
      SalesChannel,
      SyncStatus
    >;
    allPlatforms.forEach((platform) => {
      initialSyncStatus[platform.key] = {
        platform: platform.key,
        status: 'idle',
      };
    });
    setSyncStatus(initialSyncStatus);
  }, []);

  // Function to sync orders from a platform
  const syncOrders = async (platform: SalesChannel) => {
    try {
      // Update sync status to 'syncing'
      setSyncStatus((prev) => ({
        ...prev,
        [platform]: {
          ...prev[platform],
          status: 'syncing',
        },
      }));

      // Call the API to fetch orders
      const orders = await fetchOrdersFromPlatform(platform);

      // In a real implementation, you would save these orders to your database
      console.log(`Fetched ${orders.length} orders from ${platform}`);

      // Update sync status to 'success'
      setSyncStatus((prev) => ({
        ...prev,
        [platform]: {
          ...prev[platform],
          status: 'success',
          lastSync: new Date(),
          ordersCount: orders.length,
        },
      }));
    } catch (error) {
      console.error(`Error syncing orders from ${platform}:`, error);

      // Update sync status to 'error'
      setSyncStatus((prev) => ({
        ...prev,
        [platform]: {
          ...prev[platform],
          status: 'error',
          errorMessage:
            error instanceof Error ? error.message : 'Unknown error',
        },
      }));
    }
  };

  // Function to disconnect a platform
  const disconnectPlatform = (platform: SalesChannel) => {
    if (
      window.confirm(
        `Are you sure you want to disconnect ${platform}? This will remove all integration settings.`
      )
    ) {
      removePlatformConfig(platform);

      // Update platforms list to reflect the change
      setPlatforms((prev) =>
        prev.map((p) =>
          p.key === platform ? { ...p, isConfigured: false } : p
        )
      );
    }
  };

  // Function to open configuration modal
  const openConfigModal = (platform: SalesChannel) => {
    setConfigForm({});
    setConfigModalOpen(platform);
  };

  // Function to save configuration
  const saveConfig = (platform: SalesChannel) => {
    updatePlatformConfig(platform, configForm);

    // Update platforms list to reflect the change
    setPlatforms((prev) =>
      prev.map((p) => (p.key === platform ? { ...p, isConfigured: true } : p))
    );

    // Close modal
    setConfigModalOpen(null);
  };

  // Helper to render sync status
  const renderSyncStatus = (platform: SalesChannel) => {
    const status = syncStatus[platform];
    if (!status) return null;

    switch (status.status) {
      case 'syncing':
        return (
          <span className='text-blue-500 flex items-center'>
            <RefreshCw className='animate-spin h-4 w-4 mr-1' /> Syncing...
          </span>
        );
      case 'success':
        return (
          <div className='text-green-600'>
            <div>Last sync: {status.lastSync?.toLocaleString()}</div>
            <div>Orders: {status.ordersCount}</div>
          </div>
        );
      case 'error':
        return (
          <span className='text-red-500 flex items-center'>
            <AlertTriangle className='h-4 w-4 mr-1' /> {status.errorMessage}
          </span>
        );
      default:
        return <span className='text-gray-500'>Not synced yet</span>;
    }
  };

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
          {platforms.map((platform) => (
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
                {platform.isConfigured && (
                  <div className='mt-2'>{renderSyncStatus(platform.key)}</div>
                )}
              </div>

              <div className='flex flex-col gap-2'>
                {platform.isConfigured ? (
                  <>
                    <button
                      onClick={() => syncOrders(platform.key)}
                      disabled={syncStatus[platform.key]?.status === 'syncing'}
                      className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 flex items-center justify-center'
                    >
                      <RefreshCw className='h-4 w-4 mr-2' />
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
                      onClick={() => disconnectPlatform(platform.key)}
                      className='px-4 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 flex items-center justify-center'
                    >
                      <Trash2 className='h-4 w-4 mr-2' />
                      Disconnect
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => openConfigModal(platform.key)}
                    className='px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center justify-center'
                  >
                    <ShoppingBag className='h-4 w-4 mr-2' />
                    Connect
                  </button>
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
        </div>
      </div>

      {/* Configuration Modal */}
      {configModalOpen && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg shadow-lg max-w-md w-full'>
            <div className='p-6'>
              <h2 className='text-xl font-semibold mb-4'>
                {platforms.find((p) => p.key === configModalOpen)?.name}{' '}
                Integration Settings
              </h2>

              <div className='space-y-4'>
                {renderConfigFields(configModalOpen)}
              </div>

              <div className='mt-6 flex justify-end space-x-2'>
                <button
                  onClick={() => setConfigModalOpen(null)}
                  className='px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50'
                >
                  Cancel
                </button>
                <button
                  onClick={() => saveConfig(configModalOpen)}
                  className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700'
                >
                  Save Configuration
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Helper function to render config fields based on platform
  function renderConfigFields(platform: SalesChannel) {
    switch (platform) {
      case SalesChannel.SHOPIFY:
        return (
          <>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Shop Name
              </label>
              <input
                type='text'
                className='w-full p-2 border border-gray-300 rounded-md'
                placeholder='your-shop-name'
                value={configForm.shopName || ''}
                onChange={(e) =>
                  setConfigForm({ ...configForm, shopName: e.target.value })
                }
              />
              <p className='text-xs text-gray-500 mt-1'>
                Enter your Shopify shop name without the .myshopify.com part
              </p>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                API Key
              </label>
              <input
                type='text'
                className='w-full p-2 border border-gray-300 rounded-md'
                placeholder='API Key'
                value={configForm.apiKey || ''}
                onChange={(e) =>
                  setConfigForm({ ...configForm, apiKey: e.target.value })
                }
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                API Secret
              </label>
              <input
                type='password'
                className='w-full p-2 border border-gray-300 rounded-md'
                placeholder='API Secret'
                value={configForm.apiSecret || ''}
                onChange={(e) =>
                  setConfigForm({ ...configForm, apiSecret: e.target.value })
                }
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Access Token
              </label>
              <input
                type='password'
                className='w-full p-2 border border-gray-300 rounded-md'
                placeholder='Access Token'
                value={configForm.accessToken || ''}
                onChange={(e) =>
                  setConfigForm({ ...configForm, accessToken: e.target.value })
                }
              />
              <p className='text-xs text-gray-500 mt-1'>
                You can generate a private app access token in your Shopify
                admin
              </p>
            </div>
          </>
        );

      case SalesChannel.ETSY:
        return (
          <>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                API Key
              </label>
              <input
                type='text'
                className='w-full p-2 border border-gray-300 rounded-md'
                placeholder='API Key'
                value={configForm.apiKey || ''}
                onChange={(e) =>
                  setConfigForm({ ...configForm, apiKey: e.target.value })
                }
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                API Secret
              </label>
              <input
                type='password'
                className='w-full p-2 border border-gray-300 rounded-md'
                placeholder='API Secret'
                value={configForm.apiSecret || ''}
                onChange={(e) =>
                  setConfigForm({ ...configForm, apiSecret: e.target.value })
                }
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Access Token
              </label>
              <input
                type='password'
                className='w-full p-2 border border-gray-300 rounded-md'
                placeholder='Access Token'
                value={configForm.accessToken || ''}
                onChange={(e) =>
                  setConfigForm({ ...configForm, accessToken: e.target.value })
                }
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Refresh Token
              </label>
              <input
                type='password'
                className='w-full p-2 border border-gray-300 rounded-md'
                placeholder='Refresh Token'
                value={configForm.refreshToken || ''}
                onChange={(e) =>
                  setConfigForm({ ...configForm, refreshToken: e.target.value })
                }
              />
            </div>
          </>
        );

      case SalesChannel.AMAZON:
        return (
          <>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Seller ID
              </label>
              <input
                type='text'
                className='w-full p-2 border border-gray-300 rounded-md'
                placeholder='Seller ID'
                value={configForm.storeId || ''}
                onChange={(e) =>
                  setConfigForm({ ...configForm, storeId: e.target.value })
                }
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Client ID
              </label>
              <input
                type='text'
                className='w-full p-2 border border-gray-300 rounded-md'
                placeholder='Client ID'
                value={configForm.apiKey || ''}
                onChange={(e) =>
                  setConfigForm({ ...configForm, apiKey: e.target.value })
                }
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Client Secret
              </label>
              <input
                type='password'
                className='w-full p-2 border border-gray-300 rounded-md'
                placeholder='Client Secret'
                value={configForm.apiSecret || ''}
                onChange={(e) =>
                  setConfigForm({ ...configForm, apiSecret: e.target.value })
                }
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                AWS Region
              </label>
              <select
                className='w-full p-2 border border-gray-300 rounded-md'
                value={configForm.region || 'na'}
                onChange={(e) =>
                  setConfigForm({ ...configForm, region: e.target.value })
                }
              >
                <option value='na'>North America</option>
                <option value='eu'>Europe</option>
                <option value='fe'>Far East</option>
              </select>
            </div>
          </>
        );

      // Add cases for other platforms

      default:
        return (
          <div>
            <p className='text-gray-600'>
              No configuration needed for this platform.
            </p>
          </div>
        );
    }
  }
};

export default IntegrationsPage;
