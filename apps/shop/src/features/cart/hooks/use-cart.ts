import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { toast } from "@acme/ui/toaster";

import type {
  Cart,
  CartLineIntent,
  CartLineSyncStatus,
  OptimisticCartLineDraft,
} from "~/features/cart/types";
import {
  ackIntentIfCurrent,
  applyIntentToCart,
  clearIntent,
  nextRetryDelay,
  setIntentStatus,
  upsertIntent,
} from "~/features/cart/lib/cart-intent";
import { cartQueries } from "~/features/cart/lib/cart-queries";
import {
  applyOptimisticAdd,
  applyOptimisticRemove,
} from "~/features/cart/lib/optimistic-cart";
import {
  addCartLineFn,
  removeCartLineFn,
  updateCartLineFn,
} from "~/features/cart/server/manage-cart";
import { useCartStore } from "~/features/cart/store";

interface MutationContext {
  previousCart: Cart | null;
  queryKey: ReturnType<typeof cartQueries.detail>["queryKey"];
}

interface AddCartLineArgs {
  merchandiseId: string;
  quantity?: number;
  optimisticLine?: OptimisticCartLineDraft;
}

interface UpdateCartLineArgs {
  lineId: string;
  quantity: number;
}

interface ChangeCartLineQuantityArgs {
  lineId: string;
  delta: number;
}

interface FlushPendingOptions {
  timeoutMs?: number;
}

interface RemoveCartLineArgs {
  lineId: string;
}

const QUANTITY_UPDATE_DEBOUNCE_MS = 250;
const CHECKOUT_FLUSH_POLL_INTERVAL_MS = 50;
const CHECKOUT_FLUSH_TIMEOUT_MS = 3000;

const lineIntentsById = new Map<string, CartLineIntent>();

function syncCartCache(
  queryClient: ReturnType<typeof useQueryClient>,
  previousKey: ReturnType<typeof cartQueries.detail>["queryKey"],
  nextCart: Cart,
) {
  const nextKey = cartQueries.detail(nextCart.id).queryKey;
  queryClient.setQueryData(nextKey, nextCart);

  if (previousKey[1] !== nextKey[1]) {
    queryClient.removeQueries({
      queryKey: previousKey,
      exact: true,
    });
  }
}

function syncCartCacheWithIntents(
  queryClient: ReturnType<typeof useQueryClient>,
  previousKey: ReturnType<typeof cartQueries.detail>["queryKey"],
  nextCart: Cart,
) {
  const nextCartWithIntents =
    applyIntentToCart(nextCart, lineIntentsById) ?? nextCart;
  syncCartCache(queryClient, previousKey, nextCartWithIntents);
}

function clearCartIntents() {
  lineIntentsById.clear();
}

export function useCartQuery() {
  const cartId = useCartStore((store) => store.cartId);
  const setCartId = useCartStore((store) => store.setCartId);
  const setCartQuantity = useCartStore((store) => store.setCartQuantity);
  const queryClient = useQueryClient();
  const cartQuery = useQuery({
    ...cartQueries.detail(cartId),
    select: (serverCart) => applyIntentToCart(serverCart, lineIntentsById),
  });

  useEffect(() => {
    if (
      cartId === null ||
      cartQuery.isSuccess === false ||
      cartQuery.data !== null
    ) {
      return;
    }

    setCartId(null);
    clearCartIntents();
    queryClient.removeQueries({
      queryKey: cartQueries.all().queryKey,
    });
  }, [cartId, cartQuery.data, cartQuery.isSuccess, queryClient, setCartId]);

  useEffect(() => {
    if (cartQuery.data === undefined) {
      return;
    }

    setCartQuantity(cartQuery.data?.totalQuantity ?? 0);
  }, [cartQuery.data, setCartQuantity]);

  return cartQuery;
}

