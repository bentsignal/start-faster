import {
  formatRelativeFutureTime,
  formatRelativeTime,
} from "~/features/pages/lib/format-relative-time";

type Tense = "past" | "future";

export function TimeLabel({
  timestamp,
  tense,
}: {
  timestamp: number;
  tense: Tense;
}) {
  const text =
    tense === "past"
      ? formatRelativeTime(timestamp)
      : `in ${formatRelativeFutureTime(timestamp)}`;

  return (
    <span className="text-sidebar-foreground/30 ml-auto shrink-0 text-[10px] tabular-nums group-hover/version-item:invisible group-data-[menu-open]/version-item:invisible">
      {text}
    </span>
  );
}
