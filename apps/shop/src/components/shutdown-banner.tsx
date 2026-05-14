import { useMatch } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { QuickLink } from "@acme/features/quick-link";

export function ShutdownBanner() {
  const isShutdownPage = useMatch({
    from: "/$",
    shouldThrow: false,
    select: (match) => match.params._splat === "shutdown",
  });

  if (isShutdownPage) {
    return (
      <QuickLink
        to="/"
        className="bg-primary/10 text-primary flex items-center justify-center gap-2 px-4 py-2.5 text-center text-sm font-medium"
      >
        <ArrowLeft className="size-4" />
        Back to Home
      </QuickLink>
    );
  }

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
