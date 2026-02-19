# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Turborepo monorepo** containing a TanStack Start storefront app for a shopify backend.

## Key Tech Stack

- React 19 (react compiler enabled)
- TanStack Start (Vite + TanStack Router) for web
- Tailwind CSS v4
- Shopify Storefront API
- Shopify Customer Account OAuth
- Rostra for state management

Since the react compiler is enabled, you often don't need to manually memoize with useMemo and useCallback.

## Commands

This project uses pnpm for package management.

```bash
# Development
pnpm dev                # Run all apps in watch mode, you should ***NEVER*** do this without asking the user, since the dev server is usually already running

# Code quality
pnpm lint               # Lint all packages
pnpm lint:fix           # Lint and fix
pnpm format             # Check formatting
pnpm format:fix         # Fix formatting
pnpm typecheck          # TypeScript check across monorepo

# Adding components
pnpm ui-add             # Interactive shadcn/ui component installer, components from here can be used in the web app, but NOT in the expo react native app

```

To run a command for a specific app or package, use `--filter <target-name>`

### Examples

- Installing a dependency in the shop app: `pnpm i zustand --filter @acme/shop`
- Running lint on the Shopify package: `pnpm run lint --filter @acme/shopify`

Below are some commands you should run after making changes for the user. You don't have to run all of them every time, it depends on the types of changes you make.

1. `pnpm run lint`: If you make changes to pretty much any file, you should make sure linting is still passing.
2. `pnpm run format:fix`: If you make changes to any code or .md files, you should run this to make sure the changes are formatted properly.
3. `pnpm run typecheck`: If you make any changes to typescript files, make sure to run this.

Make sure that any commands you choose to run are passing before completing your work.

## Directory structure

```text
.github
  └─ workflows
        └─ CI with pnpm cache setup
.vscode
  └─ Recommended extensions and settings for VSCode users
apps
  └─ shop
      ├─ TanStack Start (Vite + TanStack Router)
      ├─ React 19 (react compiler enabled)
      └─ Tailwind CSS v4
packages
  ├─ shopify
  │   └─ Shared Shopify GraphQL operations and generated types.
  └─ ui
      └─ Components from shadcn registries.
tooling
  ├─ eslint
  │   └─ shared, fine-grained, eslint presets
  ├─ prettier
  │   └─ shared prettier configuration
  ├─ tailwind
  │   └─ shared tailwind theme and configuration
  └─ typescript
      └─ shared tsconfig you can extend from
```

### UI

ShadCN components are stored in the UI package found at `packages/ui`

Usage in apps:

```tsx
import { Button } from "@acme/ui";
```

### Shopify Data Layer (packages/shopify)

Uses **Shopify Storefront API** with shared GraphQL operations and generated types.

- `src/product/get-product.ts` - Product-by-handle query.
- `src/product/get-products-by-collection.ts` - Collection products query.
- `src/generated/` - Generated Shopify schema/types. Do not edit generated files manually.

API usage in apps:

```typescript
import { getProduct } from "@acme/shopify/product";

import { shopify } from "~/lib/shopify";

const response = await shopify.request(getProduct, {
  variables: { handle: "my-product-handle" },
});
```

### Authentication

Uses Shopify Customer Account OAuth flow:

- **Server auth utilities**: `apps/shop/src/lib/auth.ts`
- **Auth routes**: `apps/shop/src/app/auth/login.ts`, `apps/shop/src/app/callback.ts`, `apps/shop/src/app/auth/logout.ts`

Auth should typically be handled through the Auth Store.

### Environment Variables

Shop and Shopify workflows depend on environment variables defined in:

- Shop app runtime/env validation: `./apps/shop/src/env.ts`
- Shopify codegen and package scripts: `./packages/shopify/.graphqlrc.ts` and `./packages/shopify/package.json`
