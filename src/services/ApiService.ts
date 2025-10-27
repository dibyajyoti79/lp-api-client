import { AxiosError } from "axios";
import { AxiosRequestConfig } from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiConfig } from "../config";
import { ApiError } from "../types";
import {
  InvalidateQueryFilters,
  UseMutationOptions,
  UseQueryOptions,
} from "@tanstack/react-query";

// Local types for hooks
interface UseQueryApiProps<TData> {
  key: unknown[];
  url: string;
  enabled?: boolean;
  method?: "get" | "post";
  config?: Omit<AxiosRequestConfig, "url" | "method">;
  params?: Record<string, unknown>;
  data?: Record<string, unknown>;
  options?: Omit<UseQueryOptions<TData, AxiosError>, "queryKey" | "queryFn">;
}

interface UseMutationApiProps<TData, TParams> {
  keyToInvalidate?: InvalidateQueryFilters<readonly unknown[]>;
  url: string;
  method?: "post" | "put" | "patch" | "delete";
  config?: Omit<AxiosRequestConfig, "url" | "method">;
  showNotification?: boolean; // Default true
  options?: Omit<
    UseMutationOptions<TData, AxiosError<ApiError>, TParams>,
    "mutationFn"
  >;
}

export class ApiService {
  private axiosInstance: any;

  constructor(serviceName: string) {
    const config = ApiConfig.getInstance();
    this.axiosInstance = config.createAxiosInstance(serviceName);
  }

  public useQuery<TData>({
    key,
    url,
    enabled = true,
    method = "get",
    config: requestConfig,
    params,
    data,
    options = {},
  }: UseQueryApiProps<TData>) {
    const fetchData = async (): Promise<TData> => {
      const res = await this.axiosInstance({
        url,
        method,
        params,
        data,
        ...requestConfig,
      });
      return res.data;
    };

    const queryResult = useQuery<TData, AxiosError>({
      queryKey: [...key],
      queryFn: fetchData,
      enabled,
      staleTime: options.staleTime ?? 1000 * 60 * 5, // 5 minutes default
      ...options,
    });

    return queryResult;
  }

  public useMutation<TData, TParams = unknown>({
    keyToInvalidate,
    url,
    method = "post",
    config: requestConfig,
    showNotification = true,
    options,
  }: UseMutationApiProps<TData, TParams>) {
    const queryClient = useQueryClient();
    const config = ApiConfig.getInstance();
    const notificationManager = config.getNotificationManager();

    const mutateData = async (params: TParams): Promise<TData> => {
      const res = await this.axiosInstance({
        url,
        method,
        data: params,
        ...requestConfig,
      });

      return res.data;
    };

    // Get user's callbacks before overriding
    const userOnSuccess = options?.onSuccess;
    const userOnError = options?.onError;

    return useMutation<TData, AxiosError<ApiError>, TParams>({
      mutationKey: [url, method],
      mutationFn: mutateData,
      ...options,
      onSuccess: (data, variables, context, mutation) => {
        // Show notification if response has message field
        if (showNotification && notificationManager && (data as any)?.message) {
          notificationManager.success((data as any).message);
        }

        // Invalidate queries if needed
        if (keyToInvalidate) {
          queryClient.invalidateQueries(keyToInvalidate);
        }

        // Call user's callback
        userOnSuccess?.(data, variables, context, mutation);
      },
      onError: (error, variables, context, mutation) => {
        // Show error notification
        if (showNotification && notificationManager) {
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "An error occurred";
          notificationManager.error(errorMessage);
        }

        // Call user's callback
        userOnError?.(error, variables, context, mutation);
      },
    });
  }
}
