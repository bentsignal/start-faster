import { cn } from "@acme/ui";

export function MainLayout({
  className,
  children,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-auto mx-auto px-4 pt-8 sm:max-w-md sm:pt-12 lg:max-w-xl",
        className,
      )}
    >
      {children}
    </div>
  );
}
