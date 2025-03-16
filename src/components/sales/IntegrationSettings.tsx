import React, { useEffect, useState } from 'react';
import { useIntegrations } from '../../hooks/useIntegrations';
import { PlatformAuthConfig } from '../../services/integrations/platformIntegration';
import { SalesChannel } from '../../types/salesTypes';
import LoadingSpinner from '../common/LoadingSpinner';

const IntegrationSettings: React.FC = () => {
  const {
    platforms,
    loading,
    error,
    updateConfig,
    removeConfig,
    getAuthUrl,
    isConfigured,
  } = useIntegrations();

  const [activePlatform, setActivePlatform] = useState<SalesChannel | null>(
    null
  );
  const [configParams, setConfigParams] = useState<Partial<PlatformAuthConfig>>(
    {}
  );
  const [authUrl, setAuthUrl] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // When active platform changes, reset the form
  useEffect(() => {
    setConfigParams({});
    setAuthUrl('');
  }, [activePlatform]);

  const handleSelectPlatform = (platform: SalesChannel) => {
    setActivePlatform(platform);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfigParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerateAuthUrl = () => {
    if (!activePlatform) return;

    try {
      // Add default redirect URI if not provided
      const params = {
        ...configParams,
        redirectUri:
          configParams.redirectUri || window.location.origin + '/auth/callback',
      };

      const url = getAuthUrl(activePlatform, params);
      setAuthUrl(url);
    } catch (error) {
      console.error('Error generating auth URL:', error);
    }
  };

  const handleDisconnect = (platform: SalesChannel) => {
    if (window.confirm(`Are you sure you want to disconnect ${platform}?`)) {
      removeConfig(platform);
    }
  };

  const handleManualConfig = () => {
    if (!activePlatform || !configParams.apiKey) return;

    // For demonstration purposes, we'll just create a basic config
    const config: PlatformAuthConfig = {
      ...configParams,
      accessToken: configParams.accessToken || 'manual_access_token',
    };

    updateConfig(activePlatform, config);
    setActivePlatform(null);
  };

  if (loading) {
    return (
      <div className='flex justify-center p-8'>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className='bg-red-50 p-4 rounded-md text-red-800'>
        Error: {error}
      </div>
    );
  }

  return (
    <div className='space-y-8'>
      {/* Connected platforms */}
      <div>
        <h2 className='text-lg font-medium text-stone-800 mb-4'>
          Connected Platforms
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {platforms.map(
            (platform) =>
              platform.isConfigured && (
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
                  <div className='mt-4 flex justify-end'>
                    <button
                      onClick={() => handleDisconnect(platform.key)}
                      className='text-sm text-red-600 hover:text-red-800'
                    >
                      Disconnect
                    </button>
                  </div>
                </div>
              )
          )}

          {!platforms.some((p) => p.isConfigured) && (
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
          {platforms.map(
            (platform) =>
              !platform.isConfigured &&
              platform.key !== SalesChannel.DIRECT &&
              platform.key !== SalesChannel.WHOLESALE &&
              platform.key !== SalesChannel.CUSTOM_ORDER && (
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
              )
          )}
        </div>

        {/* Configuration form for selected platform */}
        {activePlatform && (
          <div className='bg-white rounded-lg shadow-sm p-6 border border-stone-200'>
            <h3 className='font-medium text-lg mb-4'>
              Connect {platforms.find((p) => p.key === activePlatform)?.name}
            </h3>

            <div className='space-y-4'>
              {/* Shopify-specific fields */}
              {activePlatform === SalesChannel.SHOPIFY && (
                <>
                  <div>
                    <label
                      htmlFor='shopName'
                      className='block text-sm font-medium text-stone-700 mb-1'
                    >
                      Shop Name <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type='text'
                      id='shopName'
                      name='shopName'
                      value={configParams.shopName || ''}
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
                  htmlFor='apiKey'
                  className='block text-sm font-medium text-stone-700 mb-1'
                >
                  API Key <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  id='apiKey'
                  name='apiKey'
                  value={configParams.apiKey || ''}
                  onChange={handleInputChange}
                  className='w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500'
                />
              </div>

              <div>
                <label
                  htmlFor='apiSecret'
                  className='block text-sm font-medium text-stone-700 mb-1'
                >
                  API Secret <span className='text-red-500'>*</span>
                </label>
                <input
                  type='password'
                  id='apiSecret'
                  name='apiSecret'
                  value={configParams.apiSecret || ''}
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
                      placeholder={window.location.origin + '/auth/callback'}
                      className='w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500'
                    />
                  </div>

                  <div>
                    <label
                      htmlFor='accessToken'
                      className='block text-sm font-medium text-stone-700 mb-1'
                    >
                      Access Token (Manual Setup)
                    </label>
                    <input
                      type='text'
                      id='accessToken'
                      name='accessToken'
                      value={configParams.accessToken || ''}
                      onChange={handleInputChange}
                      className='w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500'
                    />
                    <p className='mt-1 text-xs text-stone-500'>
                      Only provide this if you already have a valid access token
                    </p>
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
                      !configParams.apiKey ||
                      !configParams.apiSecret ||
                      (activePlatform === SalesChannel.SHOPIFY &&
                        !configParams.shopName)
                    }
                    className='bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    Generate Authorization URL
                  </button>
                ) : (
                  <div className='space-y-2'>
                    <p className='text-sm text-stone-700'>
                      Click the button below to authorize HideSync to access
                      your{' '}
                      {platforms.find((p) => p.key === activePlatform)?.name}{' '}
                      account.
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
                {showAdvanced && configParams.accessToken && (
                  <div className='mt-4 pt-4 border-t border-stone-200'>
                    <button
                      onClick={handleManualConfig}
                      className='text-amber-700 hover:text-amber-900 px-4 py-2 rounded-md text-sm font-medium border border-amber-300 hover:bg-amber-50'
                    >
                      Connect Manually
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
        </ul>
      </div>
    </div>
  );
};

export default IntegrationSettings;
