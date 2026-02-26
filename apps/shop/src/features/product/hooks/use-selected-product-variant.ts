import { useMemo } from "react";

import type { Product } from "~/features/product/types";

interface UseSelectedProductVariantArgs {
  variants: Product["variants"]["nodes"];
  variantId?: string;
}

export function useSelectedProductVariant({
  variants,
  variantId,
}: UseSelectedProductVariantArgs) {
  const defaultVariant = useMemo(
    () =>
      variants.find((variant) => variant.availableForSale) ??
      variants[0] ??
      null,
    [variants],
  );
  const selectedVariant = useMemo(
    () =>
      variants.find((variant) => variant.id === variantId) ?? defaultVariant,
    [defaultVariant, variantId, variants],
  );
  const selectedOptions = useMemo(
    () =>
      selectedVariant?.selectedOptions.reduce<Record<string, string>>(
        (accumulator, option) => {
          accumulator[option.name] = option.value;
          return accumulator;
        },
        {},
      ) ?? {},
    [selectedVariant],
  );

  return {
    selectedVariant,
    selectedOptions,
  };
}
