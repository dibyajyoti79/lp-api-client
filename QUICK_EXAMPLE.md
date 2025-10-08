# 🚀 Copy & Paste Example

Here's a complete working example you can copy and paste:

## 1. Install Dependencies

```bash
npm install @learningpad/api-client @tanstack/react-query
```

## 2. Create `src/api/config.ts`

```typescript
import { ApiClientOptions, ApiConfig } from "@learningpad/api-client";

const config: ApiClientOptions = {
  services: {
    api: {
      name: "api",
      baseURL: "https://jsonplaceholder.typicode.com", // Demo API
      timeout: 10000,
    },
  },
  defaultTimeout: 10000,
  defaultHeaders: {
    "Content-Type": "application/json",
  },
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
  notificationManager: {
    success: (message: string) => console.log("✅", message),
    error: (message: string) => console.error("❌", message),
    info: (message: string) => console.log("ℹ️", message),
    warning: (message: string) => console.warn("⚠️", message),
  },
};

ApiConfig.initialize(config);
export default config;
```

## 3. Create `src/hooks/usePosts.ts`

```typescript
import { useApiQuery, useApiMutation } from "@learningpad/api-client";

interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

interface CreatePostRequest {
  title: string;
  body: string;
  userId: number;
}

export const usePosts = () => {
  return useApiQuery<Post[]>({
    serviceName: "api",
    key: ["posts"],
    url: "/posts",
  });
};

export const useCreatePost = () => {
  return useApiMutation<Post, CreatePostRequest>({
    serviceName: "api",
    keyToInvalidate: { queryKey: ["posts"] },
    url: "/posts",
    method: "post",
    successMessage: "Post created!",
    errorMessage: "Failed to create post",
  });
};

export const useDeletePost = () => {
  return useApiMutation<void, number>({
    serviceName: "api",
    keyToInvalidate: { queryKey: ["posts"] },
    url: "/posts",
    method: "delete",
    successMessage: "Post deleted!",
    errorMessage: "Failed to delete post",
  });
};
```

## 4. Create `src/App.tsx`

```typescript
import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { usePosts, useCreatePost, useDeletePost } from "./hooks/usePosts";
import "./api/config"; // Initialize API config

function App() {
  const [newPost, setNewPost] = useState({ title: "", body: "", userId: 1 });

  const { data: posts, isLoading, error } = usePosts();
  const createPost = useCreatePost();
  const deletePost = useDeletePost();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createPost.mutate(newPost, {
      onSuccess: () => {
        setNewPost({ title: "", body: "", userId: 1 });
      },
    });
  };

  if (isLoading) return <div>Loading posts...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Posts App</h1>

      {/* Create Post Form */}
      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <div style={{ marginBottom: "10px" }}>
          <input
            type="text"
            placeholder="Post title"
            value={newPost.title}
            onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
            style={{ width: "100%", padding: "8px", marginBottom: "5px" }}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <textarea
            placeholder="Post body"
            value={newPost.body}
            onChange={(e) => setNewPost({ ...newPost, body: e.target.value })}
            style={{ width: "100%", padding: "8px", height: "80px" }}
          />
        </div>
        <button
          type="submit"
          disabled={createPost.isPending}
          style={{
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
          }}
        >
          {createPost.isPending ? "Creating..." : "Create Post"}
        </button>
      </form>

      {/* Posts List */}
      <div>
        <h2>Posts ({posts?.length || 0})</h2>
        {posts?.slice(0, 10).map((post) => (
          <div
            key={post.id}
            style={{
              border: "1px solid #ddd",
              padding: "15px",
              marginBottom: "10px",
              borderRadius: "4px",
            }}
          >
            <h3>{post.title}</h3>
            <p>{post.body}</p>
            <button
              onClick={() => deletePost.mutate(post.id)}
              disabled={deletePost.isPending}
              style={{
                padding: "5px 10px",
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "4px",
              }}
            >
              {deletePost.isPending ? "Deleting..." : "Delete"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Wrap with QueryClient
const AppWithProvider = () => {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
};

export default AppWithProvider;
```

## 5. Create `src/index.tsx`

```typescript
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

## 6. Run Your App!

```bash
npm start
```

## 🎉 That's It!

You now have a fully working app with:

- ✅ Data fetching with loading states
- ✅ Create new posts
- ✅ Delete posts
- ✅ Error handling
- ✅ Automatic caching
- ✅ Success/error notifications

Just replace `https://jsonplaceholder.typicode.com` with your actual API URL and you're good to go!
