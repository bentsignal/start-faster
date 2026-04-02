# Shop App Refactor Plan

## Context

The shop app (`apps/shop/`) was built before the project's TypeScript and React coding standards matured. While the app works correctly from a user perspective, the code violates data loading, composition, and TypeScript rules extensively. This plan is an exhaustive audit and overhaul to bring every file into alignment with the project's skills and CLAUDE.md rules.

Two parallel audits were performed — one against the TypeScript skill, one against the React skill (including composition and data-and-state references). Combined: **85 findings** across the entire `apps/shop/src/` directory.

---

## Phase 1: Shared Infrastructure (extract before refactoring consumers)

### 1A. Shared filter/sort/pagination system

The search and collections features duplicate ~800+ lines across 16 files. Extract a shared system.

**Files to create:**
- `src/features/shared/filters/filter-utils.ts` — consolidate `stableSerialize`, `buildFilterKey`, `hasSelectedFilterValue`, `toggleFilter`, `getPriceRangeFromFilters`, `applyPriceRangeFilter`, `sanitizeFilters` from:
  - `features/search/lib/search-filter-utils.ts`
  - `features/collections/lib/collection-filter-utils.ts`
- `src/features/shared/filters/components/filter-section.tsx` — shared `FilterSectionDesktop`, `FilterSectionContent`, `PriceRangeFilterContent` from:
  - `features/search/components/search-filters.tsx`
  - `features/collections/components/collection-filters.tsx`
- `src/features/shared/filters/components/sort-select.tsx` — shared `SortSelect` component from:
  - `features/search/components/search-sort-controls.tsx`
  - `features/collections/components/collection-sort-controls.tsx`
- `src/features/shared/filters/components/results-header.tsx` — shared results header from:
  - `features/search/components/search-results-header.tsx`
  - `features/collections/components/collection-results-header.tsx`
- `src/features/shared/filters/components/pagination.tsx` — shared pagination from:
  - `features/search/components/search-pagination.tsx`
  - `features/collections/components/collection-pagination.tsx`

**Files affected:** search-filters.tsx, collection-filters.tsx, search-sort-controls.tsx, collection-sort-controls.tsx, search-results-header.tsx, collection-results-header.tsx, search-pagination.tsx, collection-pagination.tsx, search-filter-utils.ts, collection-filter-utils.ts, use-search-filter-actions.ts, use-collection-filter-actions.ts, use-search-price-range-filter.ts, use-collection-price-range-filter.ts, search/schema.ts, collections/schema.ts

### 1B. Shared utilities

- **`formatMoney`** — consolidate from `order-products-section.tsx`, `order-list-helpers.ts`, and `formatPrice` from `product/lib/price.ts` into one shared utility (e.g. `src/lib/format-money.ts`)
- **Cart validation** — extract `assertNonEmptyValue`, `assertPositiveInteger` from `manage-cart.ts` and `prepare-checkout.ts` into `src/features/cart/lib/cart-validation.ts`
- **Duplicate types** — remove `CartPayload` in `cart/types.ts` (use `CartSource` from `manage-cart.ts` or vice versa); remove duplicate `CollectionProductNode` from `collections/types.ts` (use the one from `product/types.ts`)
- **`stickyHeaderTokens`** — move from `header.tsx` to `~/components/header/tokens.ts` or `~/lib/layout-tokens.ts`

### 1C. Centralized cart mutations

Create `src/features/cart/lib/cart-mutations.ts` using `mutationOptions` for all cart mutations (lineAdd, lineRemove, lineUpdate). Currently these are defined inline in `use-add-cart-line.ts` and `use-update-cart-line.ts`.

### 1D. Centralized auth mutations

Create `src/features/auth/lib/auth-mutations.ts` with `mutationOptions` for sign-out. Currently inline in `sign-out-button.tsx`.

### 1E. Centralized account mutations

Create `src/features/account/lib/account-mutations.ts` with `mutationOptions` for reorder. Currently inline in `orders-list.tsx`.

---

## Phase 2: Kitchen-Sink Hook Decomposition

### 2A. Decompose `useCart()` → fine-grained cart hooks

**Delete:** `src/features/cart/hooks/use-cart.ts`

**Create fine-grained hooks** (each calls `useSuspenseQuery` on `cartQueries.detail(...)` with targeted `select`):
- `useCartQuantity()` — selects `cart.totalQuantity` (used by CartSheet, TopRightControls)
- `useCartLines()` — selects `cart.lines.nodes` (used by CartSheet Body)
- `useCartTotal()` — selects `cart.cost.totalAmount` (used by CartSummary)
- `useCartCheckoutUrl()` — selects `cart.checkoutUrl` (used by CartCheckoutButton)
- `useCartId()` — selects `cart.id` (used by useAddToCart)

**Refactor `useUpdateCartLine`** to stop accepting the full cart object as a parameter. It should read current line data from the query cache internally.

