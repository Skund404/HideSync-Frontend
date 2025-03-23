// src/components/development/ApiMonitor.tsx
import React, { useState, useEffect } from 'react';
import { apiClient } from '../../services/api-client';
import { X, MinusCircle, PlusCircle, RefreshCw, Clock } from 'lucide-react';

// Setup request interceptor only in development
if (process.env.NODE_ENV === 'development') {
  // Track API requests and responses
  const requestMap = new Map();
  
  // Add request interceptor
  apiClient.interceptors.request.use(
    (config) => {
      const id = Date.now();
      const timestamp = new Date().toISOString();
      
      // Store request info
      requestMap.set(id, {
        id,
        url: config.url,
        method: config.method?.toUpperCase(),
        timestamp,
        status: 'pending',
        duration: 0,
        response: null,
        error: null
      });
      
      // Add ID to the request for tracking
      config.headers = config.headers || {};
      config.headers['X-Request-ID'] = id;
      
      // Log the request
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, config);
      
      // Create a custom event to notify the monitor
      window.dispatchEvent(new CustomEvent('api-request', { 
        detail: { id, url: config.url, method: config.method, timestamp } 
      }));
      
      return config;
    },
    (error) => {
      console.error('[API] Request Error:', error);
      return Promise.reject(error);
    }
  );
  
  // Add response interceptor
  apiClient.interceptors.response.use(
    (response) => {
      const id = response.config.headers?.['X-Request-ID'];
      const request = requestMap.get(parseInt(id));
      
      if (request) {
        const endTime = Date.now();
        const startTime = new Date(request.timestamp).getTime();
        const duration = endTime - startTime;
        
        // Update request info
        requestMap.set(id, {
          ...request,
          status: 'success',
          statusCode: response.status,
          duration,
          response: response.data
        });
        
        // Log the response
        console.log(`[API] Response: ${response.status} ${request.method} ${request.url} (${duration}ms)`, response.data);
        
        // Create a custom event to notify the monitor
        window.dispatchEvent(new CustomEvent('api-response', { 
          detail: { 
            id, 
            status: 'success', 
            statusCode: response.status, 
            duration, 
            data: response.data 
          } 
        }));
      }
      
      return response;
    },
    (error) => {
      const id = error.config?.headers?.['X-Request-ID'];
      const request = id ? requestMap.get(parseInt(id)) : null;
      
      if (request) {
        const endTime = Date.now();
        const startTime = new Date(request.timestamp).getTime();
        const duration = endTime - startTime;
        
        // Update request info
        requestMap.set(id, {
          ...request,
          status: 'error',
          statusCode: error.response?.status,
          duration,
          error: error.response?.data || error.message
        });
        
        // Log the error
        console.error(`[API] Error: ${error.response?.status || 'Network Error'} ${request.method} ${request.url} (${duration}ms)`, error.response?.data || error);
        
        // Create a custom event to notify the monitor
        window.dispatchEvent(new CustomEvent('api-response', { 
          detail: { 
            id, 
            status: 'error', 
            statusCode: error.response?.status, 
            duration,
            error: error.response?.data || error.message
          } 
        }));
      } else {
        console.error('[API] Error (untracked):', error);
      }
      
      return Promise.reject(error);
    }
  );
}

// Maximum number of requests to keep in history
const MAX_HISTORY = 20;

interface ApiRequest {
  id: number;
  url: string;
  method: string;
  timestamp: string;
  status: 'pending' | 'success' | 'error';
  statusCode?: number;
  duration: number;
  response?: any;
  error?: any;
}

