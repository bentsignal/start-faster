---
name: react
description: React coding standards for this project. Use when writing or modifying React components, hooks, or route files.
---

# React

These are the React standards for this project. Follow them when writing or modifying any React code. For detailed rationale, examples, and edge cases, see the individual [reference files](references/).

## Composition

- Code should read like prose. Every file should have a clear, single purpose.
- Separate concerns by file: business logic in hooks/utilities, UI in components, data fetching config in query builders. Do not combine these into a single file.
- Build complex behavior by composing small hooks and small components — do not let a single unit grow.
- **Route files**: Under ~100 lines. All route-level configuration (search params, loader, beforeLoad, head, meta, error/pending components, static data, etc.) defined inline — never imported from a separate config file. The route component composes well-named child components so the page structure is visible at a glance. No helper functions, constants, hooks, or complex logic in route files.
- **Components**: Under ~80 lines or one distinct UI concern. Split if larger. Colocate tightly related sub-components in the same file when not reused elsewhere.
- **Hooks**: Under ~50 lines. Extract sub-hooks when larger. A coordinating hook should mostly be a sequence of calls to smaller hooks plus a return statement.
- **Files**: Under ~300 lines. Larger files almost certainly have multiple concerns that should be separated.
- Small inline handlers (a couple of lines) in components are fine. Anything more substantial should be extracted into a hook or utility.

## State Management

Four strategies, each with specific use cases:

1. **URL state** (TanStack Router `validateSearch` + `useSearch`): For state that should persist across refreshes, be shareable via link, or be bookmarkable. Always use `select` with `useSearch` to avoid unnecessary re-renders.
2. **Query caches** (TanStack Query for Shopify, `convexQuery` for Convex): For server data. Query at the level you need it — no prop drilling required. Follow the data-loading rules closely.
3. **Rostra stores**: For global concerns (auth, theme) or page-level state that needs to be shared across a subtree of components. See the `rostra` skill for implementation details.
4. **Prop drilling**: Least preferred. One level down is normal. Passing the same data through multiple intermediary components is a smell — use one of the above instead.

When uncertain about the right choice, ask the user.

## Data Loading

- **Route loaders**: Prefetch with `ensureQueryData` (or `ensureInfiniteQueryData`). Declare `loaderDeps` when the loader depends on search params.
- **Convex reads**: Use `convexQuery(api.<module>.<function>, { ...args })` inline at call sites — in loaders, in `useSuspenseQuery`, everywhere. Do NOT create `*Queries` wrapper objects for Convex data. This keeps the Convex function reference directly visible for cmd-click navigation.
- **Non-Convex data** (Shopify, REST): Organize into `*Queries` builder objects (e.g. `productQueries`) with hierarchical query keys and colocated `queryFn`. Never scatter raw `queryKey`/`queryFn` pairs across components.
- **Components**: Consume prefetched data with `useSuspenseQuery`. Since the loader already populated the cache, this resolves synchronously.
- **Mutations**: Always driven by user events (clicks, form submissions). Never trigger from `useEffect` or render logic. Use `*Mutations` builder objects for non-Convex mutations. Use `useMutation` from `convex/react` for Convex mutations.
- **Optimistic updates**: For TanStack Query — cancel in-flight queries in `onMutate`, snapshot previous data, apply optimistic change, roll back in `onError`. For Convex — use `.withOptimisticUpdate`. Prioritize for actions where perceived latency matters (cart ops, toggles, inline edits).
- **Loading/error states**: Do NOT manually write loading spinners or error checks. TanStack Start handles this at the route level via `defaultPendingComponent`, `defaultErrorComponent`, and `defaultNotFoundComponent`. Only check mutation status (`isPending`, `isError`) for mutation-driven UI feedback.

## Performance

- **No unnecessary `useEffect`**: Only use `useEffect` to sync an external system with React state. If you think you need it for something else, pause and confirm with the user.
- **React Compiler**: This project has the React Compiler enabled. Default to relying on it instead of manual `useMemo`/`useCallback`/`memo`. Manual memoization is an escape hatch — use it only for precise referential stability needs with a comment explaining why.
- **Fine-grained selection**: Always use `select` to narrow subscriptions. Applies to `useSearch`, `useSuspenseQuery`, and `useStore`. Never subscribe to an entire state object when you only use part of it.
- **Push state down**: Own state in the leaf component that needs it, not in a shared parent.
- **Split at render boundaries**: Separate frequently-changing state from expensive-to-render UI into different components.
- **Compose with children**: When a wrapper needs state but its children don't depend on it, pass children through as a prop to avoid re-rendering the subtree.
- **Stable references**: Hoist static objects/arrays to module scope. Inline object/array literals create new references every render, which matters when the receiver relies on referential equality.
- No using `finally` in Try/Catch blocks.
