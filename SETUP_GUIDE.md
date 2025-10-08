# 🚀 Quick Setup Guide - LearningPad API Client

Get your API client up and running in just 5 minutes!

## 📦 Installation

```bash
npm install @learningpad/api-client
# or
yarn add @learningpad/api-client
# or
pnpm add @learningpad/api-client
```

## ⚡ Quick Start (3 Steps)

### Step 1: Create API Configuration File

Create `src/api/config.ts`:

```typescript
import { ApiClientOptions, ApiConfig } from "@learningpad/api-client";

// Your API configuration
const apiConfig: ApiClientOptions = {
  services: {
    // Your main API service
    api: {
      name: "api",
      baseURL: "https://your-api.com/api/v1", // Replace with your API URL
      timeout: 10000,
    },
    // Optional: Auth service for token management
    auth: {
      name: "auth",
      baseURL: "https://your-api.com/auth",
      timeout: 10000,
      refreshEndpoint: "/refresh", // For token refresh
    },
  },
  defaultTimeout: 10000,
  defaultHeaders: {
    "Content-Type": "application/json",
  },
  // Token management (optional)
  tokenManager: {
    getAccessToken: () => localStorage.getItem("access_token"),
    getRefreshToken: () => localStorage.getItem("refresh_token"),
    setAccessToken: (token: string) =>
      localStorage.setItem("access_token", token),
    setRefreshToken: (token: string) =>
      localStorage.setItem("refresh_token", token),
    clearTokens: () => {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    },
  },
  // Notifications (optional)
  notificationManager: {
    success: (message: string) => console.log("✅", message),
    error: (message: string) => console.error("❌", message),
    info: (message: string) => console.log("ℹ️", message),
    warning: (message: string) => console.warn("⚠️", message),
  },
  // Unauthorized handler (optional)
  onUnauthorized: () => {
    // Redirect to login page
    window.location.href = "/login";
  },
};

// Initialize the API client
ApiConfig.initialize(apiConfig);

export default apiConfig;
```

### Step 2: Create Your First API Hook

Create `src/api/hooks/useUsers.ts`:

```typescript
import { useApiQuery, useApiMutation } from "@learningpad/api-client";

// Define your data types
interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface CreateUserRequest {
  name: string;
  email: string;
}

// Query hook for fetching users
export const useUsers = () => {
  return useApiQuery<User[]>({
    serviceName: "api", // Must match your service name
    key: ["users"],
    url: "/users",
    options: {
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  });
};

// Mutation hook for creating users
export const useCreateUser = () => {
  return useApiMutation<User, CreateUserRequest>({
    serviceName: "api",
    keyToInvalidate: { queryKey: ["users"] },
    url: "/users",
    method: "post",
    successMessage: "User created successfully!",
    errorMessage: "Failed to create user",
  });
};

// Mutation hook for updating users
export const useUpdateUser = () => {
  return useApiMutation<User, { id: string; data: Partial<CreateUserRequest> }>(
    {
      serviceName: "api",
      keyToInvalidate: { queryKey: ["users"] },
      url: "/users",
      method: "put",
      successMessage: "User updated successfully!",
      errorMessage: "Failed to update user",
    }
  );
};

// Mutation hook for deleting users
export const useDeleteUser = () => {
  return useApiMutation<void, string>({
    serviceName: "api",
    keyToInvalidate: { queryKey: ["users"] },
    url: "/users",
    method: "delete",
    successMessage: "User deleted successfully!",
    errorMessage: "Failed to delete user",
  });
};
```

### Step 3: Use in Your React Component

Create `src/components/Users.tsx`:

```typescript
import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
} from "../api/hooks/useUsers";
import "../api/config"; // Import to initialize API config

const UsersComponent = () => {
  const [newUser, setNewUser] = useState({ name: "", email: "" });

  // Use your API hooks
  const { data: users, isLoading, error, refetch } = useUsers();
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    createUserMutation.mutate(newUser, {
      onSuccess: () => {
        setNewUser({ name: "", email: "" });
      },
    });
  };

  const handleUpdateUser = (
    id: string,
    data: Partial<{ name: string; email: string }>
  ) => {
    updateUserMutation.mutate({ id, data });
  };

  const handleDeleteUser = (id: string) => {
    if (window.confirm("Are you sure?")) {
      deleteUserMutation.mutate(id);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Users</h1>

      {/* Create User Form */}
      <form onSubmit={handleCreateUser}>
        <input
          type="text"
          placeholder="Name"
          value={newUser.name}
          onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          value={newUser.email}
          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
        />
        <button type="submit" disabled={createUserMutation.isPending}>
          {createUserMutation.isPending ? "Creating..." : "Create User"}
        </button>
      </form>

      {/* Users List */}
      <ul>
        {users?.map((user) => (
          <li key={user.id}>
            {user.name} - {user.email}
            <button
              onClick={() =>
                handleUpdateUser(user.id, { name: "Updated Name" })
              }
            >
              Update
            </button>
            <button onClick={() => handleDeleteUser(user.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

// Wrap your app with QueryClient
const App = () => {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <UsersComponent />
    </QueryClientProvider>
  );
};

export default App;
```

## 🎯 That's It! You're Ready to Go!

Your API client is now configured and ready to use. Here's what you get:

### ✅ **Automatic Features**

- **Loading states** - `isLoading`, `isPending`
- **Error handling** - Automatic error catching and display
- **Caching** - Smart caching with React Query
- **Retry logic** - Automatic retries on failure
- **Token management** - Automatic token refresh
- **Notifications** - Success/error messages

### 🔧 **Available Hooks**

| Hook             | Purpose              | Returns                               |
| ---------------- | -------------------- | ------------------------------------- |
| `useApiQuery`    | Fetch data           | `{ data, isLoading, error, refetch }` |
| `useApiMutation` | Create/Update/Delete | `{ mutate, isPending, error, reset }` |

### 📝 **Common Patterns**

#### Fetching Data

```typescript
const { data, isLoading, error } = useApiQuery<DataType>({
  serviceName: "api",
  key: ["data"],
  url: "/endpoint",
});
```

#### Creating Data

```typescript
const createMutation = useApiMutation<ResponseType, RequestType>({
  serviceName: "api",
  keyToInvalidate: { queryKey: ["data"] },
  url: "/endpoint",
  method: "post",
});
```

#### Updating Data

```typescript
const updateMutation = useApiMutation<
  ResponseType,
  { id: string; data: UpdateType }
>({
  serviceName: "api",
  keyToInvalidate: { queryKey: ["data"] },
  url: "/endpoint",
  method: "put",
});
```

#### Deleting Data

```typescript
const deleteMutation = useApiMutation<void, string>({
  serviceName: "api",
  keyToInvalidate: { queryKey: ["data"] },
  url: "/endpoint",
  method: "delete",
});
```

## 🚀 **Next Steps**

1. **Replace the API URL** in your config with your actual backend URL
2. **Add more services** if you have multiple APIs
3. **Customize notifications** to use your preferred toast library
4. **Add authentication** by configuring the token manager
5. **Create more hooks** for different endpoints

## 📚 **Need Help?**

- Check the [full documentation](./README.md)
- See [examples](./demo/) for more complex use cases
- View the [API reference](./docs/api-reference.md)

---

**Happy coding! 🎉**