**Files affected:** `use-cart.ts`, `cart-sheet.tsx`, `cart-line-item.tsx`, `cart-summary.tsx`, `cart-checkout-button.tsx`, `top-right-controls.tsx`, `use-product-purchase-actions.ts`, `use-update-cart-line.ts`

### 2B. Decompose `useCollectionProducts()` → fine-grained collection hooks

**Delete:** `src/features/collections/hooks/use-collection-products.ts`

**Create fine-grained hooks** (each calls `useSuspenseInfiniteQuery` on `collectionQueries.products(...)` with targeted `select`):
- `useCollectionTitle()` — selects collection title
- `useCollectionFilters()` — selects `collection.products.filters`
- `useCollectionImage()` — selects `collection.image`
- `useCollectionProductsList()` — selects products array
- `useCollectionPagination()` — selects `hasNextPage`, `isFetchingNextPage`, `fetchNextPage`

**Files affected:** `use-collection-products.ts`, `collection-filters.tsx`, `collection-hero-image.tsx`, `collection-product-results-view.tsx`, `collection-pagination.tsx`, `collections/$handle.tsx`

### 2C. Decompose `useSearchProducts()` → fine-grained search hooks

**Delete:** `src/features/search/hooks/use-search-products.ts`

**Create fine-grained hooks:**
- `useSearchTotalCount()` — selects total count
- `useSearchProductsList()` — selects products array
- `useSearchVisibleFilters()` — selects `productFilters` (already exists but calls kitchen-sink hook internally — refactor to be standalone)
- `useSearchPagination()` — selects pagination state

**Files affected:** `use-search-products.ts`, `search-filters.tsx`, `search-product-results-view.tsx`, `search-pagination.tsx`, `search-results-header.tsx`

### 2D. Fix `useSelectedVariant` and `useGalleryOrdering` over-selection

Both hooks have identical large `select` pulling `id`, `images`, `featuredImage`, `options`, `variants` from the product query. Each should select only what it needs:
- `useSelectedVariant` — select only `variants.nodes` and `options`
- `useGalleryOrdering` — select only `images`, `featuredImage`, `options`, `variants`

**Files affected:** `use-selected-variant.ts`, `use-gallery-ordering.ts`

---

## Phase 3: Component + Hook Pattern Enforcement

### 3A. Route files — extract business logic to hooks

Each route file should have at most one hook + one route component. Add co-located hooks to:

| Route File | Hook to Create | Logic to Move |
|---|---|---|
| `app/_authenticated.tsx` | `useAuthenticatedLayout()` | `useLocation`, `useNavigate`, `getSelectedRoute` |
| `app/_authenticated/orders.tsx` | `useOrdersRoute()` | All data orchestration (infinite query, useQueries, product ID chunks, orders list data) |
| `app/shop/$handle.tsx` | `useProductPage()` | `useIsHydrated`, `useScreenStore`, gallery conditional logic |
| `app/index.tsx` | Move `args` constant to product queries file | Module-level constant in route file |

### 3B. Route files — extract sub-components

| Route File | Component to Extract | Destination |
|---|---|---|
| `app/$.tsx` | `LiveDraftPreview` | `~/features/pages/components/live-draft-preview.tsx` |

### 3C. Components — add co-located hooks

| Component File | Hook to Create | Logic to Move |
|---|---|---|
| `cart/components/cart-checkout-button.tsx` | `useCartCheckout()` | `useState`, `useCart`, `useCheckForPendingMutations`, `goToCheckout` |
| `cart/components/cart-line-item.tsx` | `useCartLineItem(lineId)` | `useCart`, `useUpdateCartLine`, `decrement`/`increment` callbacks |
| `auth/components/sign-out-button.tsx` | `useSignOut()` | Full mutation definition, navigation, cache invalidation |
| `auth/components/login-modal.tsx` | `useLoginModal()` | Route context, search params, navigation handler |
| `header/header.tsx` | `useHeader()` | `useIsHydrated`, `useScreenStore`, `useSearch`, computed booleans |
| `header/top-right-controls.tsx` | `useTopRightControls()` | `useRouteContext`, `useCart`, `useCartStore` |
| `cart/components/cart-sheet.tsx` | `useCartSheet()` | Open/close state, quantity |

### 3D. Eliminate prop drilling in orders feature

- `OrdersList` currently receives `orders` and `liveProducts` as props from the route. It should have its own hook that reads from the query cache.
- `OrderProductsSection` receives `liveProducts` drilled through 4 levels (route → OrdersList → OrderCard → OrderProductsSection → OrderProductTile). Each leaf should pull data via hooks.

### 3E. Split oversized files

