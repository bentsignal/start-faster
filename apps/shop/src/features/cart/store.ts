import { useCallback, useEffect, useRef, useState } from "react";
import { createStore } from "rostra";

import type { CartCookieState } from "~/features/cart/server/cart-cookie";
import {
  getStoredCartId,
  getStoredCartQuantity,
  setStoredCartId,
  setStoredCartQuantity,
} from "~/features/cart/lib/cart-id";

interface CartStoreProps {
  initialCart?: CartCookieState;
}

function useInternalStore({
  initialCart = { id: null, quantity: 0 },
}: CartStoreProps) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const openTimerIdRef = useRef<number | null>(null);

  useEffect(() => {
    const storedCartId = getStoredCartId();
    if (storedCartId === undefined && initialCart.id !== null) {
      setStoredCartId(initialCart.id);
    }

    const storedQuantity = getStoredCartQuantity();
    if (storedQuantity === 0 && initialCart.quantity > 0) {
      setStoredCartQuantity(initialCart.quantity);
    }
  }, [initialCart.id, initialCart.quantity]);

  const setCartOpen = useCallback((open: boolean) => {
    setIsCartOpen(open);
  }, []);

  const openCartWithDelay = useCallback(
    (delayMs = 500) => {
      if (typeof window === "undefined") {
        setCartOpen(true);
        return;
      }

      if (openTimerIdRef.current !== null) {
        window.clearTimeout(openTimerIdRef.current);
      }

      openTimerIdRef.current = window.setTimeout(() => {
        setCartOpen(true);
        openTimerIdRef.current = null;
      }, delayMs);
    },
    [setCartOpen],
  );

  useEffect(() => {
    return () => {
      if (openTimerIdRef.current !== null) {
        window.clearTimeout(openTimerIdRef.current);
      }
    };
  }, []);

  return {
    isCartOpen,
    setCartOpen,
    openCart: () => setCartOpen(true),
    closeCart: () => setCartOpen(false),
    openCartWithDelay,
  };
}

const { Store: CartStore, useStore: useCartStore } =
  createStore(useInternalStore);

export { CartStore, useCartStore };
