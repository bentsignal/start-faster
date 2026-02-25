import type { Product } from "~/features/product/types";

interface UseProductVariantActionsArgs {
  variants: Product["variants"]["nodes"];
  selectedVariant: Product["variants"]["nodes"][number] | null;
  selectedOptions: Record<string, string>;
  setSelectedVariantId: (variantId: string) => void;
  onVariantIdChange: (variantId: string) => void;
}

export function useProductVariantActions({
  variants,
  selectedVariant,
  selectedOptions,
  setSelectedVariantId,
  onVariantIdChange,
}: UseProductVariantActionsArgs) {
  function selectOption(optionName: string, optionValue: string) {
    if (selectedVariant === null) {
      return;
    }

    const nextSelections = {
      ...selectedOptions,
      [optionName]: optionValue,
    };
    const nextVariant =
      variants.find((variant) =>
        variant.selectedOptions.every(
          (selectedOption) =>
            nextSelections[selectedOption.name] === selectedOption.value,
        ),
      ) ?? selectedVariant;

    setSelectedVariantId(nextVariant.id);
    onVariantIdChange(nextVariant.id);
  }

  return {
    selectOption,
  };
}
