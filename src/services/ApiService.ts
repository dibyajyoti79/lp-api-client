import { AxiosError, AxiosRequestConfig } from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiConfig } from "../config";
import { UseQueryApiProps, UseMutationApiProps, ApiError } from "../types";

export class ApiService {
  private serviceName: string;
  private axiosInstance: any;
  private config: ApiConfig;

  constructor(serviceName: string) {
    this.serviceName = serviceName;

    // Check if ApiConfig is initialized
    if (!ApiConfig.isInitialized()) {
      throw new Error(
        `ApiConfig must be initialized before creating ApiService for '${serviceName}'. ` +
          `Please call ApiConfig.initialize(options) in your app setup. ` +
          `Make sure to import your config file before using any hooks.`
      );
    }

    this.config = ApiConfig.getInstance();
    this.axiosInstance = this.config.createAxiosInstance(serviceName);
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
      queryKey: [...key, params, data],
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
    options,
    successMessage,
    errorMessage,
  }: UseMutationApiProps<TData, TParams>) {
    const queryClient = useQueryClient();
    const notificationManager = this.config.getNotificationManager();

    const mutateData = async (params: TParams): Promise<TData> => {
      const res = await this.axiosInstance({
        url,
        method,
        data: params,
        ...requestConfig,
        headers: {
          ...requestConfig?.headers,
        },
      });
      return res.data;
    };

    return useMutation<TData, AxiosError<ApiError>, TParams>({
      ...options,
      mutationKey: [url, method],
      mutationFn: mutateData,
      onSuccess: (
        data: any,
        variables: any,
        onMutateResult: any,
        context: any
      ) => {
        if (successMessage && notificationManager) {
          notificationManager.success(successMessage);
        }
        if (keyToInvalidate) {
          queryClient.invalidateQueries(keyToInvalidate);
        }
        options?.onSuccess?.(data, variables, onMutateResult, context);
      },
      onError: (
        error: any,
        variables: any,
        onMutateResult: any,
        context: any
      ) => {
        if (errorMessage && notificationManager) {
          notificationManager.error(errorMessage);
        }
        options?.onError?.(error, variables, onMutateResult, context);
      },
      onSettled: (
        data: any,
        error: any,
        variables: any,
        onMutateResult: any,
        context: any
      ) => {
        options?.onSettled?.(data, error, variables, onMutateResult, context);
      },
    });
  }

  // Direct API methods for non-React usage
  public async get<TData>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<TData> {
    const response = await this.axiosInstance.get(url, config);
    return response.data;
  }

  public async post<TData, TParams = unknown>(
    url: string,
    data?: TParams,
    config?: AxiosRequestConfig
  ): Promise<TData> {
    const response = await this.axiosInstance.post(url, data, config);
    return response.data;
  }

  public async put<TData, TParams = unknown>(
    url: string,
    data?: TParams,
    config?: AxiosRequestConfig
  ): Promise<TData> {
    const response = await this.axiosInstance.put(url, data, config);
    return response.data;
  }

  public async patch<TData, TParams = unknown>(
    url: string,
    data?: TParams,
    config?: AxiosRequestConfig
  ): Promise<TData> {
    const response = await this.axiosInstance.patch(url, data, config);
    return response.data;
  }

  public async delete<TData>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<TData> {
    const response = await this.axiosInstance.delete(url, config);
    return response.data;
  }
}
