import { ChevronDown } from "lucide-react";

import { cn } from "@acme/ui/utils";

export function SortSelect<TValue extends string>({
  value,
  onChange,
  className,
  disabled,
  options,
  ariaLabel,
}: {
  value: TValue;
  onChange: (value: TValue) => void;
  className?: string;
  disabled: boolean;
  options: { value: TValue; label: string }[];
  ariaLabel?: string;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        aria-label={ariaLabel}
        disabled={disabled}
        className={cn(
          "text-foreground disabled:text-muted-foreground h-8 w-full cursor-pointer appearance-none bg-transparent pr-6 text-sm font-medium focus:outline-none disabled:cursor-not-allowed",
          className,
        )}
        onChange={(event) => {
          const nextValue = options.find(
            (option) => option.value === event.target.value,
          )?.value;
          if (nextValue !== undefined) {
            onChange(nextValue);
          }
        }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="text-muted-foreground pointer-events-none absolute top-1/2 right-2 size-3.5 -translate-y-1/2" />
    </div>
  );
}
