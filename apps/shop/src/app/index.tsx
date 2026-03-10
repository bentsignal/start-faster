import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import type { GetProductsByCollectionQueryVariables } from "@acme/shopify/storefront/generated";

import { Hero, heroImageUrl } from "~/components/hero";
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
  head: () => ({
    links: [
      {
        rel: "preload",
        as: "image",
        href: heroImageUrl,
      },
    ],
  }),
});

function RouteComponent() {
  const { data: collection } = useSuspenseQuery(
    productQueries.getProductsByCollection(args),
  );
  const products = collection?.products.nodes ?? [];

  return (
    <div className="flex w-full flex-col">
      <Hero />
      <section className="mx-auto flex w-full max-w-[1400px] flex-col gap-3 px-4 py-16 sm:px-8 xl:px-24">
        <ProductCarousel products={products} />
      </section>
    </div>
  );
}
