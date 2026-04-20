const BADGE_STYLES = {
  live: "bg-chart-2/15 text-chart-2 inline-flex shrink-0 items-center rounded px-1.5 py-0.5 text-[10px] font-medium tracking-wide uppercase",
  previous:
    "bg-sidebar-accent text-sidebar-foreground/50 inline-flex shrink-0 items-center rounded px-1.5 py-0.5 text-[10px] font-medium tracking-wide uppercase",
  draft:
    "bg-muted text-muted-foreground inline-flex shrink-0 items-center rounded px-1.5 py-0.5 text-[10px] font-medium tracking-wide uppercase",
  scheduled:
    "bg-chart-4/15 text-chart-4 inline-flex shrink-0 items-center rounded px-1.5 py-0.5 text-[10px] font-medium tracking-wide uppercase",
} as const;

export type VersionBadgeVariant = keyof typeof BADGE_STYLES;

const BADGE_LABELS = {
  live: "Live",
  previous: "Previous",
  draft: "Draft",
  scheduled: "Scheduled",
} as const satisfies Record<VersionBadgeVariant, string>;

export function VersionBadge({ variant }: { variant: VersionBadgeVariant }) {
  return <span className={BADGE_STYLES[variant]}>{BADGE_LABELS[variant]}</span>;
}
