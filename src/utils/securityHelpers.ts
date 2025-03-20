// src/utils/securityHelpers.ts
/**
 * Utility functions for encryption and security
 *
 * NOTE: In production, this would use a proper encryption library
 * and should be handled server-side. This is a simplified implementation
 * for demonstration purposes only.
 */

// Secret key for encryption (in production, this would be an environment variable)
const SECRET_KEY = 'hidesync-secure-key';

/**
 * Encrypt sensitive data
 *
 * In a real application, implement proper encryption here.
 * This is just a simple Base64 encoding for demonstration purposes.
 * NEVER use this in production - it provides no real security.
 *
 * @param data String data to encrypt
 * @returns Encrypted string
 */
export const encryptData = (data: string): string => {
  // In a real implementation, you would use proper encryption
  // For demo purposes, we'll just use base64 encoding with a simple transformation

  // WARNING: This is NOT secure encryption!
  // In production, use a proper encryption library or API
  const combined = SECRET_KEY + data;
  return btoa(combined);
};

/**
 * Decrypt data
 *
 * In a real application, implement proper decryption here.
 * This is just a simple Base64 decoding for demonstration purposes.
 * NEVER use this in production - it provides no real security.
 *
 * @param encryptedData Encrypted string
 * @returns Decrypted string
 */
export const decryptData = (encryptedData: string): string => {
  // In a real implementation, you would use proper decryption
  // For demo purposes, we'll just use base64 decoding with a simple transformation

  // WARNING: This is NOT secure decryption!
  // In production, use a proper encryption library or API
  try {
    const combined = atob(encryptedData);
    return combined.substring(SECRET_KEY.length);
  } catch (error) {
    console.error('Error decrypting data:', error);
    return '';
  }
};

/**
 * Securely store data in localStorage with encryption
 *
 * @param key Storage key
 * @param value Value to store (will be encrypted)
 */
export const secureLocalStorage = {
  setItem: (key: string, value: string): void => {
    const encrypted = encryptData(value);
    localStorage.setItem(key, encrypted);
  },

  getItem: (key: string): string | null => {
    const encrypted = localStorage.getItem(key);

    if (!encrypted) return null;

    return decryptData(encrypted);
  },

  removeItem: (key: string): void => {
    localStorage.removeItem(key);
  },
};

/**
 * Generate a secure random string (for CSRF protection, etc.)
 *
 * @param length Length of the random string
 * @returns Random string
 */
export const generateRandomString = (length: number = 32): string => {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  // In a real implementation, use a cryptographically secure random number generator
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
};

/**
 * Hash a string using SHA-256
 * For browser environments where crypto.subtle is available
 *
 * @param message Message to hash
 * @returns Promise resolving to hash string
 */
export const hashString = async (message: string): Promise<string> => {
  // This works in modern browsers but not in all environments
  // In production, ensure compatibility or use a dedicated library
  try {
    const msgUint8 = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch (error) {
    console.error('Hashing error:', error);

    // Fallback for environments without crypto.subtle
    let hash = 0;
    for (let i = 0; i < message.length; i++) {
      const char = message.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(16);
  }
};
