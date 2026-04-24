import type { ReactNode } from "react";

import type { CmsScope } from "@acme/convex/types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@acme/ui/tooltip";
import { cn } from "@acme/ui/utils";

import { getScopeDeniedMessage } from "~/features/permissions/lib/cms-scope-messages";

type TooltipSide = "top" | "bottom" | "left" | "right";

/**
 * Shows a "permission denied" tooltip around a (usually disabled) control.
 *
 * Disabled native buttons don't emit pointer events, which prevents the
 * tooltip from ever opening. We wrap children in a span so the span is the
 * hover target instead of the disabled control. Pass `className` when the
 * wrapped control needs to fill its parent (e.g. `w-full` buttons).
 */
export function RestrictedTooltip({
  scope,
  children,
  side = "top",
  className,
}: {
  scope: CmsScope;
  children: ReactNode;
  side?: TooltipSide;
  className?: string;
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          render={<span className={cn("inline-flex", className)} />}
        >
          {children}
        </TooltipTrigger>
        <TooltipContent side={side}>
          {getScopeDeniedMessage(scope)}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
