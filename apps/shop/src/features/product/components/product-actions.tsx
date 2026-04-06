import { useEffect, useRef, useState } from "react";
import { Loader } from "lucide-react";

import { Button } from "@acme/ui/button";

import { useCartStore } from "~/features/cart/cart-store";
import { useAddToCart } from "~/features/product/hooks/use-add-to-cart";
import { useBuyNow } from "~/features/product/hooks/use-buy-now";
import { useSelectedVariant } from "~/features/product/hooks/use-selected-variant";

function useProductActions() {
  const { selectedVariant } = useSelectedVariant();
  const { addToCart: addToCartMutation } = useAddToCart(selectedVariant);
  const { buyNow, isBuyingNow } = useBuyNow(selectedVariant);

  const openCartWithDelay = useCartStore((store) => store.openCartWithDelay);
  const [wasAddedToCart, setWasAddedToCart] = useState(false);
  const feedbackTimeoutId = useRef<number | null>(null);

  const isUnavailable =
    selectedVariant === null || selectedVariant.availableForSale === false;

  // eslint-disable-next-line no-restricted-syntax -- cleanup timer on unmount (external browser timer)
  useEffect(() => {
    return () => {
      if (feedbackTimeoutId.current !== null) {
        window.clearTimeout(feedbackTimeoutId.current);
      }
    };
  }, []);

  function addToCart() {
    if (isUnavailable) {
      return;
    }

    setWasAddedToCart(true);
    if (feedbackTimeoutId.current !== null) {
      window.clearTimeout(feedbackTimeoutId.current);
    }
    feedbackTimeoutId.current = window.setTimeout(() => {
      setWasAddedToCart(false);
      feedbackTimeoutId.current = null;
    }, 500);

    addToCartMutation();
    openCartWithDelay(250);
  }

  return { addToCart, wasAddedToCart, buyNow, isBuyingNow, isUnavailable };
}

export function ProductActions() {
  const { addToCart, wasAddedToCart, buyNow, isBuyingNow, isUnavailable } =
    useProductActions();

  return (
    <div className="mb-8 flex flex-col gap-2">
      <Button
        disabled={isUnavailable || wasAddedToCart}
        variant="default"
        onClick={addToCart}
      >
        {wasAddedToCart ? "Added to Cart" : "Add to Cart"}
      </Button>
      <Button
        disabled={isUnavailable || isBuyingNow}
        variant="secondary"
        onClick={buyNow}
      >
        {isBuyingNow ? <Loader className="size-4 animate-spin" /> : "Buy Now"}
      </Button>
    </div>
  );
}
