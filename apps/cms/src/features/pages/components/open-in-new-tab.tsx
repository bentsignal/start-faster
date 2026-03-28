import { ExternalLink } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@acme/ui/tooltip";
import { cn } from "@acme/ui/utils";

export function OpenInNewTab({ url }: { url: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          className={cn(
            "text-muted-foreground hover:text-foreground rounded-md p-1.5 transition-colors",
          )}
          onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
        >
          <ExternalLink className="hover:text-foreground size-4 cursor-pointer" />
        </TooltipTrigger>
        <TooltipContent>Open in new tab</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
