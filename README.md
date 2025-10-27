# 🚀 LearningPad API Client

A super simple, type-safe API client built on top of React Query and Axios with automatic token management and notifications.

## ✨ Features

- 🚀 **React Query Hooks Only** - Simple `useQuery` and `useMutation` hooks
- 🔐 **Automatic Token Management** - Handles refresh with localStorage or HttpOnly cookies
- 🎯 **Service-Oriented** - Organize APIs by service
- 📱 **Auto Notifications** - Success/error messages handled automatically
- 🛡️ **Type-Safe** - Full TypeScript support
- 🔄 **Smart Refresh** - Only one refresh call even when multiple APIs fail with 401
- ⚙️ **Axios Config** - Use any Axios configuration directly
- 📦 **Zero Bloat** - No unnecessary utilities, just the essentials

## 📦 Installation

```bash
npm install @learningpad/api-client @tanstack/react-query
```

## ⚡ Quick Start

```typescript
import { ApiConfig, ApiService } from "@learningpad/api-client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// 1. Initialize configuration
ApiConfig.initialize({
  services: {
    api: {
      baseURL: "https://api.example.com",
      config: { timeout: 30000 }, // Use Axios config
    },
  },
  tokenManager: {
    getAccessToken: () => localStorage.getItem("token"),
    setAccessToken: (token) => localStorage.setItem("token", token),
    clearTokens: () => localStorage.clear(),
  },
  notificationManager: {
    success: (message) => console.log("✅", message),
    error: (message) => console.error("❌", message),
  },
  onUnauthorized: () => (window.location.href = "/login"),
});

// 2. Create service client
const apiService = new ApiService("api");

// 3. Use React Query hooks
const { data, isLoading } = apiService.useQuery({
  key: ["users"],
  url: "/users",
});

// 4. Mutations with automatic notifications
const mutation = apiService.useMutation({
  url: "/users",
  method: "post",
  keyToInvalidate: { queryKey: ["users"] },
});
```

## 🎯 Complete Example

```typescript
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ApiConfig, ApiService } from "@learningpad/api-client";

// Token manager with optional refresh token support
const tokenManager = {
  getAccessToken: () => localStorage.getItem("accessToken"),
  setAccessToken: (token: string) => localStorage.setItem("accessToken", token),
  clearTokens: () => localStorage.clear(),
  getRefreshToken: () => localStorage.getItem("refreshToken"), // Optional
  setRefreshToken: (token: string) =>
    localStorage.setItem("refreshToken", token), // Optional
};

// Initialize
ApiConfig.initialize({
  services: {
    api: {
      baseURL: "https://api.example.com",
      refreshEndpoint: "/auth/refresh", // Optional: for token refresh
      config: {
        withCredentials: true, // Use with credentials if needed
        timeout: 30000,
      },
    },
  },
  tokenManager,
  isRefreshTokenInCookie: false, // false = localStorage, true = HttpOnly cookie
  notificationManager: {
    success: (message) => toast.success(message),
    error: (message) => toast.error(message),
  },
  onUnauthorized: () => (window.location.href = "/login"),
});

// Create service
const apiService = new ApiService("api");

// Component
function App() {
  // Query
  const { data: users, isLoading } = apiService.useQuery({
    key: ["users"],
    url: "/users",
  });

  // Mutation with notifications
  const createUser = apiService.useMutation({
    url: "/users",
    method: "post",
    keyToInvalidate: { queryKey: ["users"] },
  });

  // Mutation without notifications
  const silentMutation = apiService.useMutation({
    url: "/users",
    method: "delete",
    showNotification: false, // Disable notifications
  });

  return (
    <div>
      <button onClick={() => createUser.mutate({ name: "John" })}>
        Create User
      </button>
      {isLoading && <div>Loading...</div>}
    </div>
  );
}

// Wrap with QueryClientProvider
const queryClient = new QueryClient();
<QueryClientProvider client={queryClient}>
  <App />
</QueryClientProvider>;
```

## 🔧 Configuration Options

### ServiceConfig

```typescript
{
  baseURL: string;                    // Base URL for the service
  refreshEndpoint?: string;           // Optional: endpoint for token refresh
  config?: AxiosRequestConfig;       // Any Axios configuration
}
```

### TokenManager

```typescript
{
  getAccessToken: () => string | null;
  setAccessToken: (token: string) => void;
  clearTokens: () => void;
  getRefreshToken?: () => string | null;     // Optional
  setRefreshToken?: (token: string) => void; // Optional
}
```

### ApiClientOptions

```typescript
{
  services: Record<string, ServiceConfig>;
  tokenManager?: TokenManager;
  notificationManager?: { success: (msg: string) => void; error: (msg: string) => void; };
  isRefreshTokenInCookie?: boolean; // true = HttpOnly cookie, false = localStorage
  onUnauthorized?: () => void;
}
```

## 🎨 Usage Patterns

### With HttpOnly Cookies

```typescript
ApiConfig.initialize({
  services: {
    api: {
      baseURL: "https://api.example.com",
      refreshEndpoint: "/auth/refresh",
      config: { withCredentials: true },
    },
  },
  tokenManager: {
    getAccessToken: () => getAccessToken(), // Read from state/memory
    setAccessToken: (token) => setAccessToken(token), // Save to state
    clearTokens: () => clearTokens(),
  },
  isRefreshTokenInCookie: true, // ✅ Use HttpOnly cookie
  onUnauthorized: () => logout(),
});
```

### With localStorage

```typescript
ApiConfig.initialize({
  services: {
    api: {
      baseURL: "https://api.example.com",
      refreshEndpoint: "/auth/refresh",
    },
  },
  tokenManager: {
    getAccessToken: () => localStorage.getItem("accessToken"),
    setAccessToken: (token) => localStorage.setItem("accessToken", token),
    clearTokens: () => localStorage.clear(),
    getRefreshToken: () => localStorage.getItem("refreshToken"), // ✅ Optional
    setRefreshToken: (token) => localStorage.setItem("refreshToken", token), // ✅ Optional
  },
  isRefreshTokenInCookie: false, // ✅ Use localStorage
  onUnauthorized: () => (window.location.href = "/login"),
});
```

## 📚 Documentation

- **[Demo Examples](./demo/)** - Working examples
- **[Changelog](./CHANGELOG.md)** - Version history
- **[Contributing](./CONTRIBUTING.md)** - How to contribute

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md).

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.
