import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { Cart, CartLineSyncStatus } from "~/features/cart/types";
import { applyPendingLineQuantities } from "../lib/cart-display";

const QUANTITY_UPDATE_DEBOUNCE_MS = 250;
const CHECKOUT_FLUSH_POLL_INTERVAL_MS = 50;
const CHECKOUT_FLUSH_TIMEOUT_MS = 3000;

function nextRetryDelay(retryCount: number) {
  return Math.min(1000 * 2 ** retryCount, 30_000);
}

interface UseCartLineSyncArgs {
  cartId: string | null;
  serverCart: Cart | null;
  applyServerCart: (nextCart: Cart) => void;
  executeUpdateLine: (args: {
    cartId: string;
    lineId: string;
    quantity: number;
  }) => Promise<Cart>;
}

export function useCartLineSync({
  cartId,
  serverCart,
  applyServerCart,
  executeUpdateLine,
}: UseCartLineSyncArgs) {
  const [pendingQuantityByLineId, setPendingQuantityByLineId] = useState<
    Record<string, number>
  >({});
  const [lineSyncStatusById, setLineSyncStatusById] = useState<
    Record<string, CartLineSyncStatus>
  >({});

  const pendingQuantityByLineIdRef = useRef(pendingQuantityByLineId);
  const lineVersionByIdRef = useRef<Map<string, number>>(new Map());
  const inFlightVersionByLineIdRef = useRef<Map<string, number>>(new Map());
  const flushTimerByLineIdRef = useRef<Map<string, number>>(new Map());
  const retryTimerByLineIdRef = useRef<Map<string, number>>(new Map());
  const retryCountByLineIdRef = useRef<Map<string, number>>(new Map());
  const flushLineQuantityRef = useRef<((lineId: string) => void) | null>(null);

  useEffect(() => {
    pendingQuantityByLineIdRef.current = pendingQuantityByLineId;
  }, [pendingQuantityByLineId]);

  const setLineStatus = useCallback(
    (lineId: string, status: CartLineSyncStatus) => {
      setLineSyncStatusById((previousStatuses) => {
        if (status === "idle") {
          if (previousStatuses[lineId] === undefined) {
            return previousStatuses;
          }
          const nextStatuses = { ...previousStatuses };
          delete nextStatuses[lineId];
          return nextStatuses;
        }

        if (previousStatuses[lineId] === status) {
          return previousStatuses;
        }

        return {
          ...previousStatuses,
          [lineId]: status,
        };
      });
    },
    [],
  );

  const bumpLineVersion = useCallback((lineId: string) => {
    const nextVersion = (lineVersionByIdRef.current.get(lineId) ?? 0) + 1;
    lineVersionByIdRef.current.set(lineId, nextVersion);
    return nextVersion;
  }, []);

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

  const clearLineIntent = useCallback(
    (lineId: string) => {
      clearLineTimers(lineId);
      bumpLineVersion(lineId);
      inFlightVersionByLineIdRef.current.delete(lineId);
      retryCountByLineIdRef.current.delete(lineId);
      setPendingQuantityByLineId((previousQuantities) => {
        if (previousQuantities[lineId] === undefined) {
          return previousQuantities;
        }
        const nextQuantities = { ...previousQuantities };
        delete nextQuantities[lineId];
        return nextQuantities;
      });
      setLineStatus(lineId, "idle");
    },
    [bumpLineVersion, clearLineTimers, setLineStatus],
  );

  const resetSyncState = useCallback(() => {
    for (const timerId of flushTimerByLineIdRef.current.values()) {
      window.clearTimeout(timerId);
    }
    flushTimerByLineIdRef.current.clear();

    for (const timerId of retryTimerByLineIdRef.current.values()) {
      window.clearTimeout(timerId);
    }
    retryTimerByLineIdRef.current.clear();

    lineVersionByIdRef.current.clear();
    inFlightVersionByLineIdRef.current.clear();
    retryCountByLineIdRef.current.clear();
    setPendingQuantityByLineId({});
    setLineSyncStatusById({});
  }, []);

  const flushLineQuantity = useCallback(
    (lineId: string) => {
      if (cartId === null) {
        return;
      }

      if (inFlightVersionByLineIdRef.current.has(lineId)) {
        return;
      }

      const desiredQuantity = pendingQuantityByLineIdRef.current[lineId];
      if (desiredQuantity === undefined) {
        setLineStatus(lineId, "idle");
        return;
      }

      clearLineTimers(lineId);
      setLineStatus(lineId, "syncing");

      const sentVersion = lineVersionByIdRef.current.get(lineId) ?? 0;
      inFlightVersionByLineIdRef.current.set(lineId, sentVersion);

      void executeUpdateLine({
        cartId,
        lineId,
        quantity: desiredQuantity,
      })
        .then((nextCart) => {
          const latestVersion = lineVersionByIdRef.current.get(lineId) ?? 0;
          if (latestVersion !== sentVersion) {
            return;
          }

          retryCountByLineIdRef.current.delete(lineId);
          setPendingQuantityByLineId((previousQuantities) => {
            if (previousQuantities[lineId] === undefined) {
              return previousQuantities;
            }
            const nextQuantities = { ...previousQuantities };
            delete nextQuantities[lineId];
            return nextQuantities;
          });
          setLineStatus(lineId, "idle");
          applyServerCart(nextCart);
        })
        .catch(() => {
          const latestVersion = lineVersionByIdRef.current.get(lineId) ?? 0;
          if (latestVersion !== sentVersion) {
            return;
          }

          const activeDesiredQuantity =
            pendingQuantityByLineIdRef.current[lineId];
          if (activeDesiredQuantity === undefined) {
            return;
          }

          const nextRetryCount =
            (retryCountByLineIdRef.current.get(lineId) ?? 0) + 1;
          retryCountByLineIdRef.current.set(lineId, nextRetryCount);
          const isOffline =
            typeof navigator !== "undefined" && navigator.onLine === false;
          setLineStatus(lineId, isOffline ? "error" : "retrying");

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
          const hasPendingFlush = flushTimerByLineIdRef.current.has(lineId);
          const hasPendingRetry = retryTimerByLineIdRef.current.has(lineId);
          if (hasPendingFlush || hasPendingRetry) {
            return;
          }
          flushLineQuantityRef.current?.(lineId);
        });
    },
    [
      applyServerCart,
      cartId,
      clearLineTimers,
      executeUpdateLine,
      setLineStatus,
    ],
  );

  useEffect(() => {
    flushLineQuantityRef.current = flushLineQuantity;
  }, [flushLineQuantity]);

  const scheduleLineFlush = useCallback(
    (lineId: string, delayMs = QUANTITY_UPDATE_DEBOUNCE_MS) => {
      const existingTimer = flushTimerByLineIdRef.current.get(lineId);
      if (existingTimer !== undefined) {
        window.clearTimeout(existingTimer);
      }

      const nextTimer = window.setTimeout(() => {
        flushTimerByLineIdRef.current.delete(lineId);
        flushLineQuantityRef.current?.(lineId);
      }, delayMs);
      flushTimerByLineIdRef.current.set(lineId, nextTimer);
    },
    [],
  );

  const setLineQuantity = useCallback(
    (lineId: string, quantity: number) => {
      if (cartId === null || quantity <= 0) {
        return;
      }
      bumpLineVersion(lineId);
      clearLineTimers(lineId);
      inFlightVersionByLineIdRef.current.delete(lineId);
      retryCountByLineIdRef.current.delete(lineId);
      setPendingQuantityByLineId((previousQuantities) => ({
        ...previousQuantities,
        [lineId]: quantity,
      }));
      setLineStatus(lineId, "queued");
      scheduleLineFlush(lineId);
    },
    [
      bumpLineVersion,
      cartId,
      clearLineTimers,
      scheduleLineFlush,
      setLineStatus,
    ],
  );

  const changeLineQuantity = useCallback(
    (lineId: string, delta: number) => {
      const displayCart = applyPendingLineQuantities(
        serverCart,
        pendingQuantityByLineIdRef.current,
      );
      const cartLine = displayCart?.lines.find((line) => line.id === lineId);
      if (cartLine === undefined) {
        return;
      }

      const sourceQuantity =
        pendingQuantityByLineIdRef.current[lineId] ?? cartLine.quantity;
      const nextQuantity = sourceQuantity + delta;
      if (nextQuantity <= 0) {
        return;
      }
      setLineQuantity(lineId, nextQuantity);
    },
    [serverCart, setLineQuantity],
  );

  const retryLineNow = useCallback(
    (lineId: string) => {
      const pendingQuantity = pendingQuantityByLineIdRef.current[lineId];
      if (pendingQuantity === undefined) {
        return;
      }
      clearLineTimers(lineId);
      setLineStatus(lineId, "queued");
      scheduleLineFlush(lineId, 0);
    },
    [clearLineTimers, scheduleLineFlush, setLineStatus],
  );

  const retryFailedNow = useCallback(() => {
    for (const [lineId, status] of Object.entries(lineSyncStatusById)) {
      if (status !== "error" && status !== "retrying") {
        continue;
      }
      retryLineNow(lineId);
    }
  }, [lineSyncStatusById, retryLineNow]);

  const flushPending = useCallback(
    async (options?: { timeoutMs?: number }) => {
      const timeoutMs = options?.timeoutMs ?? CHECKOUT_FLUSH_TIMEOUT_MS;
      const activeLines = Object.keys(pendingQuantityByLineIdRef.current);
      for (const lineId of activeLines) {
        clearLineTimers(lineId);
        flushLineQuantityRef.current?.(lineId);
      }

      const deadline = Date.now() + timeoutMs;
      while (Date.now() < deadline) {
        if (
          Object.keys(pendingQuantityByLineIdRef.current).length === 0 &&
          inFlightVersionByLineIdRef.current.size === 0
        ) {
          return true;
        }
        await new Promise((resolve) => {
          window.setTimeout(resolve, CHECKOUT_FLUSH_POLL_INTERVAL_MS);
        });
      }

      for (const lineId of Object.keys(pendingQuantityByLineIdRef.current)) {
        setLineStatus(lineId, "error");
      }
      return false;
    },
    [clearLineTimers, setLineStatus],
  );

  useEffect(() => {
    const flushTimers = flushTimerByLineIdRef.current;
    const retryTimers = retryTimerByLineIdRef.current;
    return () => {
      for (const timerId of flushTimers.values()) {
        window.clearTimeout(timerId);
      }
      for (const timerId of retryTimers.values()) {
        window.clearTimeout(timerId);
      }
    };
  }, []);

  const hasPendingSync = useMemo(
    () => Object.keys(lineSyncStatusById).length > 0,
    [lineSyncStatusById],
  );

  return {
    pendingQuantityByLineId,
    lineSyncStatusById,
    hasPendingSync,
    setLineQuantity,
    changeLineQuantity,
    clearLineIntent,
    retryLineNow,
    retryFailedNow,
    flushPending,
    resetSyncState,
  };
}
