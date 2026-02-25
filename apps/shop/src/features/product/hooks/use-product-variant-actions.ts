import { useNavigate } from "@tanstack/react-router";

import type { Product } from "~/features/product/types";
import { useIsMobile } from "~/hooks/use-is-mobile";

interface UseProductVariantActionsArgs {
  variants: Product["variants"]["nodes"];
  selectedVariant: Product["variants"]["nodes"][number] | null;
  selectedOptions: Record<string, string>;
  setSelectedVariantId: (variantId: string) => void;
}

export function useProductVariantActions({
  variants,
  selectedVariant,
  selectedOptions,
  setSelectedVariantId,
}: UseProductVariantActionsArgs) {
  const navigate = useNavigate({ from: "/shop/$item" });
  const isMobile = useIsMobile();

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
    void navigate({
      to: ".",
      search: (previousSearch) => ({
        ...previousSearch,
        variant: nextVariant.id,
      }),
      resetScroll: isMobile === false,
    });
  }

  return {
    selectOption,
  };
}
