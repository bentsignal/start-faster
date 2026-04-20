import { z } from "zod";

export type PageVersionKind = "draft" | "release" | "scheduled";

export const PAGE_HUB_TABS = ["drafts", "scheduled", "published"] as const;
export type PageHubTab = (typeof PAGE_HUB_TABS)[number];
export const pageHubTabValidator = z.enum(PAGE_HUB_TABS).default("drafts");
