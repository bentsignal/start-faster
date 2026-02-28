export const CART_QUANTITY_COOKIE_KEY = "shopify-cart-quantity";
export const CART_ID_COOKIE_KEY = "shopify-cart-id";
const SHOPIFY_CART_ID_KEY = "shopify-cart-id";
const CART_STORAGE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function parseStoredQuantity(value: string | null | undefined): number {
  if (value === null || value === undefined || value.length === 0) {
    return 0;
  }

  const parsedValue = Number.parseInt(value, 10);
  if (Number.isNaN(parsedValue) || parsedValue < 0) {
    return 0;
  }

  return parsedValue;
}

function getClientCookie(name: string): string | undefined {
  if (typeof document === "undefined") {
    return undefined;
  }

  const encodedPrefix = `${encodeURIComponent(name)}=`;
  const cookieEntry = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(encodedPrefix));
  return cookieEntry?.slice(encodedPrefix.length);
}

export function getStoredCartId() {
  if (typeof window === "undefined") {
    return undefined;
  }

  const cartId = window.localStorage.getItem(SHOPIFY_CART_ID_KEY);
  if (cartId !== null && cartId.length > 0) {
    return cartId;
  }

  const cookieCartId = getClientCookie(CART_ID_COOKIE_KEY);
  if (cookieCartId !== undefined && cookieCartId.length > 0) {
    return cookieCartId;
  }

  return undefined;
}

export function setStoredCartId(cartId: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(SHOPIFY_CART_ID_KEY, cartId);
  document.cookie = `${CART_ID_COOKIE_KEY}=${encodeURIComponent(cartId)}; path=/; max-age=${CART_STORAGE_MAX_AGE_SECONDS}; samesite=lax`;
}

export function clearStoredCartId() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(SHOPIFY_CART_ID_KEY);
  document.cookie = `${CART_ID_COOKIE_KEY}=; path=/; max-age=0; samesite=lax`;
}

export function getStoredCartQuantity() {
  if (typeof window === "undefined") {
    return 0;
  }

  const localStorageQuantity = window.localStorage.getItem(
    CART_QUANTITY_COOKIE_KEY,
  );
  if (localStorageQuantity !== null) {
    return parseStoredQuantity(localStorageQuantity);
  }

  const cookieQuantity = getClientCookie(CART_QUANTITY_COOKIE_KEY);
  return parseStoredQuantity(cookieQuantity);
}

export function setStoredCartQuantity(quantity: number) {
  if (typeof window === "undefined") {
    return;
  }

  const normalizedQuantity = Math.max(0, Math.floor(quantity));
  const quantityValue = String(normalizedQuantity);
  window.localStorage.setItem(CART_QUANTITY_COOKIE_KEY, quantityValue);
  document.cookie = `${CART_QUANTITY_COOKIE_KEY}=${quantityValue}; path=/; max-age=${CART_STORAGE_MAX_AGE_SECONDS}; samesite=lax`;
}

export function clearStoredCartQuantity() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(CART_QUANTITY_COOKIE_KEY);
  document.cookie = `${CART_QUANTITY_COOKIE_KEY}=; path=/; max-age=0; samesite=lax`;
}
