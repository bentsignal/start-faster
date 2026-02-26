const SHOPIFY_CART_ID_KEY = "shopify-cart-id";

export function getStoredCartId() {
  if (typeof window === "undefined") {
    return undefined;
  }

  const cartId = window.localStorage.getItem(SHOPIFY_CART_ID_KEY);
  return cartId !== null && cartId.length > 0 ? cartId : undefined;
}

export function setStoredCartId(cartId: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(SHOPIFY_CART_ID_KEY, cartId);
}
