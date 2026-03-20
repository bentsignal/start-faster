# Data Loading

## Overview

Data loading in this project follows a strict flow: prefetch in route loaders, consume in components via TanStack Query hooks (including `convexQuery` for Convex reads), and mutate only in response to user events. Every layer has conventions that must be followed.

## Route Loaders

Route loaders are the primary entry point for data fetching. When a route needs data, prefetch it inside the loader using `ensureQueryData` (or `ensureInfiniteQueryData` for paginated queries) so that it is already cached when the component tree mounts.

When the loader depends on search params, declare the dependency with `loaderDeps` so the loader re-runs when those params change:

```tsx
export const Route = createFileRoute("/dashboard")({
  component: DashboardRoute,
  loaderDeps: ({ search }) => search,
  loader: async ({ context, deps }) => {
    await context.queryClient.ensureQueryData(
      userAccessQueries.searchFirstPage(sanitizeSearch(deps.q)),
    );
  },
  validateSearch: z.object({
    q: z.string(),
  }),
});
```

For Convex reads, use the same `ensureQueryData` pattern with `convexQuery`:

```tsx
beforeLoad: async ({ context }) => {
  const currentUser = await context.queryClient.ensureQueryData(
    convexQuery(api.users.getCurrentUser, {}),
  );
  return { user: currentUser };
},
```

## Query Option Builders

All TanStack Query options must be organized into `*Queries` builder objects (e.g. `productQueries`, `cartQueries`, `searchQueries`). Each method returns a query options object with a stable, hierarchical query key and colocated fetch logic. Never scatter raw `queryKey` / `queryFn` pairs across components.

```tsx
export const cartQueries = {
  all: () => ({
    queryKey: ["cart"] as const,
  }),
  cookie: () => ({
    queryKey: [...cartQueries.all().queryKey, "cookie"] as const,
    queryFn: getCartFromCookie,
    staleTime: Infinity,
    gcTime: Infinity,
  }),
  detail: (cartId: string | null) => ({
    queryKey: [...cartQueries.all().queryKey, "detail", cartId] as const,
    queryFn: async () => {
      if (cartId === null) return null;
      return getCartFn({ data: { cartId } });
    },
  }),
};
```

Key points:

- Name the export `<domain>Queries` (e.g. `productQueries`, `searchQueries`).
- Build query keys hierarchically so broader invalidations work (e.g. invalidating `cartQueries.all()` clears every cart query).
- Colocate the `queryFn` with its key so the fetching logic lives in one place.

## Consuming Data in Components

After the route loader has prefetched, consume cached data in components with `useSuspenseQuery`. Since the loader already populated the cache, this will resolve synchronously and never show a loading state.

```tsx
import { useSuspenseQuery } from "@tanstack/react-query";

import { productQueries } from "~/features/product/lib/product-queries";

export function ProductPrice({ handle }: { handle: string }) {
  const { data: price } = useSuspenseQuery({
    ...productQueries.productByHandle(handle),
    select: (data) => data.priceRange.minVariantPrice.amount,
  });
  return <span>{price}</span>;
}
```

When a `useSuspenseQuery` call gets repetitive across multiple components, extract it into a helper hook:

```tsx
export function useProductPrice(handle: string) {
  const { data } = useSuspenseQuery({
    ...productQueries.productByHandle(handle),
    select: (data) => data.priceRange.minVariantPrice.amount,
  });
  return data;
}
```

Use `select` whenever the component only needs a slice of the query result. This is covered in detail in the `performance` rule, but it bears repeating here: never subscribe to an entire query result when the component only uses part of it. If the component genuinely needs the full result, consuming the full `data` object is fine.

## Mutations

Mutations must use TanStack Query's `useMutation` (for Shopify data) or Convex's `useMutation` (for Convex data). Two hard rules apply:

1. **Mutations are always driven by user events** (clicks, form submissions, gestures). Never trigger a mutation from `useEffect`, render logic, or any other React lifecycle behavior.
2. **Mutation options should be colocated** in a `*Mutations` builder object — mirroring the `*Queries` pattern — so the `mutationKey` and `mutationFn` live in one place. Callbacks like `onSuccess`, `onError`, and `onMutate` stay at the call site because they vary by context.

