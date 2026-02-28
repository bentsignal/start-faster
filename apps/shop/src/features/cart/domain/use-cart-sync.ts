import type { Dispatch } from "react";
import { useCallback, useEffect, useRef } from "react";

import type { CartDomainAction, CartDomainState } from "./cart-domain-types";
import type { Cart, CartLineSyncStatus } from "~/features/cart/types";

const QUANTITY_UPDATE_DEBOUNCE_MS = 250;
const CHECKOUT_FLUSH_POLL_INTERVAL_MS = 50;
const CHECKOUT_FLUSH_TIMEOUT_MS = 3000;

function nextRetryDelay(retryCount: number) {
  return Math.min(1000 * 2 ** retryCount, 30_000);
}

function getNextLineVersion(
  lineVersionById: Map<string, number>,
  lineId: string,
): number {
  const nextVersion = (lineVersionById.get(lineId) ?? 0) + 1;
  lineVersionById.set(lineId, nextVersion);
  return nextVersion;
}

interface UseCartSyncArgs {
  state: CartDomainState;
  dispatch: Dispatch<CartDomainAction>;
  displayCart: Cart | null;
  applyServerCart: (nextCart: Cart) => void;
  executeUpdateLine: (args: {
    cartId: string;
    lineId: string;
    quantity: number;
  }) => Promise<Cart>;
}

