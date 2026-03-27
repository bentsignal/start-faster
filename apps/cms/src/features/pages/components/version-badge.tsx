const _VERSION_BADGE_VARIANTS = ["draft", "live", "previous"] as const;
type VersionBadgeVariant = (typeof _VERSION_BADGE_VARIANTS)[number];

export type { VersionBadgeVariant };

export function VersionBadge({ variant }: { variant: VersionBadgeVariant }) {
  switch (variant) {
    case "live":
      return (
        <span className="bg-chart-2/15 text-chart-2 inline-flex shrink-0 items-center rounded px-1.5 py-0.5 text-[10px] font-medium tracking-wide uppercase">
          Live
        </span>
      );
    case "previous":
      return (
        <span className="bg-sidebar-accent text-sidebar-foreground/50 inline-flex shrink-0 items-center rounded px-1.5 py-0.5 text-[10px] font-medium tracking-wide uppercase">
          Previous
        </span>
      );
    case "draft":
      return (
        <span className="bg-muted text-muted-foreground inline-flex shrink-0 items-center rounded px-1.5 py-0.5 text-[10px] font-medium tracking-wide uppercase">
          Draft
        </span>
      );
    default: {
      const _exhaustive: never = variant;
      return _exhaustive;
    }
  }
}
