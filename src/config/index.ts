import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";
import { ApiClientConfig, TokenManager, ApiClientOptions } from "../types";

// Use global object to ensure true singleton across all module boundaries
// This works even when bundlers create separate module instances
const getGlobalApiConfig = () => {
  if (typeof globalThis !== "undefined") {
    return (globalThis as any).__learningpadApiConfig;
  }
  if (typeof global !== "undefined") {
    return (global as any).__learningpadApiConfig;
  }
  if (typeof window !== "undefined") {
    return (window as any).__learningpadApiConfig;
  }
  return null;
};

const setGlobalApiConfig = (instance: ApiConfig | null) => {
  if (typeof globalThis !== "undefined") {
    (globalThis as any).__learningpadApiConfig = instance;
  } else if (typeof global !== "undefined") {
    (global as any).__learningpadApiConfig = instance;
  } else if (typeof window !== "undefined") {
    (window as any).__learningpadApiConfig = instance;
  }
};

export class ApiConfig {
  private options: ApiClientOptions;
  private tokenManager: TokenManager;
  private notificationManager?: any;
  private refreshPromise: Promise<string | null> | null = null;

  private constructor(options: ApiClientOptions) {
    this.options = options;
    this.tokenManager =
      options.tokenManager || this.createDefaultTokenManager();
    this.notificationManager = options.notificationManager;
  }

  public static getInstance(options?: ApiClientOptions): ApiConfig {
    const instance = getGlobalApiConfig();
    if (!instance) {
      if (options) {
        const newInstance = new ApiConfig(options);
        setGlobalApiConfig(newInstance);
        return newInstance;
      } else {
        // Auto-initialize with default configuration if none provided
        console.warn(
          "ApiConfig not initialized. Auto-initializing with default configuration. " +
            "Please call ApiConfig.initialize(options) in your app setup for better control."
        );
        const defaultOptions: ApiClientOptions = {
          services: {
            default: {
              name: "default",
              baseURL: "https://jsonplaceholder.typicode.com",
              timeout: 10000,
            },
          },
          defaultTimeout: 10000,
          defaultHeaders: {
            "Content-Type": "application/json",
          },
        };
        const newInstance = new ApiConfig(defaultOptions);
        setGlobalApiConfig(newInstance);
        return newInstance;
      }
    }
    return instance;
  }

  public static initialize(options: ApiClientOptions): void {
    const instance = new ApiConfig(options);
    setGlobalApiConfig(instance);
  }

  public static isInitialized(): boolean {
    return getGlobalApiConfig() !== null;
  }

  public static reset(): void {
    setGlobalApiConfig(null);
  }

  // Utility method for debugging
  public static getDebugInfo(): { initialized: boolean; services: string[] } {
    const instance = getGlobalApiConfig();
    return {
      initialized: instance !== null,
      services: instance ? Object.keys(instance.options.services) : [],
    };
  }

  private createDefaultTokenManager(): TokenManager {
    return {
      getAccessToken: () => {
        if (typeof window !== "undefined") {
          return localStorage.getItem("access_token");
        }
        return null;
      },
      getRefreshToken: () => {
        if (typeof window !== "undefined") {
          return localStorage.getItem("refresh_token");
        }
        return null;
      },
      setAccessToken: (token: string) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("access_token", token);
        }
      },
      setRefreshToken: (token: string) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("refresh_token", token);
        }
      },
      clearTokens: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
        }
      },
    };
  }

  public createAxiosInstance(serviceName: string): AxiosInstance {
    const serviceConfig = this.options.services[serviceName];
    if (!serviceConfig) {
      throw new Error(`Service '${serviceName}' not found in configuration`);
    }

    const axiosInstance = axios.create({
      baseURL: serviceConfig.baseURL,
      timeout: serviceConfig.timeout || this.options.defaultTimeout || 60000,
      headers: {
        "Content-Type": "application/json",
        ...this.options.defaultHeaders,
        ...serviceConfig.headers,
      },
      withCredentials: Boolean(this.options.defaultHeaders?.withCredentials),
    });

    // Request interceptor
    axiosInstance.interceptors.request.use(
      (config: any) => {
        const accessToken = this.tokenManager.getAccessToken();
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error: any) => Promise.reject(error)
    );

    // Response interceptor
    axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: any) => {
        const originalRequest = error.config;

        if (error?.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          // Use the refresh queue to ensure only one refresh happens at a time
          const newToken = await this.refreshToken();

          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axiosInstance(originalRequest);
          }
        }

        return Promise.reject(error);
      }
    );

    return axiosInstance;
  }

  public getTokenManager(): TokenManager {
    return this.tokenManager;
  }

  public getNotificationManager() {
    return this.notificationManager;
  }

  public getOptions(): ApiClientOptions {
    return this.options;
  }

  private async refreshToken(): Promise<string | null> {
    // If a refresh is already in progress, wait for it
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    // Start a new refresh
    this.refreshPromise = this.performTokenRefresh();

    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      // Clear the promise when done (success or failure)
      this.refreshPromise = null;
    }
  }

  private async performTokenRefresh(): Promise<string | null> {
    const refreshToken = this.tokenManager.getRefreshToken();

    if (!refreshToken) {
      this.options.onUnauthorized?.();
      return null;
    }

    try {
      // If user provided custom refresh handler, use it
      if (this.options.onRefreshRequest) {
        const newToken = await this.options.onRefreshRequest(
          refreshToken,
          axios,
          this.options.services
        );
        if (newToken) {
          this.tokenManager.setAccessToken(newToken);
          this.options.onTokenRefresh?.(newToken);
          return newToken;
        }
      } else {
        // Automatic discovery: pick a service named like "auth" or the first with refreshEndpoint
        const authService = Object.values(this.options.services).find(
          (service) =>
            service.refreshEndpoint ||
            service.name.toLowerCase().includes("auth")
        );

        if (authService) {
          const refreshEndpoint =
            authService.refreshEndpoint || "/auth/refresh";
          const method = authService.refreshMethod || "post";
          const tokenHeader =
            authService.refreshTokenHeaderName || "Authorization";
          const tokenPrefix = authService.refreshTokenPrefix || "Bearer";
          const body = authService.refreshRequestBody || {};

          const response = await axios.request({
            url: `${authService.baseURL}${refreshEndpoint}`,
            method,
            data: method === "post" ? body : undefined,
            headers: {
              [tokenHeader]: `${tokenPrefix} ${refreshToken}`,
            },
          });

          const path = (authService.accessTokenPath || "access_token").split(
            "."
          );
          let newAccessToken: any = response?.data;
          for (const seg of path) newAccessToken = newAccessToken?.[seg];

          if (newAccessToken) {
            this.tokenManager.setAccessToken(newAccessToken);
            this.options.onTokenRefresh?.(newAccessToken);
            return newAccessToken;
          }
        }
      }
    } catch (err) {
      console.error("Refresh token error:", err);
      this.tokenManager.clearTokens();
      this.options.onTokenRefreshError?.(err as Error);
      this.options.onUnauthorized?.();
    }

    return null;
  }
}

export const createAxiosInstance = (config: ApiClientConfig): AxiosInstance => {
  return axios.create({
    baseURL: config.baseURL,
    timeout: config.timeout || 60000,
    headers: {
      "Content-Type": "application/json",
      ...config.headers,
    },
    withCredentials: config.withCredentials || false,
  });
};
