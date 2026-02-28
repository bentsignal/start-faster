import { createServerFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";

import { getTheme } from "~/features/theme/utils";

export const getThemeFromCookie = createServerFn({ method: "GET" }).handler(
  () => {
    const themeCookie = getCookie("theme");
    return getTheme(themeCookie);
  },
);
