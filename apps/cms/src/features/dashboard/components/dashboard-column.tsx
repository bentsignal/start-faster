import type { ReactNode } from "react";

import { ScrollArea } from "@acme/ui/scroll-area";

export function DashboardColumn({
  title,
  icon,
  children,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="bg-card flex min-h-0 flex-col rounded-2xl border">
      <div className="flex shrink-0 items-center gap-2 border-b px-4 py-3">
        {icon}
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <div className="p-2">{children}</div>
      </ScrollArea>
    </div>
  );
}
