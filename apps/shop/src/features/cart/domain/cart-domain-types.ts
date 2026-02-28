import type { CartLineIntent, CartLineSyncStatus } from "~/features/cart/types";

export interface CartDomainState {
  cartId: string | null;
  storedQuantity: number;
  isCartOpen: boolean;
  lineIntentsById: Record<string, CartLineIntent>;
  lineSyncStatusById: Record<string, CartLineSyncStatus>;
}

export type CartDomainAction =
  | { type: "set-cart-open"; open: boolean }
  | { type: "set-cart-id"; cartId: string | null }
  | { type: "set-stored-quantity"; quantity: number }
  | { type: "clear-cart" }
  | {
      type: "upsert-line-intent";
      lineId: string;
      desiredQuantity: number;
      version: number;
      status?: Exclude<CartLineSyncStatus, "idle">;
    }
  | {
      type: "set-line-sync-status";
      lineId: string;
      status: CartLineSyncStatus;
      retryCount?: number;
    }
  | { type: "clear-line-intent"; lineId: string };
