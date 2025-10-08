import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ApiClientOptions, ApiConfig } from "../src";
import { useApiQuery, useApiMutation } from "../src";

// Types for Todo API
interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CreateTodoRequest {
  title: string;
  description?: string;
}

interface UpdateTodoRequest {
  title?: string;
  description?: string;
  completed?: boolean;
}

interface TodoListResponse {
  todos: Todo[];
  total: number;
  page: number;
  limit: number;
}

// API Client Configuration
const apiClientOptions: ApiClientOptions = {
  services: {
    todoService: {
      name: "todoService",
      baseURL: "https://jsonplaceholder.typicode.com", // Using JSONPlaceholder for demo
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
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
    success: (message: string) => {
      console.log("✅ Success:", message);
      // In a real app, you'd use a toast library like react-toastify
    },
    error: (message: string) => {
      console.error("❌ Error:", message);
      // In a real app, you'd use a toast library like react-toastify
    },
    info: (message: string) => console.log("ℹ️ Info:", message),
    warning: (message: string) => console.warn("⚠️ Warning:", message),
  },
  onUnauthorized: () => {
    console.log("🔒 Unauthorized - redirecting to login");
    // In a real app, you'd redirect to login page
  },
};

// Initialize API Configuration
ApiConfig.initialize(apiClientOptions);

// Custom Hooks for Todo Operations
const useTodos = (page: number = 1, limit: number = 10) => {
  return useApiQuery<TodoListResponse>({
    serviceName: "todoService",
    key: ["todos", page, limit],
    url: "/todos",
    params: { _page: page, _limit: limit },
    options: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  });
};

const useCreateTodo = () => {
  return useApiMutation<Todo, CreateTodoRequest>({
    serviceName: "todoService",
    keyToInvalidate: { queryKey: ["todos"] },
    url: "/todos",
    method: "post",
    successMessage: "Todo created successfully!",
    errorMessage: "Failed to create todo",
  });
};

const useUpdateTodo = () => {
  return useApiMutation<Todo, { id: string; data: UpdateTodoRequest }>({
    serviceName: "todoService",
    keyToInvalidate: { queryKey: ["todos"] },
    url: "/todos",
    method: "put",
    successMessage: "Todo updated successfully!",
    errorMessage: "Failed to update todo",
  });
};

const useDeleteTodo = () => {
  return useApiMutation<void, string>({
    serviceName: "todoService",
    keyToInvalidate: { queryKey: ["todos"] },
    url: "/todos",
    method: "delete",
    successMessage: "Todo deleted successfully!",
    errorMessage: "Failed to delete todo",
  });
};

// Loading Spinner Component
const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center p-4">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    <span className="ml-2 text-gray-600">Loading...</span>
  </div>
);

