import { Button } from "@acme/ui/button";
import { Input } from "@acme/ui/input";

export function MailingList() {
  return (
    <section className="border-border border-t py-20">
      <div className="mx-auto max-w-xl px-6 text-center">
        <p className="text-muted-foreground mb-3 font-mono text-[10px] tracking-[0.2em] uppercase">
          Stay in the loop
        </p>
        <h2 className="mb-3 text-2xl font-semibold tracking-tight">
          Join Our Community
        </h2>
        <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
          Get early access to new drops, exclusive offers, and style inspiration
          delivered straight to your inbox.
        </p>
        <form
          className="border-input focus-within:border-ring focus-within:ring-ring/50 mx-auto flex max-w-sm rounded-4xl border transition-colors focus-within:ring-[3px]"
          onSubmit={(e) => e.preventDefault()}
        >
          <Input
            type="email"
            placeholder="Your email address"
            className="rounded-r-none border-0 focus-visible:border-transparent focus-visible:ring-0"
          />
          <Button className="rounded-l-none">Subscribe</Button>
        </form>
        <p className="text-muted-foreground mt-4 text-xs">
          We respect your privacy and will never share your information.
        </p>
      </div>
    </section>
  );
}
