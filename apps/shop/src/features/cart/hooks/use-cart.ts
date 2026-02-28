import type { OptimisticCartLineDraft } from "~/features/cart/types";
import { useCartStore } from "~/features/cart/store";

export function useCartQuery() {
  const cart = useCartStore((store) => store.cart);
  const isLoading = useCartStore((store) => store.isCartLoading);

  return {
    data: cart,
    isLoading,
    isSuccess: isLoading === false,
  };
}

export function useAddCartLine() {
  const addLine = useCartStore((store) => store.addLine);

  return {
    mutate: (variables: {
      merchandiseId: string;
      quantity?: number;
      optimisticLine?: OptimisticCartLineDraft;
    }) => {
      addLine(variables);
    },
  };
}

export function useUpdateCartLine() {
  const changeLineQuantity = useCartStore((store) => store.changeLineQuantity);
  const setLineQuantity = useCartStore((store) => store.setLineQuantity);
  const clearLineIntent = useCartStore((store) => store.clearLineIntent);
  const flushPending = useCartStore((store) => store.flushPending);
  const lineSyncStatusById = useCartStore((store) => store.lineSyncStatusById);
  const hasPendingSync = useCartStore((store) => store.hasPendingCartSync);

  return {
    changeLineQuantity: (args: { lineId: string; delta: number }) => {
      changeLineQuantity(args.lineId, args.delta);
    },
    setLineQuantity: (args: { lineId: string; quantity: number }) => {
      setLineQuantity(args.lineId, args.quantity);
    },
    clearLineIntent,
    mutate: (args: { lineId: string; quantity: number }) => {
      setLineQuantity(args.lineId, args.quantity);
    },
    flushPending,
    lineSyncStatusById,
    hasPendingSync,
    isPending: hasPendingSync,
  };
}

export function useRemoveCartLine() {
  const removeLine = useCartStore((store) => store.removeLine);

  return {
    mutate: ({ lineId }: { lineId: string }) => {
      removeLine(lineId);
    },
  };
}

export function useCartQuantity() {
  return useCartStore((store) => store.cartQuantity);
}
