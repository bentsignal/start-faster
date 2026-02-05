import { Link } from "@tanstack/react-router";

import * as Auth from "~/features/auth/atom";
import * as Profile from "~/features/profile/atom";

function SmallProfilePreview() {
  const myProfile = Auth.useStore((s) => s.myProfile);
  const imNotSignedIn = Auth.useStore((s) => s.imSignedIn === false);
  if (imNotSignedIn || !myProfile) {
    return <Auth.TakeMeToLoginLink />;
  }
  return (
    <div className="flex flex-col items-start gap-2">
      <Profile.Store profile={myProfile}>
        <Link
          to="/$username"
          params={{ username: myProfile.username }}
          preload="intent"
          className="cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Profile.PFP variant="sm" className="cursor-pointer" />
            <div className="flex flex-col">
              <Profile.Name className="text-sm font-bold" />
              <Profile.Username className="text-muted-foreground text-sm font-semibold" />
            </div>
          </div>
        </Link>
      </Profile.Store>
      <Auth.SignOutLink />
    </div>
  );
}

export { SmallProfilePreview };
