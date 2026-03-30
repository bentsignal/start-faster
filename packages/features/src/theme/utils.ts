import { DEFAULT_THEME } from "./default";

export function getTheme(theme: string | undefined) {
  if (theme === "light" || theme === "dark") return theme;
  return DEFAULT_THEME;
}
