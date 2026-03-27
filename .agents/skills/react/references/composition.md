# Composition

## Overview

Code should read like prose. When you look at a component, a hook, or a route file, you should be able to understand what it does with the same ease as reading a sentence. This means keeping things small, focused, and organized so that the intent is immediately obvious at every level.

The single biggest failure mode for AI-generated React code is producing monolithic files that mix business logic, state management, and UI into one enormous blob. This makes code review painful because you cannot reason about any single concern without mentally filtering out everything else. Every file should have a clear purpose, and every function within it should earn its place.

## Principles

1. **Small over large.** A 40-line component that does one thing well is always better than a 200-line component that does five things.
2. **Separate concerns by file.** Business logic lives in hooks or utility functions. UI lives in components. Data fetching configuration lives in query builders. Do not combine these into a single file.
3. **Compose, don't accumulate.** Build complex behavior by composing small hooks and small components rather than letting a single unit grow.
4. **Every file should answer one question at a glance.** A route file answers "what does this page look like and what data does it need?" A component file answers "what does this piece of UI render?" A hook answers "what behavior does this encapsulate?"

## Route Files

A route file is the entry point for a page. When someone opens it, they should immediately understand:

- What data the page needs
- What the general layout looks like
- Where to go to dig deeper into any specific piece

Route files should be concise. Search params, loaders, and the route component all live in the same file. The route component itself uses well-named child components so you can see the page structure without drowning in implementation details.

**Do not** put helper functions, constants, hooks, or complex logic in route files. The route file is a map — it shows you the shape of the page and points you toward the implementations that live elsewhere.

### Example: A well-composed route file

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { Card, CardContent, CardHeader, CardTitle } from "@acme/ui/card";

import { SignOutButton } from "~/components/sign-out-button";
import { UserAccessList } from "~/features/user-access/components/user-access-list";
import { UserSearchInput } from "~/features/user-access/components/user-search-input";
import { sanitizeSearch } from "~/features/user-access/lib/sanitize-search";
import { userAccessQueries } from "~/features/user-access/lib/user-access-queries";

export const Route = createFileRoute("/_authenticated/_authorized/dashboard")({
  component: DashboardRoute,
  loaderDeps: ({ search }) => search,
  loader: async ({ context, deps }) => {
    await context.queryClient.ensureQueryData(
      userAccessQueries.searchFirstPage(sanitizeSearch(deps.q)),
    );
  },
  validateSearch: z.object({
    q: z.string().optional(),
  }),
});

