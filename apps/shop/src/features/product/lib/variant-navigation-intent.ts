let pendingVariantSelectionIntent: {
  handle: string;
  variantId: string;
} | null = null;

export function markVariantSelectionIntent({
  handle,
  variantId,
}: {
  handle: string;
  variantId: string;
}) {
  pendingVariantSelectionIntent = { handle, variantId };
}

export function consumeVariantSelectionIntent({
  handle,
  variantId,
}: {
  handle: string;
  variantId: string | undefined;
}) {
  const pendingIntentHandle = pendingVariantSelectionIntent?.handle;
  const pendingIntentVariantId = pendingVariantSelectionIntent?.variantId;

  if (
    variantId === undefined ||
    pendingIntentHandle !== handle ||
    pendingIntentVariantId !== variantId
  ) {
    return false;
  }

  pendingVariantSelectionIntent = null;
  return true;
}
