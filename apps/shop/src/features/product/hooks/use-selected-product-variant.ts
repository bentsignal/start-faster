import type { Product } from "~/features/product/types";

interface UseSelectedProductVariantArgs {
  variants: Product["variants"]["nodes"];
  variantId?: string;
  defaultVariantId?: string;
}

export function useSelectedProductVariant({
  variants,
  variantId,
  defaultVariantId,
}: UseSelectedProductVariantArgs) {
  const defaultVariant =
    variants.find((variant) => variant.id === defaultVariantId) ??
    variants.find((variant) => variant.availableForSale) ??
    variants[0] ??
    null;
  const selectedVariant =
    variants.find((variant) => variant.id === variantId) ?? defaultVariant;
  const selectedOptions =
    selectedVariant?.selectedOptions.reduce<Record<string, string>>(
      (accumulator, option) => {
        accumulator[option.name] = option.value;
        return accumulator;
      },
      {},
    ) ?? {};

  return {
    selectedVariant,
    selectedOptions,
  };
}