function DashboardRoute() {
  return (
    <main className="bg-background min-h-screen">
      <div className="container py-10">
        <header className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Admin Portal</h1>
            <p className="text-muted-foreground text-sm">
              Manage access for users in your admin workspace.
            </p>
          </div>
          <SignOutButton />
        </header>

        <Card>
          <CardHeader className="space-y-4">
            <CardTitle>User Access</CardTitle>
            <UserSearchInput />
          </CardHeader>
          <CardContent>
            <UserAccessList />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
```

Notice what this file gives you: the search params are declared right here, the data dependency is visible in the loader, and the route component reads like an outline of the page. You can see the layout, the heading, and the two main pieces (`UserSearchInput` and `UserAccessList`) without any implementation noise. If you need to understand how search works, you click into `UserSearchInput`. The route file itself stays clean.

## Components

Components should be small and focused on a single piece of UI. When a component grows beyond a handful of concerns, split it into smaller components that each own one piece. The parent component then becomes a composition of those pieces, readable at a glance.

Colocate tightly related sub-components in the same file when they are not reused elsewhere. This keeps related UI together without scattering tiny files across the project. The exported component is the public API of the file; the internal components are implementation details.

### Example: Composing a complex panel from focused components

```tsx
import { Button } from "@acme/ui/button";

import { useProductPageStore } from "~/features/product/stores/product-page-store";

export function ProductDetailsPanel() {
  return (
    <aside className="px-6 pb-6 sm:px-8 md:px-10 lg:self-stretch lg:px-0">
      <div className="mx-auto max-w-xl lg:mx-0 lg:h-full lg:max-w-md xl:max-w-lg">
        <ProductTitle />
        <ProductOptionSelector />
        <ProductPrice />
        <ProductActions />
        <div className="bg-border mb-8 h-px" />
        <ProductDescription />
      </div>
    </aside>
  );
}

function ProductTitle() {
  const title = useProductPageStore((store) => store.product.title);

  return (
    <h1 className="mb-8 text-4xl leading-tight font-semibold tracking-tight">
      {title}
    </h1>
  );
}

function ProductPrice() {
  const price = useProductPageStore((store) => store.price);

  return <p className="mb-8 text-2xl font-medium">{price}</p>;
}

function ProductActions() {
  const addToCart = useProductPageStore((store) => store.addToCart);
  const wasAddedToCart = useProductPageStore((store) => store.wasAddedToCart);
  const buyNow = useProductPageStore((store) => store.buyNow);
  const isBuyingNow = useProductPageStore((store) => store.isBuyingNow);

  return (
    <div className="mb-8 flex flex-col gap-2">
      <Button disabled={wasAddedToCart} onClick={addToCart}>
        {wasAddedToCart ? "Added to Cart" : "Add to Cart"}
      </Button>
      <Button variant="secondary" disabled={isBuyingNow} onClick={buyNow}>
        {isBuyingNow ? "..." : "Buy Now"}
      </Button>
    </div>
  );
}

function ProductDescription() {
  const description = useProductPageStore((store) => store.product.description);

  return (
    <p className="text-muted-foreground text-sm leading-7">{description}</p>
  );
}
```

Reading `ProductDetailsPanel` tells you exactly what the panel contains: a title, options, price, actions, a divider, and a description. Each sub-component is small enough that you can verify its correctness in seconds. If you need to change how the price is displayed, you go straight to `ProductPrice` — you never have to wade through action buttons or option selectors to find it.

## Hooks

Hooks should be small, single-purpose, and composable. When a feature requires complex behavior — managing selections, handling actions, computing derived data — break it into multiple focused hooks rather than writing one enormous hook that does everything.

A coordinating hook can call several smaller hooks to assemble the full picture. This gives you verification at multiple levels: you can reason about each sub-hook independently, and you can reason about the coordinator as a composition of well-understood pieces.

### Example: Composing a complex hook from focused sub-hooks

```tsx
function useInternalStore({ product, variant }: ProductPageStoreProps) {
  const variants = product.variants.nodes;
  const [initialVariantId] = useState(variant);

  const galleryOrdering = useProductGalleryImages({
    product,
    variants,
    initialVariantId,
  });

  const defaultVariantId = getDefaultVariantIdFromGalleryOrdering({
    variants,
    variantImageIndexById: galleryOrdering.variantImageIndexById,
  });

  const options = useProductOptions(product, galleryOrdering.colorOrder);

  const { selectedVariant, selectedOptions } = useSelectedProductVariant({
    variants,
    variantId: variant,
    defaultVariantId,
  });

  const { selectOption, addToCart, wasAddedToCart, buyNow, isBuyingNow } =
    useProductVariantActions({
      variants,
      productTitle: product.title,
      productHandle: product.handle,
      selectedVariant,
      selectedOptions,
    });

  const selectedPrice =
    selectedVariant?.price ?? product.priceRange.minVariantPrice;
  const price = formatPrice(selectedPrice.amount, selectedPrice.currencyCode);

  return {
    product,
    options,
    galleryImages: galleryOrdering.images,
    price,
    selectedVariant,
    selectedOptions,
    selectOption,
    addToCart,
    wasAddedToCart,
    buyNow,
    isBuyingNow,
  };
}
```

This coordinating hook reads as a clear narrative: get gallery images, determine the default variant, build the option list, resolve the selected variant, wire up the actions, compute the price. Each step is a single function call whose name tells you what it does. The implementation details of _how_ gallery ordering works or _how_ variant selection works live in their own focused hooks.

### Example: A focused sub-hook

```tsx
interface UseSelectedProductVariantArgs {
  variants: Product["variants"]["nodes"];
  variantId?: string;
  defaultVariantId?: string;
}

export function useSelectedProductVariant({
  variants,
  variantId,
  defaultVariantId,
}: UseSelectedProductVariantArgs) {
  const defaultVariant =
    variants.find((variant) => variant.id === defaultVariantId) ??
    variants.find((variant) => variant.availableForSale) ??
    variants[0] ??
    null;

  const selectedVariant =
    variants.find((variant) => variant.id === variantId) ?? defaultVariant;

  const selectedOptions =
    selectedVariant?.selectedOptions.reduce<Record<string, string>>(
      (accumulator, option) => {
        accumulator[option.name] = option.value;
        return accumulator;
      },
      {},
    ) ?? {};

  return { selectedVariant, selectedOptions };
}
```

This hook does one thing: resolve which variant is selected and extract its options. It's small enough to review in under a minute and test in isolation.

## Rules of Thumb

- **Route files**: Under ~100 lines. All route-level configuration (search params, loader, beforeLoad, head, meta, error/pending components, static data, etc.) must be defined inline in the route file — never in a separate config file that gets imported. The route file should read like a self-contained table of contents: configuration at the top, then a layout component that composes feature components.
- **Components**: If a component exceeds ~80 lines or handles more than one distinct UI concern, split it.
- **Hooks**: If a hook exceeds ~50 lines, look for sub-hooks to extract. A coordinating hook should mostly be a sequence of calls to smaller hooks plus a return statement.
- **Files**: If a file exceeds ~300 lines, it almost certainly has multiple concerns that should be separated.
- **Business logic in components**: Small inline handlers (a couple of lines) are fine. Anything more substantial should be extracted into a hook or utility function so the component stays focused on rendering.
