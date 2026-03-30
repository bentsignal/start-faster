import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";

import { useGalleryOrdering } from "~/features/product/hooks/use-gallery-ordering";
import { useSelectOption } from "~/features/product/hooks/use-product-variant-actions";
import { useSelectedVariant } from "~/features/product/hooks/use-selected-variant";
import { getOrderedProductOptions } from "~/features/product/lib/product-options";
import { productQueries } from "~/features/product/lib/product-queries";
import { useProductGalleryStore } from "~/features/product/stores/product-gallery-store";

export function useProductOptionSelector() {
  const { handle } = useParams({ from: "/shop/$handle" });
  const { data: product } = useSuspenseQuery({
    ...productQueries.productByHandle(handle),
    select: (p) => ({ options: p.options, variants: p.variants }),
  });
  const { selectedVariant, selectedOptions } = useSelectedVariant();
  const { variantImageIndexById, colorOrder } = useGalleryOrdering();
  const carouselApiRef = useProductGalleryStore(
    (store) => store.carouselApiRef,
  );
  const desktopScrollToImageRef = useProductGalleryStore(
    (store) => store.desktopScrollToImageRef,
  );

  const options = getOrderedProductOptions(product, colorOrder);

  const { selectOption } = useSelectOption({
    variants: product.variants.nodes,
    selectedVariant,
    selectedOptions,
    carouselApi: carouselApiRef,
    scrollDesktopGalleryToImage: desktopScrollToImageRef,
    variantImageIndexById,
  });

  return {
    options,
    variants: product.variants.nodes,
    selectedVariant,
    selectedOptions,
    selectOption,
  };
}
