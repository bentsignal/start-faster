import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useConvexAuth, useQuery } from "convex/react";
import { createStore } from "rostra";

import { api } from "@acme/convex/api";
import { toast } from "@acme/ui/toast";

import { useLoading } from "~/hooks/use-loading";
import { authClient } from "./lib/client";

function useInternalStore({
  isAuthenticatedServerSide,
}: {
  isAuthenticatedServerSide: boolean;
}) {
  const { isLoading, start } = useLoading();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { isAuthenticated: isAuthenticatedClientSide } = useConvexAuth();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setTimeout(() => {
      setMounted(true);
    }, 1000);
  }, []);

  const imSignedIn = mounted
    ? isAuthenticatedClientSide
    : isAuthenticatedServerSide;
  const imSignedOut = !imSignedIn;

  const myProfile = useQuery(api.profile.getMine);

  const signInWithGoogle = (redirectUri?: string) => {
    if (imSignedIn) return;
    start(async () => {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: redirectUri ?? "/",
      });
    });
  };

  const signOut = () => {
    if (imSignedOut) return;
    start(async () => {
      void navigate({ to: "/", replace: true, search: { signedOut: true } });
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            queryClient.removeQueries({ queryKey: ["auth-token"] });
            const url = new URL(window.location.href);
            url.searchParams.delete("signedOut");
            window.location.replace(url.toString());
          },
          onError: (error: unknown) => {
            console.error(error);
            toast.error("Failed to sign out");
          },
        },
      });
    });
  };

  return {
    myProfile,
    isLoading,
    imSignedIn,
    imSignedOut,
    signInWithGoogle,
    signOut,
  };
}

export const { Store: AuthStore, useStore: useAuthStore } =
  createStore(useInternalStore);
