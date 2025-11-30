# Orval API Client Generation

We use [Orval](https://orval.dev/) to generate TypeScript API clients from our OpenAPI specification.

## Why Orval?

1. **Type Safety**: Auto-generates TypeScript types directly from the backend's OpenAPI schema, ensuring frontend and backend stay in sync.
2. **Reduced Boilerplate**: No need to manually write fetch calls, request/response types, or API URLs.
3. **Single Source of Truth**: The OpenAPI spec (generated from FastAPI) drives both backend validation and frontend types.

## Current Approach: Fetch Client

We currently use Orval's simple **fetch client** output mode. This generates plain functions that return typed responses with status codes, headers, and data.

Example generated code:
```ts
export const loginForAccessTokenApiLoginPost = async (
  body: BodyLoginForAccessTokenApiLoginPost,
  options?: RequestInit
): Promise<loginForAccessTokenApiLoginPostResponse> => {
  // ... fetch implementation
};
```

### Wrapper Pattern

We wrap the generated functions in feature-specific `api.ts` files to:
- Maintain a stable interface for components
- Handle error transformation (converting status codes to thrown errors)
- Map between frontend naming conventions (e.g., `email`) and API conventions (e.g., `username`)

Example:
```ts
// src/lib/features/auth/login/api.ts
import { loginForAccessTokenApiLoginPost } from '$lib/api/authentication/authentication';

export async function loginApi({ email, password }: { email: string; password: string }) {
  const response = await loginForAccessTokenApiLoginPost({
    username: email,
    password: password
  });

  if (response.status !== 200) {
    const errorData = response.data as { detail?: string };
    throw new Error(errorData.detail || 'Login failed');
  }

  return response.data;
}
```

## Future: Svelte Query Integration

Orval supports generating [Svelte Query](https://tanstack.com/query/latest/docs/svelte/overview) hooks directly. However, we are **waiting for Orval's Svelte Query integration to support the latest Svelte 5 runes**.

Once that lands, we can:
- Generate `createQuery` and `createMutation` hooks directly
- Remove manual wrapper code
- Get automatic cache invalidation patterns

For now, the simple fetch client approach works well and keeps our codebase clean.

## Generated Files Location

Generated API clients live in `src/lib/api/` and are organized by domain:
- `src/lib/api/authentication/authentication.ts`
- `src/lib/api/superimpress.schemas.ts` (shared types)

These files are auto-generated and should **not be edited manually**.
