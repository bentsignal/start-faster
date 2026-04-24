import { MoonIcon, SunIcon } from "lucide-react";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@acme/ui/sidebar";

import { useThemeStore } from "../theme/store";

export function ThemeToggleItem() {
  const currentTheme = useThemeStore((s) => s.theme);
  const changeTheme = useThemeStore((s) => s.changeTheme);

  const isLight = currentTheme === "light";

  function handleClick() {
    changeTheme(isLight ? "dark" : "light");
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="sm"
          onClick={handleClick}
          className="hover:cursor-pointer"
        >
          {isLight ? (
            <MoonIcon className="size-4" />
          ) : (
            <SunIcon className="size-4" />
          )}
          <span>
            {isLight ? "Switch to Dark Mode" : "Switch to Light Mode"}
          </span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
