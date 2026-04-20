import type { LucideIcon } from "lucide-react";
import { List, Network } from "lucide-react";
import { z } from "zod";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@acme/ui/tooltip";
import { cn } from "@acme/ui/utils";

export const pagesViewModeValidator = z.enum(["list", "tree"]);
export type PagesViewMode = z.infer<typeof pagesViewModeValidator>;
export const defaultPagesViewMode = "list" satisfies PagesViewMode;

const VIEW_OPTIONS = [
  { value: "list", label: "List", icon: List },
  { value: "tree", label: "Tree", icon: Network },
] as const satisfies readonly {
  value: PagesViewMode;
  label: string;
  icon: LucideIcon;
}[];

export function PagesViewToggle({
  value,
  onChange,
}: {
  value: PagesViewMode;
  onChange: (mode: PagesViewMode) => void;
}) {
  return (
    <TooltipProvider>
      <div className="bg-muted flex items-center gap-0.5 rounded-lg p-0.5">
        {VIEW_OPTIONS.map((option) => {
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
