import { useNavigate, useSearch } from "@tanstack/react-router";
import { Loader } from "lucide-react";

import * as Dialog from "@acme/ui/dialog";
import * as Drawer from "@acme/ui/drawer";

import * as Auth from "~/features/auth/atom";
import { useIsMobile } from "~/hooks/use-is-mobile";

export function LoginModal() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const urlSaysShowLogin = useSearch({
    from: "__root__",
    select: (s) => s.showLogin ?? false,
  });
  const imNotloggedIn = Auth.useStore((s) => s.imSignedOut);

  const shouldShowLogin = imNotloggedIn && urlSaysShowLogin;

  function handleOpenChange(open: boolean) {
    void navigate({
      to: "/",
      search: (prev) => ({ ...prev, showLogin: open ? true : undefined }),
    });
  }

  if (isMobile) {
    return (
      <Drawer.Container open={shouldShowLogin} onOpenChange={handleOpenChange}>
        <Drawer.Content className="my-4">
          <LoadingOverlay />
          <Drawer.Header className="text-left">
            <Drawer.Title className="text-center text-xl">
              Welcome to Ruby!
            </Drawer.Title>
            <Drawer.Description>
              Please choose your preferred sign in method
            </Drawer.Description>
          </Drawer.Header>
          <div className="mx-4 mt-2 mb-3 flex flex-col gap-4">
            <Auth.GoogleSignInButton />
          </div>
          <Drawer.Footer className="pt-2">
            <span className="text-muted-foreground text-center text-sm">
              By continuing, you agree to our Terms of Service, and acknowledge
              that you have read our Privacy Policy.
            </span>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer.Container>
    );
  }

  return (
    <Dialog.Container open={shouldShowLogin} onOpenChange={handleOpenChange}>
      <Dialog.Content className="sm:max-w-[425px]">
        <LoadingOverlay />
        <Dialog.Header>
          <Dialog.Title>Welcome to Ruby!</Dialog.Title>
          <Dialog.Description>
            Please choose your preferred sign in method
          </Dialog.Description>
          <div className="mx-4 mt-3 mb-2 flex flex-col gap-4">
            <Auth.GoogleSignInButton />
          </div>
          <span className="text-muted-foreground text-center text-sm">
            By continuing, you agree to our Terms of Service, and acknowledge
            that you have read our Privacy Policy.
          </span>
        </Dialog.Header>
      </Dialog.Content>
    </Dialog.Container>
  );
}

function LoadingOverlay() {
  const isLoading = Auth.useStore((s) => s.isLoading);
  if (!isLoading) return null;
  return (
    <div className="bg-background/60 fixed inset-0 z-50 flex items-center justify-center">
      <Loader className="h-5 w-5 animate-spin" />
    </div>
  );
}
