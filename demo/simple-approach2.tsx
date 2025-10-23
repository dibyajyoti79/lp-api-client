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
    auth: {
      name: "auth",
      baseURL: "https://auth.example.com",
    },
  },
});

// Step 2: Create pre-configured service clients
const jsonApiService = new ApiService("jsonplaceholder");
const authApiService = new ApiService("auth");

// Step 3: Use the service clients directly
function SimpleExample() {
  // Fetch data from JSONPlaceholder
  const { data: posts, isLoading } = jsonApiService.useQuery({
    key: ["posts"],
    url: "/posts",
  });

  // Create data with auth service
  const login = authApiService.useMutation({
    url: "/login",
    method: "post",
    successMessage: "Login successful!",
    errorMessage: "Login failed",
  });

  const handleLogin = () => {
    login.mutate({
      email: "user@example.com",
      password: "password",
    });
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Simple Example - Multiple Services</h1>

      <button onClick={handleLogin} disabled={login.isPending}>
        {login.isPending ? "Logging in..." : "Login"}
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
