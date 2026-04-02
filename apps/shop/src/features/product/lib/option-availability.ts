import type { Product } from "~/features/product/types";

export const OPTION_VALUE_AVAILABILITY_STATES = [
  "available",
  "sold-out",
  "unavailable",
] as const;
export type OptionValueAvailability =
  (typeof OPTION_VALUE_AVAILABILITY_STATES)[number];

export function getOptionValueAvailability({
  variants,
  optionName,
  optionValue,
  selectedOptions,
}: {
  variants: Product["variants"]["nodes"];
  optionName: string;
  optionValue: string;
  selectedOptions: Record<string, string>;
}) {
  const nextSelections = {
    ...selectedOptions,
    [optionName]: optionValue,
  };
  const matchingVariants = variants.filter((variant) =>
    variant.selectedOptions.every(
      (selectedOption) =>
        nextSelections[selectedOption.name] === selectedOption.value,
    ),
  );

  if (matchingVariants.length === 0) {
    return "unavailable";
  }

  if (matchingVariants.some((variant) => variant.availableForSale)) {
    return "available";
  }

  return "sold-out";
}
