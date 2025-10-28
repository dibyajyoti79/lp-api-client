import axios, {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { ApiClientOptions, NotificationManager, TokenManager } from "../types";

export class ApiConfig {
  private static instance: ApiConfig;
  private options: ApiClientOptions;
  private refreshPromise: Promise<void> | null = null;
  private notificationManager?: NotificationManager;
  private tokenManager?: TokenManager;

  private constructor(options: ApiClientOptions) {
    this.options = options;
    this.notificationManager = options.notificationManager;
    this.tokenManager = options.tokenManager;
  }

  public static getInstance(): ApiConfig {
    if (!ApiConfig.instance) {
      throw new Error("ApiConfig must be initialized with options first");
    }
    return ApiConfig.instance;
  }

  public static initialize(options: ApiClientOptions): void {
    ApiConfig.instance = new ApiConfig(options);
  }

  public createAxiosInstance(serviceName: string): AxiosInstance {
    const serviceConfig = this.options.services[serviceName];
    if (!serviceConfig) {
      throw new Error(`Service '${serviceName}' not found in configuration`);
    }

    // Use Axios's config directly
    const axiosInstance = axios.create({
      baseURL: serviceConfig.baseURL,
      ...serviceConfig.config, // Spread any custom Axios config
    });

    // Request interceptor - add Bearer token
    axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const isAccessTokenInCookie = this.options.isAccessTokenInCookie;
        if (isAccessTokenInCookie) {
          config.withCredentials = true;
        } else {
          if (this.options.tokenManager) {
            const accessToken = this.options.tokenManager.getAccessToken();
            if (accessToken) {
              config.headers.Authorization = `Bearer ${accessToken}`;
            }
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle 401 with refresh
    // IMPORTANT: Refresh only triggers when backend returns specific error codes:
    // - "TOKEN_EXPIRED" (in response.data.code or response.data.error.code)
    // - "ACCESS_TOKEN_NOT_PROVIDED" (in response.data.code or response.data.error.code)
    // Other 401 errors (invalid credentials, OTP expired, etc.) will NOT trigger refresh
    axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error?.response?.status === 401 && !originalRequest._retry) {
          // Check error code from response
          // Supports: { code: "..." } or { error: { code: "..." } }
          const errorCode =
            error.response?.data?.code || error.response?.data?.error?.code;
          const shouldRefresh =
            errorCode === "TOKEN_EXPIRED" ||
            errorCode === "ACCESS_TOKEN_NOT_PROVIDED";

          // Only refresh if error code indicates token expiry
          if (shouldRefresh) {
            originalRequest._retry = true;

            // Check if we have a refresh endpoint configured
            const hasRefreshEndpoint = Object.values(
              this.options.services
            ).some((service) => service.refreshEndpoint);

            if (hasRefreshEndpoint) {
              try {
                await this.refreshToken();
                // Retry the original request
                return axiosInstance(originalRequest);
              } catch (refreshError) {
                // Refresh failed, don't retry
                return Promise.reject(error);
              }
            }
          }

          // Not a token expiry error - this is a real 401
        }

        return Promise.reject(error);
      }
    );

    return axiosInstance;
  }

  public getNotificationManager(): NotificationManager | undefined {
    return this.notificationManager;
  }

  public getTokenManager(): TokenManager | undefined {
    return this.tokenManager;
  }

  private async refreshToken(): Promise<void> {
    // If a refresh is already in progress, wait for it
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    // Start a new refresh
    this.refreshPromise = this.performTokenRefresh();

    try {
      await this.refreshPromise;
    } finally {
      // Clear the promise when done (success or failure)
      this.refreshPromise = null;
    }
  }

  private async performTokenRefresh(): Promise<void> {
    try {
      const isRefreshTokenInCookie = this.options.isRefreshTokenInCookie;
      const isAccessTokenInCookie = this.options.isAccessTokenInCookie;
      const authService = Object.values(this.options.services).find(
        (service) => service.refreshEndpoint
      );

      if (isAccessTokenInCookie && isRefreshTokenInCookie && authService) {
        await axios.post(
          `${authService.baseURL}${authService.refreshEndpoint}`,
          {},
          {
            withCredentials: true,
          }
        );
        return;
      }

      const tokenManager = this.options.tokenManager;
      if (!tokenManager) {
        console.error("No token manager configured");
        this.options.onUnauthorized?.();
        return;
      }

      // Find the auth service with refreshEndpoint

      if (!authService) {
        console.error("No refresh endpoint configured");
        this.options.onUnauthorized?.();
        return;
      }

      let requestBody: any;

      // If refresh token is NOT in cookie, we need to pass it in body
      if (!isRefreshTokenInCookie && tokenManager.getRefreshToken) {
        const refreshToken = tokenManager.getRefreshToken();
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }
        requestBody = { refreshToken };
      }

      // Make refresh request
      const response = await axios.post(
        `${authService.baseURL}${authService.refreshEndpoint}`,
        requestBody,
        {
          withCredentials: isRefreshTokenInCookie, // Use withCredentials for cookie-based refresh
        }
      );

      // Update tokens based on response
      if (response?.data?.data?.accessToken) {
        tokenManager.setAccessToken(response.data.data.accessToken);
      }

      // If refresh token is NOT in cookie, also update the refresh token
      if (
        !isRefreshTokenInCookie &&
        response.data.data.refreshToken &&
        tokenManager.setRefreshToken
      ) {
        tokenManager.setRefreshToken(response.data.data.refreshToken);
      }
    } catch (err) {
      console.error("Refresh token error:", err);
      this.options.tokenManager?.clearTokens();
      this.options.onUnauthorized?.();
      throw err;
    }
  }
}
