import type { Theme } from "./types";

function getTheme(theme: string | undefined): Theme {
  if (!theme) return "dark";
  return theme as Theme;
}

export { getTheme };
