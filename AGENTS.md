# AGENTS.md

Guidance for coding agents working in `/Users/shawn/dev/projects/start-faster`.

## Repository Summary

- Turborepo monorepo.
- Storefront built on Shopify headless.
- Greenfield project, prefer ambitious overhauls when necessary to lay solid foundation.

## Required Validation After Changes

Choose based on change type:

- Code changes: `pnpm lint` and `pnpm typecheck`
- Code or markdown edits: `pnpm format:fix`. Run this last after lint and typecheck.
- Shopify GraphQL operation changes: `pnpm --filter @acme/shopify run build`

Before finishing, report what you ran and whether it passed.

## Architecture

### GraphQL

All GraphQL queries and mutations should be written in `@packages/shopify`. This package has GraphQL codegen setup so that any queries written will have TypeScript types generated for them, giving us type safety when calling the query. When done right, you won't have to use generics of narrowing to get a return type from calling `shopify.request(myQuery)` or `customerAccount.query(myQuery)`.

- In app code, prefer using generated operation types from `@acme/shopify/storefront/generated` over writing large custom GraphQL result types.

## Code Style and Conventions

### Imports

- Prefer `import type` for type-only imports.
- In `apps`, prefer `~/` alias over deep relative paths.
- In shared packages, use local relative paths unless exporting across packages.

### TypeScript

- Avoid `any`;
- Avoid `unknown` + narrowing.
- Use discriminated unions where appropriate.
- Prefer type inference over explicitly defined types, use `as const` where appropriate.

### React / UI

- **_IMPORTANT_**: Do not over-memoize, React Compiler is enabled. useMemo and useCallback are not usually needed.
- Keep components focused and composable, divide functionality into smaller components where it makes sense to; extract logic into hooks/stores when it grows beyond simple things.
- Keep component files component-focused. Move shared types and pure helpers to `types.ts` or `lib/`.
- Use shared UI from `@acme/ui` before creating one-off primitives.
- Use `cn()` from `@acme/ui` to merge classnames when necessary.
- Route files should stay thin, validation, loaders, and route component should live in the route file. Everything else should be abstracted away into smaller pieces of code outside the route file.

### State Management

- Repo uses Rostra (`createStore`) patterns.
- Store pattern to follow:
  - internal hook function (`useInternalStore`)
  - exported `Store` provider + `useStore` hook alias

### Naming and File Conventions

- Files: kebab-case (for example `top-right-controls.tsx`, `get-product.ts`).
- React components: PascalCase function names.
- Hooks: `use-*.ts` filenames and `useXxx` function names.

### Error Handling and Control Flow

- Prefer early returns to reduce nesting.
- Do not swallow errors silently; either handle with fallback or rethrow with context.
- Validate external inputs (URL params, env, API payloads) before use.

### Environment Variables

- Never access `process.env` directly in app runtime code.
- Use validated env from `apps/shop/src/env.ts`
- ESLint enforces restricted env access outside `env.ts`.

### Data flow

- Never perform queries or mutations inside useEffect. Data fetching should not rely on react's render behavior
- Data loading should be done in route loaders when appropriate, or through tanstack query when done in components
- Mutations should use tanstack query's useMutation and should always be driven by user events.
- Query option builders should follow the `*Queries` object pattern (for example `productQueries`, `searchQueries`) with stable query keys and colocated fetch logic.
- For multi-part product result UIs, use a feature store and selector-based subcomponents instead of one large card component.
- Use optimistic updates to provide instant feedback to user after they perform an action.

### Testing

- Currently no testing solution is in place. Do not write any tests or attempt to run them.
