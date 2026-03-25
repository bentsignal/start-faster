interface AccountDetailsProps {
  user: {
    name: string;
    email: string;
    adminLevel: number;
    cmsScopes: string[];
  };
  minAdminLevel: number;
}

export function AccountDetails({ user, minAdminLevel }: AccountDetailsProps) {
  const isAdmin = user.adminLevel >= minAdminLevel;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Account</h1>

      <dl className="grid gap-5 sm:grid-cols-[140px_minmax(0,1fr)] sm:gap-x-6">
        <dt className="text-muted-foreground text-sm">Name</dt>
        <dd className="text-sm font-medium break-words">
          {user.name || "\u2014"}
        </dd>

        <dt className="text-muted-foreground text-sm">Email</dt>
        <dd className="text-sm font-medium break-words">
          {user.email || "\u2014"}
        </dd>

        <dt className="text-muted-foreground text-sm">Admin</dt>
        <dd className="text-sm font-medium">{isAdmin ? "Yes" : "No"}</dd>

        <dt className="text-muted-foreground text-sm">Scopes</dt>
        <dd className="text-sm font-medium break-words">
          {user.cmsScopes.length > 0 ? user.cmsScopes.join(", ") : "\u2014"}
        </dd>
      </dl>
    </div>
  );
}
