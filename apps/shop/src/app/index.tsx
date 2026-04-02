import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { Hero, heroImageUrl } from "~/components/hero";
import { env } from "~/env";
import { ProductCarousel } from "~/features/product/components/product-carousel";
import {
  frontpageCollectionArgs,
  productQueries,
} from "~/features/product/lib/product-queries";
import { buildSeoHead, defaultSeoDescription } from "~/lib/seo";

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(
      productQueries.getProductsByCollection(frontpageCollectionArgs),
    );
  },
  component: RouteComponent,
  head: () =>
    buildSeoHead({
      title: "Start Faster",
      description: defaultSeoDescription,
      canonicalUrl: `${env.VITE_SITE_URL}/`,
      imageUrl: heroImageUrl,
      imageAlt: "Lifestyle photos from the launch collection",
    }),
});

function RouteComponent() {
  const { data: products } = useSuspenseQuery({
    ...productQueries.getProductsByCollection(frontpageCollectionArgs),
    select: (collection) => collection?.products.nodes ?? [],
  });

  return (
    <main className="flex w-full flex-col">
      <Hero />
      <section className="mx-auto flex w-full max-w-[1400px] flex-col gap-3 px-4 py-16 sm:px-8 xl:px-24">
        <ProductCarousel products={products} />
      </section>
    </main>
  );
}
