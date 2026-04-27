import type { ReactNode } from "react";

export function PageWrapper({ children }: { children: ReactNode }) {
  return <main className="mx-auto flex w-full flex-col gap-2">{children}</main>;
}
