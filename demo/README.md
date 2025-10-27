# Demo Examples

This folder contains working examples of the @learningpad/api-client package.

## Examples

### 1. `simple-approach1.tsx` - Basic Service Client

Shows the simplest way to use the API client with automatic notifications:

- Initialize configuration with notificationManager
- Create a single service client
- Use React Query hooks (useQuery, useMutation)
- Automatic success/error notifications

```typescript
ApiConfig.initialize({
  services: {
    jsonplaceholder: {
      baseURL: "https://jsonplaceholder.typicode.com",
    },
  },
  notificationManager: {
    success: (message) => console.log("✅", message),
    error: (message) => console.error("❌", message),
  },
});

const apiService = new ApiService("jsonplaceholder");
const { data } = apiService.useQuery({ key: ["posts"], url: "/posts" });
const mutation = apiService.useMutation({ url: "/posts", method: "post" });
```

### 2. `simple-approach2.tsx` - Multiple Services with Token Management

Demonstrates using multiple services with token management:

- Multiple services configuration
- Token manager with refresh token support
- Automatic token refresh on 401
- Separate service clients for different APIs

```typescript
const tokenManager = {
  getAccessToken: () => localStorage.getItem("accessToken"),
  setAccessToken: (token: string) => localStorage.setItem("accessToken", token),
  clearTokens: () => localStorage.clear(),
  getRefreshToken: () => localStorage.getItem("refreshToken"),
  setRefreshToken: (token: string) =>
    localStorage.setItem("refreshToken", token),
};

ApiConfig.initialize({
  services: {
    jsonplaceholder: { baseURL: "https://jsonplaceholder.typicode.com" },
    auth: {
      baseURL: "https://api.example.com",
      refreshEndpoint: "/auth/refresh",
    },
  },
  tokenManager,
  isRefreshTokenInCookie: false, // localStorage, not HttpOnly cookie
  notificationManager: {
    /* ... */
  },
});
```

### 3. `comprehensive-example.tsx` - Full Featured

Complete example with all features:

- Multiple services (posts, users, auth)
- Token management with optional refresh token methods
- Notification manager
- All CRUD operations (Create, Read, Update, Delete)
- Query invalidation
- showNotification flag to control notifications
- Cookie-based refresh token support

## Key Features Demonstrated

- ✅ **Service-Oriented Architecture**: Organize APIs by service
- ✅ **React Query Hooks Only**: Just useQuery and useMutation
- ✅ **TypeScript Support**: Full type safety
- ✅ **Token Management**: Automatic token refresh with localStorage or HttpOnly cookies
- ✅ **Notification Manager**: Automatic success/error messages
- ✅ **Axios Configuration**: Pass any Axios config via `config` property
- ✅ **Query Invalidation**: Auto-invalidate queries after mutations
- ✅ **Loading States**: Built-in loading and pending states

## How to Run

1. Install dependencies:

```bash
npm install @learningpad/api-client @tanstack/react-query react react-dom
```

2. Copy any example file to your React project

3. Import and use in your app:

```typescript
import SimpleExample from "./simple-approach1";
```

## Configuration Options

```typescript
ApiConfig.initialize({
  services: {
    api: {
      baseURL: "https://api.example.com",
      refreshEndpoint: "/auth/refresh", // Optional
      config: {
        // Use any Axios config
        withCredentials: true,
        timeout: 30000,
      },
    },
  },
  tokenManager: {
    /* Required methods + optional getRefreshToken/setRefreshToken */
  },
  isRefreshTokenInCookie: false, // true = HttpOnly cookie, false = localStorage
  notificationManager: { success, error },
  onUnauthorized: () => {},
});
```

## Best Practices

1. **Initialize once**: Call `ApiConfig.initialize()` in your app setup
2. **Create service clients**: Use `new ApiService(serviceName)` for each API
3. **Use hooks only**: Only `useQuery` and `useMutation` available (no direct API methods)
4. **Handle notifications**: Set up `notificationManager` for automatic messages
5. **Token management**: Use localStorage for manual refresh, HttpOnly cookies for secure
6. **Query invalidation**: Use `keyToInvalidate` to update cache after mutations
7. **Show notifications**: Use `showNotification: false` to disable for specific mutations
