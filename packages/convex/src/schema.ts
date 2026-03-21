import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema(
  {
    users: defineTable({
      name: v.string(),
      email: v.string(),
      workosUserId: v.string(),
      accessLevel: v.union(v.literal("unauthorized"), v.literal("authorized")),
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
