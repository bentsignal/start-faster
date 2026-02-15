import { createFileRoute } from "@tanstack/react-router";

import { SignOutLink } from "~/features/auth/atoms/sign-out-link";

export const Route = createFileRoute("/cms/settings")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <h1>Settings</h1>
      <SignOutLink />
    </div>
  );
}
