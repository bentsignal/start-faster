import { useQuery as useTanstackQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { getSignInUrl } from "@workos/authkit-tanstack-react-start";
import { useAuth } from "@workos/authkit-tanstack-react-start/client";
import { LogIn, LogOut } from "lucide-react";

import { Button } from "@acme/ui/button";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { auth } = Route.useRouteContext({
    select: (context) => ({
      auth: context.auth,
    }),
  });
  const { signOut, loading } = useAuth();
  const { data: signInUrl } = useTanstackQuery({
    queryKey: ["sign-in-url"],
    queryFn: async () => await getSignInUrl(),
  });

  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <h1>Shop</h1>
      {auth.isSignedIn ? (
        <Button
          variant="link"
          onClick={() => signOut({ returnTo: "/" })}
          disabled={loading}
          className="px-0!"
        >
          <LogOut size={16} />
          <span>Sign out</span>
        </Button>
      ) : (
        <Button variant="link" className="px-0!" asChild>
          <a href={signInUrl}>
            <LogIn size={16} />
            <span>Sign in</span>
          </a>
        </Button>
      )}
    </div>
  );
}
