import { MoonIcon, SunIcon } from "lucide-react";

import { Button } from "@acme/ui/button";

import { useThemeStore } from "../store";

export function ThemeToggle() {
  const currentTheme = useThemeStore((s) => s.theme);
  const changeTheme = useThemeStore((s) => s.changeTheme);

  if (currentTheme === "light") {
    return (
      <Button variant="ghost" onClick={() => changeTheme("dark")}>
        <MoonIcon />
        Switch to Dark Mode
      </Button>
    );
  }

  return (
    <Button variant="ghost" onClick={() => changeTheme("light")}>
      <SunIcon />
      Switch to Light Mode
    </Button>
  );
}
