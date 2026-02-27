import { Image } from "@unpic/react";
import { Minus, Plus } from "lucide-react";

import { Button } from "@acme/ui/button";

import type { CartLine } from "~/features/cart/types";
import { formatPrice } from "~/features/product/lib/price";

interface CartLineItemProps {
  line: CartLine;
  changeLineQuantity: (args: { lineId: string; delta: number }) => void;
  clearLineIntent: (lineId: string) => void;
  removeLine: (lineId: string) => void;
}

function formatSelectedOptions(line: CartLine) {
  return line.merchandise.selectedOptions
    .map((selectedOption) => `${selectedOption.name}: ${selectedOption.value}`)
    .join(" | ");
}

export function CartLineItem({
  line,
  changeLineQuantity,
  clearLineIntent,
  removeLine,
}: CartLineItemProps) {
  const selectedOptionsLabel = formatSelectedOptions(line);

  const decrement = () => {
    if (line.quantity <= 1) {
      clearLineIntent(line.id);
      removeLine(line.id);
      return;
    }

    changeLineQuantity({
      lineId: line.id,
      delta: -1,
    });
  };

  const increment = () => {
    changeLineQuantity({
      lineId: line.id,
      delta: 1,
    });
  };

  return (
    <article className="flex gap-4 border-b py-4">
      {line.merchandise.image === null ? (
        <div className="bg-muted h-24 w-20 shrink-0 rounded-md" />
      ) : (
        <div className="h-24 w-20 shrink-0 overflow-hidden rounded-md">
          <Image
            src={line.merchandise.image.url}
            alt={
              line.merchandise.image.altText ?? line.merchandise.product.title
            }
            width={line.merchandise.image.width ?? 120}
            height={line.merchandise.image.height ?? 144}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm leading-5 font-medium">
          {line.merchandise.product.title}
        </p>
        <p className="text-muted-foreground mt-1 text-xs">
          {line.merchandise.title}
        </p>
        {selectedOptionsLabel.length > 0 ? (
          <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">
            {selectedOptionsLabel}
          </p>
        ) : null}
        <div className="mt-3 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                size="icon-sm"
                variant="outline"
                onClick={decrement}
                aria-label={`Decrease quantity of ${line.merchandise.product.title}`}
              >
                <Minus className="size-4" />
              </Button>
              <span className="w-8 text-center text-sm tabular-nums">
                {line.quantity}
              </span>
              <Button
                type="button"
                size="icon-sm"
                variant="outline"
                onClick={increment}
                aria-label={`Increase quantity of ${line.merchandise.product.title}`}
              >
                <Plus className="size-4" />
              </Button>
            </div>
          </div>
          <p className="text-sm font-medium tabular-nums">
            {formatPrice(
              line.cost.totalAmount.amount,
              line.cost.totalAmount.currencyCode,
            )}
          </p>
        </div>
      </div>
    </article>
  );
}
