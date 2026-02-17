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
    <main className="flex h-screen flex-col overflow-hidden md:flex-row">
      <div className="relative flex h-100 shrink-0 items-center justify-center overflow-hidden bg-white sm:h-full md:w-3/5">
        {product.featuredImage ? (
          <Image
            src={product.featuredImage.url}
            alt={product.featuredImage.altText ?? product.title}
            layout="fullWidth"
            className="my-auto object-cover"
          />
        ) : (
          <div className="bg-muted h-full w-full" />
        )}
        <div className="from-background/30 md:to-background/8 pointer-events-none absolute inset-0 bg-linear-to-t to-transparent md:bg-linear-to-r md:from-transparent" />
      </div>

      <div className="flex min-h-0 flex-1 flex-col justify-center overflow-y-auto px-8 py-10 md:px-12 lg:px-16 xl:px-20">
        <div className="max-w-sm">
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
