import { QuickLink } from "@acme/features/quick-link";

import { SignOutButton } from "~/components/sign-out-button";

export function FilesHeader() {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-3">
        <QuickLink
          to="/dashboard"
          className="text-muted-foreground hover:text-foreground text-sm transition-colors"
        >
          Back to dashboard
        </QuickLink>
        <div className="space-y-1">
          <p className="text-muted-foreground text-sm">Shared asset library</p>
          <h1 className="text-2xl font-semibold tracking-tight">CMS Files</h1>
        </div>
      </div>
      <SignOutButton />
    </header>
  );
}
