import {
  createFileRoute,
  Outlet,
  redirect,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";

import { QuickLink } from "@acme/features/quick-link";
import { buttonVariants } from "@acme/ui/button";
import { NativeSelect, NativeSelectOption } from "@acme/ui/native-select";
import { cn } from "@acme/ui/utils";

import { getSelectedRoute, navItems } from "~/features/account/lib/nav-items";
import { SignOutButton } from "~/features/auth/components/sign-out-button";
import { stickyHeaderTokens } from "~/lib/layout-tokens";

export const Route = createFileRoute("/_authenticated")({
  component: RouteComponent,
  beforeLoad: ({ location, context }) => {
    if (context.auth.isSignedIn) {
      return {
        customer: context.auth.customer,
      };
    }
    throw redirect({
      to: "/",
      search: { showLogin: true, returnTo: location.href },
    });
  },
});

function useAuthenticatedLayout() {
  const pathname = useLocation({ select: (location) => location.pathname });
  const navigate = useNavigate();
  const selectedRoute = getSelectedRoute(pathname);

  const handleRouteChange = (value: string) => {
    void navigate({ to: value });
  };

  const isActiveRoute = (to: string) => pathname.startsWith(to);

  return { pathname, selectedRoute, handleRouteChange, isActiveRoute };
}

function RouteComponent() {
  const { selectedRoute, handleRouteChange, isActiveRoute } =
    useAuthenticatedLayout();

  return (
    <main className="container py-8 sm:py-12">
      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
        <aside
          className={cn(
            "space-y-4 lg:h-fit lg:space-y-6 lg:self-start",
            stickyHeaderTokens.stickyContent,
          )}
        >
          <div className="lg:hidden">
            <NativeSelect
              className="w-full"
              value={selectedRoute}
              onChange={(event) => {
                handleRouteChange(event.target.value);
              }}
              aria-label="Select account page"
            >
              {navItems.map((item) => (
                <NativeSelectOption key={item.to} value={item.to}>
                  {item.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            <SignOutButton className="mt-3 w-full justify-start" />
          </div>

          <nav
            className="hidden space-y-2 lg:block"
            aria-label="Account navigation"
          >
            {navItems.map((item) => {
              const isActive = isActiveRoute(item.to);

              return (
                <QuickLink
                  key={item.to}
                  to={item.to}
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "lg" }),
                    "w-full justify-start rounded-xl",
                    isActive && "bg-muted text-foreground",
                  )}
                  preload="viewport"
                >
                  <item.icon className="size-4" />
                  {item.label}
                </QuickLink>
              );
            })}
          </nav>

          <div className="hidden lg:block">
            <SignOutButton className="w-full justify-start" />
          </div>
        </aside>

        <section className="min-h-[calc(100vh-30rem)]">
          <Outlet />
        </section>
      </div>
    </main>
  );
}
