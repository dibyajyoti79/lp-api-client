import { AxiosRequestConfig, CreateAxiosDefaults } from "axios";

export interface ApiError {
  detail: string | { message: string };
  message?: string;
}

export interface TokenManager {
  getAccessToken: () => string | null;
  setAccessToken: (token: string) => void;
  clearTokens: () => void;
  // Optional refresh token methods
  getRefreshToken?: () => string | null;
  setRefreshToken?: (token: string) => void;
}

export interface NotificationManager {
  success: (message: string) => void;
  error: (message: string) => void;
}

export interface ApiClientOptions {
  services: Record<string, ServiceConfig>;
  tokenManager?: TokenManager;
  notificationManager?: NotificationManager;
  isRefreshTokenInCookie?: boolean; // If true, refresh token is in HttpOnly cookie
  onUnauthorized?: () => void;
}

export interface ServiceConfig {
  baseURL: string;
  config?: Omit<CreateAxiosDefaults, "baseURL">; // Use Axios's built-in config type
  refreshEndpoint?: string; // Just the endpoint URL for refresh, e.g., "/auth/refresh"
}
