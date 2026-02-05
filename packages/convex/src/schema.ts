import { defineSchema, defineTable } from "convex/server";

import { vFriendship, vProfile } from "./validators";

export default defineSchema(
  {
    profiles: defineTable(vProfile)
      .index("by_userId", ["userId"])
      .index("by_username", ["username"])
      .searchIndex("search_searchTerm", { searchField: "searchTerm" }),
    friends: defineTable(vFriendship)
      .index("by_profileA", ["profileIdA"])
      .index("by_profileB", ["profileIdB"]),
  },
  { schemaValidation: true },
);
