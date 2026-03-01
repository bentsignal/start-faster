import { createStore } from "rostra";

import {
  useAddCartLine,
  useCheckForPendingMutations,
  useUpdateCartLine,
} from "~/features/cart/hooks/use-cart-mutations";
import { useCart } from "./hooks/use-cart";
import { useCartModal } from "./hooks/use-cart-modal";

function useInternalStore() {
  const { isCartOpen, setIsCartOpen, openCartWithDelay } = useCartModal();
  const { cartId, cart, cartQuery, cartQuantity } = useCart();
  const addLine = useAddCartLine({ cartId });
  const { changeLineQuantity } = useUpdateCartLine({ cartId, cart });
  const checkForPendingMutations = useCheckForPendingMutations();

  return {
    isCartOpen,
    setIsCartOpen,
    openCartWithDelay,
    cartId,
    cart,
    cartQuery,
    cartQuantity,
    addLine,
    changeLineQuantity,
    checkForPendingMutations,
  };
}

const { Store: CartStore, useStore: useCartStore } =
  createStore(useInternalStore);

export { CartStore, useCartStore };
