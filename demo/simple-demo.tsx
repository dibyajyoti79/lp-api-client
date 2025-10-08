import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  ApiConfig,
  useApiQuery,
  useApiMutation,
} from "@learningpad/api-client";

// Simple demo configuration
ApiConfig.initialize({
  services: {
    jsonplaceholder: {
      name: "jsonplaceholder",
      baseURL: "https://jsonplaceholder.typicode.com",
    },
  },
  defaultTimeout: 10000,
});

const queryClient = new QueryClient();

// Simple demo component
function SimpleDemo() {
  // Fetch posts
  const {
    data: posts,
    isLoading,
    error,
  } = useApiQuery({
    serviceName: "jsonplaceholder",
    key: ["posts"],
    url: "/posts",
    options: {
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  });

  // Create post mutation
  const createPost = useApiMutation({
    serviceName: "jsonplaceholder",
    url: "/posts",
    method: "post",
    keyToInvalidate: ["posts"],
    successMessage: "Post created successfully!",
  });

  const handleCreatePost = () => {
    createPost.mutate({
      title: "New Post",
      body: "This is a new post created with the API client.",
      userId: 1,
    });
  };

  if (isLoading) return <div>Loading posts...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>@learningpad/api-client Demo</h1>

      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={handleCreatePost}
          disabled={createPost.isPending}
          style={{
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          {createPost.isPending ? "Creating..." : "Create Post"}
        </button>
      </div>

      <h2>Posts ({posts?.length || 0})</h2>
      <div style={{ display: "grid", gap: "10px" }}>
        {posts?.slice(0, 5).map((post: any) => (
          <div
            key={post.id}
            style={{
              border: "1px solid #ddd",
              padding: "15px",
              borderRadius: "4px",
              backgroundColor: "#f9f9f9",
            }}
          >
            <h3 style={{ margin: "0 0 10px 0", color: "#333" }}>
              {post.title}
            </h3>
            <p style={{ margin: "0", color: "#666" }}>{post.body}</p>
            <small style={{ color: "#999" }}>User ID: {post.userId}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SimpleDemo />
    </QueryClientProvider>
  );
}

export default App;
