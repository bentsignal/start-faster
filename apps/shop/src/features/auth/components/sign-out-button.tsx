import { useMutation } from "@tanstack/react-query";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { Loader, LogOut } from "lucide-react";

import { Button } from "@acme/ui/button";
import { toast } from "@acme/ui/toaster";

interface SignOutButtonProps {
  className?: string;
}

export function SignOutButton({ className }: SignOutButtonProps) {
  const navigate = useNavigate();
  const router = useRouter();

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
    onSuccess: async () => {
      await navigate({ to: "/" });
      await router.invalidate();
      toast.success("Successfully signed out, see you soon!");
    },
    onError: () => {
      toast.error("Unable to sign out. Please try again.");
    },
  });

  return (
    <Button
      type="button"
      variant="ghost"
      size="lg"
      className={className}
      disabled={signOutMutation.isPending}
      onClick={() => {
        signOutMutation.mutate();
      }}
    >
      {signOutMutation.isPending ? (
        <Loader className="size-4 animate-spin" />
      ) : (
        <LogOut className="size-4" />
      )}
      {signOutMutation.isPending ? (
        <Loader className="size-4 animate-spin" />
      ) : (
        "Sign out"
      )}
    </Button>
  );
}
