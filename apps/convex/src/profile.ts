import type { Doc } from "./_generated/dataModel";
import type { UIProfile } from "./types";
import { authedQuery } from "./utils";

export const DeletedProfile = {
  name: "Deleted User",
} satisfies UIProfile;

export const getPublicProfile = (profile: Doc<"profiles">): UIProfile => {
  const { userId: _userId, _creationTime, _id, ...publicProfile } = profile;
  return publicProfile;
};

export const getMine = authedQuery({
  handler: (ctx) => {
    return getPublicProfile(ctx.myProfile);
  },
});
