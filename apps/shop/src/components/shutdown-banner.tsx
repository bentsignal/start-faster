import { useMatch } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { QuickLink } from "@acme/features/quick-link";

export function ShutdownBanner() {
  const isShutdownPage = useMatch({
    from: "/$",
    shouldThrow: false,
    select: (match) => match.params._splat === "shutdown",
  });

  if (isShutdownPage) return null;

  return (
    <QuickLink
      to="/$"
      params={{ _splat: "shutdown" }}
      className="bg-destructive/10 text-destructive flex items-center justify-center gap-2 px-4 py-2.5 text-center text-sm font-medium"
    >
      Store shutdown &mdash; read more here
      <ArrowRight className="size-4" />
    </QuickLink>
  );
}
