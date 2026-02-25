# AGENTS.md

Guidance for coding agents working in `/Users/shawn/dev/projects/start-faster`.

## Repository Summary

- Turborepo monorepo.
- Storefront build on Shopify headless.

## Commands

### Scoped by workspace/package

- Run any script in one package: `pnpm --filter <pkg> run <script>`
- Build only shop app: `pnpm --filter @acme/shop run build`
- Lint only shop app: `pnpm --filter @acme/shop run lint`
- Typecheck only shop app: `pnpm --filter @acme/shop run typecheck`
- Build Shopify package (runs GraphQL codegen): `pnpm --filter @acme/shopify run build`
- Lint UI package: `pnpm --filter @acme/ui run lint`

### Development / preview

- Full repo dev watch: `pnpm dev`
- Do not run `pnpm dev` unless explicitly asked (a dev server may already be running).
- Shop app only dev: `pnpm --filter @acme/shop run dev`
- Shop app preview: `pnpm --filter @acme/shop run preview`

## Required Validation After Changes

Choose based on change type:

- Code changes: `pnpm lint` and `pnpm typecheck`
- Code or markdown edits: `pnpm format:fix`. Run this last after lint and typecheck.
- Shopify GraphQL operation changes: `pnpm --filter @acme/shopify run build`

Before finishing, report what you ran and whether it passed.

## Code Style and Conventions

### Imports

- Prefer `import type` for type-only imports.
- In `apps`, prefer `~/` alias over deep relative paths.
- In shared packages, use local relative paths unless exporting across packages.

### TypeScript

- `strict` mode is on; keep code fully type-safe.
- Avoid `any`;
- Avoid `unknown` + narrowing.
- Avoid non-null assertions.
- Handle optional/nullable values explicitly (no unsafe assumptions).
- Use discriminated unions where appropriate.
- Prefer type inference over explicitly defined types, use `as const` where appropriate.

### React / UI

- Do not over-memoize; React Compiler is enabled.
- Keep components focused and composable; extract logic into hooks/stores when it grows.
- Use shared UI from `@acme/ui` before creating one-off primitives.
- Use `cn()` from `@acme/ui` to merge classnames when necessary.

### State Management

- Repo uses Rostra (`createStore`) patterns.
- Store pattern to follow:
  - internal hook function (`useInternalStore`)
  - exported `Store` provider + `useStore` hook alias
- Keep store state serializable unless refs are required.

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
