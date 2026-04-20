import type { ReactNode } from "react";

export function PageWrapper({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-2 px-6 py-6 sm:px-8 lg:py-14">
      {children}
    </main>
  );
}
