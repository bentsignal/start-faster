import type { InputHTMLAttributes } from "react";
import { useEffect, useRef } from "react";
import { Search, X } from "lucide-react";

import { cn } from "~/utils/style-utils";
import { useStore as useSearchStore } from "./search-store";

function Container({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "bg-sidebar border-sidebar-border flex flex-row items-center rounded-full border px-4",
        className,
      )}
    >
      {children}
    </div>
  );
}

function Icon({ className }: { className?: string }) {
  return <Search className={cn("text-sidebar-foreground size-4", className)} />;
}

function Input({
  className,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTerm = useSearchStore((s) => s.searchTerm);
  const setSearchTerm = useSearchStore((s) => s.setSearchTerm);

  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
      const length = inputRef.current.value.length;
      inputRef.current.setSelectionRange(length, length);
    }
  };

  useEffect(() => {
    focusInput();
  }, []);

  return (
    <input
      ref={inputRef}
      className={cn(
        "text-sidebar-foreground placeholder:text-muted-foreground h-10 flex-1 bg-transparent px-4 outline-none",
        className,
      )}
      value={searchTerm}
      autoCorrect="off"
      autoCapitalize="off"
      autoComplete="off"
      placeholder="Search"
      onChange={(e) => setSearchTerm(e.target.value)}
      {...props}
    />
  );
}

function ClearButton({ className }: { className?: string }) {
  const setSearchTerm = useSearchStore((s) => s.setSearchTerm);
  const hideButton = useSearchStore((s) => s.searchTerm.length === 0);
  if (hideButton) return null;
  return (
    <button
      type="button"
      className={cn(
        "text-sidebar-foreground cursor-pointer py-2 pl-2",
        className,
      )}
      onClick={() => setSearchTerm("")}
    >
      <X className="size-4" />
    </button>
  );
}

export { Container, Icon, Input, ClearButton };
