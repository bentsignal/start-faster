import { useMatches } from "@tanstack/react-router";

import { DefaultSidebar } from "./default-sidebar";
import { DraftSidebar } from "./draft-sidebar";
import { PageHubSidebar } from "./page-hub-sidebar";
import { SettingsSidebar } from "./settings-sidebar";

type AppSidebarVariant = "draft" | "pageHub" | "settings" | "default";

const DRAFT_ROUTE_IDS = new Set<string>([
  "/_authenticated/_authorized/pages/$pageId/draft/$draftId",
]);

const SETTINGS_ROUTE_IDS = new Set<string>([
  "/_authenticated/_authorized/pages/$pageId/settings",
]);

const PAGE_HUB_ROUTE_IDS = new Set<string>([
  "/_authenticated/_authorized/pages/$pageId/",
  "/_authenticated/_authorized/pages/$pageId/scheduled/$scheduledId",
  "/_authenticated/_authorized/pages/$pageId/release/$releaseId",
  "/_authenticated/_authorized/pages/$pageId/draftPreview/$draftId",
]);

function useAppSidebarVariant() {
  const matches = useMatches();
  const routeIds = matches.map((m) => m.routeId);

  if (routeIds.some((id) => DRAFT_ROUTE_IDS.has(id))) {
    return "draft" satisfies AppSidebarVariant;
  }
  if (routeIds.some((id) => SETTINGS_ROUTE_IDS.has(id))) {
    return "settings" satisfies AppSidebarVariant;
  }
  if (routeIds.some((id) => PAGE_HUB_ROUTE_IDS.has(id))) {
    return "pageHub" satisfies AppSidebarVariant;
  }
  return "default" satisfies AppSidebarVariant;
}

export function AppSidebar() {
  const variant = useAppSidebarVariant();

  switch (variant) {
    case "draft":
      return <DraftSidebar />;
    case "pageHub":
      return <PageHubSidebar />;
    case "settings":
      return <SettingsSidebar />;
    case "default":
      return <DefaultSidebar />;
  }
}
