import {
  Link,
  useNavigate,
  useRouteContext,
  useSearch,
} from "@tanstack/react-router";
import { ArrowRight, LockKeyhole } from "lucide-react";

import { Button } from "@acme/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@acme/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@acme/ui/drawer";

import { useIsMobile } from "~/hooks/use-is-mobile";

function LoginButton() {
  const returnTo = useSearch({
    from: "__root__",
    select: (search) => search.returnTo,
  });
  return (
    <form method="post" action="/login" className="flex flex-col gap-3">
      <input type="hidden" name="returnTo" value={returnTo} />
      <Button type="submit" size="lg" className="w-full">
        Continue to Sign In
        <ArrowRight data-icon="inline-end" className="size-4" />
      </Button>
    </form>
  );
}

function LoginModalContent() {
  return (
    <>
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="bg-primary/10 flex size-12 items-center justify-center rounded-2xl">
          <LockKeyhole className="text-primary size-5" strokeWidth={1.5} />
        </div>
        <div className="flex flex-col gap-1.5">
          <p className="text-muted-foreground font-mono text-[10px] tracking-[0.2em] uppercase">
            Sign in
          </p>
          <h3 className="text-xl font-semibold tracking-tight">
            Welcome back!
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Click below to be redirected to{" "}
            <span className="font-bold text-green-600 dark:text-green-400">
              Shopify
            </span>{" "}
            for sign in. After that you'll be brought back to this site.
          </p>
        </div>
      </div>
      <LoginButton />
      <p className="text-muted-foreground mx-4 text-center text-xs">
        By signing in, you agree to our{" "}
        <Link
          className="hover:text-primary transition-colors"
          to="/terms-of-service"
        >
          terms of service
        </Link>{" "}
        and{" "}
        <Link
          className="hover:text-primary transition-colors"
          to="/privacy-policy"
        >
          privacy policy
        </Link>
        .
      </p>
    </>
  );
}

export function LoginModal() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const isLoggedIn = useRouteContext({
    from: "__root__",
    select: (context) => context.auth.isSignedIn,
  });
  const urlSaysShowLogin = useSearch({
    from: "__root__",
    select: (search) => search.showLogin,
  });

  function handleOpenChange(open: boolean) {
    if (!open) {
      void navigate({
        to: ".",
      });
    }
  }

  const showLogin = urlSaysShowLogin && isLoggedIn === false ? true : false;

  if (isMobile) {
    return (
      <Drawer open={showLogin} onOpenChange={handleOpenChange}>
        <DrawerContent>
          <DrawerHeader className="sr-only">
            <DrawerTitle>Sign in required</DrawerTitle>
            <DrawerDescription>
              Sign in securely with Shopify.
            </DrawerDescription>
          </DrawerHeader>
          <div className="flex flex-col gap-5 px-4 pt-4 pb-4 lg:pt-2">
            <LoginModalContent />
          </div>
          <DrawerFooter />
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={showLogin} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader className="sr-only">
          <DialogTitle>Sign in required</DialogTitle>
          <DialogDescription>Sign in securely with Shopify.</DialogDescription>
        </DialogHeader>
        <LoginModalContent />
      </DialogContent>
    </Dialog>
  );
}
