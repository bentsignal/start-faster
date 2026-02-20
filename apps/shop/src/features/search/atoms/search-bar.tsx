import { cn } from "@acme/ui/utils";

export function SearchBar({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "bg-sidebar border-sidebar-border flex flex-row items-center rounded-xl border px-4",
        className,
      )}
    >
      {children}
    </div>
  );
}
