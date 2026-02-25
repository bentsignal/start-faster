import { useEffect, useMemo, useState } from "react";

import type { Product } from "~/features/product/types";

interface UseSelectedProductVariantArgs {
  variants: Product["variants"]["nodes"];
  initialVariantId?: string;
}

export function useSelectedProductVariant({
  variants,
  initialVariantId,
}: UseSelectedProductVariantArgs) {
  const [selectedVariantId, setSelectedVariantId] = useState<
    string | undefined
  >(initialVariantId);

  useEffect(() => {
    setSelectedVariantId(initialVariantId);
  }, [initialVariantId]);

  const defaultVariant = useMemo(
    () =>
      variants.find((variant) => variant.availableForSale) ??
      variants[0] ??
      null,
    [variants],
  );
  const selectedVariant = useMemo(
    () =>
      variants.find((variant) => variant.id === selectedVariantId) ??
      defaultVariant,
    [defaultVariant, selectedVariantId, variants],
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
    setSelectedVariantId,
  };
}