export function useAddCartLine() {
  const queryClient = useQueryClient();
  const cartId = useCartStore((store) => store.cartId);
  const setCartId = useCartStore((store) => store.setCartId);
  const setCartQuantity = useCartStore((store) => store.setCartQuantity);

  return useMutation({
    mutationKey: ["cart", "line", "add"],
    mutationFn: async (variables: AddCartLineArgs) => {
      return addCartLineFn({
        data: {
          cartId: cartId ?? undefined,
          merchandiseId: variables.merchandiseId,
          quantity: variables.quantity ?? 1,
        },
      });
    },
    onMutate: async (variables) => {
      const activeKey = cartQueries.detail(cartId).queryKey;
      await queryClient.cancelQueries({
        queryKey: cartQueries.all().queryKey,
      });
      const previousCart =
        queryClient.getQueryData<Cart | null>(activeKey) ?? null;
      const optimisticCart = applyOptimisticAdd(
        previousCart,
        variables.optimisticLine ?? null,
      );

      if (optimisticCart !== null) {
        queryClient.setQueryData(activeKey, optimisticCart);
      }

      return {
        previousCart,
        queryKey: activeKey,
      } satisfies MutationContext;
    },
    onError: (_error, _variables, context) => {
      if (context !== undefined) {
        queryClient.setQueryData(context.queryKey, context.previousCart);
      }
      console.error(_error);
      toast.error("Unable to add this item to your cart. Please try again.");
    },
    onSuccess: (nextCart, _variables, context) => {
      const previousKey = context.queryKey;
      syncCartCacheWithIntents(queryClient, previousKey, nextCart);
      setCartId(nextCart.id);
      setCartQuantity(nextCart.totalQuantity);
    },
  });
}

