import { useEffect } from "react";

import {
  clearStoredCartId,
  clearStoredCartQuantity,
  setStoredCartId,
  setStoredCartQuantity,
} from "~/features/cart/lib/cart-id";

interface UseCartPersistenceArgs {
  cartId: string | null;
  quantity: number;
}

export function useCartPersistence({
  cartId,
  quantity,
}: UseCartPersistenceArgs) {
  useEffect(() => {
    if (cartId === null) {
      clearStoredCartId();
      clearStoredCartQuantity();
      return;
    }

    setStoredCartId(cartId);
  }, [cartId]);

  useEffect(() => {
    if (cartId === null) {
      return;
    }

    setStoredCartQuantity(quantity);
  }, [cartId, quantity]);
}