const ApiMonitor: React.FC = () => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [requests, setRequests] = useState<ApiRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<ApiRequest | null>(null);
  
  // Track requests and responses
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') {
      return;
    }
    
    const handleRequest = (event: CustomEvent) => {
      const { id, url, method, timestamp } = event.detail;
      
      setRequests(prev => {
        const newRequests = [
          {
            id,
            url,
            method,
            timestamp,
            status: 'pending' as const,
            duration: 0
          },
          ...prev
        ].slice(0, MAX_HISTORY);
        
        return newRequests;
      });
    };
    
    const handleResponse = (event: CustomEvent) => {
      const { id, status, statusCode, duration, data, error } = event.detail;
      
      setRequests(prev => {
        return prev.map(req => {
          if (req.id === id) {
            return {
              ...req,
              status,
              statusCode,
              duration,
              response: data,
              error
            };
          }
          return req;
        });
      });
    };
    
    // Add event listeners
    window.addEventListener('api-request', handleRequest as EventListener);
    window.addEventListener('api-response', handleResponse as EventListener);
    
    // Clean up
    return () => {
      window.removeEventListener('api-request', handleRequest as EventListener);
      window.removeEventListener('api-response', handleResponse as EventListener);
    };
  }, []);
  
  // Don't render in production
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  // Format duration
  const formatDuration = (ms: number) => {
    if (ms < 1000) {
      return `${ms}ms`;
    }
    return `${(ms / 1000).toFixed(2)}s`;
  };
  
  // Clear request history
  const clearRequests = () => {
    setRequests([]);
    setSelectedRequest(null);
  };
  
  // Status color
  const getStatusColor = (status: string, code?: number) => {
    if (status === 'pending') return 'bg-blue-500';
    if (status === 'error') return 'bg-red-500';
    if (code && code >= 400) return 'bg-red-500';
    if (code && code >= 300) return 'bg-yellow-500';
    return 'bg-green-500';
  };
  
  return (
    <>
      {/* Toggle button */}
      <button
        className="fixed bottom-4 right-4 bg-indigo-700 text-white p-2 rounded-full shadow-lg z-50 hover:bg-indigo-800"
        onClick={() => setIsVisible(!isVisible)}
        title="API Monitor"
      >
        <RefreshCw size={20} className={`${requests.some(r => r.status === 'pending') ? 'animate-spin' : ''}`} />
      </button>
      
      {/* Monitor panel */}
      {isVisible && (
        <div className="fixed bottom-16 right-4 bg-gray-900 text-white rounded-lg shadow-xl z-50 w-96 max-w-full max-h-[80vh] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between bg-indigo-800 p-2">
            <div className="flex items-center space-x-2">
              <Clock size={16} />
              <h3 className="font-medium">API Monitor</h3>
              <span className="text-xs bg-indigo-700 px-2 py-0.5 rounded-full">
                {requests.length} requests
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <button 
                onClick={clearRequests} 
                className="p-1 hover:bg-indigo-700 rounded"
                title="Clear history"
              >
                <RefreshCw size={14} />
              </button>
              <button 
                onClick={() => setIsExpanded(!isExpanded)} 
                className="p-1 hover:bg-indigo-700 rounded"
                title={isExpanded ? "Collapse" : "Expand"}
              >
                {isExpanded ? <MinusCircle size={14} /> : <PlusCircle size={14} />}
              </button>
              <button 
                onClick={() => setIsVisible(false)} 
                className="p-1 hover:bg-indigo-700 rounded"
                title="Close"
              >
                <X size={14} />
              </button>
            </div>
          </div>
          
          {/* Request list */}
          <div className="overflow-y-auto flex-grow" style={{ maxHeight: isExpanded ? '500px' : '300px' }}>
            {requests.length === 0 ? (
              <div className="text-center p-4 text-gray-400">
                No API requests captured yet.
              </div>
            ) : (
              <ul className="divide-y divide-gray-800">
                {requests.map(req => (
                  <li 
                    key={req.id} 
                    className={`p-2 hover:bg-gray-800 cursor-pointer ${selectedRequest?.id === req.id ? 'bg-gray-800' : ''}`}
                    onClick={() => setSelectedRequest(req === selectedRequest ? null : req)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(req.status, req.statusCode)}`}></span>
                        <span className="font-mono text-xs bg-gray-700 px-1 rounded mr-2">
                          {req.method}
                        </span>
                        <span className="text-sm truncate" style={{ maxWidth: '150px' }}>
                          {req.url?.replace(/^.*\/api\/v1/, '')}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-400">
                        {req.status !== 'pending' && (
                          <span>
                            {formatDuration(req.duration)}
                          </span>
                        )}
                        {req.statusCode && (
                          <span className={`px-1 rounded ${req.statusCode >= 400 ? 'bg-red-900 text-red-200' : 'bg-gray-700'}`}>
                            {req.statusCode}
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {/* Request details */}
          {selectedRequest && (
            <div className="border-t border-gray-800 p-3 bg-gray-850">
              <div className="mb-2">
                <h4 className="text-sm font-semibold">
                  {selectedRequest.method} {selectedRequest.url}
                </h4>
                <div className="text-xs text-gray-400">
                  {new Date(selectedRequest.timestamp).toLocaleTimeString()} • 
                  {selectedRequest.status === 'pending' ? ' Pending' : ` ${formatDuration(selectedRequest.duration)}`}
                  {selectedRequest.statusCode && ` • Status ${selectedRequest.statusCode}`}
                </div>
              </div>
              
              {/* Response or error data */}
              {(selectedRequest.response || selectedRequest.error) && (
                <div className="mt-2">
                  <p className="text-xs text-gray-400 mb-1">
                    {selectedRequest.status === 'error' ? 'Error' : 'Response'}:
                  </p>
                  <pre className="text-xs bg-gray-950 p-2 rounded overflow-x-auto max-h-40">
                    {JSON.stringify(selectedRequest.response || selectedRequest.error, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ApiMonitor;