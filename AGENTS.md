# AGENTS.md

Guidance for coding agents working in `/Users/shawn/dev/projects/start-faster`.

## Repository Summary

- Turborepo monorepo.
- Greenfield project, prefer ambitious overhauls when necessary to lay solid foundation.

## Required Validation After Changes

At the end of every run, run the following commands in order:

1. `pnpm run lint`
2. `pnpm run typecheck`

If both of these succeed, run:

3. `pnpm run format:fix`

Then summarize changes for the user.

## Architecture

### GraphQL

- All GraphQL queries and mutations should be written in `@acme/shopify`. This package has GraphQL codegen setup so that any queries written will have TypeScript types generated for them, giving us type safety when calling the query. When done right, you won't have to use generics or type narrowing to get a return type from calling `shopify.request(myQuery)` or `customerAccount.query(myQuery)`.
- **IMPORTANT**: In app code, prefer using generated operation types from `@acme/shopify/storefront/generated` over writing large custom GraphQL result types. Normalizing the results from GraphQL queries is generally unnecessary and just bloats the codebase.
- After making any changes to the code in the shopify package, run `pnpm --filter @acme/shopify run build` to generate updated types.

## Code Style and Conventions

### TypeScript

- Avoid `any`.
- Avoid `unknown`.
- Use discriminated unions where appropriate.
- Avoid type assertions, this is generally an anti pattern and should NOT be used to dodge the type system.
- Prefer type inference over explicitly defined types, use `as const` where appropriate.

### React / UI

- **_IMPORTANT_**: Do not over-memoize, React Compiler is enabled. useMemo and useCallback are not usually needed.
- Don't write enormous components or functions, keep things small and composable.

### Error Handling and Control Flow

- Prefer early returns to reduce nesting.

### Data flow

- Never perform queries or mutations inside useEffect. Data fetching should not rely on react's render behavior
- Data loading should be done in route loaders when appropriate, or through tanstack query when done in components
- Mutations should use tanstack query's useMutation and should always be driven by user events, never by React's render behavior.
- Query option builders should follow the `*Queries` object pattern (for example `productQueries`, `searchQueries`) with stable query keys and colocated fetch logic.
- Use optimistic updates to provide instant feedback to user after they perform an action.

### Testing

- Currently no testing solution is in place. Do not write or attempt to run any tests.
