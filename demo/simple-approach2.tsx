import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ApiConfig, createServiceClient } from "@learningpad/api-client";

// Step 1: Initialize API Configuration
ApiConfig.initialize({
  services: {
    jsonplaceholder: {
      name: "jsonplaceholder",
      baseURL: "https://jsonplaceholder.typicode.com",
    },
  },
});

// Step 2: Create a client for this service
const jsonPlaceholderClient = createServiceClient("jsonplaceholder");

// Step 3: Use the client directly (no serviceName needed)
function SimpleExample() {
  // Fetch data
  const { data: posts, isLoading } = jsonPlaceholderClient.useQuery({
    key: ["posts"],
    url: "/posts",
  });

  // Create data
  const createPost = jsonPlaceholderClient.useMutation({
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
      <h1>Simple Example - Pre-configured Client</h1>

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
