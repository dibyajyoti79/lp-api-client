# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2024-01-20

### 🎉 Major Simplification - Super Simple API Client

This is a complete rewrite focused on simplicity and ease of use. The package now provides only the essential React Query hooks and removes all unnecessary complexity.

### Added

- **Notification Manager** with automatic success/error message handling
- **showNotification** flag on `useMutation` to control notifications per mutation
- **Token Manager** now supports optional `getRefreshToken()` and `setRefreshToken()` methods
- **isRefreshTokenInCookie** flag to support both localStorage and HttpOnly cookie-based auth
- Proper TypeScript types for all configurations (no more `any` types)
- Smart callback handling - ensures both internal logic and user callbacks run correctly
- Support for both localStorage and HttpOnly cookie-based token storage

### Changed

- **BREAKING**: Removed all utility functions (`isAxiosError`, `getErrorMessage`, `buildUrl`, etc.)
- **BREAKING**: Removed all direct API methods (`get`, `post`, `put`, `patch`, `delete`)
- **BREAKING**: Only `useQuery` and `useMutation` hooks are available (no direct API calls)
- **BREAKING**: Removed `name` property from service configuration
- **BREAKING**: Use Axios's built-in `AxiosRequestConfig` type instead of custom types
- Simplified configuration - use `config` property for any Axios configuration
- Removed unnecessary methods from `ApiConfig` (`isInitialized`, `reset`, `getOptions`)
- Improved token refresh mechanism to handle both cookie and localStorage approaches

### Removed

- All utility functions from `src/utils/` directory
- Direct API methods (`get`, `post`, `put`, `patch`, `delete`)
- Complex callback chains
- Custom configuration types in favor of Axios's native types
- Unused service properties (`name`, `timeout` in favor of `config`)

### Migration Guide

```typescript
// Before (1.x.x)
ApiConfig.initialize({
  services: {
    api: {
      name: "api", // ❌ Removed
      baseURL: "https://api.example.com",
      timeout: 30000, // ❌ Removed
    },
  },
  defaultTimeout: 10000, // ❌ Removed
  defaultHeaders: {}, // ❌ Removed
});

// After (2.0.0)
ApiConfig.initialize({
  services: {
    api: {
      baseURL: "https://api.example.com",
      config: { timeout: 30000 }, // ✅ Use Axios config
    },
  },
  notificationManager: {
    // ✅ Added
    success: (message) => console.log(message),
    error: (message) => console.error(message),
  },
  tokenManager: {
    getAccessToken: () => localStorage.getItem("token"),
    setAccessToken: (token) => localStorage.setItem("token", token),
    clearTokens: () => localStorage.clear(),
    getRefreshToken: () => localStorage.getItem("refreshToken"), // ✅ Optional
    setRefreshToken: (token) => localStorage.setItem("refreshToken", token), // ✅ Optional
  },
  isRefreshTokenInCookie: false, // ✅ Added
});
```

### Usage

```typescript
// Create service
const apiService = new ApiService("api");

// Fetch data
const { data } = apiService.useQuery({
  key: ["users"],
  url: "/users",
});

// Mutate data (with automatic notifications)
const mutation = apiService.useMutation({
  url: "/users",
  method: "post",
  keyToInvalidate: { queryKey: ["users"] },
});

// Disable notifications for specific mutation
const silentMutation = apiService.useMutation({
  url: "/users",
  method: "post",
  showNotification: false, // ✅ Control notifications
});
```

## [1.1.0] - 2024-01-15

### Major Changes

- **Simplified Architecture**: Removed complex singleton patterns and unnecessary hooks
- **Direct ApiService Usage**: Users can now directly use `new ApiService(serviceName)` instead of `createServiceClient()`
- **Cleaner API**: Removed `useApiQuery` and `useApiMutation` hooks in favor of service-specific clients
- **Reduced Bundle Size**: Removed unused code and dependencies

### Removed

- `createServiceClient` function (use `new ApiService()` directly)
- `useApiQuery` and `useApiMutation` hooks
- Complex singleton pattern with global variables
- `UseQueryApiProps` and `UseMutationApiProps` types
- Unnecessary ApiClient class methods

### Simplified Usage

```typescript
// Initialize once
ApiConfig.initialize(config);

// Create service client directly
const postsService = new ApiService("posts");

// Use React Query hooks directly
const { data } = postsService.useQuery({...});
const mutation = postsService.useMutation({...});
```

## [1.0.5] - 2024-01-15

### Fixed

- Implemented true global singleton using globalThis/global/window objects for cross-module persistence
- Added auto-initialization with sensible defaults when no config is provided
- Removed strict initialization requirement - now works seamlessly across all modules
- Enhanced singleton pattern to work reliably in Next.js, Webpack, and other modern bundlers
- Added graceful fallback to prevent initialization errors

### Improved

- Better error handling with auto-initialization warnings
- Simplified usage - initialize once in root, use anywhere without additional imports
- More robust singleton implementation that persists across module boundaries

## [1.0.4] - 2024-01-15

### Fixed

- Fixed singleton pattern to work across module boundaries in modern bundlers (Next.js, Webpack, etc.)
- Replaced static class property with global variable to ensure singleton persistence
- Added `isInitialized()`, `reset()`, and `getDebugInfo()` utility methods to ApiConfig
- Improved error messages in ApiService constructor with better debugging information
- Enhanced test coverage for new singleton implementation

## [1.0.3] - 2024-01-15

### Fixed

- Fixed ApiConfig initialization issue where `getInstance()` method was incorrectly requiring options parameter even when instance already existed
- Improved singleton pattern implementation to properly handle initialization flow
- Resolved "ApiConfig must be initialized with options first" error when using hooks after calling `ApiConfig.initialize()`

## [1.0.2] - 2024-01-15

### Fixed

- Fixed ESM bundle import resolution issue where `require()` calls were causing module resolution errors in Next.js and other bundlers
- Replaced dynamic `require()` imports with proper ES6 imports in hooks module
- Ensured both CommonJS and ESM bundles work correctly across different environments

## [1.0.1] - 2024-01-10

### Fixed

- Minor bug fixes and improvements

## [1.0.0] - 2024-01-01

### Added

- Initial release of @learningpad/api-client
- React Query integration with custom hooks
- TypeScript support with comprehensive type definitions
- Service-oriented architecture for organizing APIs
- Automatic token management and refresh
- Error handling utilities and interceptors
- Customizable notification system
- Retry logic and caching configuration
- Direct API methods for non-React usage
- Comprehensive documentation and examples
- Jest test suite with coverage reporting
- ESLint configuration for code quality
- Rollup build configuration for multiple formats

### Features

- `useApiQuery` hook for data fetching
- `useApiMutation` hook for data mutations
- Service-specific hook creators
- Automatic request/response interceptors
- Token refresh on 401 errors
- Configurable retry logic
- Query invalidation on mutations
- Success/error message handling
- Type-safe API calls
- Universal compatibility (browser/Node.js)

### Documentation

- Complete README with examples
- TypeScript type definitions
- Real-world usage examples
- API reference documentation
- Contributing guidelines
