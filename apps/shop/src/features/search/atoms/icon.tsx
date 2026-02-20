import { Search } from "lucide-react";

import { cn } from "@acme/ui/utils";

export function SearchIcon({ className }: { className?: string }) {
  return <Search className={cn("text-sidebar-foreground size-4", className)} />;
}
