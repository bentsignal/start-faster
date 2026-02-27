import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

import { toast } from "@acme/ui/toaster";

import type { Product } from "~/features/product/types";
import { useAddCartLine } from "~/features/cart/hooks/use-cart";
import { getStoredCartId, setStoredCartId } from "~/features/cart/lib/cart-id";
import { prepareCheckoutFn } from "~/features/cart/server/prepare-checkout";
import { useCartStore } from "~/features/cart/store";
import { useIsMobile } from "~/hooks/use-is-mobile";

interface UseProductVariantActionsArgs {
  variants: Product["variants"]["nodes"];
  productTitle: string;
  productHandle: string;
  selectedVariant: Product["variants"]["nodes"][number] | null;
  selectedOptions: Record<string, string>;
}

export function useProductVariantActions({
  variants,
  productTitle,
  productHandle,
  selectedVariant,
  selectedOptions,
}: UseProductVariantActionsArgs) {
  const navigate = useNavigate({ from: "/shop/$item" });
  const isMobile = useIsMobile();
  const openCartWithDelay = useCartStore((store) => store.openCartWithDelay);
  const addCartLine = useAddCartLine();
  const [wasAddedToCart, setWasAddedToCart] = useState(false);
  const addToCartFeedbackTimeoutId = useRef<number | null>(null);
  const buyNowMutation = useMutation({
    mutationFn: async (merchandiseId: string) => {
      return prepareCheckoutFn({
        data: {
          cartId: getStoredCartId(),
          merchandiseId,
          quantity: 1,
        },
      });
    },
    onSuccess: (nextCheckout) => {
      setStoredCartId(nextCheckout.id);
      window.location.assign(nextCheckout.checkoutUrl);
    },
    onError: () => {
      toast.error("There was an error with your checkout. Please try again.");
    },
  });

  useEffect(() => {
    return () => {
      if (addToCartFeedbackTimeoutId.current !== null) {
        window.clearTimeout(addToCartFeedbackTimeoutId.current);
      }
    };
  }, []);

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

    void navigate({
      to: ".",
      search: (previousSearch) => ({
        ...previousSearch,
        variant: nextVariant.id,
      }),
      resetScroll: isMobile === false,
    });
  }

  function buyNow() {
    if (
      selectedVariant === null ||
      selectedVariant.availableForSale === false
    ) {
      return;
    }

    buyNowMutation.mutate(selectedVariant.id);
  }

  function addToCart() {
    if (
      selectedVariant === null ||
      selectedVariant.availableForSale === false
    ) {
      return;
    }

    setWasAddedToCart(true);
    if (addToCartFeedbackTimeoutId.current !== null) {
      window.clearTimeout(addToCartFeedbackTimeoutId.current);
    }
    addToCartFeedbackTimeoutId.current = window.setTimeout(() => {
      setWasAddedToCart(false);
      addToCartFeedbackTimeoutId.current = null;
    }, 2_000);

    const variantImage = selectedVariant.image ?? null;

    addCartLine.mutate({
      merchandiseId: selectedVariant.id,
      quantity: 1,
      optimisticLine: {
        merchandiseId: selectedVariant.id,
        quantity: 1,
        unitAmount: Number(selectedVariant.price.amount),
        currencyCode: selectedVariant.price.currencyCode,
        variantTitle: selectedVariant.title,
        productTitle,
        productHandle,
        image:
          variantImage === null
            ? null
            : {
                url: variantImage.url,
                altText: variantImage.altText ?? null,
                width: variantImage.width ?? null,
                height: variantImage.height ?? null,
              },
        selectedOptions: selectedVariant.selectedOptions,
      },
    });
    openCartWithDelay(500);
  }

  return {
    selectOption,
    addToCart,
    wasAddedToCart,
    buyNow,
    isBuyingNow: buyNowMutation.isPending,
  };
}
