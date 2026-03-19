import { useQuery as useTanstackQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { getSignInUrl } from "@workos/authkit-tanstack-react-start";
import { useAuth } from "@workos/authkit-tanstack-react-start/client";
import { LogIn, LogOut } from "lucide-react";

import { Button } from "@acme/ui/button";

import { Image } from "~/components/image";
import { env } from "~/env";

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
      <h1>CMS</h1>
      <Image
        src={`${env.VITE_UT_URL}/f/dlAVwa1xZRzoPGPAVYMlRHnDjhbYXJ7ZpOdACLVk8KzfSW30`}
        alt="Lifestyle photos from the launch collection"
        width={1440}
        height={720}
        sizes="(min-width: 1280px) 60vw, 100vw"
        fetchPriority="high"
        loading="eager"
        className="block h-auto w-full max-w-lg"
      />
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
        <Button
          variant="link"
          className="px-0!"
          render={() => (
            <a href={signInUrl}>
              <LogIn size={16} />
              <span>Sign in</span>
            </a>
          )}
        />
      )}
    </div>
  );
}
