import { Button } from "@acme/ui/button";
import { cn } from "@acme/ui/utils";

import { ColorOptionGroup } from "~/features/product/components/color-option-group";
import { useProductOptionSelector } from "~/features/product/hooks/use-product-option-selector";
import { getOptionValueAvailability } from "~/features/product/lib/option-availability";
import { isColorOptionName } from "~/features/product/lib/option-names";

export function ProductOptionSelector() {
  const { options, variants, selectedVariant, selectedOptions, selectOption } =
    useProductOptionSelector();

  if (options.length === 0) {
    return null;
  }

  return (
    <div className="mb-8 space-y-6">
      {options.map((option) => {
        const isColorOption = isColorOptionName(option.name);

        if (isColorOption) {
          return (
            <ColorOptionGroup
              key={option.name}
              variants={variants}
              optionName={option.name}
              values={option.values}
              selectedValue={selectedOptions[option.name]}
              selectedOptions={selectedOptions}
              onSelect={(value) => selectOption(option.name, value)}
            />
          );
        }

        return (
          <div key={option.name} className="space-y-3">
            <p className="text-sm font-semibold tracking-wide uppercase">
              {option.name}
            </p>
            <div className="flex flex-wrap gap-2">
              {option.values.map((value) => {
                const isSelected = selectedOptions[option.name] === value;
                const availability = getOptionValueAvailability({
                  variants,
                  optionName: option.name,
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
                    key={`${option.name}-${value}`}
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
                    onClick={() => selectOption(option.name, value)}
                  >
                    {value}
                  </Button>
                );
              })}
            </div>
          </div>
        );
      })}
      {selectedVariant !== null &&
      selectedVariant.availableForSale === false ? (
        <p className="text-destructive text-sm">This variant is sold out.</p>
      ) : null}
    </div>
  );
}
