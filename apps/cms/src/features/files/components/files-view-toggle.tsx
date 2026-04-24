import type { LucideIcon } from "lucide-react";
import { LayoutGrid, List } from "lucide-react";
import { z } from "zod";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@acme/ui/tooltip";
import { cn } from "@acme/ui/utils";

export const filesViewModeValidator = z.enum(["grid", "list"]);
export type FilesViewMode = z.infer<typeof filesViewModeValidator>;
export const defaultFilesViewMode = "grid" satisfies FilesViewMode;

const VIEW_OPTIONS = [
  { value: "grid", label: "Grid", icon: LayoutGrid },
  { value: "list", label: "List", icon: List },
] as const satisfies readonly {
  value: FilesViewMode;
  label: string;
  icon: LucideIcon;
}[];

export function FilesViewToggle({
  value,
  onChange,
}: {
  value: FilesViewMode;
  onChange: (mode: FilesViewMode) => void;
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