// Error Message Component
const ErrorMessage: React.FC<{ error: any; onRetry?: () => void }> = ({
  error,
  onRetry,
}) => (
  <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
    <div className="flex">
      <div className="flex-shrink-0">
        <svg
          className="h-5 w-5 text-red-400"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <div className="ml-3">
        <h3 className="text-sm font-medium text-red-800">Error occurred</h3>
        <div className="mt-2 text-sm text-red-700">
          <p>{error?.message || "An unexpected error occurred"}</p>
        </div>
        {onRetry && (
          <div className="mt-4">
            <button
              onClick={onRetry}
              className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
);

// Todo Item Component
const TodoItem: React.FC<{
  todo: Todo;
  onUpdate: (id: string, data: UpdateTodoRequest) => void;
  onDelete: (id: string) => void;
  isUpdating: boolean;
  isDeleting: boolean;
}> = ({ todo, onUpdate, onDelete, isUpdating, isDeleting }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDescription, setEditDescription] = useState(
    todo.description || ""
  );

  const handleSave = () => {
    if (editTitle.trim()) {
      onUpdate(todo.id, {
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
      });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditTitle(todo.title);
    setEditDescription(todo.description || "");
    setIsEditing(false);
  };

  return (
    <div
      className={`bg-white border rounded-lg p-4 mb-3 ${
        isUpdating || isDeleting ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {isEditing ? (
            <div className="space-y-2">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Todo title"
              />
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Description (optional)"
                rows={2}
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleSave}
                  disabled={!editTitle.trim() || isUpdating}
                  className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isUpdating}
                  className="px-3 py-1 bg-gray-600 text-white rounded-md text-sm hover:bg-gray-700 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <h3
                className={`text-lg font-medium ${
                  todo.completed
                    ? "line-through text-gray-500"
                    : "text-gray-900"
                }`}
              >
                {todo.title}
              </h3>
              {todo.description && (
                <p
                  className={`mt-1 text-sm ${
                    todo.completed ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {todo.description}
                </p>
              )}
              <div className="mt-2 text-xs text-gray-500">
                Created: {new Date(todo.createdAt).toLocaleDateString()}
                {todo.updatedAt !== todo.createdAt && (
                  <span>
                    {" "}
                    • Updated: {new Date(todo.updatedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {!isEditing && (
          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={() => onUpdate(todo.id, { completed: !todo.completed })}
              disabled={isUpdating || isDeleting}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                todo.completed
                  ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                  : "bg-green-100 text-green-800 hover:bg-green-200"
              } disabled:opacity-50`}
            >
              {todo.completed ? "Mark Incomplete" : "Mark Complete"}
            </button>
            <button
              onClick={() => setIsEditing(true)}
              disabled={isUpdating || isDeleting}
              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-md text-sm hover:bg-blue-200 disabled:opacity-50"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(todo.id)}
              disabled={isUpdating || isDeleting}
              className="px-3 py-1 bg-red-100 text-red-800 rounded-md text-sm hover:bg-red-200 disabled:opacity-50"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Todo Form Component
const TodoForm: React.FC<{
  onSubmit: (data: CreateTodoRequest) => void;
  isSubmitting: boolean;
}> = ({ onSubmit, isSubmitting }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
      });
      setTitle("");
      setDescription("");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border rounded-lg p-4 mb-6"
    >
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Todo</h2>
      <div className="space-y-4">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Title *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter todo title"
            required
          />
        </div>
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter description (optional)"
            rows={3}
          />
        </div>
        <button
          type="submit"
          disabled={!title.trim() || isSubmitting}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Adding Todo..." : "Add Todo"}
        </button>
      </div>
    </form>
  );
};

// Main Todo App Component
const TodoApp: React.FC = () => {
  const [page, setPage] = useState(1);
  const limit = 10;

  // Fetch todos
  const {
    data: todosData,
    isLoading: isLoadingTodos,
    error: todosError,
    refetch: refetchTodos,
  } = useTodos(page, limit);

  // Mutations
  const createTodoMutation = useCreateTodo();
  const updateTodoMutation = useUpdateTodo();
  const deleteTodoMutation = useDeleteTodo();

  // Handlers
  const handleCreateTodo = (data: CreateTodoRequest) => {
    createTodoMutation.mutate(data, {
      onSuccess: () => {
        // Reset form is handled in TodoForm component
      },
    });
  };

  const handleUpdateTodo = (id: string, data: UpdateTodoRequest) => {
    updateTodoMutation.mutate({ id, data });
  };

  const handleDeleteTodo = (id: string) => {
    if (window.confirm("Are you sure you want to delete this todo?")) {
      deleteTodoMutation.mutate(id);
    }
  };

  // Calculate pagination
  const totalPages = todosData ? Math.ceil(todosData.total / limit) : 0;
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Todo App</h1>
          <p className="mt-2 text-gray-600">
            A comprehensive example of CRUD operations with loading and error
            states
          </p>
        </div>

        {/* Todo Form */}
        <TodoForm
          onSubmit={handleCreateTodo}
          isSubmitting={createTodoMutation.isPending}
        />

        {/* Error State for Create */}
        {createTodoMutation.error && (
          <ErrorMessage
            error={createTodoMutation.error}
            onRetry={() => createTodoMutation.reset()}
          />
        )}

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Your Todos</h2>
            <p className="text-sm text-gray-600">
              {todosData ? `${todosData.total} total todos` : "Loading..."}
            </p>
          </div>

          <div className="p-6">
            {/* Loading State */}
            {isLoadingTodos && <LoadingSpinner />}

            {/* Error State */}
            {todosError && (
              <ErrorMessage error={todosError} onRetry={() => refetchTodos()} />
            )}

            {/* Success State */}
            {todosData && !isLoadingTodos && !todosError && (
              <>
                {todosData.todos.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-6xl mb-4">📝</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No todos yet
                    </h3>
                    <p className="text-gray-600">
                      Create your first todo above to get started!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {todosData.todos.map((todo) => (
                      <TodoItem
                        key={todo.id}
                        todo={todo}
                        onUpdate={handleUpdateTodo}
                        onDelete={handleDeleteTodo}
                        isUpdating={updateTodoMutation.isPending}
                        isDeleting={deleteTodoMutation.isPending}
                      />
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center">
                      <p className="text-sm text-gray-700">
                        Page {page} of {totalPages}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setPage(page - 1)}
                        disabled={!hasPrevPage || isLoadingTodos}
                        className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setPage(page + 1)}
                        disabled={!hasNextPage || isLoadingTodos}
                        className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Global Loading Overlay for Mutations */}
        {(createTodoMutation.isPending ||
          updateTodoMutation.isPending ||
          deleteTodoMutation.isPending) && (
          <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-700">
                {createTodoMutation.isPending && "Creating todo..."}
                {updateTodoMutation.isPending && "Updating todo..."}
                {deleteTodoMutation.isPending && "Deleting todo..."}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// App with QueryClient Provider
const TodoExampleApp: React.FC = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
      },
      mutations: {
        retry: 1,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <TodoApp />
    </QueryClientProvider>
  );
};

export default TodoExampleApp;
