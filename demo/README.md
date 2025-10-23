# Demo Examples

This folder contains working examples of the @learningpad/api-client package.

## Examples

### 1. `simple-approach1.tsx` - Basic Service Client

Shows the simplest way to use the API client:

- Initialize configuration once
- Create a single service client
- Use React Query hooks directly

```typescript
const apiService = new ApiService("jsonplaceholder");
const { data } = apiService.useQuery({...});
const mutation = apiService.useMutation({...});
```

### 2. `simple-approach2.tsx` - Multiple Services

Demonstrates using multiple service clients:

- Multiple services in configuration
- Separate service clients for different APIs
- Clean separation of concerns

```typescript
const jsonApiService = new ApiService("jsonplaceholder");
const authApiService = new ApiService("auth");
```

### 3. `comprehensive-example.tsx` - Full Featured

Complete example with all features:

- Multiple services (posts, users, auth)
- Token management configuration
- Notification manager
- All CRUD operations (Create, Read, Update, Delete)
- Error handling and success messages
- Loading states and user feedback

## How to Run

1. Install dependencies:

```bash
npm install @learningpad/api-client @tanstack/react-query react react-dom
```

2. Copy any example file to your React project

3. Import and use in your app:

```typescript
import SimpleExample from "./simple-approach1";
```

## Key Features Demonstrated

- ✅ **Service-Oriented Architecture**: Organize APIs by service
- ✅ **React Query Integration**: Powerful caching and synchronization
- ✅ **TypeScript Support**: Full type safety
- ✅ **Token Management**: Automatic token refresh
- ✅ **Error Handling**: Graceful error handling with user feedback
- ✅ **Loading States**: Built-in loading and pending states
- ✅ **Notifications**: Success/error messages
- ✅ **CRUD Operations**: Complete data management
- ✅ **Multiple Services**: Handle different APIs in one app

## Best Practices

1. **Initialize once**: Call `ApiConfig.initialize()` in your app setup
2. **Create service clients**: Use `new ApiService(serviceName)` for each API
3. **Use React Query hooks**: Leverage `useQuery` and `useMutation` directly
4. **Handle loading states**: Always show loading indicators
5. **Provide user feedback**: Use success/error messages
6. **Invalidate queries**: Update cache after mutations
7. **Type your data**: Use TypeScript for better development experience
