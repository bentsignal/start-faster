import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import type { GetProductsByCollectionQueryVariables } from "@acme/shopify/storefront/generated";

import { ProductCarousel } from "~/features/product/components/product-carousel";
import { productQueries } from "~/features/product/lib/product-queries";

const args = {
  handle: "frontpage",
  first: 24,
} as const satisfies GetProductsByCollectionQueryVariables;

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(
      productQueries.getProductsByCollection(args),
    );
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { data: collection } = useSuspenseQuery(
    productQueries.getProductsByCollection(args),
  );
  const products = collection?.products.nodes ?? [];

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-6 py-12">
      <section className="flex flex-col gap-3">
        {collection?.title && (
          <h2 className="mb-3 w-full text-center text-xl font-medium">
            {collection.title}
          </h2>
        )}
        <ProductCarousel products={products} />
      </section>
    </div>
  );
}
