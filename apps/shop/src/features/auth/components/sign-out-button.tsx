import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { convert } from "great-time";
import { Check, LoaderCircle, LogOut, RotateCcw } from "lucide-react";

import { Button } from "@acme/ui/button";
import { cn } from "@acme/ui/utils";

import { accountQueries } from "~/features/account/lib/account-queries";
import { authMutations } from "~/features/auth/lib/auth-mutations";
import { authQueries } from "~/features/auth/lib/auth-queries";

type SignOutStatus = "idle" | "pending" | "success" | "error";

function useSignOut() {
  const navigate = useNavigate();
  const router = useRouter();
  const queryClient = useQueryClient();

  const signOutMutation = useMutation({
    ...authMutations.signOut(),
    onSuccess: () => {
      setTimeout(
        () => {
          void (async () => {
            await navigate({ to: "/", reloadDocument: true });
            queryClient.setQueryData(authQueries.getAuth().queryKey, {
              isSignedIn: false,
              customer: null,
            });
            queryClient.removeQueries({
              queryKey: accountQueries.all().queryKey,
            });
            await queryClient.invalidateQueries({
              queryKey: authQueries.getAuth().queryKey,
            });
            await router.invalidate();
          })();
        },
        convert(1, "second", "to ms"),
      );
    },
    onError: (error) => {
      console.error(error);
    },
  });

  return {
    signOut: () => signOutMutation.mutate(),
    status: signOutMutation.status,
  };
}

function getAriaLabel(status: SignOutStatus) {
  switch (status) {
    case "pending":
      return "Signing out";
    case "success":
      return "Signed out";
    case "idle":
    case "error":
      return "Sign out";
  }
}

function SignOutButtonContent({ status }: { status: SignOutStatus }) {
  switch (status) {
    case "pending":
      return <LoaderCircle className="size-4 animate-spin" />;
    case "success":
      return (
        <>
          <Check className="size-4 text-green-600 dark:text-green-300" />
          <span className="text-green-600 dark:text-green-300">
            See ya later!
          </span>
        </>
      );
    case "error":
      return (
        <>
          <RotateCcw className="size-4" />
          <span>Retry</span>
        </>
      );
    case "idle":
      return (
        <>
          <LogOut className="size-4" />
          Sign out
        </>
      );
  }
}

export function SignOutButton({ className }: { className?: string }) {
  const { signOut, status } = useSignOut();

  return (
    <div className="w-full">
      <Button
        type="button"
        variant="ghost"
        size="lg"
        className={cn(
          className,
          status === "success" && "disabled:opacity-100",
        )}
        aria-label={getAriaLabel(status)}
        disabled={status === "pending" || status === "success"}
        onClick={signOut}
      >
        <SignOutButtonContent status={status} />
      </Button>
      {status === "error" ? (
        <p className="text-destructive mt-2 text-sm leading-5" role="alert">
          Unable to sign out. Please try again.
        </p>
      ) : null}
    </div>
  );
}
