import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

import { adminLevelValidator, cmsScopesValidator } from "./validators";

export default defineSchema(
  {
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