| File | Lines | Action |
|---|---|---|
| `orders-list.tsx` | ~243 | Extract `StatusPill`, `TrackingNumbers`, `EmptyOrdersList` to separate files. `OrderCard` to its own file with hook. |
| `order-products-section.tsx` | ~261 | Extract helper functions to lib file. Remove duplicate `formatMoney`. |
| `product-option-selector.tsx` | ~193 | Extract `ColorOptionGroup` to its own file. |
| `product-image-gallery-desktop.tsx` | ~192 | Extract `GalleryThumbnail` and `GalleryImage` if they grow. |
| `search-filters.tsx` | ~247 | Will be resolved by Phase 1A shared filter extraction. |
| `collection-filters.tsx` | ~220 | Will be resolved by Phase 1A shared filter extraction. |
| `use-product-purchase-actions.ts` | ~161 | Split `useBuyNow` and `useAddToCart` into own files. |
| `use-desktop-product-image-gallery.ts` | ~169 | Extract `useGalleryScrollManagement` and `useGalleryIntersectionObserver` to own files. |
| `sign-out-button.tsx` | ~105 | Will be resolved by extracting `useSignOut` hook. |
| `mailing-list.tsx` | ~70 line hook | Extract timeout management into sub-hook. |

---

## Phase 4: TypeScript Standards

### 4A. Add `as const` to fixed-value objects and arrays

| File | What | Fix |
|---|---|---|
| `header/nav-data.ts` | `navItems` | Add `as const satisfies readonly NavItem[]` |
| `header/nav-data.ts` | `secondaryNavLinks` | Add `as const` |
| `product/colors.ts` | `KNOWN_COLORS` | Replace `Record<string, string>` annotation with `as const satisfies Record<string, string>` |
| `cart/lib/cart-queries.ts` | `cartMutationKeys` | Move `as const` to outer object |
| `header/header.tsx` | `stickyHeaderTokens` | Add `as const` |
| `product/lib/gallery-scroll-helpers.ts` | `SCROLL_INTERRUPT_KEYS` | Extract to const array first, create Set from it |

### 4B. Derive union types from const arrays (not manual unions)

| File | Type | Fix |
|---|---|---|
| `mailing-list.tsx` | `MailingListState` | Derive from `const MAILING_LIST_STATES = [...] as const` |
| `collections/lib/collection-queries.ts` | `CollectionSortBy`, `CollectionSortDirection` | Derive from const arrays |
| `search/lib/search-queries.ts` | `SearchSortBy`, `SearchSortDirection` | Derive from const arrays (or share with collections) |
| `product/lib/option-availability.ts` | `OptionValueAvailability` | Derive from const array |

### 4C. Discriminated unions and narrowing

| File | Issue | Fix |
|---|---|---|
| `auth/server/get-auth-state.ts` | Returns unnamed discriminated union | Define named `AuthState` type |
| `cart/server/cart-cookie.ts` | `CartCookieState` allows impossible combinations | Convert to discriminated union: `{ id: string; quantity: number } \| { id: null; quantity: 0 }` |
| `account/lib/orders-list-data.ts` | `OrderListItem` flattens paired status fields | Embed discriminated type from `getCustomerOrderStatus` |
| `account/lib/order-status.ts` | Returns unnamed inline unions | Define named `OrderStatus` type |
| `cart/lib/cart-pending-mutations.ts` | if/continue chain for 3 variants | Convert to exhaustive switch |

### 4D. Replace nested ternaries with switch/map

| File | Issue | Fix |
|---|---|---|
| `account/components/orders-list.tsx` | `StatusPill` 4-way nested ternary | Use lookup map or switch |
| `auth/components/sign-out-button.tsx` | Chained ternaries on mutation status | Switch on `signOutMutation.status` |

### 4E. Remove redundant return type annotations

| File | Annotation to Remove |
|---|---|
| `account/server/get-customer-orders.ts` | `Promise<CustomerOrdersConnection>` |
| `account/lib/account-queries.ts` | `Promise<LiveOrderProducts>` |
| `cart/server/cart-cookie.ts` | `CartCookieState` return annotation |

---

## Phase 5: Small Fixes

| # | File | Fix |
|---|---|---|
| 1 | `header/top-right-controls.tsx` | Replace `Link` with `QuickLink` from `@acme/features/quick-link` |
| 2 | `search/hooks/use-search-price-range-filter.ts` | Remove `.finally()` — use `.then()/.catch()` or async/await |
| 3 | `collections/hooks/use-collection-price-range-filter.ts` | Same `.finally()` fix |
| 4 | `components/error.tsx` | Remove `console.log(props)` |
| 5 | `hooks/use-debounced-input.ts` | Change default export to named export |
| 6 | `app/_authenticated/orders.tsx` | Change `useQueries` to suspense-based queries since data is preloaded |
| 7 | `app/_authenticated/orders.tsx` | Add `select` to `useSuspenseInfiniteQuery` |

---

## Verification

After all changes:

1. `pnpm run lint` — should pass with no errors
2. `pnpm run typecheck` — should pass with no type errors
3. `pnpm run test` — should pass all tests
4. `pnpm run format:fix` — auto-format
5. Manual smoke test: navigate through shop pages (index, collection, product, search, cart, account/orders) to verify nothing is broken
