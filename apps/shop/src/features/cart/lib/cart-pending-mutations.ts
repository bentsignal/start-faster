import type { Cart, OptimisticCartLineDraft } from "~/features/cart/types";
import {
  applyOptimisticAdd,
  applyOptimisticQuantityUpdate,
  applyOptimisticRemove,
} from "~/features/cart/lib/optimistic-cart";

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

export function applyPendingMutationsToCart(
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

export function parsePendingCartMutation(
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
