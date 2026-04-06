import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod/v4";

import { ScreenSize, useScreenStore } from "@acme/features/screen";
import { cn } from "@acme/ui/utils";

import { heroImageUrl } from "~/components/hero";
import { env } from "~/env";
import { ProductActions } from "~/features/product/components/product-actions";
import {
  ProductDescription,
  ProductPrice,
  ProductTitle,
} from "~/features/product/components/product-details-panel";
import { ProductImageGalleryDesktop } from "~/features/product/components/product-image-gallery-desktop";
import { ProductImageGalleryMobile } from "~/features/product/components/product-image-gallery-mobile";
import { ProductOptionSelector } from "~/features/product/components/product-option-selector";
import { productQueries } from "~/features/product/lib/product-queries";
import { ProductGalleryStore } from "~/features/product/stores/product-gallery-store";
import { useIsHydrated } from "~/hooks/use-is-hydrated";
import { stickyHeaderTokens } from "~/lib/layout-tokens";
import {
  buildSeoHead,
  defaultSeoDescription,
  jsonLdScript,
  toSeoDescription,
} from "~/lib/seo";

export const Route = createFileRoute("/shop/$handle")({
  component: ProductPage,
  params: z.object({
    handle: z.string(),
  }),
  validateSearch: z.object({
    variant: z.string().optional(),
  }),
  loader: async ({ context, params }) => {
    const product = await context.queryClient.ensureQueryData(
      productQueries.productByHandle(params.handle),
    );

    return {
      title: product.title,
      description: product.description,
      canonicalPath: `/shop/${encodeURIComponent(params.handle)}`,
      imageUrl:
        product.featuredImage?.url ??
        product.images.nodes[0]?.url ??
        heroImageUrl,
      imageAlt:
        product.featuredImage?.altText ??
        product.images.nodes[0]?.altText ??
        undefined,
      minPriceAmount: product.priceRange.minVariantPrice.amount,
      minPriceCurrencyCode: product.priceRange.minVariantPrice.currencyCode,
      inStock: product.variants.nodes[0]?.availableForSale !== false,
    };
  },
  head: ({ loaderData }) => {
    if (loaderData === undefined) {
      return buildSeoHead({
        type: "product",
        title: "Product",
        description: defaultSeoDescription,
        imageUrl: heroImageUrl,
        canonicalUrl: `${env.VITE_SITE_URL}/shop`,
      });
    }

    const canonicalUrl = `${env.VITE_SITE_URL}${loaderData.canonicalPath}`;
    const description = toSeoDescription(
      loaderData.description,
      `Shop ${loaderData.title} at Start Faster.`,
    );
    const productJsonLd = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: loaderData.title,
      description,
      image: loaderData.imageUrl,
      offers: {
        "@type": "Offer",
        url: canonicalUrl,
        priceCurrency: loaderData.minPriceCurrencyCode,
        price: loaderData.minPriceAmount,
        availability: loaderData.inStock
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      },
    };

    return buildSeoHead({
      type: "product",
      title: loaderData.title,
      description,
      imageUrl: loaderData.imageUrl,
      imageAlt: loaderData.imageAlt,
      canonicalUrl,
      scripts: jsonLdScript(productJsonLd),
    });
  },
});

function useProductPage() {
  const isHydrated = useIsHydrated();
  const screen = useScreenStore((store) => store.screen);
  const shouldRenderSingleGallery = isHydrated && screen.size !== undefined;
  const showDesktopGallery = shouldRenderSingleGallery
    ? screen.isBiggerThan(ScreenSize.LG)
    : true;
  const showMobileGallery = shouldRenderSingleGallery
    ? !screen.isBiggerThan(ScreenSize.LG)
    : true;

  return { showDesktopGallery, showMobileGallery };
}

function ProductPage() {
  const { showDesktopGallery, showMobileGallery } = useProductPage();

  return (
    <ProductGalleryStore>
      <main className="mx-auto w-full max-w-[1700px] lg:px-8 xl:px-12">
        <div className="lg:grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-stretch lg:gap-10 xl:gap-16">
          <section className="lg:py-14">
            {showMobileGallery ? <ProductImageGalleryMobile /> : null}
            {showDesktopGallery ? <ProductImageGalleryDesktop /> : null}
          </section>
          <aside
            className={cn(
              "px-6 pb-6 sm:px-8 md:px-10 lg:self-stretch lg:px-0",
              stickyHeaderTokens.spacer,
            )}
          >
            <div className="mx-auto max-w-xl lg:mx-0 lg:h-full lg:max-w-md xl:max-w-lg">
              <div className={cn(stickyHeaderTokens.stickyContent)}>
                <ProductTitle />
                <ProductOptionSelector />
                <ProductPrice />
                <ProductActions />

                <div className="bg-border mb-8 h-px" />

                <ProductDescription />
              </div>
            </div>
          </aside>
        </div>
      </main>
    </ProductGalleryStore>
  );
}
