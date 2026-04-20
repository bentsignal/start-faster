const pad = (n: number) => n.toString().padStart(2, "0");

export function splitDateTimeLocal(value: string) {
  const [date = "", time = ""] = value.split("T");
  return { date, time };
}

export function toLocalInputValue(timestamp: number) {
  const d = new Date(timestamp);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function parseLocalInputValue(value: string) {
  if (!value) return null;
  const ts = new Date(value).getTime();
  if (Number.isNaN(ts)) return null;
  return ts;
}

export function nextHourTimestamp() {
  const d = new Date();
  d.setHours(d.getHours() + 1);
  d.setMinutes(0, 0, 0);
  return d.getTime();
}

export type DateTimeValidation =
  | { ok: true; ts: number }
  | { ok: false; error: string };

export function validateDateTime(value: string) {
  const ts = parseLocalInputValue(value);
  if (ts === null) {
    return {
      ok: false as const,
      error: "Please pick a valid date and time",
    };
  }
  if (ts <= Date.now()) {
    return {
      ok: false as const,
      error: "Scheduled time must be in the future",
    };
  }
  return { ok: true as const, ts };
}
