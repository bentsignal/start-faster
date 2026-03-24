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
  },
  { schemaValidation: true },
);
