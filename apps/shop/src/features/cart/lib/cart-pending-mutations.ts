import type { Cart, OptimisticCartLineDraft } from "~/features/cart/types";
import {
  applyOptimisticAdd,
  applyOptimisticQuantityUpdate,
  applyOptimisticRemove,
} from "~/features/cart/lib/optimistic-cart";

interface AddVariables {
  cartId?: string;
  merchandiseId: string;
  quantity?: number;
  optimisticLine?: OptimisticCartLineDraft;
}

interface UpdateVariables {
  cartId: string;
  lineId: string;
  quantity: number;
}

interface RemoveVariables {
  cartId: string;
  lineId: string;
}

type PendingCartMutation =
  | { submittedAt: number; action: "add"; variables: AddVariables }
  | { submittedAt: number; action: "update"; variables: UpdateVariables }
  | { submittedAt: number; action: "remove"; variables: RemoveVariables };

export function applyPendingMutationsToCart(
  sourceCart: Cart | null,
  pendingMutations: PendingCartMutation[],
) {
  let nextCart = sourceCart;
  const sortedMutations = [...pendingMutations].sort(
    (left, right) => left.submittedAt - right.submittedAt,
  );

  for (const mutation of sortedMutations) {
    switch (mutation.action) {
      case "add":
        nextCart = applyOptimisticAdd(
          nextCart,
          mutation.variables.optimisticLine ?? null,
        );
        break;
      case "update":
        nextCart = applyOptimisticQuantityUpdate(
          nextCart,
          mutation.variables.lineId,
          mutation.variables.quantity,
        );
        break;
      case "remove":
        nextCart = applyOptimisticRemove(nextCart, mutation.variables.lineId);
        break;
    }
  }

  return nextCart;
}

function hasMutationShape(value: unknown): value is {
  options: { mutationKey?: unknown };
  state: { variables: unknown; submittedAt: number };
} {
  if (typeof value !== "object" || value === null) return false;
  if (
    !("options" in value) ||
    typeof value.options !== "object" ||
    value.options === null
  )
    return false;
  if (
    !("state" in value) ||
    typeof value.state !== "object" ||
    value.state === null
  )
    return false;
  return (
    "submittedAt" in value.state && typeof value.state.submittedAt === "number"
  );
}

export function parsePendingCartMutation(mutation: unknown) {
  if (!hasMutationShape(mutation)) {
    return null;
  }

  const mutationKey = mutation.options.mutationKey;
  if (Array.isArray(mutationKey) === false) {
    return null;
  }

  // eslint-disable-next-line no-restricted-syntax -- widening from any to unknown for safe narrowing below
  const rawAction: unknown = mutationKey[mutationKey.length - 1];
  if (rawAction !== "add" && rawAction !== "update" && rawAction !== "remove") {
    return null;
  }

  const variables = mutation.state.variables;
  if (typeof variables !== "object" || variables === null) {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- variables come from TanStack Query's untyped mutation cache; runtime checks above validate the shape
  return {
    submittedAt: mutation.state.submittedAt,
    action: rawAction,
    variables,
  } as PendingCartMutation;
}
