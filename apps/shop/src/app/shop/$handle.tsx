import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod/v4";

import { ProductDetailsPanel } from "~/features/product/components/product-details-panel";
import { ProductImageGalleryDesktop } from "~/features/product/components/product-image-gallery-desktop";
import { ProductImageGalleryMobile } from "~/features/product/components/product-image-gallery-mobile";
import { productQueries } from "~/features/product/lib/product-queries";
import { ProductPageStore } from "~/features/product/stores/product-page-store";
import { ScreenSize } from "~/features/screen/sizes";
import { useScreenStore } from "~/features/screen/store";

export const Route = createFileRoute("/shop/$handle")({
  component: ProductPage,
  params: z.object({
    handle: z.string(),
  }),
  validateSearch: z.object({
    variant: z.string().optional(),
  }),
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(
      productQueries.productByHandle(params.handle),
    );
  },
});

function ProductPage() {
  const screen = useScreenStore((store) => store.screen);
  const { handle } = Route.useParams();
  const variant = Route.useSearch({ select: (search) => search.variant });
  const { data: product } = useSuspenseQuery(
    productQueries.productByHandle(handle),
  );
  const showDesktopGallery =
    screen.size === undefined ? true : screen.isBiggerThan(ScreenSize.LG);
  const showMobileGallery =
    screen.size === undefined ? true : !screen.isBiggerThan(ScreenSize.LG);

  return (
    <ProductPageStore variant={variant} product={product}>
      <main className="mx-auto w-full max-w-[1700px] lg:px-8 xl:px-12">
        <div className="lg:grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-stretch lg:gap-10 xl:gap-16">
          <section className="lg:py-14">
            {showMobileGallery ? <ProductImageGalleryMobile /> : null}
            {showDesktopGallery ? <ProductImageGalleryDesktop /> : null}
          </section>
          <ProductDetailsPanel />
        </div>
      </main>
    </ProductPageStore>
  );
}
