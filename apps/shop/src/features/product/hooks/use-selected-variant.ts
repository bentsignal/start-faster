import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams, useSearch } from "@tanstack/react-router";

import {
  getDefaultVariantIdFromGalleryOrdering,
  getProductGalleryOrdering,
} from "~/features/product/lib/gallery-images";
import { productQueries } from "~/features/product/lib/product-queries";

export function useSelectedVariant() {
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

  const variants = product.variants.nodes;
  const [initialVariantId] = useState(variant);

  const galleryOrdering = getProductGalleryOrdering({
    product,
    variants,
    initialVariantId,
  });
  const defaultVariantId = getDefaultVariantIdFromGalleryOrdering({
    variants,
    variantImageIndexById: galleryOrdering.variantImageIndexById,
  });

  const defaultVariant =
    variants.find((v) => v.id === defaultVariantId) ??
    variants.find((v) => v.availableForSale) ??
    variants[0] ??
    null;
  const selectedVariant =
    variants.find((v) => v.id === variant) ?? defaultVariant;
  const selectedOptions =
    selectedVariant?.selectedOptions.reduce<Record<string, string>>(
      (acc, opt) => {
        acc[opt.name] = opt.value;
        return acc;
      },
      {},
    ) ?? {};

  return { selectedVariant, selectedOptions };
}
