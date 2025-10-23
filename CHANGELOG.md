# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
