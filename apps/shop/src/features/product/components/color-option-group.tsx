import { Button } from "@acme/ui/button";
import { cn } from "@acme/ui/utils";

import type { Product } from "~/features/product/types";
import { getKnownColorHex } from "~/features/product/colors";
import { ColorSwatch } from "~/features/product/components/color-swatch";
import { getOptionValueAvailability } from "~/features/product/lib/option-availability";

export function ColorOptionGroup({
  variants,
  optionName,
  values,
  selectedValue,
  selectedOptions,
  onSelect,
}: {
  variants: Product["variants"]["nodes"];
  optionName: string;
  values: string[];
  selectedValue: string | undefined;
  selectedOptions: Record<string, string>;
  onSelect: (value: string) => void;
}) {
  const knownColors = [];
  const unknownColors = [];

  for (const value of values) {
    if (getKnownColorHex(value)) {
      knownColors.push(value);
    } else {
      unknownColors.push(value);
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold tracking-wide uppercase">
        {optionName}
        {selectedValue ? (
          <span className="text-muted-foreground ml-2 font-normal normal-case">
            {selectedValue}
          </span>
        ) : null}
      </p>

      {knownColors.length > 0 ? (
        <div className="flex flex-wrap gap-2.5">
          {knownColors.map((value) => {
            const isSelected = selectedValue === value;
            const availability = getOptionValueAvailability({
              variants,
              optionName,
              optionValue: value,
              selectedOptions,
            });

            return (
              <ColorSwatch
                key={`${optionName}-${value}`}
                colorName={value}
                isSelected={isSelected}
                availability={availability}
                onClick={() => onSelect(value)}
              />
            );
          })}
        </div>
      ) : null}

      {unknownColors.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {unknownColors.map((value) => {
            const isSelected = selectedValue === value;
            const availability = getOptionValueAvailability({
              variants,
              optionName,
              optionValue: value,
              selectedOptions,
            });
            const isDisabled =
              isSelected === false && availability !== "available";
            const title =
              availability === "sold-out"
                ? `${value} (Sold out)`
                : availability === "unavailable"
                  ? `${value} (Unavailable)`
                  : value;
            return (
              <Button
                key={`${optionName}-${value}`}
                type="button"
                size="sm"
                variant={isSelected ? "default" : "outline"}
                aria-pressed={isSelected}
                disabled={isDisabled}
                title={title}
                className={cn(
                  availability !== "available" &&
                    "text-muted-foreground border-border/60 decoration-1.5 line-through",
                )}
                onClick={() => onSelect(value)}
              >
                {value}
              </Button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
