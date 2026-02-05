import type { Infer } from "convex/values";

import type { vFriendshipStatus, vProfile } from "./validators";

type Profile = Infer<typeof vProfile>;
type UIProfile = Omit<Profile, "userId" | "searchTerm">;

type FriendshipStatus = Infer<typeof vFriendshipStatus>;
type Relationship =
  | null
  | "friends"
  | "pending-incoming"
  | "pending-outgoing"
  | "my-profile";

export type { Profile, UIProfile, FriendshipStatus, Relationship };
