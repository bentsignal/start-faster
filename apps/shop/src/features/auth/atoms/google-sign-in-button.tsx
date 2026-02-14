import { useSearch } from "@tanstack/react-router";

import { cn } from "@acme/ui";

import { GoogleIcon } from "~/features/auth/icons";
import { useAuthStore } from "../store";

export function GoogleSignInButton({ className }: { className?: string }) {
  const signInWithGoogle = useAuthStore((s) => s.signInWithGoogle);
  const disabled = useAuthStore((s) => s.isLoading || s.imSignedIn);

  const redirectUri = useSearch({
    from: "/login",
    select: (s) => s.redirect_uri,
  });

  return (
    <button
      onClick={() => signInWithGoogle(redirectUri)}
      disabled={disabled}
      className={cn(
        className,
        "cursor-pointer disabled:cursor-not-allowed",
        "flex h-11 w-full flex-row items-center justify-center rounded-full border disabled:opacity-50",
        "border-[#747775] bg-white",
        "dark:border-[#8E918F] dark:bg-[#131314]",
      )}
    >
      <GoogleIcon />
      <span
        style={{ fontFamily: "var(--font-roboto)" }}
        className="font-medium text-[#1F1F1F] dark:text-[#E3E3E3]"
      >
        Sign in with Google
      </span>
    </button>
  );
}
