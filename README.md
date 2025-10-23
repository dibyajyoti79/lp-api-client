# 🚀 LearningPad API Client

A powerful, type-safe API client built on top of React Query and Axios with automatic token management, error handling, and seamless integration with React applications.

## ✨ Features

- 🚀 **Built on React Query** - Leverages the power of TanStack Query for caching, background updates, and more
- 🔐 **Automatic Token Management** - Handles access token refresh automatically
- 🛡️ **Type-Safe** - Full TypeScript support with comprehensive type definitions
- 🎯 **Service-Oriented** - Organize your APIs by service with easy configuration
- 🔄 **Smart Retry Mechanism** - Only one token refresh happens even when multiple APIs fail with 401 simultaneously
- 📱 **React Hooks** - Easy-to-use hooks for queries and mutations
- 🎨 **Customizable** - Flexible configuration and error handling
- 📦 **Zero Dependencies** - Only requires React Query and Axios as peer dependencies
- 🌐 **Universal** - Works in both browser and Node.js environments

## 📦 Installation

```bash
npm install @learningpad/api-client @tanstack/react-query
# or
yarn add @learningpad/api-client @tanstack/react-query
# or
pnpm add @learningpad/api-client @tanstack/react-query
```

## ⚡ Quick Start

```typescript
import { ApiConfig, ApiService } from "@learningpad/api-client";

// 1. Initialize configuration
ApiConfig.initialize({
  services: {
    api: {
      name: "api",
      baseURL: "https://api.example.com",
    },
  },
});

// 2. Create service client
const apiService = new ApiService("api");

// 3. Use React Query hooks
const { data, isLoading, error } = apiService.useQuery({
  key: ["users"],
  url: "/users",
});

const createUser = apiService.useMutation({
  keyToInvalidate: { queryKey: ["users"] },
  url: "/users",
  method: "post",
});
```

## 📚 Documentation

- **[🚀 Setup Guide](./SETUP_GUIDE.md)** - Complete setup instructions with folder structure
- **[💻 Quick Example](./QUICK_EXAMPLE.md)** - Copy & paste working example

## 🎯 What You Get

### Automatic Features

- **Loading states** - `isLoading`, `isPending`
- **Error handling** - Automatic error catching and display
- **Caching** - Smart caching with React Query
- **Retry logic** - Automatic retries on failure
- **Token management** - Automatic token refresh
- **Notifications** - Success/error messages

### Available Methods

| Method                     | Purpose                  | Usage                           |
| -------------------------- | ------------------------ | ------------------------------- |
| `ApiConfig.initialize()`   | Initialize global config | `ApiConfig.initialize(options)` |
| `new ApiService()`         | Create service client    | `new ApiService("serviceName")` |
| `apiService.useQuery()`    | Fetch data               | `apiService.useQuery({...})`    |
| `apiService.useMutation()` | Create/Update/Delete     | `apiService.useMutation({...})` |

## 🚀 Next Steps

1. **Follow the [Setup Guide](./SETUP_GUIDE.md)** for detailed instructions
2. **Check out [examples](./demo/)** for more complex use cases

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

**Ready to get started?** Check out our [Quick Setup Guide](./SETUP_GUIDE.md)!
