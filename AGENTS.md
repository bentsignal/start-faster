# AGENTS.md

Guidance for coding agents working in `/Users/shawn/dev/projects/start-faster`.

## Repository Summary

- Monorepo managed with Turborepo + pnpm workspaces.
- Main app: `apps/shop` (TanStack Start + React 19 + Tailwind v4).
- Shared packages: `packages/shopify`, `packages/ui`.
- Shared tooling: `tooling/eslint`, `tooling/prettier`, `tooling/typescript`.
- React Compiler is enabled; avoid manual `useMemo`/`useCallback` unless clearly needed.

## Environment and Package Manager

- Node: `>=22.12.0`
- pnpm: `9.15.4`
- Package manager command prefix: `pnpm`

## High-Signal Commands

### Monorepo-wide

- Build all: `pnpm build`
- Lint all: `pnpm lint`
- Lint all (fix): `pnpm lint:fix`
- Typecheck all: `pnpm typecheck`
- Format check all: `pnpm format`
- Format all (write): `pnpm format:fix`
- Workspace dependency policy check: `pnpm lint:ws`

### Scoped by workspace/package

- Run any script in one package: `pnpm --filter <pkg> run <script>`
- Build only shop app: `pnpm --filter @acme/shop run build`
- Lint only shop app: `pnpm --filter @acme/shop run lint`
- Typecheck only shop app: `pnpm --filter @acme/shop run typecheck`
- Build Shopify package (also runs GraphQL codegen): `pnpm --filter @acme/shopify run build`
- Lint UI package: `pnpm --filter @acme/ui run lint`

### Development / preview

- Full repo dev watch: `pnpm dev`
- Important: do not start `pnpm dev` unless explicitly asked (a dev server may already be running).
- Shop app only dev: `pnpm --filter @acme/shop run dev`
- Shop app preview: `pnpm --filter @acme/shop run preview`

## Required Validation After Changes

Choose based on change type:

- Most code changes: `pnpm lint` and `pnpm typecheck`
- Code or markdown edits: `pnpm format:fix`. Run this last after lint and typecheck
- Shopify GraphQL operation changes: `pnpm --filter @acme/shopify run build`

Before finishing, report what you ran and whether it passed.

## Code Style and Conventions

### Formatting

- Prettier is authoritative (`@acme/prettier-config`).
- Use trailing commas and semicolons as formatted by Prettier.
- Tailwind class sorting is automatic (`prettier-plugin-tailwindcss`).
- Do not hand-sort imports; import sorting is automated by Prettier plugin.

### Imports

- Prefer `import type` for type-only imports.
- Keep import groups in configured order:
  1. type imports
  2. React / TanStack / third-party
  3. `@acme/*`
  4. app alias imports (`~/...`)
  5. relative imports (`../`, `./`)
- In `apps/shop`, prefer `~/` alias over deep relative paths.
- In shared packages, use local relative paths unless exporting across packages.

### TypeScript

- `strict` mode is on; keep code fully type-safe.
- Avoid `any`; avoid `unknown` + narrowing as well.
- Avoid non-null assertions (`!`); lint disallows them.
- Handle optional/nullable values explicitly (no unsafe assumptions).
- Use discriminated unions for state where appropriate (existing auth code is a good model).

### React / UI

- Function components + hooks, no class components.
- Do not over-memoize; React Compiler is enabled.
- Keep components focused and composable; extract logic into hooks/stores when it grows.
- Use shared UI from `@acme/ui` before creating one-off primitives.
- Use `cn() from `@acme/ui` to merge classnames when necessary.

### State Management

- Repo uses Rostra (`createStore`) patterns.
- Store pattern to follow:
  - internal hook function (`useInternalStore`)
  - exported `Store` provider + `useStore` hook alias
- Keep store state serializable unless refs are required (see search store input ref).

### Naming and File Conventions

- Files: kebab-case (for example `top-right-controls.tsx`, `get-product.ts`).
- React components: PascalCase function names.
- Hooks: `use-*.ts` filenames and `useXxx` function names.
- Route files follow TanStack Start conventions (e.g. `__root.tsx`, `$item.tsx`, `_authenticated.tsx`).
- Prefer clear, domain-based names over generic names like `data`/`utils`.

### Error Handling and Control Flow

- Prefer early returns to reduce nesting.
- Throw `Error` objects (or subclasses) when throwing is required.
- Do not swallow errors silently; either handle with fallback or rethrow with context.
- Validate external inputs (URL params, env, API payloads) before use.
- Preserve secure defaults (for auth/cookies/redirects, follow existing `apps/shop/src/lib/auth.ts`).

### Environment Variables

- Never access `process.env` directly in app/package runtime code.
- Use validated env from `apps/shop/src/env.ts` (`import { env } from "~/env"`).
- ESLint enforces restricted env access outside `env.ts`.

### Generated Files

- Do not manually edit generated artifacts:
  - `apps/shop/src/routeTree.gen.ts`
  - `packages/shopify/src/storefront/_generated/**`
  - `packages/shopify/src/customer/_generated/**`
- Regenerate via scripts when source inputs change.

## Directory Map

- `apps/shop`: storefront app (TanStack Start).
- `packages/shopify`: Shopify GraphQL operations + generated types.
- `packages/ui`: shared UI components.
- `tooling/eslint`: flat ESLint configs (`base`, `react`, `nextjs`).
- `tooling/prettier`: shared Prettier config + import order rules.
- `tooling/typescript`: base and compiled package tsconfig presets.

## Agent Operating Rules

- Prefer minimal, targeted changes.
- Respect existing architecture and naming before introducing new patterns.
- Avoid editing unrelated files.
- If you touch TypeScript or TSX, run typecheck, lint, and format:fix for affected scope.
- If you change GraphQL queries in `packages/shopify`, run package build/codegen.

## Rules and Skills

- Skills can be found in `.agents/skills`