```tsx
export const cartMutations = {
  lineAdd: {
    mutationKey: ["cart", "mutation", "line", "add"] as const,
    mutationFn: async (variables: {
      cartId?: string;
      merchandiseId: string;
    }) => {
      return addCartLineFn({ data: variables });
    },
  },
  lineRemove: {
    mutationKey: ["cart", "mutation", "line", "remove"] as const,
    mutationFn: async (variables: { lineId: string; cartId: string }) => {
      return removeCartLineFn({ data: variables });
    },
  },
  lineUpdate: {
    mutationKey: ["cart", "mutation", "line", "update"] as const,
    mutationFn: async (variables: {
      cartId: string;
      lines: CartLineUpdateInput[];
    }) => {
      return updateCartLineFn({ data: variables });
    },
  },
};
```

At the call site, spread the entry and add only the handlers you need:

```tsx
const addToCart = useMutation({
  ...cartMutations.lineAdd,
  onSuccess: (nextCart) => {
    queryClient.setQueryData(
      cartQueries.detail(nextCart.id).queryKey,
      nextCart,
    );
  },
  onError: () => {
    toast.error("Unable to add this item to your cart.");
  },
});
```

A typical Convex mutation:

```tsx
import { useMutation as useConvexMutation } from "convex/react";

const updateAccess = useConvexMutation(api.users.updateUserAccessLevel);
```

## Optimistic Updates

Use optimistic updates to give users instant feedback after they perform an action. The approach differs between TanStack Query and Convex.

**TanStack Query**: Cancel in-flight queries in `onMutate`, snapshot previous data, apply the optimistic change, and roll back in `onError` if the mutation fails.

```tsx
useMutation({
  ...cartMutations.lineUpdate,
  onMutate: async (variables) => {
    await queryClient.cancelQueries({
      queryKey: cartQueries.all().queryKey,
    });

    const cartQueryKey = cartQueries.detail(variables.cartId).queryKey;
    const previous = queryClient.getQueryData(cartQueryKey);

    queryClient.setQueryData(cartQueryKey, (current) =>
      current ? applyOptimisticCartLineUpdate(current, variables) : current,
    );

    return { previous };
  },
  onError: (_err, variables, context) => {
    if (context?.previous) {
      queryClient.setQueryData(
        cartQueries.detail(variables.cartId).queryKey,
        context.previous,
      );
    }
  },
  onSuccess: (nextCart) => {
    queryClient.setQueryData(
      cartQueries.detail(nextCart.id).queryKey,
      nextCart,
    );
  },
});
```

In other words, an optimistic update is not just "snapshot and hope" — you should eagerly write the predicted next cache state when you can compute it safely.

**Convex**: Use the `.withOptimisticUpdate` API on the mutation to update the local store immediately:

```tsx
import { useMutation as useConvexMutation } from "convex/react";

const updateAccess = useConvexMutation(
  api.users.updateUserAccessLevel,
).withOptimisticUpdate((localStore, args) => {
  const results = localStore.getAllQueries(api.users.searchUsersPaginated);
  for (const result of results) {
    if (result.value === undefined) continue;
    localStore.setQuery(api.users.searchUsersPaginated, result.args, {
      ...result.value,
      page: result.value.page.map((user) =>
        user._id === args.userId
          ? { ...user, accessLevel: args.accessLevel }
          : user,
      ),
    });
  }
});
```

When deciding whether to add optimistic updates, prioritize actions where perceived latency matters most: cart operations, toggles, and inline edits.

## Loading and Error States

Do **not** manually write loading spinners or error messages based on query status inside components. TanStack Start handles this at the route level through default components configured on the router:

- `defaultPendingComponent` — shown while the route loader is in flight.
- `defaultErrorComponent` — shown when the loader or component throws.
- `defaultNotFoundComponent` — shown for 404s.

These defaults mean that any route using `ensureQueryData` in its loader gets loading and error handling for free. You do not need `isLoading` / `isError` checks in components that consume prefetched data.

If a specific route needs custom error handling, override it on the route definition:

```tsx
export const Route = createFileRoute("/_authenticated/orders")({
  component: OrdersPage,
  errorComponent: ({ error, reset }) => (
    <OrdersErrorComponent error={error} onRetry={reset} />
  ),
});
```

The only place where you should check mutation status (`isPending`, `isError`, `isSuccess`) is for mutation-driven UI feedback (disabling buttons, showing inline toasts, etc.) — never for data-loading states.
