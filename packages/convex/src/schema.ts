import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

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
      createdByUserId: v.id("users"),
      createdAt: v.number(),
    }),
    pageVersions: defineTable(
      v.union(
        v.object({
          pageId: v.id("pages"),
          state: v.literal("draft"),
          title: v.optional(v.string()),
          path: v.optional(v.string()),
          content: v.optional(v.string()),
          createdByUserId: v.id("users"),
          updatedAt: v.number(),
        }),
        v.object({
          pageId: v.id("pages"),
          state: v.literal("published"),
          title: v.string(),
          path: v.string(),
          content: v.string(),
          createdByUserId: v.id("users"),
          updatedAt: v.number(),
        }),
      ),
    )
      .index("by_pageId", ["pageId"])
      .index("by_createdByUserId", ["createdByUserId"])
      .index("by_path_and_state", ["path", "state", "updatedAt"]),
  },
  { schemaValidation: true },
);
