import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { convert } from "great-time";
import { Check, LoaderCircle, LogOut, RotateCcw } from "lucide-react";

import { Button } from "@acme/ui/button";
import { toast } from "@acme/ui/toaster";

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
            queryClient.setQueryData(["auth"], {
              isSignedIn: false,
              customer: null,
            });
            queryClient.removeQueries({
              queryKey: accountQueries.all().queryKey,
            });
            await queryClient.invalidateQueries({ queryKey: ["auth"] });
            await navigate({ to: "/", replace: true });
            await router.invalidate();
          })();
        },
        convert(1, "second", "to ms"),
      );
    },
    onError: () => {
      toast.error("Unable to sign out. Please try again.");
    },
  });

  const isPending = signOutMutation.status === "pending";
  const isSuccess = signOutMutation.status === "success";
  const isError = signOutMutation.status === "error";

  return (
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
        <Check className="size-4" />
      ) : isError ? (
        <>
          <RotateCcw className="text-destructive size-4" />
          <span className="text-destructive">Retry</span>
        </>
      ) : (
        <>
          <LogOut className="size-4" />
          Sign out
        </>
      )}
    </Button>
  );
}