export function useUpdateCartLine() {
  const queryClient = useQueryClient();
  const cartId = useCartStore((store) => store.cartId);
  const setCartId = useCartStore((store) => store.setCartId);
  const setCartQuantity = useCartStore((store) => store.setCartQuantity);
  const [lineSyncState, setLineSyncState] = useState<{
    cartId: string | null;
    byId: Record<string, CartLineSyncStatus>;
  }>({
    cartId: null,
    byId: {},
  });
  const flushTimerByLineId = useRef<Map<string, number>>(new Map());
  const retryTimerByLineId = useRef<Map<string, number>>(new Map());
  const inFlightLineIds = useRef<Set<string>>(new Set());
  const inFlightVersionByLineId = useRef<Map<string, number>>(new Map());
  const flushLineQuantityUpdateRef = useRef<((lineId: string) => void) | null>(
    null,
  );

  const setSyncStatus = useCallback(
    (lineId: string, status: CartLineSyncStatus) => {
      if (cartId === null) {
        return;
      }

      setLineSyncState((previous) => {
        const previousById = previous.cartId === cartId ? previous.byId : {};

        if (status === "idle") {
          if (previousById[lineId] === undefined) {
            return previous;
          }

          const next = { ...previousById };
          delete next[lineId];
          return {
            cartId,
            byId: next,
          };
        }

        if (previousById[lineId] === status) {
          return previous;
        }

        return {
          cartId,
          byId: {
            ...previousById,
            [lineId]: status,
          },
        };
      });
    },
    [cartId],
  );

  const clearLineTimers = useCallback((lineId: string) => {
    const flushTimerId = flushTimerByLineId.current.get(lineId);
    if (flushTimerId !== undefined) {
      window.clearTimeout(flushTimerId);
      flushTimerByLineId.current.delete(lineId);
    }

    const retryTimerId = retryTimerByLineId.current.get(lineId);
    if (retryTimerId !== undefined) {
      window.clearTimeout(retryTimerId);
      retryTimerByLineId.current.delete(lineId);
    }
  }, []);

  const flushLineQuantityUpdate = useCallback(
    (lineId: string) => {
      if (cartId === null || inFlightLineIds.current.has(lineId)) {
        return;
      }

      const intent = lineIntentsById.get(lineId);
      if (intent === undefined) {
        setSyncStatus(lineId, "idle");
        return;
      }

      clearLineTimers(lineId);
      setIntentStatus(lineIntentsById, lineId, "syncing", intent.retryCount);
      setSyncStatus(lineId, "syncing");
      inFlightLineIds.current.add(lineId);
      inFlightVersionByLineId.current.set(lineId, intent.version);

      const activeKey = cartQueries.detail(cartId).queryKey;
      void updateCartLineFn({
        data: {
          cartId,
          lineId,
          quantity: intent.desiredQuantity,
        },
      })
        .then((nextCart) => {
          const sentVersion = inFlightVersionByLineId.current.get(lineId);
          if (sentVersion !== undefined) {
            ackIntentIfCurrent(lineIntentsById, lineId, sentVersion);
          }

          syncCartCacheWithIntents(queryClient, activeKey, nextCart);
          setCartId(nextCart.id);
          setCartQuantity(nextCart.totalQuantity);

          if (lineIntentsById.has(lineId)) {
            setSyncStatus(lineId, "queued");
            flushLineQuantityUpdateRef.current?.(lineId);
            return;
          }

          setSyncStatus(lineId, "idle");
        })
        .catch(() => {
          const latestIntent = lineIntentsById.get(lineId);
          if (latestIntent === undefined) {
            setSyncStatus(lineId, "idle");
            return;
          }

          const nextRetryCount = latestIntent.retryCount + 1;
          const isOffline =
            typeof navigator !== "undefined" && navigator.onLine === false;
          const nextStatus: CartLineSyncStatus = isOffline
            ? "error"
            : "retrying";

          setIntentStatus(lineIntentsById, lineId, nextStatus, nextRetryCount);
          setSyncStatus(lineId, nextStatus);

          if (isOffline) {
            return;
          }

          const retryDelay = nextRetryDelay(nextRetryCount);
          const retryTimerId = window.setTimeout(() => {
            retryTimerByLineId.current.delete(lineId);
            flushLineQuantityUpdateRef.current?.(lineId);
          }, retryDelay);

          retryTimerByLineId.current.set(lineId, retryTimerId);
        })
        .finally(() => {
          inFlightLineIds.current.delete(lineId);
          inFlightVersionByLineId.current.delete(lineId);
        });
    },
    [
      cartId,
      clearLineTimers,
      queryClient,
      setCartId,
      setCartQuantity,
      setSyncStatus,
    ],
  );
  useEffect(() => {
    flushLineQuantityUpdateRef.current = flushLineQuantityUpdate;
  }, [flushLineQuantityUpdate]);

  const scheduleLineFlush = useCallback(
    (lineId: string, delayMs = QUANTITY_UPDATE_DEBOUNCE_MS) => {
      const activeTimerId = flushTimerByLineId.current.get(lineId);
      if (activeTimerId !== undefined) {
        window.clearTimeout(activeTimerId);
      }

      const timerId = window.setTimeout(() => {
        flushTimerByLineId.current.delete(lineId);
        flushLineQuantityUpdate(lineId);
      }, delayMs);

      flushTimerByLineId.current.set(lineId, timerId);
    },
    [flushLineQuantityUpdate],
  );

  const setLineQuantity = useCallback(
    (variables: UpdateCartLineArgs) => {
      if (cartId === null) {
        toast.error("Missing cart ID for quantity update.");
        return;
      }

      const activeKey = cartQueries.detail(cartId).queryKey;
      upsertIntent(lineIntentsById, {
        lineId: variables.lineId,
        desiredQuantity: variables.quantity,
      });
      setSyncStatus(variables.lineId, "queued");

      const currentCart =
        queryClient.getQueryData<Cart | null>(activeKey) ?? null;
      const nextDisplayCart = applyIntentToCart(currentCart, lineIntentsById);
      queryClient.setQueryData(activeKey, nextDisplayCart);

      scheduleLineFlush(variables.lineId);
    },
    [cartId, queryClient, scheduleLineFlush, setSyncStatus],
  );

  const changeLineQuantity = useCallback(
    (variables: ChangeCartLineQuantityArgs) => {
      if (cartId === null) {
        toast.error("Missing cart ID for quantity update.");
        return;
      }

      const activeKey = cartQueries.detail(cartId).queryKey;
      const cart = queryClient.getQueryData<Cart | null>(activeKey) ?? null;
      const targetLine = cart?.lines.find(
        (line) => line.id === variables.lineId,
      );
      if (targetLine === undefined) {
        return;
      }

      const nextQuantity = targetLine.quantity + variables.delta;
      if (nextQuantity <= 0) {
        return;
      }

      setLineQuantity({
        lineId: variables.lineId,
        quantity: nextQuantity,
      });
    },
    [cartId, queryClient, setLineQuantity],
  );

  const clearLineIntent = useCallback(
    (lineId: string) => {
      clearLineTimers(lineId);
      clearIntent(lineIntentsById, lineId);
      inFlightLineIds.current.delete(lineId);
      inFlightVersionByLineId.current.delete(lineId);
      setSyncStatus(lineId, "idle");

      if (cartId === null) {
        return;
      }

      const activeKey = cartQueries.detail(cartId).queryKey;
      const currentCart =
        queryClient.getQueryData<Cart | null>(activeKey) ?? null;
      const nextDisplayCart = applyIntentToCart(currentCart, lineIntentsById);
      queryClient.setQueryData(activeKey, nextDisplayCart);
    },
    [cartId, clearLineTimers, queryClient, setSyncStatus],
  );

  const flushPending = useCallback(
    async (options?: FlushPendingOptions) => {
      const timeoutMs = options?.timeoutMs ?? CHECKOUT_FLUSH_TIMEOUT_MS;

      for (const [lineId, intent] of lineIntentsById.entries()) {
        if (intent.status !== "syncing") {
          setIntentStatus(lineIntentsById, lineId, "queued", intent.retryCount);
          setSyncStatus(lineId, "queued");
        }
        clearLineTimers(lineId);
        flushLineQuantityUpdate(lineId);
      }

      const deadline = Date.now() + timeoutMs;
      while (Date.now() < deadline) {
        if (lineIntentsById.size === 0 && inFlightLineIds.current.size === 0) {
          return true;
        }

        await new Promise((resolve) => {
          window.setTimeout(resolve, CHECKOUT_FLUSH_POLL_INTERVAL_MS);
        });
      }

      for (const lineId of lineIntentsById.keys()) {
        setIntentStatus(lineIntentsById, lineId, "error");
        setSyncStatus(lineId, "error");
      }

      return false;
    },
    [clearLineTimers, flushLineQuantityUpdate, setSyncStatus],
  );

  useEffect(() => {
    if (cartId !== null) {
      return;
    }

    clearCartIntents();
    inFlightLineIds.current.clear();
    inFlightVersionByLineId.current.clear();

    for (const timerId of flushTimerByLineId.current.values()) {
      window.clearTimeout(timerId);
    }
    flushTimerByLineId.current.clear();

    for (const timerId of retryTimerByLineId.current.values()) {
      window.clearTimeout(timerId);
    }
    retryTimerByLineId.current.clear();
  }, [cartId]);

  useEffect(() => {
    const handleOnline = () => {
      for (const [lineId, intent] of lineIntentsById.entries()) {
        if (intent.status !== "retrying" && intent.status !== "error") {
          continue;
        }

        setIntentStatus(lineIntentsById, lineId, "queued", intent.retryCount);
        setSyncStatus(lineId, "queued");
        clearLineTimers(lineId);
        flushLineQuantityUpdate(lineId);
      }
    };

    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, [clearLineTimers, flushLineQuantityUpdate, setSyncStatus]);

  useEffect(() => {
    const flushTimers = flushTimerByLineId.current;
    const retryTimers = retryTimerByLineId.current;
    const inFlight = inFlightLineIds.current;
    const inFlightVersions = inFlightVersionByLineId.current;

    return () => {
      for (const timerId of flushTimers.values()) {
        window.clearTimeout(timerId);
      }
      flushTimers.clear();

      for (const timerId of retryTimers.values()) {
        window.clearTimeout(timerId);
      }
      retryTimers.clear();

      inFlight.clear();
      inFlightVersions.clear();
    };
  }, []);

  const lineSyncStatusById =
    lineSyncState.cartId === cartId ? lineSyncState.byId : {};
  const hasPendingSync = Object.keys(lineSyncStatusById).length > 0;

  return {
    changeLineQuantity,
    setLineQuantity,
    clearLineIntent,
    mutate: setLineQuantity,
    flushPending,
    lineSyncStatusById,
    hasPendingSync,
    isPending: hasPendingSync,
  };
}

export function useRemoveCartLine() {
  const queryClient = useQueryClient();
  const cartId = useCartStore((store) => store.cartId);
  const setCartId = useCartStore((store) => store.setCartId);
  const setCartQuantity = useCartStore((store) => store.setCartQuantity);

  return useMutation({
    mutationKey: ["cart", "line", "remove"],
    mutationFn: async (variables: RemoveCartLineArgs) => {
      if (cartId === null) {
        throw new Error("Missing cart ID for line removal.");
      }

      return removeCartLineFn({
        data: {
          cartId,
          lineId: variables.lineId,
        },
      });
    },
    onMutate: async (variables) => {
      const activeKey = cartQueries.detail(cartId).queryKey;
      clearIntent(lineIntentsById, variables.lineId);
      await queryClient.cancelQueries({
        queryKey: cartQueries.all().queryKey,
      });

      const previousCart =
        queryClient.getQueryData<Cart | null>(activeKey) ?? null;
      const optimisticCart = applyOptimisticRemove(
        previousCart,
        variables.lineId,
      );
      queryClient.setQueryData(
        activeKey,
        applyIntentToCart(optimisticCart, lineIntentsById),
      );

      return {
        previousCart,
        queryKey: activeKey,
      } satisfies MutationContext;
    },
    onError: (_error, _variables, context) => {
      if (context !== undefined) {
        queryClient.setQueryData(context.queryKey, context.previousCart);
      }
      toast.error("Unable to remove this item from your cart.");
    },
    onSuccess: (nextCart, _variables, context) => {
      const previousKey = context.queryKey;
      syncCartCacheWithIntents(queryClient, previousKey, nextCart);
      setCartId(nextCart.id);
      setCartQuantity(nextCart.totalQuantity);
    },
  });
}

export function useCartQuantity() {
  const storedQuantity = useCartStore((store) => store.cartQuantity);
  const { data } = useCartQuery();
  return data?.totalQuantity ?? storedQuantity;
}
