import {
  isAxiosError,
  getErrorMessage,
  getErrorStatus,
  isNetworkError,
  isTimeoutError,
  buildUrl,
  createQueryKey,
  createRetryConfig,
  createCacheConfig,
} from "../utils";
import { AxiosError } from "axios";

describe("Utils", () => {
  describe("isAxiosError", () => {
    it("should return true for AxiosError", () => {
      const error = new Error("Test error") as AxiosError;
      error.isAxiosError = true;
      expect(isAxiosError(error)).toBe(true);
    });

    it("should return false for regular Error", () => {
      const error = new Error("Test error");
      expect(isAxiosError(error)).toBe(false);
    });

    it("should return false for non-error objects", () => {
      expect(isAxiosError("string")).toBe(false);
      expect(isAxiosError(123)).toBe(false);
      expect(isAxiosError(null)).toBe(false);
      expect(isAxiosError(undefined)).toBe(false);
    });
  });

  describe("getErrorMessage", () => {
    it("should extract message from AxiosError with string detail", () => {
      const error = {
        isAxiosError: true,
        response: {
          data: {
            detail: "Custom error message",
          },
        },
      } as AxiosError;
      expect(getErrorMessage(error)).toBe("Custom error message");
    });

    it("should extract message from AxiosError with object detail", () => {
      const error = {
        isAxiosError: true,
        response: {
          data: {
            detail: {
              message: "Object error message",
            },
          },
        },
      } as AxiosError;
      expect(getErrorMessage(error)).toBe("Object error message");
    });

    it("should fallback to statusText", () => {
      const error = {
        isAxiosError: true,
        response: {
          statusText: "Not Found",
        },
      } as AxiosError;
      expect(getErrorMessage(error)).toBe("Not Found");
    });

    it("should fallback to error message", () => {
      const error = {
        isAxiosError: true,
        message: "Network Error",
      } as AxiosError;
      expect(getErrorMessage(error)).toBe("Network Error");
    });

    it("should handle regular Error", () => {
      const error = new Error("Regular error");
      expect(getErrorMessage(error)).toBe("Regular error");
    });

    it("should handle unknown error types", () => {
      expect(getErrorMessage("string error")).toBe("An unknown error occurred");
      expect(getErrorMessage(123)).toBe("An unknown error occurred");
    });
  });

  describe("getErrorStatus", () => {
    it("should return status from AxiosError", () => {
      const error = {
        isAxiosError: true,
        response: {
          status: 404,
        },
      } as AxiosError;
      expect(getErrorStatus(error)).toBe(404);
    });

    it("should return null for non-AxiosError", () => {
      const error = new Error("Test error");
      expect(getErrorStatus(error)).toBe(null);
    });
  });

  describe("isNetworkError", () => {
    it("should return true for network error", () => {
      const error = {
        isAxiosError: true,
        response: undefined,
      } as AxiosError;
      expect(isNetworkError(error)).toBe(true);
    });

    it("should return false for error with response", () => {
      const error = {
        isAxiosError: true,
        response: {
          status: 404,
        },
      } as AxiosError;
      expect(isNetworkError(error)).toBe(false);
    });
  });

  describe("isTimeoutError", () => {
    it("should return true for timeout error", () => {
      const error = {
        isAxiosError: true,
        code: "ECONNABORTED",
      } as AxiosError;
      expect(isTimeoutError(error)).toBe(true);
    });

    it("should return false for non-timeout error", () => {
      const error = {
        isAxiosError: true,
        code: "ENOTFOUND",
      } as AxiosError;
      expect(isTimeoutError(error)).toBe(false);
    });
  });

  describe("buildUrl", () => {
    it("should build URL with base and path", () => {
      const url = buildUrl("https://api.example.com", "/users");
      expect(url).toBe("https://api.example.com/users");
    });

    it("should build URL with query parameters", () => {
      const url = buildUrl("https://api.example.com", "/users", {
        page: 1,
        limit: 10,
        search: "test",
      });
      expect(url).toBe(
        "https://api.example.com/users?page=1&limit=10&search=test"
      );
    });

    it("should handle undefined and null values", () => {
      const url = buildUrl("https://api.example.com", "/users", {
        page: 1,
        limit: undefined,
        search: null,
        active: true,
      });
      expect(url).toBe("https://api.example.com/users?page=1&active=true");
    });
  });

  describe("createQueryKey", () => {
    it("should create query key with prefix and suffixes", () => {
      const key = createQueryKey("users", 1, "profile");
      expect(key).toEqual(["users", 1, "profile"]);
    });

    it("should create query key with only prefix", () => {
      const key = createQueryKey("users");
      expect(key).toEqual(["users"]);
    });
  });

  describe("createRetryConfig", () => {
    it("should create retry config with default values", () => {
      const config = createRetryConfig();
      expect(config.retry(0, new Error())).toBe(true);
      expect(config.retry(3, new Error())).toBe(false);
      expect(config.retryDelay(0)).toBe(1000);
      expect(config.retryDelay(1)).toBe(2000);
      expect(config.retryDelay(2)).toBe(4000);
    });

    it("should create retry config with custom values", () => {
      const config = createRetryConfig(2, 500);
      expect(config.retry(0, new Error())).toBe(true);
      expect(config.retry(2, new Error())).toBe(false);
      expect(config.retryDelay(0)).toBe(500);
      expect(config.retryDelay(1)).toBe(1000);
    });

    it("should not retry on 4xx errors", () => {
      const config = createRetryConfig();
      const error = {
        isAxiosError: true,
        response: { status: 400 },
      } as AxiosError;
      expect(config.retry(0, error)).toBe(false);
    });

    it("should retry on 5xx errors", () => {
      const config = createRetryConfig();
      const error = {
        isAxiosError: true,
        response: { status: 500 },
      } as AxiosError;
      expect(config.retry(0, error)).toBe(true);
    });
  });

  describe("createCacheConfig", () => {
    it("should create cache config with default values", () => {
      const config = createCacheConfig();
      expect(config.staleTime).toBe(5 * 60 * 1000);
      expect(config.cacheTime).toBe(10 * 60 * 1000);
    });

    it("should create cache config with custom values", () => {
      const config = createCacheConfig(1000, 2000);
      expect(config.staleTime).toBe(1000);
      expect(config.cacheTime).toBe(2000);
    });
  });
});
