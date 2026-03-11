import { MoonIcon, SunIcon } from "lucide-react";

import { Button } from "@acme/ui/button";

import { useThemeStore } from "../store";

export function ThemeToggle() {
  const currentTheme = useThemeStore((s) => s.theme);
  const changeTheme = useThemeStore((s) => s.changeTheme);

  function handleClick() {
    changeTheme(currentTheme === "light" ? "dark" : "light");
  }

  return (
    <Button
      variant="ghost"
      className="w-full justify-center rounded-xl px-4 text-base sm:h-10 sm:w-auto sm:justify-start sm:text-sm"
      onClick={handleClick}
    >
      {currentTheme === "light" ? <SunIcon /> : <MoonIcon />}
      {currentTheme === "light"
        ? "Switch to Dark Mode"
        : "Switch to Light Mode"}
    </Button>
  );
}
