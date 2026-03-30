import type { RefObject } from "react";
import { useNavigate } from "@tanstack/react-router";

import type { CarouselApi } from "@acme/ui/carousel";
import { ScreenSize, useScreenStore } from "@acme/features/screen";

import type { Product } from "~/features/product/types";
import { isColorOptionName } from "~/features/product/lib/option-names";

interface UseSelectOptionArgs {
  variants: Product["variants"]["nodes"];
  selectedVariant: Product["variants"]["nodes"][number] | null;
  selectedOptions: Record<string, string>;
  carouselApi: RefObject<CarouselApi | null>;
  scrollDesktopGalleryToImage: RefObject<((index: number) => void) | null>;
  variantImageIndexById: Record<string, number>;
}

export function useSelectOption({
  variants,
  selectedVariant,
  selectedOptions,
  carouselApi,
  scrollDesktopGalleryToImage,
  variantImageIndexById,
}: UseSelectOptionArgs) {
  const navigate = useNavigate({ from: "/shop/$handle" });
  const screen = useScreenStore((store) => store.screen);

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
        if (screen.isSmallerThan(ScreenSize.MD)) {
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

  return { selectOption };
}
