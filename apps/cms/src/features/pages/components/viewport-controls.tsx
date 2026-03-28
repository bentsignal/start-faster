import type { LucideIcon } from "lucide-react";
import { Monitor, Smartphone, Tablet } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@acme/ui/tooltip";
import { cn } from "@acme/ui/utils";

export const VIEWPORT_OPTIONS = [
  {
    value: "mobile",
    label: "Mobile",
    icon: Smartphone,
    width: 375,
    height: 812,
  },
  { value: "tablet", label: "Tablet", icon: Tablet, width: 768, height: 1024 },
  {
    value: "desktop",
    label: "Desktop",
    icon: Monitor,
    width: undefined,
    height: undefined,
  },
] as const satisfies readonly {
  value: string;
  label: string;
  icon: LucideIcon;
  width: number | undefined;
  height: number | undefined;
}[];

export type Viewport = (typeof VIEWPORT_OPTIONS)[number]["value"];

export function ViewportToggle({
  value,
  onChange,
}: {
  value: Viewport;
  onChange: (viewport: Viewport) => void;
}) {
  return (
    <TooltipProvider>
      <div className="bg-muted flex items-center gap-0.5 rounded-lg p-0.5">
        {VIEWPORT_OPTIONS.map((option) => {
          const Icon = option.icon;
          return (
            <Tooltip key={option.value}>
              <TooltipTrigger
                className={cn(
                  "cursor-pointer rounded-md p-1.5 transition-colors",
                  value === option.value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
                onClick={() => onChange(option.value)}
              >
                <Icon className="size-4" />
              </TooltipTrigger>
              <TooltipContent>{option.label}</TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
