import { createFileRoute, notFound } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { z } from "zod/v4";

import { getProductByHandle } from "~/lib/shopify/product.server";

export const Route = createFileRoute("/shop/$item")({
  component: ProductPage,
  loader: async ({ params }) => {
    const product = await getProductByHandle({
      data: {
        handle: params.item,
      },
    });
    if (!product) {
      throw notFound();
    }
    return product;
  },
  params: z.object({
    item: z.string(),
  }),
});

function formatPrice(amount: number, currencyCode: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(amount);
}

function ProductPage() {
  const { item } = Route.useParams();
  const product = Route.useLoaderData();

  const price = formatPrice(
    product.priceRange.minVariantPrice.amount,
    product.priceRange.minVariantPrice.currencyCode,
  );

  return (
    <main className="lg:grid lg:min-h-screen lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
      <div className="relative overflow-hidden bg-white lg:sticky lg:top-0 lg:h-screen">
        <div className="relative aspect-square w-full lg:h-full lg:aspect-auto">
          {product.featuredImage ? (
            <Image
              src={product.featuredImage.url}
              alt={product.featuredImage.altText ?? product.title}
              layout="fullWidth"
              className="h-full w-full object-contain"
            />
          ) : (
            <div className="bg-muted h-full w-full" />
          )}
          <div className="from-background/30 pointer-events-none absolute inset-0 bg-linear-to-t to-transparent lg:bg-linear-to-r lg:from-transparent lg:to-background/8" />
        </div>
      </div>

      <div className="px-6 py-10 sm:px-8 md:px-10 lg:px-12 lg:py-14 xl:px-16">
        <div className="mx-auto max-w-xl lg:mx-0 lg:max-w-md xl:max-w-lg">
          <p className="animate-in fade-in slide-in-from-bottom-1 fill-mode-both text-muted-foreground mb-8 font-mono text-[10px] tracking-[0.2em] uppercase duration-500">
            {item}
          </p>

          <h1 className="animate-in fade-in slide-in-from-bottom-3 fill-mode-both mb-8 text-4xl leading-tight font-light tracking-tight delay-75 duration-700 lg:text-5xl">
            {product.title}
          </h1>

          <p className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both mb-8 font-mono text-2xl font-medium delay-150 duration-500">
            {price}
          </p>

          <div className="animate-in fade-in fill-mode-both bg-border mb-8 h-px delay-200 duration-700" />

          <p className="animate-in fade-in slide-in-from-bottom-1 fill-mode-both text-muted-foreground text-sm leading-7 delay-300 duration-500">
            {product.description}
          </p>
        </div>
      </div>
    </main>
  );
}
