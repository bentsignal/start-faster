import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

import { toast } from "@acme/ui/toaster";

import type { Product } from "~/features/product/types";
import { getStoredCartId, setStoredCartId } from "~/features/cart/lib/cart-id";
import { prepareCheckoutFn } from "~/features/cart/server/prepare-checkout";
import { useIsMobile } from "~/hooks/use-is-mobile";

interface UseProductVariantActionsArgs {
  variants: Product["variants"]["nodes"];
  selectedVariant: Product["variants"]["nodes"][number] | null;
  selectedOptions: Record<string, string>;
}

export function useProductVariantActions({
  variants,
  selectedVariant,
  selectedOptions,
}: UseProductVariantActionsArgs) {
  const navigate = useNavigate({ from: "/shop/$item" });
  const isMobile = useIsMobile();
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

  return {
    selectOption,
    buyNow,
    isBuyingNow: buyNowMutation.isPending,
  };
}
