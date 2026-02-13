import type { Infer } from "convex/values";

import type { vProfile } from "./validators";

type Profile = Infer<typeof vProfile>;
type UIProfile = Omit<Profile, "userId">;

export type { Profile, UIProfile };
