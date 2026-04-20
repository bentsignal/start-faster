import { getRouteApi } from "@tanstack/react-router";

import { SidebarGroup, SidebarGroupContent } from "@acme/ui/sidebar";
import { cn } from "@acme/ui/utils";

import type { PageHubTab } from "~/features/pages/lib/page-version-kind";
import { DraftsList } from "~/features/pages/components/page-hub/drafts-list";
import { PublishedList } from "~/features/pages/components/page-hub/published-list";
import { ScheduledList } from "~/features/pages/components/page-hub/scheduled-list";

const pageHubRoute = getRouteApi("/_authenticated/_authorized/pages/$pageId");

const TABS = [
  { value: "drafts", label: "Drafts" },
  { value: "scheduled", label: "Scheduled" },
  { value: "published", label: "Published" },
] as const satisfies readonly { value: PageHubTab; label: string }[];

export function PageHubTabs() {
  const tab = pageHubRoute.useSearch({ select: (s) => s.tab });
  const navigate = pageHubRoute.useNavigate();

  function selectTab(next: PageHubTab) {
    void navigate({ search: { tab: next }, replace: true });
  }

  return (
    <SidebarGroup className="pb-0">
      <SidebarGroupContent>
        <div className="bg-sidebar-accent/40 flex items-center gap-1 rounded-full p-1">
          {TABS.map((t) => (
            <PageHubTabButton
              key={t.value}
              label={t.label}
              isActive={tab === t.value}
              onClick={() => selectTab(t.value)}
            />
          ))}
        </div>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

function PageHubTabButton({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex-1 rounded-full px-2 py-1 text-xs font-medium transition-colors",
        isActive
          ? "bg-sidebar text-sidebar-foreground shadow-sm"
          : "text-sidebar-foreground/60 hover:text-sidebar-foreground",
      )}
    >
      {label}
    </button>
  );
}

export function ActiveTabList() {
  const tab = pageHubRoute.useSearch({ select: (s) => s.tab });
  switch (tab) {
    case "drafts":
      return <DraftsList />;
    case "scheduled":
      return <ScheduledList />;
    case "published":
      return <PublishedList />;
  }
}
