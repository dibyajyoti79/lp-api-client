// Main exports
export { ApiClient, createApiClient, createServiceClient } from "./ApiClient";
export { ApiConfig } from "./config";
export { ApiService } from "./services/ApiService";

// Hooks
export {
  createUseQuery,
  createUseMutation,
  useApiQuery,
  useApiMutation,
} from "./hooks";

// Types
export type {
  ApiError,
  UseQueryApiProps,
  UseMutationApiProps,
  ApiClientConfig,
  TokenManager,
  NotificationManager,
  ApiServiceConfig,
  ApiClientOptions,
} from "./types";

// Utilities
export {
  isAxiosError,
  getErrorMessage,
  getErrorStatus,
  isNetworkError,
  isTimeoutError,
  buildUrl,
  createQueryKey,
  createRetryConfig,
  createCacheConfig,
  createRequestInterceptor,
  createResponseInterceptor,
  createErrorInterceptor,
} from "./utils";

// Default export
import { ApiClient } from "./ApiClient";
export default ApiClient;
