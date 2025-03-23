// Create src/services/api-client.ts
import { getAuthToken, refreshToken, logout } from '@/utils/auth';
import axios from 'axios';

// Read environment variables or default to localhost
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8001';
const API_TIMEOUT = 30000; // 30 seconds

// Create a configured Axios instance
export const apiClient = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: API_TIMEOUT,
});

// Export common types for responses
export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: any;
}

export interface ApiError {
  message: string;
  status: number;
  data?: any;
}

// Add to api-client.ts

// Request interceptor for authentication
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle token expiration
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const token = await refreshToken();
        if (token) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        logout();
        window.location.href = '/login';
      }
    }
    
    // Format error for consistent handling
    const apiError = {
      message: error.response?.data?.detail || error.message || 'Unknown error',
      status: error.response?.status || 500,
      data: error.response?.data
    };
    
    return Promise.reject(apiError);
  }
);
