import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ApiService } from "../services/ApiService";
import { ApiConfig } from "../config";

// Mock axios
jest.mock("axios");
const mockAxios = require("axios");

// Mock the ApiConfig
jest.mock("../config", () => ({
  ApiConfig: {
    getInstance: jest.fn(() => ({
      createAxiosInstance: jest.fn(() => mockAxios),
      getNotificationManager: jest.fn(() => ({
        success: jest.fn(),
        error: jest.fn(),
      })),
    })),
    initialize: jest.fn(),
    reset: jest.fn(),
  },
}));

describe("ApiService", () => {
  let queryClient: QueryClient;
  let wrapper: React.FC<{ children: React.ReactNode }>;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
        mutations: {
          retry: false,
        },
      },
    });

    wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    // Reset mocks
    jest.clearAllMocks();
  });

  describe("useQuery", () => {
    it("should fetch data successfully", async () => {
      const mockData = { id: 1, name: "Test User" };
      mockAxios.mockResolvedValue({ data: mockData });

      const apiService = new ApiService("test");
      const { result } = renderHook(
        () =>
          apiService.useQuery({
            key: ["users"],
            url: "/users",
          }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockData);
    });

    it("should handle errors", async () => {
      const mockError = new Error("Network error");
      mockAxios.mockRejectedValue(mockError);

      const apiService = new ApiService("test");
      const { result } = renderHook(
        () =>
          apiService.useQuery({
            key: ["users"],
            url: "/users",
          }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(mockError);
    });

    it("should respect enabled option", () => {
      const apiService = new ApiService("test");
      const { result } = renderHook(
        () =>
          apiService.useQuery({
            key: ["users"],
            url: "/users",
            enabled: false,
          }),
        { wrapper }
      );

      expect(result.current.isLoading).toBe(false);
      expect(mockAxios).not.toHaveBeenCalled();
    });
  });

  describe("useMutation", () => {
    it("should mutate data successfully", async () => {
      const mockData = { id: 1, name: "New User" };
      mockAxios.mockResolvedValue({ data: mockData });

      const apiService = new ApiService("test");
      const { result } = renderHook(
        () =>
          apiService.useMutation({
            url: "/users",
            method: "post",
          }),
        { wrapper }
      );

      result.current.mutate({ name: "New User" });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockData);
    });

    it("should handle mutation errors", async () => {
      const mockError = new Error("Mutation failed");
      mockAxios.mockRejectedValue(mockError);

      const apiService = new ApiService("test");
      const { result } = renderHook(
        () =>
          apiService.useMutation({
            url: "/users",
            method: "post",
          }),
        { wrapper }
      );

      result.current.mutate({ name: "New User" });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(mockError);
    });
  });
});
