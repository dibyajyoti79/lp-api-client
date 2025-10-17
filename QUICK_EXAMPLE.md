# 🚀 Copy & Paste Example

Here are two simple approaches you can copy and paste:

## Approach 1: Direct Hooks Usage

### 1. Install Dependencies

```bash
npm install @learningpad/api-client @tanstack/react-query
```

### 2. Create `src/App.tsx`

```typescript
import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  ApiConfig,
  useApiQuery,
  useApiMutation,
} from "@learningpad/api-client";

// Step 1: Initialize API Configuration
ApiConfig.initialize({
  services: {
    jsonplaceholder: {
      name: "jsonplaceholder",
      baseURL: "https://jsonplaceholder.typicode.com",
    },
  },
});

// Step 2: Use hooks directly with serviceName
function SimpleExample() {
  // Fetch data
  const { data: posts, isLoading } = useApiQuery({
    serviceName: "jsonplaceholder", // ← This tells which service to use
    key: ["posts"],
    url: "/posts",
  });

  // Create data
  const createPost = useApiMutation({
    serviceName: "jsonplaceholder", // ← Same service name
    url: "/posts",
    method: "post",
  });

  const handleCreate = () => {
    createPost.mutate({
      title: "New Post",
      body: "This is a new post",
      userId: 1,
    });
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Simple Example - Direct Hooks</h1>

      <button onClick={handleCreate} disabled={createPost.isPending}>
        {createPost.isPending ? "Creating..." : "Create Post"}
      </button>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div>
          <h2>Posts ({posts?.length || 0})</h2>
          {posts?.slice(0, 5).map((post: any) => (
            <div
              key={post.id}
              style={{
                border: "1px solid #ccc",
                padding: "10px",
                margin: "5px",
              }}
            >
              <h3>{post.title}</h3>
              <p>{post.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function App() {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <SimpleExample />
    </QueryClientProvider>
  );
}

export default App;
```

## Approach 2: Pre-configured Clients

### 1. Install Dependencies

```bash
npm install @learningpad/api-client @tanstack/react-query
```

### 2. Create `src/api-clients.ts`

```typescript
import { createServiceClient } from "@learningpad/api-client";

// Create pre-configured clients
export const jsonApiClient = createServiceClient("jsonplaceholder");
export const authApiClient = createServiceClient("auth");
export const omrApiClient = createServiceClient("omr");
```

### 3. Create `src/App.tsx`

```typescript
import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ApiConfig } from "@learningpad/api-client";
import { jsonApiClient, authApiClient } from "./api-clients";

// Step 1: Initialize API Configuration
ApiConfig.initialize({
  services: {
    jsonplaceholder: {
      name: "jsonplaceholder",
      baseURL: "https://jsonplaceholder.typicode.com",
    },
    auth: {
      name: "auth",
      baseURL: "https://auth.example.com",
    },
  },
});

// Step 2: Use pre-configured clients
function SimpleExample() {
  // Fetch data
  const { data: omrData, isLoading } = jsonApiClient.useQuery({
    key: ["posts"],
    url: "/posts",
  });

  // Create data
  const login = authApiClient.useMutation({
    url: "/login",
    method: "post",
  });

  const handleLogin = () => {
    login.mutate({
      email: "user@example.com",
      password: "password",
    });
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Simple Example - Pre-configured Clients</h1>

      <button onClick={handleLogin} disabled={login.isPending}>
        {login.isPending ? "Logging in..." : "Login"}
      </button>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div>
          <h2>Posts ({omrData?.length || 0})</h2>
          {omrData?.slice(0, 5).map((post: any) => (
            <div
              key={post.id}
              style={{
                border: "1px solid #ccc",
                padding: "10px",
                margin: "5px",
              }}
            >
              <h3>{post.title}</h3>
              <p>{post.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function App() {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <SimpleExample />
    </QueryClientProvider>
  );
}

export default App;
```

## 🎯 Key Differences

### Approach 1: Direct Hooks

```typescript
// Direct usage
const { data: posts } = useApiQuery({
  serviceName: "jsonplaceholder",
  key: ["posts"],
  url: "/posts",
});

const createPost = useApiMutation({
  serviceName: "jsonplaceholder",
  url: "/posts",
  method: "post",
});
```

### Approach 2: Pre-configured Clients

```typescript
// Pre-configured clients
const { data: omrData } = jsonApiClient.useQuery({
  key: ["posts"],
  url: "/posts",
});

const login = authApiClient.useMutation({
  url: "/login",
  method: "post",
});
```

## 🎉 That's It!

Both approaches give you:

- ✅ Data fetching with loading states
- ✅ Create/update/delete operations
- ✅ Error handling
- ✅ Automatic caching
- ✅ TypeScript support

Choose the approach that fits your project structure better!
