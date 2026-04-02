type StatusPillTone = "primary" | "secondary" | "accent" | "success";

const toneClassMap = {
  primary:
    "bg-foreground text-background self-start rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide uppercase",
  accent:
    "self-start rounded-full bg-sky-500/12 px-2.5 py-1 text-xs font-semibold tracking-wide text-sky-800 uppercase ring-1 ring-sky-600/20 ring-inset dark:bg-sky-500/18 dark:text-sky-200 dark:ring-sky-400/30",
  success:
    "self-start rounded-full bg-emerald-500/12 px-2.5 py-1 text-xs font-semibold tracking-wide text-emerald-800 uppercase ring-1 ring-emerald-600/20 ring-inset dark:bg-emerald-500/18 dark:text-emerald-200 dark:ring-emerald-400/30",
  secondary:
    "bg-muted text-muted-foreground self-start rounded-full px-2.5 py-1 text-xs font-medium",
} satisfies Record<StatusPillTone, string>;

export function StatusPill({
  label,
  tone = "secondary",
}: {
  label: string;
  tone?: StatusPillTone;
}) {
  return <span className={toneClassMap[tone]}>{label}</span>;
}
