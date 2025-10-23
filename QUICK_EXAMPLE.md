# 🚀 Copy & Paste Example

Here's the simple service client approach you can copy and paste:

## Service Client Approach

### 1. Install Dependencies

```bash
npm install @learningpad/api-client @tanstack/react-query
```

### 2. Create `src/App.tsx`

```typescript
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ApiConfig, ApiService } from "@learningpad/api-client";

// Step 1: Initialize API Configuration
ApiConfig.initialize({
  services: {
    jsonplaceholder: {
      name: "jsonplaceholder",
      baseURL: "https://jsonplaceholder.typicode.com",
    },
  },
});

// Step 2: Create service client
const apiService = new ApiService("jsonplaceholder");

// Step 3: Use React Query hooks directly
function SimpleExample() {
  // Fetch data
  const { data: posts, isLoading } = apiService.useQuery({
    key: ["posts"],
    url: "/posts",
  });

  // Create data
  const createPost = apiService.useMutation({
    keyToInvalidate: { queryKey: ["posts"] },
    url: "/posts",
    method: "post",
    successMessage: "Post created successfully!",
    errorMessage: "Failed to create post",
  });

  const handleCreate = () => {
    createPost.mutate({
      title: "New Post",
      body: "This is a new post",
      userId: 1,
    });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Posts</h1>
      <button onClick={handleCreate}>Create Post</button>
      {posts?.map((post: any) => (
        <div key={post.id}>
          <h3>{post.title}</h3>
          <p>{post.body}</p>
        </div>
      ))}
    </div>
  );
}

// Step 4: Wrap with QueryClient
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SimpleExample />
    </QueryClientProvider>
  );
}

export default App;
```

### 3. Run Your App

```bash
npm start
```

## Key Benefits

✅ **Simple**: Just initialize once, create service client, use React Query hooks  
✅ **Type Safe**: Full TypeScript support  
✅ **Automatic**: Token management, error handling, retries  
✅ **Flexible**: Works with any API structure

## What You Get

- 🔄 **Automatic Retry**: Failed requests retry automatically
- 🔐 **Token Management**: Automatic token refresh on 401 errors
- 📱 **Universal**: Works in browser and Node.js
- 🎯 **Service-Oriented**: Organize APIs by service
- ⚡ **React Query**: Powerful caching and synchronization
