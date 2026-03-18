export type AccessLevel = "authorized" | "unauthorized";

export function toAccessLevel(value: string): AccessLevel {
  if (value === "authorized") {
    return "authorized";
  }
  return "unauthorized";
}
