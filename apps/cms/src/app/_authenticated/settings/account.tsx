import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/settings/account")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      Hello "/settings/account"!
    </div>
  );
}
