import { useEffect, useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useConvexAuth, useQuery } from "convex/react";
import { createStore } from "rostra";

import { api } from "@acme/convex/api";

import { useLoading } from "~/hooks/use-loading";
import { authClient } from "../../lib/auth-client";

function useInternalStore({
  isAuthenticatedServerSide,
}: {
  isAuthenticatedServerSide: boolean;
}) {
  const { isLoading, start } = useLoading();

  const navigate = useNavigate();
  const urlShowLogin = useSearch({
    from: "__root__",
    select: (s) => s.showLogin ?? false,
  });
  const urlRedirectTo = useSearch({
    from: "__root__",
    select: (s) => s.redirectTo ?? null,
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(urlShowLogin);
  const [redirectTo, setRedirectTo] = useState(urlRedirectTo);
  const setRedirectURL = (url: string) => setRedirectTo(url);

  // use serverside auth value until client is mounted
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

  const myProfile = useQuery(api.profile.getMine, imSignedIn ? {} : "skip");

  const signInWithGoogle = () => {
    if (imSignedIn) return;
    start(async () => {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: redirectTo ?? "/",
      });
    });
  };

  const signOut = () => {
    if (imSignedOut) return;
    start(async () => {
      void navigate({ to: "/", replace: true });
      await authClient.signOut();
    });
  };

  return {
    myProfile,
    isLoading,
    imSignedIn,
    imSignedOut,
    signInWithGoogle,
    signOut,
    isLoginModalOpen,
    setIsLoginModalOpen,
    setRedirectURL,
  };
}

export const { Store: AuthStore, useStore: useAuthStore } =
  createStore(useInternalStore);
