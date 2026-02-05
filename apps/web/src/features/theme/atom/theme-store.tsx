import { useEffect, useState } from "react";
import {
  ThemeProvider as NextThemeProvider,
  useTheme as useNextTheme,
} from "next-themes";
import { createStore } from "rostra";

import type { Theme } from "../types";

function useInternalStore({ initialTheme }: { initialTheme: Theme }) {
  const { setTheme: setNextTheme } = useNextTheme();
  const [theme, setTheme] = useState<Theme>(initialTheme);

  useEffect(() => {
    document.cookie = `theme=${theme}; path=/; max-age=${60 * 60 * 24 * 30}`;
  }, [theme]);

  const changeTheme = (newTheme: Theme) => {
    setNextTheme(newTheme);
    setTheme(newTheme);
  };

  return { theme, changeTheme };
}

const { Store: InternalStore, useStore } = createStore(useInternalStore);

function Store({
  children,
  initialTheme,
  ...props
}: React.ComponentProps<typeof NextThemeProvider> & { initialTheme: Theme }) {
  return (
    <NextThemeProvider {...props}>
      <InternalStore initialTheme={initialTheme}>{children}</InternalStore>
    </NextThemeProvider>
  );
}

export { Store, useStore };
