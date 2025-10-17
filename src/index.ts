// Core API Client
export { createServiceClient } from "./ApiClient";
export { ApiConfig } from "./config";

// Hooks for both approaches
export { useApiQuery, useApiMutation } from "./hooks";

// Types
export type {
  ApiError,
  UseQueryApiProps,
  UseMutationApiProps,
  TokenManager,
  NotificationManager,
  ApiServiceConfig,
  ApiClientOptions,
} from "./types";

// Utilities
export { isAxiosError, getErrorMessage, getErrorStatus } from "./utils";
