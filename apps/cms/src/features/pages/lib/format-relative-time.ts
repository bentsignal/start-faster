function unitsFromDiff(diffMs: number) {
  const seconds = Math.floor(Math.abs(diffMs) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  return { seconds, minutes, hours, days };
}

function formatShortDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function formatRelativeTime(timestamp: number) {
  const diff = Date.now() - timestamp;
  if (diff < 0) return "now";
  const { seconds, minutes, hours, days } = unitsFromDiff(diff);

  if (seconds < 60) return "now";
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 30) return `${days}d`;
  return formatShortDate(timestamp);
}

export function formatTimeAgo(timestamp: number) {
  const diff = Date.now() - timestamp;
  const { seconds, minutes, hours, days } = unitsFromDiff(diff);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30) return `${days}d ago`;
  return formatShortDate(timestamp);
}

export function formatRelativeFutureTime(timestamp: number) {
  const diff = timestamp - Date.now();
  if (diff <= 0) return "now";
  const { minutes, hours, days } = unitsFromDiff(diff);

  if (minutes < 1) return "<1m";
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 30) return `${days}d`;
  return formatShortDate(timestamp);
}

export function formatAbsoluteDateTime(timestamp: number) {
  return new Date(timestamp).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
