import { Ellipsis } from "lucide-react";

import { DropdownMenuTrigger } from "@acme/ui/dropdown-menu";

export function EllipsisTrigger() {
  return (
    <DropdownMenuTrigger
      render={
        <button className="text-sidebar-foreground/50 hover:text-sidebar-foreground absolute top-0 right-3 bottom-0 flex cursor-pointer items-center opacity-0 transition-colors group-hover/version-item:opacity-100 group-data-[menu-open]/version-item:opacity-100" />
      }
    >
      <Ellipsis className="size-4" />
    </DropdownMenuTrigger>
  );
}
