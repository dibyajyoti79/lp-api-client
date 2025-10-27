import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ApiConfig, ApiService } from "@learningpad/api-client";

// Step 1: Initialize API Configuration
const tokenManager = {
  getAccessToken: () => localStorage.getItem("accessToken"),
  setAccessToken: (token: string) => localStorage.setItem("accessToken", token),
  clearTokens: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  },
  // Refresh token methods (optional)
  getRefreshToken: () => localStorage.getItem("refreshToken"),
  setRefreshToken: (token: string) =>
    localStorage.setItem("refreshToken", token),
};

ApiConfig.initialize({
  services: {
    posts: {
      baseURL: "https://jsonplaceholder.typicode.com",
      config: { timeout: 10000 }, // Use Axios config
    },
    users: {
      baseURL: "https://jsonplaceholder.typicode.com",
      config: { timeout: 10000 },
    },
    auth: {
      baseURL: "https://api.example.com",
      refreshEndpoint: "/auth/refresh", // For token refresh
      config: {
        withCredentials: true, // Use with credentials for cookie-based auth
        timeout: 5000,
      },
    },
  },
  tokenManager,
  isRefreshTokenInCookie: false, // false = localStorage, true = HttpOnly cookie
  notificationManager: {
    success: (message) => console.log("✅", message),
    error: (message) => console.error("❌", message),
  },
  onUnauthorized: () => {
    window.location.href = "/login";
  },
});

// Step 2: Create service clients
const postsService = new ApiService("posts");
const usersService = new ApiService("users");
const authService = new ApiService("auth");

// Step 3: Component with all CRUD operations
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
  });

  // Create post mutation
  const createPost = postsService.useMutation({
    keyToInvalidate: { queryKey: ["posts"] },
    url: "/posts",
    method: "post",
    showNotification: true, // Default, optional
  });

  // Update post mutation
  const updatePost = postsService.useMutation({
    keyToInvalidate: { queryKey: ["posts"] },
    url: "/posts",
    method: "put",
  });

  // Delete post mutation (without notifications)
  const deletePost = postsService.useMutation({
    keyToInvalidate: { queryKey: ["posts"] },
    url: "/posts",
    method: "delete",
    showNotification: false, // Disable notifications
  });

  // Login mutation
  const login = authService.useMutation({
    url: "/auth/login",
    method: "post",
  });

  const handleCreate = () => {
    createPost.mutate({
      title: "New Post",
      body: "This is a new post",
      userId: 1,
    });
  };

  const handleUpdate = (id: number) => {
    updatePost.mutate({
      id,
      title: "Updated Post",
      body: "Updated content",
    });
  };

  const handleDelete = (id: number) => {
    deletePost.mutate({ id });
  };

  const handleLogin = () => {
    login.mutate({
      email: "user@example.com",
      password: "password",
    });
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Comprehensive Example</h1>

      {/* Login */}
      <div style={{ marginBottom: "20px" }}>
        <button onClick={handleLogin} disabled={login.isPending}>
          {login.isPending ? "Logging in..." : "Login"}
        </button>
      </div>

      {/* CRUD Operations */}
      <div style={{ marginBottom: "20px" }}>
        <h2>Posts Management</h2>
        <button onClick={handleCreate} disabled={createPost.isPending}>
          {createPost.isPending ? "Creating..." : "Create Post"}
        </button>
      </div>

      {/* Display Posts */}
      {postsLoading ? (
        <div>Loading posts...</div>
      ) : (
        <div>
          <h2>Posts ({posts?.length || 0})</h2>
          {posts?.slice(0, 5).map((post: any) => (
            <div
              key={post.id}
              style={{
                border: "1px solid #ccc",
                padding: "10px",
                margin: "10px 0",
              }}
            >
              <h3>{post.title}</h3>
              <p>{post.body}</p>
              <button onClick={() => handleUpdate(post.id)}>Update</button>
              <button onClick={() => handleDelete(post.id)}>Delete</button>
            </div>
          ))}
        </div>
      )}

      {/* Display Users */}
      {usersLoading ? (
        <div>Loading users...</div>
      ) : (
        <div>
          <h2>Users ({users?.length || 0})</h2>
          {users?.slice(0, 3).map((user: any) => (
            <div key={user.id} style={{ margin: "10px 0" }}>
              <strong>{user.name}</strong> - {user.email}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function App() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
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
