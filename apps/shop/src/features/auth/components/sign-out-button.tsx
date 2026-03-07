import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { convert } from "great-time";
import { Check, LoaderCircle, LogOut, RotateCcw } from "lucide-react";

import { Button } from "@acme/ui/button";

import { accountQueries } from "~/features/account/lib/account-queries";

export function SignOutButton({ className }: { className?: string }) {
  const navigate = useNavigate();
  const router = useRouter();
  const queryClient = useQueryClient();

  const signOutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/logout", {
        method: "POST",
        redirect: "manual",
      });

      if (response.type === "opaqueredirect") {
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to sign out.");
      }
    },
    onSuccess: () => {
      setTimeout(
        () => {
          void (async () => {
            await navigate({ to: "/", replace: true });
            queryClient.setQueryData(["auth"], {
              isSignedIn: false,
              customer: null,
            });
            queryClient.removeQueries({
              queryKey: accountQueries.all().queryKey,
            });
            await queryClient.invalidateQueries({ queryKey: ["auth"] });
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

  const isPending = signOutMutation.status === "pending";
  const isSuccess = signOutMutation.status === "success";
  const isError = signOutMutation.status === "error";

  return (
    <div className="w-full">
      <Button
        type="button"
        variant="ghost"
        size="lg"
        className={className}
        aria-label={
          isPending ? "Signing out" : isSuccess ? "Signed out" : "Sign out"
        }
        disabled={isPending || isSuccess}
        onClick={() => {
          signOutMutation.mutate();
        }}
      >
        {isPending ? (
          <LoaderCircle className="size-4 animate-spin" />
        ) : isSuccess ? (
          <>
            <Check className="size-4 text-green-600 dark:text-green-300" />
            <span className="text-green-600 dark:text-green-300">
              See ya later!
            </span>
          </>
        ) : isError ? (
          <>
            <RotateCcw className="size-4" />
            <span>Retry</span>
          </>
        ) : (
          <>
            <LogOut className="size-4" />
            Sign out
          </>
        )}
      </Button>
      {isError ? (
        <p className="text-destructive mt-2 text-sm leading-5" role="alert">
          Unable to sign out. Please try again.
        </p>
      ) : null}
    </div>
  );
}
