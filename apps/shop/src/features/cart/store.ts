import { useCallback, useEffect, useRef, useState } from "react";
import { createStore } from "rostra";

function useInternalStore() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const openTimerIdRef = useRef<number | null>(null);

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
    openCartWithDelay,
  };
}

const { Store: CartStore, useStore: useCartStore } =
  createStore(useInternalStore);

export { CartStore, useCartStore };
