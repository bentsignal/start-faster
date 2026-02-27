import { useEffect, useRef, useState } from "react";
import { createStore } from "rostra";

import {
  clearStoredCartId,
  clearStoredCartQuantity,
  getStoredCartId,
  getStoredCartQuantity,
  setStoredCartId,
  setStoredCartQuantity,
} from "~/features/cart/lib/cart-id";

interface CartStoreProps {
  initialCartQuantity?: number;
}

function useInternalStore({ initialCartQuantity = 0 }: CartStoreProps) {
  const [cartId, setCartIdState] = useState<string | null>(
    () => getStoredCartId() ?? null,
  );
  const [cartQuantity, setCartQuantityState] = useState<number>(
    () => getStoredCartQuantity() || initialCartQuantity,
  );
  const [isCartOpen, setCartOpen] = useState(false);
  const openTimerId = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (openTimerId.current !== null) {
        window.clearTimeout(openTimerId.current);
      }
    };
  }, []);

  const setCartId = (nextCartId: string | null) => {
    if (nextCartId === null) {
      clearStoredCartId();
      clearStoredCartQuantity();
      setCartQuantityState(0);
    } else {
      setStoredCartId(nextCartId);
    }

    setCartIdState(nextCartId);
  };

  const setCartQuantity = (nextQuantity: number) => {
    setStoredCartQuantity(nextQuantity);
    setCartQuantityState(Math.max(0, Math.floor(nextQuantity)));
  };

  const openCart = () => {
    setCartOpen(true);
  };

  const closeCart = () => {
    setCartOpen(false);
  };

  const openCartWithDelay = (delayMs = 500) => {
    if (typeof window === "undefined") {
      openCart();
      return;
    }

    if (openTimerId.current !== null) {
      window.clearTimeout(openTimerId.current);
    }

    openTimerId.current = window.setTimeout(() => {
      openCart();
      openTimerId.current = null;
    }, delayMs);
  };

  return {
    cartId,
    setCartId,
    cartQuantity,
    setCartQuantity,
    isCartOpen,
    setCartOpen,
    openCart,
    closeCart,
    openCartWithDelay,
  };
}

const { Store: CartStore, useStore: useCartStore } =
  createStore(useInternalStore);

export { CartStore, useCartStore };
