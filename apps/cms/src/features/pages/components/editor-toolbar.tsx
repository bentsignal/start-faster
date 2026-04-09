import { CodeIcon, EyeIcon } from "lucide-react";

import { Button } from "@acme/ui/button";
import { Separator } from "@acme/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@acme/ui/tooltip";

import type { ViewMode } from "../types";
import { InsertButtons } from "./editor/insert-buttons";
import {
  BlockTypeSelector,
  ListButtons,
  MarkButtons,
} from "./editor/toolbar-buttons";

export function EditorToolbar({
  viewMode,
  onViewModeToggle,
  disabled,
  children,
}: {
  viewMode: ViewMode;
  onViewModeToggle: () => void;
  disabled?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="border-border flex shrink-0 items-center border-b px-2 py-1">
      <div className="flex flex-1 flex-wrap items-center gap-0.5">
        <BlockTypeSelector disabled={disabled} />
        <Separator orientation="vertical" className="mx-1 h-5" />
        <MarkButtons disabled={disabled} />
        <Separator orientation="vertical" className="mx-1 h-5" />
        <ListButtons disabled={disabled} />
        <Separator orientation="vertical" className="mx-1 h-5" />
        <InsertButtons disabled={disabled} />
      </div>
      <div className="ml-auto flex shrink-0 items-center gap-0.5">
        {children}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="xs"
                  className="min-w-20 gap-1 rounded-md text-xs"
                  onClick={onViewModeToggle}
                />
              }
            >
              {viewMode === "wysiwyg" ? (
                <>
                  <EyeIcon className="size-3" />
                  Editor
                </>
              ) : (
                <>
                  <CodeIcon className="size-3" />
                  Source
                </>
              )}
            </TooltipTrigger>
            <TooltipContent>
              {viewMode === "wysiwyg"
                ? "Switch to source mode"
                : "Switch to editor mode"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
