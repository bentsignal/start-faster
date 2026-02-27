import type {
  Cart,
  CartLine,
  OptimisticCartLineDraft,
} from "~/features/cart/types";

function normalizeAmount(value: number | string) {
  return typeof value === "number" ? value : Number(value);
}

function roundCurrency(value: number | string) {
  return Number(normalizeAmount(value).toFixed(2));
}

function buildLineTotal(unitAmount: number | string, quantity: number) {
  return roundCurrency(normalizeAmount(unitAmount) * quantity);
}

function recalculateCart(cart: Cart): Cart {
  const totalQuantity = cart.lines.reduce(
    (accumulator, line) => accumulator + line.quantity,
    0,
  );
  const totalAmount = cart.lines.reduce(
    (accumulator, line) =>
      accumulator + normalizeAmount(line.cost.totalAmount.amount),
    0,
  );
  const currencyCode =
    cart.lines[0]?.cost.totalAmount.currencyCode ??
    cart.cost.totalAmount.currencyCode;

  return {
    ...cart,
    totalQuantity,
    cost: {
      totalAmount: {
        amount: roundCurrency(totalAmount),
        currencyCode,
      },
    },
  };
}

function createOptimisticLine(draft: OptimisticCartLineDraft): CartLine {
  const lineTotal = buildLineTotal(draft.unitAmount, draft.quantity);
  return {
    id: `optimistic-${draft.merchandiseId}`,
    quantity: draft.quantity,
    cost: {
      amountPerQuantity: {
        amount: normalizeAmount(draft.unitAmount),
        currencyCode: draft.currencyCode,
      },
      subtotalAmount: {
        amount: lineTotal,
        currencyCode: draft.currencyCode,
      },
      totalAmount: {
        amount: lineTotal,
        currencyCode: draft.currencyCode,
      },
    },
    merchandise: {
      id: draft.merchandiseId,
      title: draft.variantTitle,
      image: draft.image,
      product: {
        title: draft.productTitle,
        handle: draft.productHandle,
      },
      selectedOptions: draft.selectedOptions,
    },
    isOptimistic: true,
  };
}

function createOptimisticCartFromLine(line: CartLine): Cart {
  return recalculateCart({
    id: "optimistic-cart",
    checkoutUrl: "",
    totalQuantity: line.quantity,
    cost: {
      totalAmount: {
        amount: line.cost.totalAmount.amount,
        currencyCode: line.cost.totalAmount.currencyCode,
      },
    },
    lines: [line],
  });
}

export function applyOptimisticAdd(
  cart: Cart | null,
  draft: OptimisticCartLineDraft | null,
) {
  if (cart === null && draft === null) {
    return null;
  }

  if (cart === null && draft !== null) {
    return createOptimisticCartFromLine(createOptimisticLine(draft));
  }

  if (cart === null) {
    return null;
  }

  const existingLine = cart.lines.find(
    (line) => line.merchandise.id === draft?.merchandiseId,
  );

  if (existingLine !== undefined) {
    const nextQuantity = existingLine.quantity + (draft?.quantity ?? 1);
    const lineTotal = buildLineTotal(
      existingLine.cost.amountPerQuantity.amount,
      nextQuantity,
    );
    const nextLines = cart.lines.map((line) => {
      if (line.id !== existingLine.id) {
        return line;
      }

      return {
        ...line,
        quantity: nextQuantity,
        cost: {
          ...line.cost,
          subtotalAmount: {
            ...line.cost.subtotalAmount,
            amount: lineTotal,
          },
          totalAmount: {
            ...line.cost.totalAmount,
            amount: lineTotal,
          },
        },
        isOptimistic: true,
      };
    });

    return recalculateCart({
      ...cart,
      lines: nextLines,
    });
  }

  if (draft === null) {
    return cart;
  }

  return recalculateCart({
    ...cart,
    lines: [...cart.lines, createOptimisticLine(draft)],
  });
}

export function applyOptimisticQuantityUpdate(
  cart: Cart | null,
  lineId: string,
  quantity: number,
) {
  if (cart === null) {
    return null;
  }

  if (quantity <= 0) {
    return recalculateCart({
      ...cart,
      lines: cart.lines.filter((line) => line.id !== lineId),
    });
  }

  const nextLines = cart.lines.map((line) => {
    if (line.id !== lineId) {
      return line;
    }

    const lineTotal = buildLineTotal(
      line.cost.amountPerQuantity.amount,
      quantity,
    );
    return {
      ...line,
      quantity,
      cost: {
        ...line.cost,
        subtotalAmount: {
          ...line.cost.subtotalAmount,
          amount: lineTotal,
        },
        totalAmount: {
          ...line.cost.totalAmount,
          amount: lineTotal,
        },
      },
      isOptimistic: true,
    };
  });

  return recalculateCart({
    ...cart,
    lines: nextLines,
  });
}

export function applyOptimisticRemove(cart: Cart | null, lineId: string) {
  if (cart === null) {
    return null;
  }

  return recalculateCart({
    ...cart,
    lines: cart.lines.filter((line) => line.id !== lineId),
  });
}
