import { Search } from "lucide-react";

import { cn } from "@acme/ui";
import { Button } from "@acme/ui/button";
import { Input } from "@acme/ui/input";

export function SearchBar({ className }: { className?: string }) {
  return (
    <div className={cn("relative mx-auto max-w-xl flex-1", className)}>
      <Input
        type="text"
        placeholder="What can we help you find?"
        className="border-border h-11 rounded-xl px-5 pr-11 text-sm"
      />
      <Button
        variant="ghost"
        className="text-muted-foreground absolute top-0 right-0 h-full rounded-xl px-5"
      >
        <Search className="h-4 w-4" />
        <span className="sr-only">Search</span>
      </Button>
    </div>
  );
}
