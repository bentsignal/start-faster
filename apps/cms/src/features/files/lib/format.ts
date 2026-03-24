const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatDate(timestamp: number) {
  return dateFormatter.format(timestamp);
}

const FILE_SIZE_UNITS = ["KB", "MB", "GB", "TB"] as const;

export function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  let value = bytes / 1024;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < FILE_SIZE_UNITS.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(value >= 10 ? 0 : 1)} ${FILE_SIZE_UNITS[unitIndex]}`;
}

export function toConvexSiteUrl(url: string) {
  return url.includes(".cloud") ? url.replace(".cloud", ".site") : url;
}
