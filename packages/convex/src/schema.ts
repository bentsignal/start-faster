import { defineSchema, defineTable } from "convex/server";

import { vFriendship, vImage, vPost, vProfile, vTrip } from "./validators";

export default defineSchema(
  {
    trips: defineTable(vTrip),
    posts: defineTable(vPost),
    images: defineTable(vImage),
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
