import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, X } from "lucide-react";

import type { Block } from "@acme/convex/page-validators";
import { Button } from "@acme/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@acme/ui/tooltip";

import { BLOCK_TYPE_LABELS } from "~/features/pages/lib/block-types";

export function BlockWrapper({
  id,
  type,
  onDelete,
  children,
}: {
  id: string;
  type: Block["type"];
  onDelete: () => void;
  children: React.ReactNode;
}) {
  const { confirming, setConfirming, nodeRef, style, isDragging, handleProps } =
    useBlockWrapper({ id });

  return (
    <div
      ref={nodeRef}
      style={style}
      className={`border-border bg-card group relative rounded-lg border ${isDragging ? "z-10 opacity-50" : ""}`}
    >
      <div className="border-border flex items-center justify-between border-b px-3 py-1.5">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
            {...handleProps}
          >
            <GripVertical className="size-3.5" />
          </button>
          <span className="text-muted-foreground text-xs font-medium">
            {BLOCK_TYPE_LABELS[type]}
          </span>
        </div>

        {confirming ? (
          <DeleteConfirmation
            onConfirm={onDelete}
            onCancel={() => setConfirming(false)}
          />
        ) : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    size="icon-xs"
                    variant="ghost"
                    className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100"
                    onClick={() => setConfirming(true)}
                  />
                }
              >
                <Trash2 className="size-3.5" />
              </TooltipTrigger>
              <TooltipContent>Delete block</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {children}
    </div>
  );
}

function useBlockWrapper({ id }: { id: string }) {
  const [confirming, setConfirming] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return {
    confirming,
    setConfirming,
    nodeRef: setNodeRef,
    style,
    isDragging,
    handleProps: { ...attributes, ...listeners },
  };
}

function DeleteConfirmation({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground text-xs">Are you sure?</span>
      <TooltipProvider>
        <div className="flex gap-1">
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  size="icon-xs"
                  className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-none"
                  onClick={onConfirm}
                />
              }
            >
              <Trash2 className="size-3.5" />
            </TooltipTrigger>
            <TooltipContent>Delete block</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button size="icon-xs" variant="outline" onClick={onCancel} />
              }
            >
              <X className="size-3.5" />
            </TooltipTrigger>
            <TooltipContent>Cancel</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  );
}
