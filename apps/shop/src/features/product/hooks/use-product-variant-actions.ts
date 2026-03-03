import type { RefObject } from "react";
import { useNavigate } from "@tanstack/react-router";

import type { CarouselApi } from "@acme/ui/carousel";

import type { Product } from "~/features/product/types";
import { useIsMobile } from "~/hooks/use-is-mobile";
import { useProductPurchaseActions } from "./use-product-purchase-actions";

interface UseProductVariantActionsArgs {
  variants: Product["variants"]["nodes"];
  productTitle: string;
  productHandle: string;
  selectedVariant: Product["variants"]["nodes"][number] | null;
  selectedOptions: Record<string, string>;
  carouselApi: RefObject<CarouselApi | null>;
}

export function useProductVariantActions({
  variants,
  productTitle,
  productHandle,
  selectedVariant,
  selectedOptions,
  carouselApi,
}: UseProductVariantActionsArgs) {
  const navigate = useNavigate({ from: "/shop/$handle" });
  const isMobile = useIsMobile();
  const purchaseActions = useProductPurchaseActions({
    productTitle,
    productHandle,
    selectedVariant,
  });

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

    if (nextVariant.id === selectedVariant.id) {
      return;
    }

    if (optionName === "Color") {
      window.requestAnimationFrame(() => {
        carouselApi.current?.scrollTo(0, "auto");
      });
    }

    const shouldResetScroll = isMobile === false && optionName === "Color";

    void navigate({
      to: ".",
      search: (previousSearch) => ({
        ...previousSearch,
        variant: nextVariant.id,
      }),
      resetScroll: shouldResetScroll,
    });
  }

  return {
    selectOption,
    ...purchaseActions,
  };
}
