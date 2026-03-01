import { useCallback, useEffect, useMemo } from "react";
import {
  useMutationState,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import type { Cart, OptimisticCartLineDraft } from "~/features/cart/types";
import {
  clearCartStorage,
  useAddCartLineMutation,
  useRemoveCartLineMutation,
  useUpdateCartLineMutation,
} from "~/features/cart/hooks/use-cart-mutations";
import {
  getStoredCartId,
  getStoredCartQuantity,
} from "~/features/cart/lib/cart-id";
import {
  cartMutationKeys,
  cartQueries,
} from "~/features/cart/lib/cart-queries";
import {
  applyOptimisticAdd,
  applyOptimisticQuantityUpdate,
  applyOptimisticRemove,
} from "~/features/cart/lib/optimistic-cart";

const CHECKOUT_SYNC_POLL_INTERVAL_MS = 50;

interface PendingCartMutation {
  submittedAt: number;
  action: "add" | "update" | "remove";
  variables:
    | {
        cartId?: string;
        merchandiseId: string;
        quantity?: number;
        optimisticLine?: OptimisticCartLineDraft;
      }
    | {
        cartId: string;
        lineId: string;
        quantity: number;
      }
    | {
        cartId: string;
        lineId: string;
      };
}

function applyPendingMutationsToCart(
  sourceCart: Cart | null,
  pendingMutations: PendingCartMutation[],
) {
  let nextCart = sourceCart;
  const sortedMutations = [...pendingMutations].sort(
    (left, right) => left.submittedAt - right.submittedAt,
  );

  for (const mutation of sortedMutations) {
    if (mutation.action === "add") {
      const variables = mutation.variables as Extract<
        PendingCartMutation["variables"],
        { merchandiseId: string }
      >;
      nextCart = applyOptimisticAdd(nextCart, variables.optimisticLine ?? null);
      continue;
    }

    if (mutation.action === "update") {
      const variables = mutation.variables as Extract<
        PendingCartMutation["variables"],
        { lineId: string; quantity: number }
      >;
      nextCart = applyOptimisticQuantityUpdate(
        nextCart,
        variables.lineId,
        variables.quantity,
      );
      continue;
    }

    const variables = mutation.variables as Extract<
      PendingCartMutation["variables"],
      { lineId: string }
    >;
    nextCart = applyOptimisticRemove(nextCart, variables.lineId);
  }

  return nextCart;
}

function readLineIdFromVariables(variables: unknown) {
  if (typeof variables !== "object" || variables === null) {
    return undefined;
  }

  if ("lineId" in variables === false) {
    return undefined;
  }

  const lineId = (variables as { lineId?: unknown }).lineId;
  return typeof lineId === "string" ? lineId : undefined;
}

function parsePendingCartMutation(
  mutation: unknown,
): PendingCartMutation | null {
  const typedMutation = mutation as {
    options: {
      mutationKey?: unknown;
    };
    state: {
      variables: unknown;
      submittedAt: number;
    };
  };

  const mutationKey = typedMutation.options.mutationKey;
  if (Array.isArray(mutationKey) === false) {
    return null;
  }

  const rawAction: unknown = mutationKey[mutationKey.length - 1];
  if (rawAction !== "add" && rawAction !== "update" && rawAction !== "remove") {
    return null;
  }
  const action: PendingCartMutation["action"] = rawAction;

  const variables = typedMutation.state.variables;
  if (typeof variables !== "object" || variables === null) {
    return null;
  }

  return {
    submittedAt: typedMutation.state.submittedAt,
    action,
    variables: variables as PendingCartMutation["variables"],
  };
}

function useCartState() {
  const cookieCartQuery = useQuery({
    ...cartQueries.cookie(),
  });

  const cartId = getStoredCartId() ?? cookieCartQuery.data?.id ?? null;

  const cartQuery = useQuery({
    ...cartQueries.detail(cartId),
    enabled: cartId !== null,
  });

  const pendingMutations = useMutationState({
    filters: {
      mutationKey: cartMutationKeys.lineAll,
      status: "pending",
    },
    select: parsePendingCartMutation,
  }).filter((mutation) => mutation !== null);

  const serverCart = cartQuery.data ?? null;
  const cart = useMemo(
    () => applyPendingMutationsToCart(serverCart, pendingMutations),
    [pendingMutations, serverCart],
  );
  const storedQuantity = getStoredCartQuantity();
  const fallbackQuantity =
    cartId === null
      ? 0
      : storedQuantity > 0
        ? storedQuantity
        : (cookieCartQuery.data?.quantity ?? 0);
  const cartQuantity = cart?.totalQuantity ?? fallbackQuantity;

  useEffect(() => {
    if (cartId === null) {
      return;
    }

    if (cartQuery.status !== "success") {
      return;
    }

    if (cartQuery.data !== null) {
      return;
    }

    clearCartStorage();
  }, [cartId, cartQuery.data, cartQuery.status]);

  return {
    cartId,
    cart,
    serverCart,
    cartQuery,
    cartQuantity,
  };
}

function useLineSyncStatusById() {
  const mutations = useMutationState({
    filters: {
      mutationKey: cartMutationKeys.lineAll,
    },
    select: (mutation) => {
      const typedMutation = mutation as {
        state: {
          variables: unknown;
          status: "idle" | "pending" | "error" | "success";
          failureCount: number;
        };
      };

      return {
        lineId: readLineIdFromVariables(typedMutation.state.variables),
        status: typedMutation.state.status,
        failureCount: typedMutation.state.failureCount,
      };
    },
  });

  return useMemo(() => {
    const statusByLineId: Record<
      string,
      "queued" | "syncing" | "retrying" | "error"
    > = {};

    for (const mutation of mutations) {
      if (mutation.lineId === undefined || mutation.status === "success") {
        continue;
      }

      if (mutation.status === "error") {
        statusByLineId[mutation.lineId] = "error";
        continue;
      }

      if (mutation.status === "pending" && mutation.failureCount > 0) {
        statusByLineId[mutation.lineId] = "retrying";
        continue;
      }

      if (mutation.status === "pending") {
        statusByLineId[mutation.lineId] = "syncing";
      }
    }

    return statusByLineId;
  }, [mutations]);
}

export function useCartQuery() {
  const { cart, cartQuery } = useCartState();

  return {
    data: cart,
    isLoading: cartQuery.isLoading,
    isSuccess: cartQuery.isLoading === false,
  };
}

export function useAddCartLine() {
  const { cartId } = useCartState();
  const addLineMutation = useAddCartLineMutation();

  return {
    mutate: (variables: {
      merchandiseId: string;
      quantity?: number;
      optimisticLine?: OptimisticCartLineDraft;
    }) => {
      addLineMutation.mutate({
        ...variables,
        cartId: cartId ?? undefined,
      });
    },
  };
}

export function useUpdateCartLine() {
  const queryClient = useQueryClient();
  const { cartId, cart } = useCartState();
  const updateLineMutation = useUpdateCartLineMutation();
  const removeLineMutation = useRemoveCartLineMutation();
  const lineSyncStatusById = useLineSyncStatusById();

  const hasPendingSync =
    useMutationState({
      filters: {
        mutationKey: cartMutationKeys.lineAll,
        status: "pending",
      },
    }).length > 0;

  const setLineQuantity = useCallback(
    (lineId: string, quantity: number) => {
      if (cartId === null || quantity <= 0) {
        return;
      }

      updateLineMutation.mutate({
        cartId,
        lineId,
        quantity,
      });
    },
    [cartId, updateLineMutation],
  );

  const changeLineQuantity = useCallback(
    (lineId: string, delta: number) => {
      const cartLine = cart?.lines.nodes.find((line) => line.id === lineId);
      if (cartLine === undefined || cartId === null) {
        return;
      }

      const nextQuantity = cartLine.quantity + delta;
      if (nextQuantity <= 0) {
        removeLineMutation.mutate({
          cartId,
          lineId,
        });
        return;
      }

      updateLineMutation.mutate({
        cartId,
        lineId,
        quantity: nextQuantity,
      });
    },
    [cart, cartId, removeLineMutation, updateLineMutation],
  );

  const flushPending = useCallback(
    async (options?: { timeoutMs?: number }) => {
      const timeoutMs = options?.timeoutMs ?? 8000;
      const deadline = Date.now() + timeoutMs;

      while (Date.now() < deadline) {
        const activeMutations = queryClient.isMutating({
          mutationKey: cartMutationKeys.lineAll,
        });

        if (activeMutations === 0) {
          return true;
        }

        await new Promise((resolve) => {
          window.setTimeout(resolve, CHECKOUT_SYNC_POLL_INTERVAL_MS);
        });
      }

      return false;
    },
    [queryClient],
  );

  return {
    changeLineQuantity: (args: { lineId: string; delta: number }) => {
      changeLineQuantity(args.lineId, args.delta);
    },
    setLineQuantity: (args: { lineId: string; quantity: number }) => {
      setLineQuantity(args.lineId, args.quantity);
    },
    clearLineIntent: () => {
      // No-op for backward compatibility; intents are represented by queued mutations.
    },
    mutate: (args: { lineId: string; quantity: number }) => {
      setLineQuantity(args.lineId, args.quantity);
    },
    flushPending,
    retryLineNow: () => Promise.resolve(),
    retryFailedNow: () => Promise.resolve(),
    lineSyncStatusById,
    hasPendingSync,
    isPending: hasPendingSync,
  };
}

export function useRemoveCartLine() {
  const { cartId } = useCartState();
  const removeLineMutation = useRemoveCartLineMutation();

  return {
    mutate: ({ lineId }: { lineId: string }) => {
      if (cartId === null) {
        return;
      }

      removeLineMutation.mutate({
        cartId,
        lineId,
      });
    },
  };
}

export function useCartQuantity() {
  return useCartState().cartQuantity;
}
