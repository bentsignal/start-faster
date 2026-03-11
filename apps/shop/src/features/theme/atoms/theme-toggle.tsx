import { MoonIcon, SunIcon } from "lucide-react";

import { Button } from "@acme/ui/button";
import { cn } from "@acme/ui/utils";

import { useThemeStore } from "../store";

export function ThemeToggle({ className }: { className?: string }) {
  const currentTheme = useThemeStore((s) => s.theme);
  const changeTheme = useThemeStore((s) => s.changeTheme);

  function handleClick() {
    changeTheme(currentTheme === "light" ? "dark" : "light");
  }

  return (
    <Button
      variant="ghost"
      className={cn("justify-start rounded-xl px-3 text-sm", className)}
      onClick={handleClick}
    >
      {currentTheme === "light" ? <MoonIcon /> : <SunIcon />}
      {currentTheme === "light"
        ? "Switch to Dark Mode"
        : "Switch to Light Mode"}
    </Button>
  );
}
