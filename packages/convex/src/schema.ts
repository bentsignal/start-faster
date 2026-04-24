import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

import { blockValidator } from "./pages/validators";
import {
  adminLevelValidator,
  cmsScopesValidator,
  storageProviderValidator,
} from "./validators";

export default defineSchema(
  {
    files: defineTable({
      storageId: v.string(),
      storageProvider: storageProviderValidator,
      fileName: v.string(),
      contentType: v.union(v.string(), v.null()),
      size: v.number(),
      sha256: v.string(),
      uploadedByUserId: v.id("users"),
      downloadToken: v.optional(v.string()),
    })
      .index("by_storageId", ["storageId"])
      .index("by_uploadedByUserId", ["uploadedByUserId"]),
    users: defineTable({
      name: v.string(),
      email: v.string(),
      workosUserId: v.string(),
      adminLevel: adminLevelValidator,
      cmsScopes: cmsScopesValidator,
      searchText: v.string(),
    })
      .index("by_workos_user_id", ["workosUserId"])
      .index("by_email", ["email"])
      .searchIndex("search_text", {
        searchField: "searchText",
      }),
    pages: defineTable({
      title: v.string(),
      path: v.string(),
      isVisible: v.boolean(),
      createdByUserId: v.id("users"),
      searchText: v.string(),
    })
      .index("by_path", ["path"])
      .index("by_createdByUserId", ["createdByUserId"])
      .searchIndex("search_text", {
        searchField: "searchText",
      }),
    pageDrafts: defineTable({
      pageId: v.id("pages"),
      name: v.string(),
      blocks: v.array(blockValidator),
      createdByUserId: v.id("users"),
      updatedAt: v.number(),
      // Set when a scheduled version is reverted back to a draft, so the
      // schedule modal can pre-fill with the previously chosen time.
      lastScheduledAt: v.optional(v.number()),
    }).index("by_pageId", ["pageId"]),
    pageScheduled: defineTable({
      pageId: v.id("pages"),
      name: v.string(),
      blocks: v.array(blockValidator),
      scheduledByUserId: v.id("users"),
      scheduledAt: v.number(),
      // Optional only because we need to insert the row to get its id
      // before we can schedule the publish callback that references it.
      // It is set in the same mutation, so it is effectively always present.
      scheduledFunctionId: v.optional(v.id("_scheduled_functions")),
    })
      .index("by_pageId", ["pageId"])
      .index("by_pageId_and_scheduledAt", ["pageId", "scheduledAt"])
      .index("by_scheduledAt", ["scheduledAt"]),
    pageReleases: defineTable({
      pageId: v.id("pages"),
      name: v.string(),
      blocks: v.array(blockValidator),
      publishedByUserId: v.id("users"),
    }).index("by_pageId", ["pageId"]),
  },
  { schemaValidation: true },
);
