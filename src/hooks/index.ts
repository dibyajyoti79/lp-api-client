import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError, AxiosRequestConfig } from "axios";
import { UseQueryApiProps, UseMutationApiProps, ApiError } from "../types";
import { ApiConfig } from "../config";
import { ApiService } from "../services/ApiService";

// Hook for creating query hooks with a specific service
export const createUseQuery = (serviceName: string) => {
  return <TData>({
    key,
    url,
    enabled = true,
    method = "get",
    config,
    params,
    data,
    options = {},
  }: UseQueryApiProps<TData>) => {
    const apiService = new ApiService(serviceName);
    return apiService.useQuery({
      key,
      url,
      enabled,
      method,
      config,
      params,
      data,
      options,
    });
  };
};

// Hook for creating mutation hooks with a specific service
export const createUseMutation = (serviceName: string) => {
  return <TData, TParams = unknown>({
    keyToInvalidate,
    url,
    method = "post",
    config,
    options,
    successMessage,
    errorMessage,
  }: UseMutationApiProps<TData, TParams>) => {
    const apiService = new ApiService(serviceName);
    return apiService.useMutation({
      keyToInvalidate,
      url,
      method,
      config,
      options,
      successMessage,
      errorMessage,
    });
  };
};

// Generic query hook
export const useApiQuery = <TData>({
  serviceName,
  key,
  url,
  enabled = true,
  method = "get",
  config,
  params,
  data,
  options = {},
}: UseQueryApiProps<TData> & { serviceName: string }) => {
  const apiService = new ApiService(serviceName);
  return apiService.useQuery({
    key,
    url,
    enabled,
    method,
    config,
    params,
    data,
    options,
  });
};

// Generic mutation hook
export const useApiMutation = <TData, TParams = unknown>({
  serviceName,
  keyToInvalidate,
  url,
  method = "post",
  config,
  options,
  successMessage,
  errorMessage,
}: UseMutationApiProps<TData, TParams> & { serviceName: string }) => {
  const apiService = new ApiService(serviceName);
  return apiService.useMutation({
    keyToInvalidate,
    url,
    method,
    config,
    options,
    successMessage,
    errorMessage,
  });
};
