import { useEffect, useRef, useState } from "react";
import { createStore } from "rostra";

function useInternalStore() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const openTimerIdRef = useRef<number | null>(null);

  const openCartWithDelay = (delayMs = 500) => {
    if (typeof window === "undefined") {
      setIsCartOpen(true);
      return;
    }

    if (openTimerIdRef.current !== null) {
      window.clearTimeout(openTimerIdRef.current);
    }

    openTimerIdRef.current = window.setTimeout(() => {
      setIsCartOpen(true);
      openTimerIdRef.current = null;
    }, delayMs);
  };

  // eslint-disable-next-line no-restricted-syntax -- cleanup timer on unmount (external browser timer)
  useEffect(() => {
    return () => {
      if (openTimerIdRef.current !== null) {
        window.clearTimeout(openTimerIdRef.current);
      }
    };
  }, []);

  return {
    isCartOpen,
    setIsCartOpen,
    openCartWithDelay,
  };
}

const { Store: CartStore, useStore: useCartStore } =
  createStore(useInternalStore);

export { CartStore, useCartStore };
