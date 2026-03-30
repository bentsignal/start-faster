import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams, useSearch } from "@tanstack/react-router";

import { getProductGalleryOrdering } from "~/features/product/lib/gallery-images";
import { productQueries } from "~/features/product/lib/product-queries";

export function useGalleryOrdering() {
  const { handle } = useParams({ from: "/shop/$handle" });
  const variant = useSearch({
    from: "/shop/$handle",
    select: (s) => s.variant,
  });
  const { data: product } = useSuspenseQuery({
    ...productQueries.productByHandle(handle),
    select: (p) => ({
      id: p.id,
      images: p.images,
      featuredImage: p.featuredImage,
      options: p.options,
      variants: p.variants,
    }),
  });

  const [initialVariantId] = useState(variant);

  const { images, variantImageIndexById, colorOrder } =
    getProductGalleryOrdering({
      product,
      variants: product.variants.nodes,
      initialVariantId,
    });

  return { images, variantImageIndexById, colorOrder };
}
