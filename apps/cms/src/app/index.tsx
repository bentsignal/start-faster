import { createFileRoute } from "@tanstack/react-router";
import { useConvexAuth } from "convex/react";

import { SignOutLink } from "~/features/auth/atoms/sign-out-link";
import { TakeMeToLoginLink } from "~/features/auth/atoms/take-me-to-login-link";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const isAuthenticatedServerSide = Route.useRouteContext({
    select: (c) => c.isAuthenticated,
  });
  const { isAuthenticated: isAuthenticatedClientSide } = useConvexAuth();

  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <h1>CMS</h1>
      <span>client: {isAuthenticatedClientSide ? "true" : "false"}</span>
      <span>server: {isAuthenticatedServerSide ? "true" : "false"}</span>
      {isAuthenticatedClientSide ? <SignOutLink /> : <TakeMeToLoginLink />}
    </div>
  );
}
