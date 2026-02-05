import {
  createFileRoute,
  Link,
  Outlet,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import { Bell, Home, PlusIcon, Search, UserRound } from "lucide-react";

import { cn } from "@acme/ui";
import { buttonVariants } from "@acme/ui/button";
import * as HoverCard from "@acme/ui/hover-card";

import * as Auth from "~/features/auth/atom";
import { SmallProfilePreview } from "~/features/profile/molecules/small-profile-preview";
import * as Theme from "~/features/theme/atom";

export const Route = createFileRoute("/_tabs")({
  component: TabsLayout,
});

function TabsLayout() {
  return (
    <>
      <Outlet />
      <TabBar />
    </>
  );
}

function TabBar() {
  const location = useLocation();
  const pathname = location.pathname;
  const myUsername = Auth.useStore((s) => s.myProfile?.username ?? "");
  return (
    <div
      className={cn(
        "flex items-center gap-1",
        "fixed bottom-6 left-1/2 z-50 -translate-x-1/2",
        "bg-sidebar/80 border-sidebar-border border",
        "rounded-full px-3 py-2",
        "shadow-lg backdrop-blur-sm",
      )}
    >
      <TabBarLink href="/" label="Home">
        <TabBarSlot>
          <Home
            size={24}
            strokeWidth={pathname === "/" ? 2.5 : 1.75}
            className={cn(
              "transition-all",
              pathname === "/" && "text-sidebar-accent-foreground",
            )}
          />
        </TabBarSlot>
      </TabBarLink>
      <TabBarLink href="/search" label="Search">
        <TabBarSlot>
          <Search
            size={24}
            strokeWidth={pathname === "/search" ? 2.5 : 1.75}
            className={cn(
              "transition-all",
              pathname === "/search" && "text-sidebar-accent-foreground",
            )}
          />
        </TabBarSlot>
      </TabBarLink>
      <TabBarLink href="/notifications" label="Notifications">
        <TabBarSlot>
          <Bell
            size={24}
            strokeWidth={pathname === "/notifications" ? 2.5 : 1.75}
            className={cn(
              "transition-all",
              pathname === "/notifications" && "text-sidebar-accent-foreground",
            )}
          />
        </TabBarSlot>
      </TabBarLink>
      <HoverCard.Container openDelay={1250}>
        <HoverCard.Trigger asChild>
          <TabBarLink href={`/${myUsername}`} label="Profile">
            <TabBarSlot>
              <UserRound
                size={24}
                strokeWidth={pathname === `/${myUsername}` ? 2.5 : 1.75}
                className={cn(
                  "transition-all",
                  pathname === `/${myUsername}` &&
                    "text-sidebar-accent-foreground",
                )}
              />
            </TabBarSlot>
          </TabBarLink>
        </HoverCard.Trigger>
        <HoverCard.Content className="flex flex-col items-start px-6! pt-5 pb-3!">
          <SmallProfilePreview />
          <Theme.Toggle />
        </HoverCard.Content>
      </HoverCard.Container>
      <TabBarLink href="/create" label="Create">
        <div className={cn("rounded-full!", buttonVariants({ size: "icon" }))}>
          <PlusIcon size={16} />
        </div>
      </TabBarLink>
    </div>
  );
}

function TabBarSlot({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-sidebar-foreground hover:bg-sidebar-accent flex size-10 cursor-pointer items-center justify-center rounded-full transition-colors">
      {children}
    </div>
  );
}

function TabBarLink({
  href,
  label,
  children,
  ref,
  ...props
}: {
  href: string;
  label: string;
  children: React.ReactNode;
  ref?: React.Ref<HTMLAnchorElement>;
}) {
  const imNotSignedIn = Auth.useStore((s) => s.imSignedOut);
  const navigate = useNavigate();

  if (imNotSignedIn) {
    return (
      <button
        aria-label={label}
        onClick={() => {
          void navigate({
            to: "/",
            search: (prev) => ({ ...prev, showLogin: true, redirectTo: href }),
          });
        }}
      >
        {children}
      </button>
    );
  }

  return (
    <Link ref={ref} to={href} aria-label={label} preload="intent" {...props}>
      {children}
    </Link>
  );
}
