import { useSuspenseQuery } from "@tanstack/react-query";

import { ProductCarousel } from "~/features/product/components/product-carousel";
import {
  CAROUSEL_PRODUCT_COUNT,
  productQueries,
} from "~/features/product/lib/product-queries";

export function ProductCarouselBlockView({
  collectionHandle,
}: {
  collectionHandle: string;
}) {
  const { data: products } = useSuspenseQuery({
    ...productQueries.getProductsByCollection({
      handle: collectionHandle,
      first: CAROUSEL_PRODUCT_COUNT,
    }),
    select: (collection) => collection?.products.nodes ?? [],
  });

  return (
    <section className="mx-auto w-full max-w-[1400px] px-4 sm:px-8 xl:px-24">
      <ProductCarousel products={products} />
    </section>
  );
}
