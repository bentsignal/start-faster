import type { cartQueries } from "~/features/cart/lib/cart-queries";
import {
  clearStoredCartId,
  clearStoredCartQuantity,
} from "~/features/cart/lib/cart-storage";

export const CART_WRITE_SCOPE_ID = "cart-write";

export interface CartMutationContext {
  queryKey: ReturnType<typeof cartQueries.detail>["queryKey"];
  previousCartId: string | null;
}

export function clearCartStorage() {
  clearStoredCartId();
  clearStoredCartQuantity();
}
