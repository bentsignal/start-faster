import type { Cart } from "../types";
import { getClientCookie } from "~/lib/cookies";

export const CART_QUANTITY_COOKIE_KEY = "shopify-cart-quantity";
export const CART_ID_COOKIE_KEY = "shopify-cart-id";
const SHOPIFY_CART_ID_KEY = "shopify-cart-id";
const CART_STORAGE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
const cartStorageListeners = new Set<() => void>();

function createCartStorageSnapshot(id: string | null, quantity: number) {
  return {
    id,
    quantity,
  };
}

let cartStorageSnapshot = createCartStorageSnapshot(null, 0);
const cartStorageServerSnapshot = createCartStorageSnapshot(null, 0);

function parseStoredQuantity(value: string | null | undefined) {
  if (value === null || value === undefined || value.length === 0) {
    return 0;
  }

  const parsedValue = Number.parseInt(value, 10);
  if (Number.isNaN(parsedValue) || parsedValue < 0) {
    return 0;
  }

  return parsedValue;
}

function notifyCartStorageListeners() {
  for (const listener of cartStorageListeners) {
    listener();
  }
}

function writeStoredCartId(cartId: string) {
  window.localStorage.setItem(SHOPIFY_CART_ID_KEY, cartId);
  document.cookie = `${CART_ID_COOKIE_KEY}=${encodeURIComponent(cartId)}; path=/; max-age=${CART_STORAGE_MAX_AGE_SECONDS}; samesite=lax`;
}

function clearStoredCartIdValue() {
  window.localStorage.removeItem(SHOPIFY_CART_ID_KEY);
  document.cookie = `${CART_ID_COOKIE_KEY}=; path=/; max-age=0; samesite=lax`;
}

function writeStoredCartQuantity(quantity: number) {
  const normalizedQuantity = Math.max(0, Math.floor(quantity));
  const quantityValue = String(normalizedQuantity);
  window.localStorage.setItem(CART_QUANTITY_COOKIE_KEY, quantityValue);
  document.cookie = `${CART_QUANTITY_COOKIE_KEY}=${quantityValue}; path=/; max-age=${CART_STORAGE_MAX_AGE_SECONDS}; samesite=lax`;
}

function clearStoredCartQuantityValue() {
  window.localStorage.removeItem(CART_QUANTITY_COOKIE_KEY);
  document.cookie = `${CART_QUANTITY_COOKIE_KEY}=; path=/; max-age=0; samesite=lax`;
}

export function storeCart(cart: Cart) {
  if (typeof window === "undefined") {
    return;
  }

  writeStoredCartId(cart.id);
  writeStoredCartQuantity(cart.totalQuantity);
  notifyCartStorageListeners();
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

  writeStoredCartId(cartId);
  notifyCartStorageListeners();
}

export function clearStoredCartId() {
  if (typeof window === "undefined") {
    return;
  }

  clearStoredCartIdValue();
  notifyCartStorageListeners();
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

  writeStoredCartQuantity(quantity);
  notifyCartStorageListeners();
}

export function clearStoredCartQuantity() {
  if (typeof window === "undefined") {
    return;
  }

  clearStoredCartQuantityValue();
  notifyCartStorageListeners();
}

export function subscribeToCartStorage(listener: () => void) {
  cartStorageListeners.add(listener);

  if (typeof window === "undefined") {
    return () => {
      cartStorageListeners.delete(listener);
    };
  }

  function handleStorage(event: StorageEvent) {
    if (
      event.key !== null &&
      event.key !== SHOPIFY_CART_ID_KEY &&
      event.key !== CART_QUANTITY_COOKIE_KEY
    ) {
      return;
    }

    listener();
  }

  window.addEventListener("storage", handleStorage);

  return () => {
    cartStorageListeners.delete(listener);
    window.removeEventListener("storage", handleStorage);
  };
}

export function getCartStorageSnapshot() {
  const nextSnapshot = createCartStorageSnapshot(
    getStoredCartId() ?? null,
    getStoredCartQuantity(),
  );

  if (
    cartStorageSnapshot.id === nextSnapshot.id &&
    cartStorageSnapshot.quantity === nextSnapshot.quantity
  ) {
    return cartStorageSnapshot;
  }

  cartStorageSnapshot = nextSnapshot;
  return cartStorageSnapshot;
}

export function getCartStorageServerSnapshot() {
  return cartStorageServerSnapshot;
}
