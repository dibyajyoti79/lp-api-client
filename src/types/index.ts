import { AxiosRequestConfig } from "axios";

export interface ApiError {
  detail: string | { message: string };
}

export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
  withCredentials?: boolean;
}

export interface TokenManager {
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  setAccessToken: (token: string) => void;
  setRefreshToken: (token: string) => void;
  clearTokens: () => void;
}

export interface NotificationManager {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

export interface ApiServiceConfig {
  name: string;
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
  // Optional token refresh configuration for this service (typically the auth service)
  refreshEndpoint?: string; // e.g. "/auth/refresh" or "/v1/token/refresh"
  refreshMethod?: "post" | "get";
  refreshRequestBody?: Record<string, unknown>; // payload to send when refreshing
  refreshTokenHeaderName?: string; // defaults to "Authorization"
  refreshTokenPrefix?: string; // defaults to "Bearer"
  accessTokenPath?: string; // dot-path to access token in response, defaults to "access_token"
}

export interface ApiClientOptions {
  services: Record<string, ApiServiceConfig>;
  defaultTimeout?: number;
  defaultHeaders?: Record<string, string>;
  tokenManager?: TokenManager;
  notificationManager?: NotificationManager;
  onUnauthorized?: () => void;
  onTokenRefresh?: (newToken: string) => void;
  onTokenRefreshError?: (error: Error) => void;
  // Custom override for token refresh flow. If provided, it will be used.
  onRefreshRequest?: (
    refreshToken: string,
    axiosLib: any, // AxiosStatic type
    services: Record<string, ApiServiceConfig>
  ) => Promise<string | null>; // return new access token or null
}
