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
    })
      .index("by_path", ["path"])
      .index("by_createdByUserId", ["createdByUserId"]),
    pageDrafts: defineTable({
      pageId: v.id("pages"),
      name: v.string(),
      blocks: v.array(blockValidator),
      createdByUserId: v.id("users"),
      updatedAt: v.number(),
    }).index("by_pageId", ["pageId"]),
    pageReleases: defineTable({
      pageId: v.id("pages"),
      name: v.string(),
      blocks: v.array(blockValidator),
      publishedByUserId: v.id("users"),
    }).index("by_pageId", ["pageId"]),
  },
  { schemaValidation: false },
);
