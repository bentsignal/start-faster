# State

The main difficulty with state management in React is getting data from one place to another in a way that provides good DX while also being performance-friendly. There are many options to solve this problem, and each of them lends itself well to specific use cases. The main ones used in this project are:

- Storing state in the URL
- Storing data in query caches (TanStack Query, including Convex reads through `convexQuery`)
- Storing state in Rostra Stores
- Storing state high up + prop drilling

I have strong preferences on when each of these should be used, and I will do my best to outline the scenarios for you. If you are ever uncertain about what you think is the right choice, ask the user for clarification.

## URL

TanStack Start provides very strong primitives for storing state in the URL. By defining search param validators per route, you gain validated type-safe access to URL search params in your code. Ex:

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

Now `DashboardRoute` and any of its child components will be able to access `q`:

```tsx
import { useSearch } from "@tanstack/react-router";

export function DashboardSearchBar() {
  const searchTerm = useSearch({
    from: "/dashboard",
    select: (search) => search.q,
  });
  return null;
}
```

**_IMPORTANT_**: Make sure to use the `select` option when using the `useSearch` hook. This way the component will only re-render when `q` changes, instead of when any search param changes.

Storing state in the URL is a great option whenever:

- You have state you want to persist between full page refreshes
- State you want to be easily shareable via link
- State that you want to persist if a user bookmarks the page

## Query Clients

This project has two sources of truth for data:

- Shopify
- Convex

The Shopify data is queried using TanStack Query. Convex reads should usually follow the same route-loader-plus-query-cache flow by using `convexQuery` with `ensureQueryData` in the route and `useSuspenseQuery` in components.

These alone can be an excellent way to store data. You don't have to worry about passing the data through parent components; you just query it at the level you need it and it's there.

**_IMPORTANT_**: There are some delicate considerations that need to be made when loading data with these solutions. Make sure you deeply internalize the patterns discussed in the `data-loading` rule before attempting any implementations.

## Rostra

The big idea with Rostra is that you define your state at a level where it can be shared with a subtree of components, and then pull it in at lower levels exactly where it's needed. It's designed to avoid prop drilling by allowing you to pull state directly into the leaf component where it is needed, even if the store component is many nodes higher in the tree.

The TL;DR is that you write a React hook just like any other, but then Rostra turns it into a store component. Any component that is a child component of the store component can pull in pieces of the state returned from the store using fine-grained selectors.

Rostra is a great option for global stores that store state for things like _auth_ or _theme_. They can also be useful for page-level concerns. For example, storing product data and product actions in a store for the entire product page.

**_IMPORTANT_**: If you want to use Rostra, you should check out the `Rostra` skill for more info on how to actually use the library.

## Prop Drilling

This is typically my least favorite solution. I could go on for hours about why I dislike prop drilling, but the rule for the code should typically be:

**Avoid prop drilling by default. Passing props one level down is normal. Passing the same data through multiple intermediary components just to reach a deep leaf is usually a smell, and one of the approaches above is typically a better fit.**
