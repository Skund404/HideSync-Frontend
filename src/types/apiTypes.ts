// src/types/apiTypes.ts

/**
 * Generic paginated response interface used by the API
 * for list endpoints that return multiple items
 */
export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    skip: number;
    limit: number;
  }
  
  /**
   * Generic error response from the API
   */
  export interface ApiErrorResponse {
    message: string;
    status?: number;
    errors?: Record<string, string[]>;
  }
  
  /**
   * Generic success response for operations that return data
   */
  export interface ApiSuccessResponse<T> {
    data: T;
    message?: string;
  }
  
  /**
   * Common HTTP status codes used in the application
   */
  export enum HttpStatus {
    OK = 200,
    CREATED = 201,
    NO_CONTENT = 204,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    CONFLICT = 409,
    INTERNAL_SERVER_ERROR = 500
  }