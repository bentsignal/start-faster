import { useCallback, useEffect, useRef, useState } from "react";

// this hook should only be used in the cart store, not directly in components. use the cart store instead.
export function useCartModal() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const openTimerIdRef = useRef<number | null>(null);

  const openCartWithDelay = useCallback(
    (delayMs = 500) => {
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
    },
    [setIsCartOpen],
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
    setIsCartOpen,
    openCartWithDelay,
  };
}
