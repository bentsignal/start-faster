import {
  createFileRoute,
  Outlet,
  redirect,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import { Package, Settings, User } from "lucide-react";

import { buttonVariants } from "@acme/ui/button";
import { NativeSelect, NativeSelectOption } from "@acme/ui/native-select";
import { cn } from "@acme/ui/utils";

import { stickyHeaderTokens } from "~/components/header/header";
import { Link } from "~/components/link";
import { SignOutButton } from "~/features/auth/components/sign-out-button";

const navItems = [
  { icon: User, label: "Account", to: "/account" },
  { icon: Package, label: "Orders", to: "/orders" },
  { icon: Settings, label: "Settings", to: "/settings" },
] as const;

function getSelectedRoute(pathname: string) {
  const matchingItem = navItems.find((item) => pathname.startsWith(item.to));
  if (matchingItem !== undefined) {
    return matchingItem.to;
  }

  return "/orders";
}
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

function RouteComponent() {
  const pathname = useLocation({ select: (location) => location.pathname });
  const navigate = useNavigate();
  const selectedRoute = getSelectedRoute(pathname);

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
                void navigate({ to: event.target.value });
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
              const isActive = pathname.startsWith(item.to);

              return (
                <Link
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
                </Link>
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
