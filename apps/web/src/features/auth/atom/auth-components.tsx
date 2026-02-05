import { useNavigate } from "@tanstack/react-router";
import { LogIn, LogOut } from "lucide-react";

import { Button } from "@acme/ui/button";

import { GoogleIcon } from "~/features/auth/icons";
import { cn } from "~/utils/style-utils";
import { useStore as useAuthStore } from "./auth-store";

function GoogleSignInButton({ className }: { className?: string }) {
  const signInWithGoogle = useAuthStore((s) => s.signInWithGoogle);
  const disabled = useAuthStore((s) => s.isLoading || s.imSignedIn);
  return (
    <button
      onClick={signInWithGoogle}
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

function TakeMeToLoginButton() {
  const setIsLoginModalOpen = useAuthStore((s) => s.setIsLoginModalOpen);
  return (
    <Button className="w-full" onClick={() => setIsLoginModalOpen(true)}>
      <LogIn size={16} />
      <span>Take me to login</span>
    </Button>
  );
}

function TakeMeToLoginLink() {
  const navigate = useNavigate();
  function handleClick() {
    void navigate({
      to: "/",
      search: (prev) => ({ ...prev, showLogin: true }),
    });
  }
  return (
    <Button variant="link" onClick={handleClick} className="px-0!">
      <LogIn size={16} />
      <span>Take me to login</span>
    </Button>
  );
}

function SignOutButton() {
  const signOut = useAuthStore((s) => s.signOut);
  const disabled = useAuthStore((s) => s.isLoading || !s.imSignedIn);
  return (
    <Button onClick={signOut} disabled={disabled}>
      <LogOut size={16} />
      <span>Sign out</span>
    </Button>
  );
}

function SignOutLink() {
  const signOut = useAuthStore((s) => s.signOut);
  const disabled = useAuthStore((s) => s.isLoading || !s.imSignedIn);
  return (
    <Button
      variant="link"
      onClick={signOut}
      disabled={disabled}
      className="px-0!"
    >
      <LogOut size={16} />
      <span>Sign out</span>
    </Button>
  );
}

export {
  GoogleSignInButton,
  TakeMeToLoginButton,
  TakeMeToLoginLink,
  SignOutButton,
  SignOutLink,
};
