import { AxiosError } from "axios";
import { ApiError } from "../types";

// Error handling utilities
export const isAxiosError = (error: unknown): error is AxiosError => {
  return error !== null && typeof error === "object" && "isAxiosError" in error;
};

export const getErrorMessage = (error: unknown): string => {
  if (isAxiosError(error)) {
    const apiError = error.response?.data as ApiError;

    if (typeof apiError?.detail === "string") {
      return apiError.detail;
    }

    if (typeof apiError?.detail === "object" && apiError.detail?.message) {
      return apiError.detail.message;
    }

    if (error.response?.statusText) {
      return error.response.statusText;
    }

    return (error as any).message || "An error occurred";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unknown error occurred";
};

export const getErrorStatus = (error: unknown): number | null => {
  if (isAxiosError(error)) {
    return error.response?.status || null;
  }
  return null;
};

export const isNetworkError = (error: unknown): boolean => {
  if (isAxiosError(error)) {
    return !error.response;
  }
  return false;
};

export const isTimeoutError = (error: unknown): boolean => {
  if (isAxiosError(error)) {
    return error.code === "ECONNABORTED";
  }
  return false;
};

// URL utilities
export const buildUrl = (
  baseUrl: string,
  path: string,
  params?: Record<string, unknown>
): string => {
  const url = new URL(path, baseUrl);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  return url.toString();
};

// Query key utilities
export const createQueryKey = (
  prefix: string,
  ...suffixes: unknown[]
): unknown[] => {
  return [prefix, ...suffixes];
};

// Retry utilities
export const createRetryConfig = (
  maxRetries: number = 3,
  baseDelay: number = 1000
) => {
  return {
    retry: (failureCount: number, error: unknown) => {
      if (isAxiosError(error)) {
        const status = error.response?.status;
        // Don't retry on 4xx errors (except 408, 429)
        if (
          status &&
          status >= 400 &&
          status < 500 &&
          status !== 408 &&
          status !== 429
        ) {
          return false;
        }
      }
      return failureCount < maxRetries;
    },
    retryDelay: (attemptIndex: number) =>
      Math.min(baseDelay * 2 ** attemptIndex, 30000),
  };
};

// Cache utilities
export const createCacheConfig = (
  staleTime: number = 5 * 60 * 1000,
  cacheTime: number = 10 * 60 * 1000
) => {
  return {
    staleTime,
    cacheTime,
  };
};

// Request/Response interceptors
export const createRequestInterceptor = (tokenManager: any) => {
  return (config: any) => {
    const token = tokenManager.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  };
};

export const createResponseInterceptor = (
  tokenManager: any,
  onUnauthorized?: () => void
) => {
  return (response: any) => response;
};

export const createErrorInterceptor = (
  tokenManager: any,
  onUnauthorized?: () => void
) => {
  return async (error: any) => {
    if (error.response?.status === 401) {
      tokenManager.clearTokens();
      onUnauthorized?.();
    }
    return Promise.reject(error);
  };
};
