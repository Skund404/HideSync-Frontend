// src/components/sales/IntegrationSettings.tsx
import React, { useEffect, useState } from 'react';
import { useIntegrations } from '../../context/IntegrationsContext';
import { PlatformIntegration } from '../../services/integrations/integration-service';
import { SalesChannel } from '../../types/salesTypes';
import ErrorMessage from '../common/ErrorMessage';
import LoadingSpinner from '../common/LoadingSpinner';

// Add redirectUri to PlatformIntegration interface or extend it here
interface PlatformIntegrationWithRedirect extends PlatformIntegration {
  redirectUri?: string;
}

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
  [SalesChannel.OTHER]: {
    key: SalesChannel.OTHER,
    name: 'Other',
    description: 'Connect other marketplace platforms',
    icon: '🔄',
    color: '#777777',
    url: '',
    docUrl: '',
  },
};

const IntegrationSettings: React.FC = () => {
  const {
    integrations,
    isLoading,
    error,
    connectPlatform,
    disconnectPlatform,
    generateAuthUrl,
    testConnection,
  } = useIntegrations();

  const [activePlatform, setActivePlatform] = useState<SalesChannel | null>(
    null
  );
  const [configParams, setConfigParams] = useState<
    Partial<PlatformIntegrationWithRedirect>
  >({});
  const [authUrl, setAuthUrl] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // When active platform changes, reset the form
  useEffect(() => {
    setConfigParams({});
    setAuthUrl('');
    setConnectionError(null);
  }, [activePlatform]);

  const handleSelectPlatform = (platform: SalesChannel) => {
    setActivePlatform(platform);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setConfigParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerateAuthUrl = async () => {
    if (!activePlatform) return;
    setConnectionError(null);

    try {
      setConnecting(true);
      // Add default redirect URI if not provided
      const redirectUri =
        configParams.redirectUri || `${window.location.origin}/auth/callback`;

      // Default scopes for each platform
      const defaultScopes: Record<SalesChannel, string[]> = {
        [SalesChannel.SHOPIFY]: ['read_orders', 'write_orders'],
        [SalesChannel.ETSY]: ['transactions_r', 'transactions_w'],
        [SalesChannel.AMAZON]: [
          'sellingpartnerapi:orders_read',
          'sellingpartnerapi:orders_write',
        ],
        [SalesChannel.EBAY]: [
          'https://api.ebay.com/oauth/api_scope/sell.fulfillment',
        ],
        [SalesChannel.DIRECT]: [],
        [SalesChannel.WHOLESALE]: [],
        [SalesChannel.CUSTOM_ORDER]: [],
        [SalesChannel.OTHER]: [],
      };

      const url = await generateAuthUrl(
        activePlatform,
        redirectUri,
        defaultScopes[activePlatform]
      );

      if (url) {
        setAuthUrl(url);
      } else {
        setConnectionError('Failed to generate authorization URL');
      }
    } catch (error) {
      setConnectionError(
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async (integrationId: string) => {
    if (
      window.confirm(
        `Are you sure you want to disconnect this integration? This will remove all integration settings.`
      )
    ) {
      await disconnectPlatform(integrationId);
    }
  };

  const handleManualConfig = async () => {
    if (!activePlatform) return;

    setConnectionError(null);
    try {
      setConnecting(true);

      // Create basic integration config
      const integration = await connectPlatform(activePlatform, {
        ...configParams,
        platform: activePlatform,
        active: true,
      });

      if (integration) {
        // Test the connection if manually configured
        const connectionTest = await testConnection(integration.id);
        if (!connectionTest) {
          setConnectionError(
            'Connection test failed. Please check your credentials.'
          );
          return;
        }

        setActivePlatform(null);
      } else {
        setConnectionError('Failed to create integration');
      }
    } catch (error) {
      setConnectionError(
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setConnecting(false);
    }
  };

  if (isLoading) {
    return (
      <div className='flex justify-center p-8'>
        <LoadingSpinner
          size='medium'
          color='amber'
          message='Loading integrations...'
        />
      </div>
    );
  }

  // Get platform info with integration status
  const getPlatformsWithStatus = (): (PlatformInfo & {
    isConfigured: boolean;
    integration?: PlatformIntegration;
  })[] => {
    return Object.values(SalesChannel).map((platform) => {
      const platformInfo = PLATFORM_INFO[platform];
      const integration = integrations.find((i) => i.platform === platform);

      return {
        ...platformInfo,
        isConfigured: !!integration,
        integration,
      };
    });
  };

  const platforms = getPlatformsWithStatus();

  return (
    <div className='space-y-8'>
      {error && <ErrorMessage message={error} />}

      {/* Connected platforms */}
      <div>
        <h2 className='text-lg font-medium text-stone-800 mb-4'>
          Connected Platforms
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {platforms
            .filter((platform) => platform.isConfigured)
            .map((platform) => (
              <div
                key={platform.key}
                className='bg-white rounded-lg shadow-sm p-4 border border-stone-200'
              >
                <div className='flex items-center'>
                  <div
                    className='w-10 h-10 rounded-full flex items-center justify-center mr-3'
                    style={{ backgroundColor: `${platform.color}20` }} // 20% opacity
                  >
                    <span className='text-lg'>{platform.icon}</span>
                  </div>
                  <div>
                    <h3 className='font-medium'>{platform.name}</h3>
                    <p className='text-xs text-stone-500'>Connected</p>
                  </div>
                </div>
                {platform.integration && (
                  <div className='mt-3'>
                    {platform.integration.shop_name && (
                      <p className='text-sm text-stone-600'>
                        Shop: {platform.integration.shop_name}
                      </p>
                    )}
                    <p className='text-xs text-stone-500'>
                      Last synced:{' '}
                      {platform.integration.lastSyncAt
                        ? new Date(
                            platform.integration.lastSyncAt
                          ).toLocaleString()
                        : 'Never'}
                    </p>
                  </div>
                )}
                <div className='mt-4 flex justify-end'>
                  <button
                    onClick={() =>
                      platform.integration &&
                      handleDisconnect(platform.integration.id)
                    }
                    className='text-sm text-red-600 hover:text-red-800'
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            ))}

          {platforms.filter((p) => p.isConfigured).length === 0 && (
            <div className='col-span-full bg-stone-50 rounded-lg p-6 text-center text-stone-500'>
              <p>
                No platforms connected yet. Connect a marketplace below to start
                importing orders.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add new platform */}
      <div>
        <h2 className='text-lg font-medium text-stone-800 mb-4'>
          Add New Platform
        </h2>

        {/* Platform selection */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6'>
          {platforms
            .filter(
              (platform) =>
                !platform.isConfigured &&
                platform.key !== SalesChannel.DIRECT &&
                platform.key !== SalesChannel.WHOLESALE &&
                platform.key !== SalesChannel.CUSTOM_ORDER
            )
            .map((platform) => (
              <button
                key={platform.key}
                onClick={() => handleSelectPlatform(platform.key)}
                className={`bg-white rounded-lg shadow-sm p-4 border hover:border-amber-500 text-left ${
                  activePlatform === platform.key
                    ? 'border-amber-500 ring-2 ring-amber-200'
                    : 'border-stone-200'
                }`}
              >
                <div className='flex items-center'>
                  <div
                    className='w-10 h-10 rounded-full flex items-center justify-center mr-3'
                    style={{ backgroundColor: `${platform.color}20` }} // 20% opacity
                  >
                    <span className='text-lg'>{platform.icon}</span>
                  </div>
                  <div>
                    <h3 className='font-medium'>{platform.name}</h3>
                    <p className='text-xs text-stone-500'>
                      {platform.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
        </div>

        {/* Configuration form for selected platform */}
        {activePlatform && (
          <div className='bg-white rounded-lg shadow-sm p-6 border border-stone-200'>
            <h3 className='font-medium text-lg mb-4'>
              Connect {PLATFORM_INFO[activePlatform].name}
            </h3>

            {connectionError && (
              <div className='mb-4'>
                <ErrorMessage message={connectionError} />
              </div>
            )}

            <div className='space-y-4'>
              {/* Shopify-specific fields */}
              {activePlatform === SalesChannel.SHOPIFY && (
                <>
                  <div>
                    <label
                      htmlFor='shop_name'
                      className='block text-sm font-medium text-stone-700 mb-1'
                    >
                      Shop Name <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type='text'
                      id='shop_name'
                      name='shop_name'
                      value={configParams.shop_name || ''}
                      onChange={handleInputChange}
                      placeholder='your-shop-name'
                      className='w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500'
                    />
                    <p className='mt-1 text-xs text-stone-500'>
                      Enter your Shopify store name without .myshopify.com
                    </p>
                  </div>
                </>
              )}

              {/* Common fields for all platforms */}
              <div>
                <label
                  htmlFor='api_key'
                  className='block text-sm font-medium text-stone-700 mb-1'
                >
                  API Key <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  id='api_key'
                  name='api_key'
                  value={configParams.api_key || ''}
                  onChange={handleInputChange}
                  className='w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500'
                />
              </div>

              <div>
                <label
                  htmlFor='api_secret'
                  className='block text-sm font-medium text-stone-700 mb-1'
                >
                  API Secret <span className='text-red-500'>*</span>
                </label>
                <input
                  type='password'
                  id='api_secret'
                  name='api_secret'
                  value={configParams.api_secret || ''}
                  onChange={handleInputChange}
                  className='w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500'
                />
              </div>

              {/* Advanced options toggle */}
              <div>
                <button
                  type='button'
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className='text-sm text-amber-600 hover:text-amber-800 flex items-center'
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className={`h-5 w-5 mr-1 transform ${
                      showAdvanced ? 'rotate-90' : ''
                    }`}
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9 5l7 7-7 7'
                    />
                  </svg>
                  Advanced Options
                </button>
              </div>

              {/* Advanced options */}
              {showAdvanced && (
                <>
                  <div>
                    <label
                      htmlFor='redirectUri'
                      className='block text-sm font-medium text-stone-700 mb-1'
                    >
                      Redirect URI
                    </label>
                    <input
                      type='text'
                      id='redirectUri'
                      name='redirectUri'
                      value={configParams.redirectUri || ''}
                      onChange={handleInputChange}
                      placeholder={`${window.location.origin}/auth/callback`}
                      className='w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500'
                    />
                  </div>

                  <div>
                    <label
                      htmlFor='access_token'
                      className='block text-sm font-medium text-stone-700 mb-1'
                    >
                      Access Token (Manual Setup)
                    </label>
                    <input
                      type='password'
                      id='access_token'
                      name='access_token'
                      value={configParams.access_token || ''}
                      onChange={handleInputChange}
                      className='w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500'
                    />
                    <p className='mt-1 text-xs text-stone-500'>
                      Only provide this if you already have a valid access token
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor='refresh_token'
                      className='block text-sm font-medium text-stone-700 mb-1'
                    >
                      Refresh Token (Manual Setup)
                    </label>
                    <input
                      type='password'
                      id='refresh_token'
                      name='refresh_token'
                      value={configParams.refresh_token || ''}
                      onChange={handleInputChange}
                      className='w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500'
                    />
                  </div>
                </>
              )}

              {/* OAuth flow section */}
              <div className='pt-4 border-t border-stone-200'>
                <h4 className='font-medium mb-2'>Connect Your Account</h4>

                {!authUrl ? (
                  <button
                    onClick={handleGenerateAuthUrl}
                    disabled={
                      connecting ||
                      !configParams.api_key ||
                      !configParams.api_secret ||
                      (activePlatform === SalesChannel.SHOPIFY &&
                        !configParams.shop_name)
                    }
                    className='bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center'
                  >
                    {connecting ? (
                      <>
                        <LoadingSpinner size='small' color='stone' />
                        <span className='ml-2'>Generating...</span>
                      </>
                    ) : (
                      'Generate Authorization URL'
                    )}
                  </button>
                ) : (
                  <div className='space-y-2'>
                    <p className='text-sm text-stone-700'>
                      Click the button below to authorize HideSync to access
                      your {PLATFORM_INFO[activePlatform].name} account.
                    </p>
                    <div className='flex flex-wrap gap-3'>
                      <a
                        href={authUrl}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md text-sm font-medium inline-flex items-center'
                      >
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          className='h-5 w-5 mr-1'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14'
                          />
                        </svg>
                        Authorize in New Window
                      </a>
                      <button
                        onClick={() => setAuthUrl('')}
                        className='text-stone-700 hover:text-stone-900 px-4 py-2 rounded-md text-sm font-medium border border-stone-300 hover:bg-stone-50'
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                )}

                {/* Manual connection option */}
                {showAdvanced && configParams.access_token && (
                  <div className='mt-4 pt-4 border-t border-stone-200'>
                    <button
                      onClick={handleManualConfig}
                      disabled={connecting}
                      className='text-amber-700 hover:text-amber-900 px-4 py-2 rounded-md text-sm font-medium border border-amber-300 hover:bg-amber-50 flex items-center'
                    >
                      {connecting ? (
                        <>
                          <LoadingSpinner size='small' color='amber' />
                          <span className='ml-2'>Connecting...</span>
                        </>
                      ) : (
                        'Connect Manually'
                      )}
                    </button>
                    <p className='mt-1 text-xs text-stone-500'>
                      Use this option if you already have a valid access token
                    </p>
                  </div>
                )}
              </div>

              {/* Cancel button */}
              <div className='pt-4 flex justify-end'>
                <button
                  onClick={() => setActivePlatform(null)}
                  className='text-stone-700 hover:text-stone-900 px-4 py-2 rounded-md text-sm font-medium'
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Documentation and help */}
      <div className='bg-stone-50 rounded-lg p-6 border border-stone-200'>
        <h2 className='text-lg font-medium text-stone-800 mb-2'>
          Need Help Setting Up?
        </h2>
        <p className='text-stone-600 mb-4'>
          Setting up marketplace integrations requires API keys from each
          platform. Follow these guides to get your API credentials:
        </p>
        <ul className='space-y-2 text-sm'>
          <li>
            <a
              href='https://shopify.dev/api/admin-rest'
              target='_blank'
              rel='noopener noreferrer'
              className='text-amber-600 hover:text-amber-800 flex items-center'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-5 w-5 mr-1'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14'
                />
              </svg>
              Shopify API Documentation
            </a>
          </li>
          <li>
            <a
              href='https://developers.etsy.com/documentation'
              target='_blank'
              rel='noopener noreferrer'
              className='text-amber-600 hover:text-amber-800 flex items-center'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-5 w-5 mr-1'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14'
                />
              </svg>
              Etsy API Documentation
            </a>
          </li>
          <li>
            <a
              href='https://developer.ebay.com/develop/apis'
              target='_blank'
              rel='noopener noreferrer'
              className='text-amber-600 hover:text-amber-800 flex items-center'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-5 w-5 mr-1'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14'
                />
              </svg>
              eBay API Documentation
            </a>
          </li>
          <li>
            <a
              href='https://developer-docs.amazon.com/sp-api/'
              target='_blank'
              rel='noopener noreferrer'
              className='text-amber-600 hover:text-amber-800 flex items-center'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-5 w-5 mr-1'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14'
                />
              </svg>
              Amazon Selling Partner API Documentation
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default IntegrationSettings;
