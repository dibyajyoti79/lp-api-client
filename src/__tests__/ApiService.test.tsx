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
    isInitialized: jest.fn(() => true),
    initialize: jest.fn(),
    reset: jest.fn(),
    getDebugInfo: jest.fn(() => ({ initialized: true, services: ["test"] })),
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

  describe("Direct API methods", () => {
    it("should make GET request", async () => {
      const mockData = { id: 1, name: "Test User" };
      mockAxios.get.mockResolvedValue({ data: mockData });

      const apiService = new ApiService("test");
      const result = await apiService.get("/users");

      expect(mockAxios.get).toHaveBeenCalledWith("/users", undefined);
      expect(result).toEqual(mockData);
    });

    it("should make POST request", async () => {
      const mockData = { id: 1, name: "New User" };
      const requestData = { name: "New User" };
      mockAxios.post.mockResolvedValue({ data: mockData });

      const apiService = new ApiService("test");
      const result = await apiService.post("/users", requestData);

      expect(mockAxios.post).toHaveBeenCalledWith(
        "/users",
        requestData,
        undefined
      );
      expect(result).toEqual(mockData);
    });

    it("should make PUT request", async () => {
      const mockData = { id: 1, name: "Updated User" };
      const requestData = { name: "Updated User" };
      mockAxios.put.mockResolvedValue({ data: mockData });

      const apiService = new ApiService("test");
      const result = await apiService.put("/users/1", requestData);

      expect(mockAxios.put).toHaveBeenCalledWith(
        "/users/1",
        requestData,
        undefined
      );
      expect(result).toEqual(mockData);
    });

    it("should make DELETE request", async () => {
      mockAxios.delete.mockResolvedValue({ data: {} });

      const apiService = new ApiService("test");
      await apiService.delete("/users/1");

      expect(mockAxios.delete).toHaveBeenCalledWith("/users/1", undefined);
    });
  });
});
