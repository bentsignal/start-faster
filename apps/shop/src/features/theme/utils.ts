import type { Theme } from "./types";
import { DEFAULT_THEME } from "./default";

function getTheme(theme: string | undefined): Theme {
  if (!theme) return DEFAULT_THEME;
  return theme as Theme;
}

export { getTheme };
