// src/utils/auth.ts
/**
 * Authentication utilities
 */

// Storage keys
const TOKEN_KEY = 'leathercraft_token';
const REFRESH_TOKEN_KEY = 'leathercraft_refresh_token';

/**
 * Get the current authentication token from localStorage
 * @returns The stored auth token or null if not authenticated
 */
export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Set auth token in localStorage (usually after login)
 * @param token - The authentication token to store
 */
export function setAuthToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Get the refresh token from localStorage
 * @returns The stored refresh token or null if not available
 */
export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

/**
 * Set refresh token in localStorage
 * @param token - The refresh token to store
 */
export function setRefreshToken(token: string): void {
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

/**
 * Check if user is authenticated
 * @returns Boolean indicating authentication status
 */
export function isAuthenticated(): boolean {
  return Boolean(getAuthToken());
}

/**
 * Login function to authenticate user
 * @param email - User email
 * @param password - User password
 * @returns Promise with auth token
 */
export async function login(email: string, password: string): Promise<string> {
  try {
    // This would be replaced with an actual API call
    const response = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    const { token, refreshToken } = data;

    setAuthToken(token);
    setRefreshToken(refreshToken);
    
    return token;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

/**
 * Refresh authentication token using refresh token
 * @returns Promise with new token
 */
export async function refreshToken(): Promise<string | null> {
  try {
    const currentRefreshToken = getRefreshToken();
    
    if (!currentRefreshToken) {
      return null;
    }
    
    // This would be replaced with an actual API call
    const response = await fetch('/api/v1/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken: currentRefreshToken }),
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    const { token } = data;

    setAuthToken(token);
    
    return token;
  } catch (error) {
    console.error('Token refresh error:', error);
    return null;
  }
}

/**
 * Logout function to clear authentication
 */
export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}