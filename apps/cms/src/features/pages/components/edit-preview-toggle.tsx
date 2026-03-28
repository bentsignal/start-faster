import type { LucideIcon } from "lucide-react";
import { Eye, Pencil } from "lucide-react";
import { z } from "zod";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@acme/ui/tooltip";
import { cn } from "@acme/ui/utils";

export const editorModeValidator = z.enum(["edit", "preview"]);
export type EditorMode = z.infer<typeof editorModeValidator>;
export const defaultEditorMode = "edit" satisfies EditorMode;

const MODE_OPTIONS = [
  { value: "edit", label: "Edit", icon: Pencil },
  { value: "preview", label: "Preview", icon: Eye },
] as const satisfies readonly {
  value: EditorMode;
  label: string;
  icon: LucideIcon;
}[];

export function EditPreviewToggle({
  value,
  onChange,
}: {
  value: EditorMode;
  onChange: (mode: EditorMode) => void;
}) {
  return (
    <TooltipProvider>
      <div className="bg-muted flex items-center gap-0.5 rounded-lg p-0.5">
        {MODE_OPTIONS.map((option) => {
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