export function useCartSync({
  state,
  dispatch,
  displayCart,
  applyServerCart,
  executeUpdateLine,
}: UseCartSyncArgs) {
  const stateRef = useRef(state);
  const displayCartRef = useRef(displayCart);
  const lineVersionByIdRef = useRef<Map<string, number>>(new Map());
  const flushTimerByLineIdRef = useRef<Map<string, number>>(new Map());
  const retryTimerByLineIdRef = useRef<Map<string, number>>(new Map());
  const inFlightVersionByLineIdRef = useRef<Map<string, number>>(new Map());
  const flushLineQuantityRef = useRef<((lineId: string) => void) | null>(null);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    displayCartRef.current = displayCart;
  }, [displayCart]);

  const clearLineTimers = useCallback((lineId: string) => {
    const flushTimer = flushTimerByLineIdRef.current.get(lineId);
    if (flushTimer !== undefined) {
      window.clearTimeout(flushTimer);
      flushTimerByLineIdRef.current.delete(lineId);
    }

    const retryTimer = retryTimerByLineIdRef.current.get(lineId);
    if (retryTimer !== undefined) {
      window.clearTimeout(retryTimer);
      retryTimerByLineIdRef.current.delete(lineId);
    }
  }, []);

  const flushLineQuantity = useCallback(
    (lineId: string) => {
      const latestState = stateRef.current;
      if (latestState.cartId === null) {
        return;
      }

      if (inFlightVersionByLineIdRef.current.has(lineId)) {
        return;
      }

      const intent = latestState.lineIntentsById[lineId];
      if (intent === undefined) {
        dispatch({ type: "set-line-sync-status", lineId, status: "idle" });
        return;
      }

      clearLineTimers(lineId);
      dispatch({
        type: "set-line-sync-status",
        lineId,
        status: "syncing",
        retryCount: intent.retryCount,
      });

      const sentVersion = intent.version;
      inFlightVersionByLineIdRef.current.set(lineId, sentVersion);

      void executeUpdateLine({
        cartId: latestState.cartId,
        lineId,
        quantity: intent.desiredQuantity,
      })
        .then((nextCart) => {
          const latestVersion = lineVersionByIdRef.current.get(lineId) ?? 0;
          if (latestVersion !== sentVersion) {
            return;
          }

          dispatch({ type: "clear-line-intent", lineId });
          dispatch({ type: "set-line-sync-status", lineId, status: "idle" });
          applyServerCart(nextCart);
        })
        .catch(() => {
          const currentIntent = stateRef.current.lineIntentsById[lineId];
          const latestVersion = lineVersionByIdRef.current.get(lineId) ?? 0;

          if (currentIntent === undefined || latestVersion !== sentVersion) {
            return;
          }

          const nextRetryCount = currentIntent.retryCount + 1;
          const isOffline =
            typeof navigator !== "undefined" && navigator.onLine === false;
          const nextStatus: CartLineSyncStatus = isOffline
            ? "error"
            : "retrying";

          dispatch({
            type: "set-line-sync-status",
            lineId,
            status: nextStatus,
            retryCount: nextRetryCount,
          });

          if (isOffline) {
            return;
          }

          const retryDelay = nextRetryDelay(nextRetryCount);
          const retryTimerId = window.setTimeout(() => {
            retryTimerByLineIdRef.current.delete(lineId);
            flushLineQuantityRef.current?.(lineId);
          }, retryDelay);
          retryTimerByLineIdRef.current.set(lineId, retryTimerId);
        })
        .finally(() => {
          inFlightVersionByLineIdRef.current.delete(lineId);

          const nextIntent = stateRef.current.lineIntentsById[lineId];
          if (nextIntent !== undefined) {
            const pendingFlush = flushTimerByLineIdRef.current.get(lineId);
            const pendingRetry = retryTimerByLineIdRef.current.get(lineId);
            if (pendingFlush === undefined && pendingRetry === undefined) {
              flushLineQuantityRef.current?.(lineId);
            }
          }
        });
    },
    [applyServerCart, clearLineTimers, dispatch, executeUpdateLine],
  );

  useEffect(() => {
    flushLineQuantityRef.current = flushLineQuantity;
  }, [flushLineQuantity]);

  const scheduleLineFlush = useCallback(
    (lineId: string, delayMs = QUANTITY_UPDATE_DEBOUNCE_MS) => {
      const activeTimer = flushTimerByLineIdRef.current.get(lineId);
      if (activeTimer !== undefined) {
        window.clearTimeout(activeTimer);
      }

      const timerId = window.setTimeout(() => {
        flushTimerByLineIdRef.current.delete(lineId);
        flushLineQuantityRef.current?.(lineId);
      }, delayMs);

      flushTimerByLineIdRef.current.set(lineId, timerId);
    },
    [],
  );

  const setLineQuantity = useCallback(
    (lineId: string, quantity: number) => {
      if (stateRef.current.cartId === null) {
        return;
      }

      const nextVersion = getNextLineVersion(
        lineVersionByIdRef.current,
        lineId,
      );
      dispatch({
        type: "upsert-line-intent",
        lineId,
        desiredQuantity: quantity,
        version: nextVersion,
        status: "queued",
      });

      scheduleLineFlush(lineId);
    },
    [dispatch, scheduleLineFlush],
  );

  const changeLineQuantity = useCallback(
    (lineId: string, delta: number) => {
      const targetLine = displayCartRef.current?.lines.find(
        (line) => line.id === lineId,
      );
      if (targetLine === undefined) {
        return;
      }

      const intent = stateRef.current.lineIntentsById[lineId];
      const sourceQuantity = intent?.desiredQuantity ?? targetLine.quantity;
      const nextQuantity = sourceQuantity + delta;

      if (nextQuantity <= 0) {
        return;
      }

      setLineQuantity(lineId, nextQuantity);
    },
    [setLineQuantity],
  );

  const clearLineIntent = useCallback(
    (lineId: string) => {
      clearLineTimers(lineId);
      getNextLineVersion(lineVersionByIdRef.current, lineId);
      inFlightVersionByLineIdRef.current.delete(lineId);
      dispatch({ type: "clear-line-intent", lineId });
      dispatch({ type: "set-line-sync-status", lineId, status: "idle" });
    },
    [clearLineTimers, dispatch],
  );

  const retryLineNow = useCallback(
    (lineId: string) => {
      const intent = stateRef.current.lineIntentsById[lineId];
      if (intent === undefined) {
        return;
      }

      dispatch({
        type: "set-line-sync-status",
        lineId,
        status: "queued",
        retryCount: intent.retryCount,
      });
      clearLineTimers(lineId);
      flushLineQuantityRef.current?.(lineId);
    },
    [clearLineTimers, dispatch],
  );

  const retryFailedNow = useCallback(() => {
    for (const [lineId, intent] of Object.entries(
      stateRef.current.lineIntentsById,
    )) {
      if (intent.status !== "retrying" && intent.status !== "error") {
        continue;
      }

      retryLineNow(lineId);
    }
  }, [retryLineNow]);

  const flushPending = useCallback(
    async (options?: { timeoutMs?: number }) => {
      const timeoutMs = options?.timeoutMs ?? CHECKOUT_FLUSH_TIMEOUT_MS;
      const currentIntents = Object.keys(stateRef.current.lineIntentsById);

      for (const lineId of currentIntents) {
        clearLineTimers(lineId);
        flushLineQuantityRef.current?.(lineId);
      }

      const deadline = Date.now() + timeoutMs;
      while (Date.now() < deadline) {
        const latestState = stateRef.current;
        if (
          Object.keys(latestState.lineIntentsById).length === 0 &&
          inFlightVersionByLineIdRef.current.size === 0
        ) {
          return true;
        }

        await new Promise((resolve) => {
          window.setTimeout(resolve, CHECKOUT_FLUSH_POLL_INTERVAL_MS);
        });
      }

      for (const lineId of Object.keys(stateRef.current.lineIntentsById)) {
        dispatch({ type: "set-line-sync-status", lineId, status: "error" });
      }

      return false;
    },
    [clearLineTimers, dispatch],
  );

  useEffect(() => {
    if (state.cartId !== null) {
      return;
    }

    for (const lineId of flushTimerByLineIdRef.current.keys()) {
      clearLineTimers(lineId);
    }
    inFlightVersionByLineIdRef.current.clear();
  }, [clearLineTimers, state.cartId]);

  useEffect(() => {
    const flushTimers = flushTimerByLineIdRef.current;
    const retryTimers = retryTimerByLineIdRef.current;
    const inFlightVersions = inFlightVersionByLineIdRef.current;

    return () => {
      for (const timerId of flushTimers.values()) {
        window.clearTimeout(timerId);
      }
      flushTimers.clear();

      for (const timerId of retryTimers.values()) {
        window.clearTimeout(timerId);
      }
      retryTimers.clear();

      inFlightVersions.clear();
    };
  }, []);

  return {
    setLineQuantity,
    changeLineQuantity,
    clearLineIntent,
    retryLineNow,
    retryFailedNow,
    flushPending,
  };
}
