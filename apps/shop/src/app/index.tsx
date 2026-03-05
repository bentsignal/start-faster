import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import type { GetQueryVariables } from "@acme/shopify/storefront/generated";

import { HomepageCollectionCarousel } from "~/features/home/components/homepage-collection-carousel";
import { productQueries } from "~/features/product/lib/product-queries";

const args = {
  handle: "frontpage",
  first: 24,
} as const satisfies GetQueryVariables;

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(
      productQueries.productsFromCollection(args),
    );
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { data: products } = useSuspenseQuery(
    productQueries.productsFromCollection(args),
  );

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-6 py-12">
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-medium">Frontpage Collection</h2>
        <HomepageCollectionCarousel products={products} />
      </section>
    </div>
  );
}
