import { Plus } from "lucide-react";

import type { Block } from "@acme/convex/page-validators";
import { Button } from "@acme/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@acme/ui/dropdown-menu";

import { BLOCK_OPTIONS } from "~/features/pages/lib/block-types";

export function AddBlockButton({
  onAdd,
  variant = "default",
}: {
  onAdd: (block: Block) => void;
  variant?: "default" | "between";
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<AddButton variant={variant} label="Add block" />}
      />
      <DropdownMenuContent>
        {BLOCK_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.type}
            onClick={() => onAdd(option.create())}
          >
            <option.icon className="size-3.5" />
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AddButton({
  variant,
  onClick,
  label,
}: {
  variant: "default" | "between";
  onClick?: () => void;
  label: string;
}) {
  if (variant === "between") {
    return (
      <div className="flex justify-center py-1 opacity-0 transition-opacity hover:opacity-100 has-[[data-popup-open]]:opacity-100">
        <Button
          size="xs"
          variant="ghost"
          className="text-muted-foreground hover:text-foreground gap-1 text-xs"
          onClick={onClick}
        >
          <Plus className="size-3" />
          {label}
        </Button>
      </div>
    );
  }

  return (
    <Button
      size="sm"
      variant="outline"
      className="text-muted-foreground hover:text-foreground gap-1.5"
      onClick={onClick}
    >
      <Plus className="size-3.5" />
      {label}
    </Button>
  );
}
