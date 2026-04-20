import { cn } from "@acme/ui/utils";

type EmptyStateVariant = "sidebar" | "dashboard";

const VARIANT_CLASSES = {
  sidebar: "text-sidebar-foreground/40 block px-2 py-4 text-center text-xs",
  dashboard: "text-muted-foreground block px-3 py-8 text-center text-sm",
} as const satisfies Record<EmptyStateVariant, string>;

interface EmptyStateProps {
  text: string;
  variant?: EmptyStateVariant;
  className?: string;
}

/**
 * Shared empty-state placeholder. The `sidebar` variant preserves the
 * visuals from the original `PageHubEmptyState`; the `dashboard` variant
 * preserves the inline `EmptyState` used in `dashboard.tsx`.
 */
export function EmptyState({
  text,
  variant = "sidebar",
  className,
}: EmptyStateProps) {
  return (
    <span className={cn(VARIANT_CLASSES[variant], className)}>{text}</span>
  );
}
