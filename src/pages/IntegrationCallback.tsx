// src/pages/IntegrationCallback.tsx
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useIntegrations } from '../context/IntegrationsContext';
import { SalesChannel } from '../types/salesTypes';

/**
 * This component handles OAuth callbacks from external platforms
 * It extracts the authorization code and other parameters from the URL
 * and exchanges them for access tokens
 */
const IntegrationCallback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  );
  const [message, setMessage] = useState<string>(
    'Processing authentication...'
  );

  const { handleAuthCallback } = useIntegrations();

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Get query parameters
        const params = new URLSearchParams(location.search);
        const code = params.get('code');
        const state = params.get('state');
        const error = params.get('error');

        if (error) {
          setStatus('error');
          setMessage(`Authentication failed: ${error}`);
          return;
        }

        if (!code) {
          setStatus('error');
          setMessage('No authorization code received');
          return;
        }

        if (!state) {
          setStatus('error');
          setMessage('No state parameter received');
          return;
        }

        // Determine which platform this is for based on state
        // The state param should include the platform name
        let platform: SalesChannel;

        if (state.includes(SalesChannel.SHOPIFY)) {
          platform = SalesChannel.SHOPIFY;
        } else if (state.includes(SalesChannel.ETSY)) {
          platform = SalesChannel.ETSY;
        } else if (state.includes(SalesChannel.AMAZON)) {
          platform = SalesChannel.AMAZON;
        } else if (state.includes(SalesChannel.EBAY)) {
          platform = SalesChannel.EBAY;
        } else {
          setStatus('error');
          setMessage(`Unknown platform in state parameter: ${state}`);
          return;
        }

        // Calculate the callback URL that was used (current URL without query params)
        const redirectUri = `${window.location.origin}${window.location.pathname}`;

        // Handle the authorization code
        const success = await handleAuthCallback(platform, code, redirectUri);

        if (success) {
          setStatus('success');
          setMessage(`Successfully connected to ${platform}`);

          // After a brief delay, redirect back to integrations page
          setTimeout(() => {
            navigate('/integrations');
          }, 2000);
        } else {
          setStatus('error');
          setMessage(`Failed to complete authentication with ${platform}`);
        }
      } catch (error) {
        console.error('Error processing OAuth callback:', error);
        setStatus('error');
        setMessage(
          `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    };

    processCallback();
  }, [location, handleAuthCallback, navigate]);

  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gray-100'>
      <div className='bg-white p-8 rounded-lg shadow-md max-w-md w-full'>
        <h1 className='text-xl font-semibold mb-4'>Platform Integration</h1>

        <div className='flex flex-col items-center'>
          {status === 'loading' && (
            <>
              <LoadingSpinner size="medium" color="amber" message={message} />
            </>
          )}

          {status === 'success' && (
            <div className='text-center'>
              <div className='bg-green-100 text-green-700 p-4 rounded-md mb-4'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-6 w-6 mx-auto mb-2'
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
                <p>{message}</p>
              </div>
              <p className='text-sm text-gray-500'>
                Redirecting back to integrations page...
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className='text-center'>
              <ErrorMessage
                message={message}
                onRetry={() => navigate('/integrations')}
              />
              <button
                onClick={() => navigate('/integrations')}
                className='mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700'
              >
                Return to Integrations
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IntegrationCallback;