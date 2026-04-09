import { Button } from "@acme/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@acme/ui/tooltip";
import { cn } from "@acme/ui/utils";

export function ToolbarButton({
  active,
  disabled,
  tooltip,
  onClick,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  tooltip: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="ghost"
              size="icon-xs"
              disabled={disabled}
              className={cn("rounded-md", active && "bg-muted text-foreground")}
              onMouseDown={(e: React.MouseEvent) => e.preventDefault()}
              onClick={(e: React.MouseEvent) => {
                e.preventDefault();
                onClick();
              }}
            />
          }
        >
          {children}
        </TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
