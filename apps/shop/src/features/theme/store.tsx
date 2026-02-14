import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  ThemeProvider as NextThemeProvider,
  useTheme as useNextTheme,
} from "next-themes";
import { createStore } from "rostra";

import type { Theme } from "./types";

function useInternalStore({ initialTheme }: { initialTheme: Theme }) {
  const queryClient = useQueryClient();
  const { setTheme: setNextTheme } = useNextTheme();
  const [theme, setTheme] = useState<Theme>(initialTheme);

  useEffect(() => {
    document.cookie = `theme=${theme}; path=/; max-age=${60 * 60 * 24 * 30}`;
  }, [theme]);

  const changeTheme = (newTheme: Theme) => {
    setNextTheme(newTheme);
    setTheme(newTheme);
    queryClient.setQueryData(["theme"], newTheme);
  };

  return { theme, changeTheme };
}

const { Store: InternalThemeStore, useStore } = createStore(useInternalStore);

function ThemeStore({
  children,
  initialTheme,
  ...props
}: React.ComponentProps<typeof NextThemeProvider> & { initialTheme: Theme }) {
  return (
    <NextThemeProvider {...props}>
      <InternalThemeStore initialTheme={initialTheme}>
        {children}
      </InternalThemeStore>
    </NextThemeProvider>
  );
}

export const useThemeStore = useStore;
export { ThemeStore };
