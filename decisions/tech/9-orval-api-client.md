# Orval API Client Generation

We use [Orval](https://orval.dev/) to generate TypeScript API clients from our OpenAPI specification.

![Orval Explained](./assets/orval-explained.png)

## Why Orval?

1. **Type Safety**: Auto-generates TypeScript types directly from the backend's OpenAPI schema, ensuring frontend and backend stay in sync.
2. **Reduced Boilerplate**: No need to manually write fetch calls, request/response types, or API URLs.
3. **Single Source of Truth**: The OpenAPI spec (generated from FastAPI) drives both backend validation and frontend types.

## Current Approach: Svelte Query with Axios

We use Orval's **svelte-query** client output mode, which generates Svelte Query hooks (`createQuery` and `createMutation`) that use Axios under the hood.

Example generated code:

```ts
export const createRegisterUserApiRegisterPost = <
  TError = AxiosError<HTTPValidationError>,
  TContext = unknown
>(
  options?: {
    mutation?: CreateMutationOptions<...>;
    axios?: AxiosRequestConfig;
  },
  queryClient?: QueryClient
): CreateMutationResult<...> => {
  const mutationOptions = getRegisterUserApiRegisterPostMutationOptions(options);
  return createMutation(() => ({ ...mutationOptions, queryClient }));
};
```

### Usage in Components

The generated hooks can be used directly in Svelte components:

```svelte
<script lang="ts">
  import { createRegisterUserApiRegisterPost } from '$lib/api/authentication/authentication';

  const registerMutation = createRegisterUserApiRegisterPost({
    mutation: {
      onSuccess: () => {
        goto('/login');
      }
    }
  });

  // In form submit handler:
  registerMutation.mutate({
    data: { email: value.email, password: value.password }
  });
</script>

{#if registerMutation.isPending}
  <span>Loading...</span>
{/if}

{#if registerMutation.isError}
  <span>{getErrorMessage(registerMutation.error)}</span>
{/if}
```

### Error Handling

Axios errors require special handling to extract the actual API error message. The error object from a failed mutation is an `AxiosError`, where:

- `error.message` contains the generic axios message (e.g., "Request failed with status code 409")
- `error.response.data.detail` contains the actual FastAPI error message

We use a utility function `getErrorMessage` (`src/lib/utils/get-error-message.ts`) to extract the appropriate message:

```ts
import type { AxiosError } from "axios";

export function getErrorMessage(error: AxiosError<unknown> | null): string {
  if (!error) {
    return "An unknown error occurred";
  }

  const responseData = error.response?.data;

  if (
    responseData &&
    typeof responseData === "object" &&
    "detail" in responseData
  ) {
    const detail = (responseData as { detail: unknown }).detail;

    // FastAPI HTTPException - detail is a string
    if (typeof detail === "string") {
      return detail;
    }

    // FastAPI HTTPValidationError - detail is an array of validation errors
    if (Array.isArray(detail) && detail.length > 0) {
      const firstError = detail[0];
      if (firstError && typeof firstError === "object" && "msg" in firstError) {
        return String(firstError.msg);
      }
    }
  }

  // Fallback to the generic axios error message
  return error.message || "An unknown error occurred";
}
```

## Configuration

The Orval configuration is in `orval.config.ts`:

```ts
import { defineConfig } from "orval";

export default defineConfig({
  "super-impress": {
    input: "http://localhost:8000/openapi.json",
    output: {
      target: "./src/lib/api/superimpress.ts",
      mode: "tags-split",
      client: "svelte-query",
    },
    hooks: {
      afterAllFilesWrite: "prettier --write",
    },
  },
});
```

## Generated Files Location

Generated API clients live in `src/lib/api/` and are organized by domain:

- `src/lib/api/authentication/authentication.ts`
- `src/lib/api/superimpress.schemas.ts` (shared types)

These files are auto-generated and should **not be edited manually**.
