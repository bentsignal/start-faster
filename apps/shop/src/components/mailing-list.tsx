import { Button } from "@acme/ui/button";
import { Input } from "@acme/ui/input";

export function MailingList() {
  return (
    <section className="bg-primary py-16 text-white">
      <div className="mx-auto max-w-5xl px-6 text-center">
        <h2 className="mb-4 text-3xl font-bold">Join Our Community</h2>
        <p className="mx-auto mb-8 max-w-2xl text-white/90">
          Sign up for our newsletter to get early access to new drops, exclusive
          offers, and style inspiration delivered straight to your inbox.
        </p>
        <div className="mx-auto max-w-md">
          <form
            className="flex flex-col gap-2 sm:flex-row"
            onSubmit={(e) => e.preventDefault()}
          >
            <Input
              type="email"
              placeholder="Your email address"
              className="border-white/20 bg-white/10 text-white placeholder:text-white/60 focus-visible:border-white focus-visible:ring-white/30"
            />
            <Button className="text-primary hover:text-primary bg-white hover:bg-white/90">
              Subscribe
            </Button>
          </form>
          <p className="mt-4 text-sm text-white/80">
            We respect your privacy and will never share your information.
          </p>
        </div>
      </div>
    </section>
  );
}
