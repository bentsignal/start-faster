import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod/v4";

import type { ProductByHandleQueryVariables } from "@acme/shopify/storefront/generated";
import { getProduct } from "@acme/shopify/storefront/product";

import { ProductDetailsPanel } from "~/features/product/components/product-details-panel";
import { ProductImageGalleryDesktop } from "~/features/product/components/product-image-gallery-desktop";
import { ProductImageGalleryMobile } from "~/features/product/components/product-image-gallery-mobile";
import {
  consumeVariantSelectionIntent,
  markVariantSelectionIntent,
} from "~/features/product/lib/variant-navigation-intent";
import { ProductStore } from "~/features/product/store";
import { shopify } from "~/lib/shopify";

const getProductFn = createServerFn({ method: "GET" })
  .inputValidator((value: ProductByHandleQueryVariables) => value)
  .handler(async ({ data }) => {
    const response = await shopify.request(getProduct, {
      variables: data,
    });
    return response.data?.product;
  });

export const Route = createFileRoute("/shop/$item")({
  component: ProductPage,
  loader: async ({ params }) => {
    const product = await getProductFn({
      data: {
        handle: params.item,
      },
    });
    if (product === null || product === undefined) throw notFound();
    return product;
  },
  params: z.object({
    item: z.string(),
  }),
  validateSearch: z.object({
    variant: z.string().optional(),
  }),
});

function ProductPage() {
  const { item } = Route.useParams();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const product = Route.useLoaderData();
  const initialVariantImageFocusMode: "reorder" | "scroll" =
    consumeVariantSelectionIntent({
      handle: item,
      variantId: search.variant,
    })
      ? "scroll"
      : "reorder";

  function handleVariantIdChange(variantId: string) {
    markVariantSelectionIntent({
      handle: item,
      variantId,
    });

    void navigate({
      to: ".",
      search: (previousSearch) => ({
        ...previousSearch,
        variant: variantId,
      }),
      replace: true,
    });
  }

  return (
    <ProductStore
      key={`${item}:${search.variant ?? ""}`}
      handle={item}
      product={product}
      initialVariantId={search.variant}
      initialVariantImageFocusMode={initialVariantImageFocusMode}
      onVariantIdChange={handleVariantIdChange}
    >
      <main className="mx-auto w-full max-w-[1700px] lg:px-8 xl:px-12">
        <div className="lg:grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-stretch lg:gap-10 xl:gap-16">
          <section className="lg:py-14">
            <ProductImageGalleryMobile />
            <ProductImageGalleryDesktop />
          </section>
          <ProductDetailsPanel />
        </div>
      </main>
    </ProductStore>
  );
}
