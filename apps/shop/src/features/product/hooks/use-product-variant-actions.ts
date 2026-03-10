import type { RefObject } from "react";
import { useNavigate } from "@tanstack/react-router";

import type { CarouselApi } from "@acme/ui/carousel";

import type { Product } from "~/features/product/types";
import { isColorOptionName } from "~/features/product/lib/option-names";
import { useIsMobile } from "~/hooks/use-is-mobile";
import { useProductPurchaseActions } from "./use-product-purchase-actions";

interface UseProductVariantActionsArgs {
  variants: Product["variants"]["nodes"];
  productTitle: string;
  productHandle: string;
  selectedVariant: Product["variants"]["nodes"][number] | null;
  selectedOptions: Record<string, string>;
  carouselApi: RefObject<CarouselApi | null>;
  scrollDesktopGalleryToImage: RefObject<((index: number) => void) | null>;
  variantImageIndexById: Record<string, number>;
}

export function useProductVariantActions({
  variants,
  productTitle,
  productHandle,
  selectedVariant,
  selectedOptions,
  carouselApi,
  scrollDesktopGalleryToImage,
  variantImageIndexById,
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

    const isColorOption = isColorOptionName(optionName);
    const targetImageIndex = variantImageIndexById[nextVariant.id];

    if (isColorOption && targetImageIndex !== undefined) {
      window.requestAnimationFrame(() => {
        if (isMobile) {
          carouselApi.current?.scrollTo(targetImageIndex, "smooth");
          return;
        }

        scrollDesktopGalleryToImage.current?.(targetImageIndex);
      });
    }

    void navigate({
      to: ".",
      search: (previousSearch) => ({
        ...previousSearch,
        variant: nextVariant.id,
      }),
      replace: true,
      resetScroll: false,
    });
  }

  return {
    selectOption,
    ...purchaseActions,
  };
}
