import type { CartDomainAction, CartDomainState } from "./cart-domain-types";
import {
  applyOptimisticAdd,
  applyOptimisticRemove,
} from "~/features/cart/lib/optimistic-cart";

function clampQuantity(value: number) {
  return Math.max(0, Math.floor(value));
}

export function createInitialCartDomainState(args: {
  cartId: string | null;
  storedQuantity: number;
}): CartDomainState {
  return {
    cartId: args.cartId,
    storedQuantity: clampQuantity(args.storedQuantity),
    isCartOpen: false,
    lineIntentsById: {},
    lineSyncStatusById: {},
  };
}

export function cartDomainReducer(
  state: CartDomainState,
  action: CartDomainAction,
): CartDomainState {
  switch (action.type) {
    case "set-cart-open": {
      if (state.isCartOpen === action.open) {
        return state;
      }

      return {
        ...state,
        isCartOpen: action.open,
      };
    }
    case "set-cart-id": {
      if (state.cartId === action.cartId) {
        return state;
      }

      return {
        ...state,
        cartId: action.cartId,
      };
    }
    case "set-stored-quantity": {
      const nextQuantity = clampQuantity(action.quantity);
      if (state.storedQuantity === nextQuantity) {
        return state;
      }

      return {
        ...state,
        storedQuantity: nextQuantity,
      };
    }
    case "clear-cart": {
      return {
        ...state,
        cartId: null,
        storedQuantity: 0,
        lineIntentsById: {},
        lineSyncStatusById: {},
      };
    }
    case "upsert-line-intent": {
      const nextIntent = {
        desiredQuantity: action.desiredQuantity,
        version: action.version,
        status: action.status ?? "queued",
        retryCount: 0,
        updatedAt: Date.now(),
      };

      return {
        ...state,
        lineIntentsById: {
          ...state.lineIntentsById,
          [action.lineId]: nextIntent,
        },
        lineSyncStatusById: {
          ...state.lineSyncStatusById,
          [action.lineId]: nextIntent.status,
        },
      };
    }
    case "set-line-sync-status": {
      const previousIntent = state.lineIntentsById[action.lineId];
      const nextLineSyncStatusById = { ...state.lineSyncStatusById };

      if (action.status === "idle") {
        delete nextLineSyncStatusById[action.lineId];
      } else {
        nextLineSyncStatusById[action.lineId] = action.status;
      }

      if (previousIntent === undefined || action.status === "idle") {
        return {
          ...state,
          lineSyncStatusById: nextLineSyncStatusById,
        };
      }

      return {
        ...state,
        lineIntentsById: {
          ...state.lineIntentsById,
          [action.lineId]: {
            ...previousIntent,
            status: action.status,
            retryCount: action.retryCount ?? previousIntent.retryCount,
            updatedAt: Date.now(),
          },
        },
        lineSyncStatusById: nextLineSyncStatusById,
      };
    }
    case "clear-line-intent": {
      if (state.lineIntentsById[action.lineId] === undefined) {
        if (state.lineSyncStatusById[action.lineId] === undefined) {
          return state;
        }

        const nextSyncStatus = { ...state.lineSyncStatusById };
        delete nextSyncStatus[action.lineId];

        return {
          ...state,
          lineSyncStatusById: nextSyncStatus,
        };
      }

      const nextIntents = { ...state.lineIntentsById };
      delete nextIntents[action.lineId];

      const nextSyncStatus = { ...state.lineSyncStatusById };
      delete nextSyncStatus[action.lineId];

      return {
        ...state,
        lineIntentsById: nextIntents,
        lineSyncStatusById: nextSyncStatus,
      };
    }
    default: {
      return state;
    }
  }
}

export { applyOptimisticAdd, applyOptimisticRemove };
