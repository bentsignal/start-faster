import { Loader } from "lucide-react";

export function Pending() {
  return (
    <div className="animate-in fade-in my-0 flex h-screen flex-col items-center justify-center gap-4 py-0 pb-8 duration-1000">
      <Loader className="size-6 animate-spin" />
    </div>
  );
}
