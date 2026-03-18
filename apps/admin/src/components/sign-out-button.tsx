import { useAuth } from "@workos/authkit-tanstack-react-start/client";
import { LogOut } from "lucide-react";

import { Button } from "@acme/ui/button";

import { env } from "~/env";

export function SignOutButton() {
  const { signOut, loading: isSigningOut } = useAuth();

  return (
    <Button
      variant="outline"
      onClick={() => {
        void signOut({ returnTo: env.VITE_SITE_URL });
      }}
      disabled={isSigningOut}
    >
      <LogOut className="size-4" />
      Sign out
    </Button>
  );
}
