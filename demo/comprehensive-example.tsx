import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ApiConfig, ApiService } from "@learningpad/api-client";

// Step 1: Initialize API Configuration with multiple services
ApiConfig.initialize({
  services: {
    posts: {
      name: "posts",
      baseURL: "https://jsonplaceholder.typicode.com",
      timeout: 10000,
    },
    users: {
      name: "users",
      baseURL: "https://jsonplaceholder.typicode.com",
      timeout: 10000,
    },
    auth: {
      name: "auth",
      baseURL: "https://auth.example.com",
      timeout: 5000,
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
});

// Step 2: Create service clients
const postsService = new ApiService("posts");
const usersService = new ApiService("users");
const authService = new ApiService("auth");

// Step 3: Comprehensive example with multiple operations
function ComprehensiveExample() {
  // Fetch posts
  const { data: posts, isLoading: postsLoading } = postsService.useQuery({
    key: ["posts"],
    url: "/posts",
    options: {
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  });

  // Fetch users
  const { data: users, isLoading: usersLoading } = usersService.useQuery({
    key: ["users"],
    url: "/users",
    options: {
      staleTime: 10 * 60 * 1000, // 10 minutes
    },
  });

  // Create post mutation
  const createPost = postsService.useMutation({
    keyToInvalidate: { queryKey: ["posts"] },
    url: "/posts",
    method: "post",
    successMessage: "Post created successfully!",
    errorMessage: "Failed to create post",
  });

  // Update post mutation
  const updatePost = postsService.useMutation({
    keyToInvalidate: { queryKey: ["posts"] },
    url: "/posts",
    method: "put",
    successMessage: "Post updated successfully!",
    errorMessage: "Failed to update post",
  });

  // Delete post mutation
  const deletePost = postsService.useMutation({
    keyToInvalidate: { queryKey: ["posts"] },
    url: "/posts",
    method: "delete",
    successMessage: "Post deleted successfully!",
    errorMessage: "Failed to delete post",
  });

  // Login mutation
  const login = authService.useMutation({
    url: "/login",
    method: "post",
    successMessage: "Login successful!",
    errorMessage: "Login failed",
  });

  const handleCreatePost = () => {
    createPost.mutate({
      title: "New Post",
      body: "This is a new post created via API",
      userId: 1,
    });
  };

  const handleUpdatePost = (postId: number) => {
    updatePost.mutate({
      id: postId,
      title: "Updated Post",
      body: "This post has been updated",
      userId: 1,
    });
  };

  const handleDeletePost = (postId: number) => {
    deletePost.mutate(postId);
  };

  const handleLogin = () => {
    login.mutate({
      email: "user@example.com",
      password: "password123",
    });
  };

  const isLoading = postsLoading || usersLoading;

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Comprehensive API Client Example</h1>

      <div style={{ marginBottom: "20px" }}>
        <h2>Authentication</h2>
        <button
          onClick={handleLogin}
          disabled={login.isPending}
          style={{ padding: "10px 20px", marginRight: "10px" }}
        >
          {login.isPending ? "Logging in..." : "Login"}
        </button>
        {login.isSuccess && (
          <span style={{ color: "green" }}>✅ Login successful!</span>
        )}
        {login.isError && <span style={{ color: "red" }}>❌ Login failed</span>}
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h2>Posts Management</h2>
        <button
          onClick={handleCreatePost}
          disabled={createPost.isPending}
          style={{ padding: "10px 20px", marginRight: "10px" }}
        >
          {createPost.isPending ? "Creating..." : "Create Post"}
        </button>
        {createPost.isSuccess && (
          <span style={{ color: "green" }}>✅ Post created!</span>
        )}
        {createPost.isError && (
          <span style={{ color: "red" }}>❌ Failed to create post</span>
        )}
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div style={{ display: "flex", gap: "20px" }}>
          <div style={{ flex: 1 }}>
            <h2>Posts ({posts?.length || 0})</h2>
            {posts?.slice(0, 3).map((post: any) => (
              <div
                key={post.id}
                style={{
                  border: "1px solid #ddd",
                  padding: "15px",
                  margin: "10px 0",
                  borderRadius: "5px",
                  backgroundColor: "#f9f9f9",
                }}
              >
                <h3>{post.title}</h3>
                <p>{post.body}</p>
                <div style={{ marginTop: "10px" }}>
                  <button
                    onClick={() => handleUpdatePost(post.id)}
                    disabled={updatePost.isPending}
                    style={{ padding: "5px 10px", marginRight: "5px" }}
                  >
                    Update
                  </button>
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    disabled={deletePost.isPending}
                    style={{
                      padding: "5px 10px",
                      backgroundColor: "#ff6b6b",
                      color: "white",
                      border: "none",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ flex: 1 }}>
            <h2>Users ({users?.length || 0})</h2>
            {users?.slice(0, 3).map((user: any) => (
              <div
                key={user.id}
                style={{
                  border: "1px solid #ddd",
                  padding: "15px",
                  margin: "10px 0",
                  borderRadius: "5px",
                  backgroundColor: "#f0f8ff",
                }}
              >
                <h3>{user.name}</h3>
                <p>
                  <strong>Email:</strong> {user.email}
                </p>
                <p>
                  <strong>Phone:</strong> {user.phone}
                </p>
                <p>
                  <strong>Website:</strong> {user.website}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 3,
        staleTime: 5 * 60 * 1000, // 5 minutes
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ComprehensiveExample />
    </QueryClientProvider>
  );
}

export default App;
