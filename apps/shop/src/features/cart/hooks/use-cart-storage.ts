import { useSyncExternalStore } from "react";

import {
  getCartStorageServerSnapshot,
  getCartStorageSnapshot,
  subscribeToCartStorage,
} from "~/features/cart/lib/cart-storage";

export function useCartStorage() {
  return useSyncExternalStore(
    subscribeToCartStorage,
    getCartStorageSnapshot,
    getCartStorageServerSnapshot,
  );
}
