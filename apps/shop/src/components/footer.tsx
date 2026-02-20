import { Button } from "@acme/ui/button";
import { Input } from "@acme/ui/input";
import { Separator } from "@acme/ui/separator";

export function Footer() {
  return (
    <footer className="bg-muted py-12">
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <h3 className="text-muted-foreground mb-4 text-lg font-semibold">
              Customer Service
            </h3>
            <ul className="text-muted-foreground space-y-2">
              <li>
                <a href="#" className="hover:text-primary">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary">
                  FAQs
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary">
                  Shipping Information
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary">
                  Returns &amp; Exchanges
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-muted-foreground mb-4 text-lg font-semibold">
              About Us
            </h3>
            <ul className="text-muted-foreground space-y-2">
              <li>
                <a href="#" className="hover:text-primary">
                  Our Story
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary">
                  Sustainability
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary">
                  Store Locations
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary">
                  Careers
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-muted-foreground mb-4 text-lg font-semibold">
              Resources
            </h3>
            <ul className="text-muted-foreground space-y-2">
              <li>
                <a href="#" className="hover:text-primary">
                  Style Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary">
                  Lookbook
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary">
                  Size Guide
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary">
                  Gift Cards
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-muted-foreground mb-4 text-lg font-semibold">
              Connect With Us
            </h3>
            <p className="text-muted-foreground mb-4">
              Sign up for style tips, exclusive offers, and more.
            </p>
            <form
              className="border-input focus-within:border-ring focus-within:ring-ring/50 flex w-full max-w-72 rounded-4xl border transition-colors focus-within:ring-[3px]"
              onSubmit={(e) => e.preventDefault()}
            >
              <Input
                type="email"
                placeholder="Your email"
                className="rounded-r-none border-0 focus-visible:border-transparent focus-visible:ring-0"
              />
              <Button className="rounded-l-none">Subscribe</Button>
            </form>
          </div>
        </div>
        <Separator className="my-8" />
        <div className="text-muted-foreground text-center">
          <p>
            &copy; {new Date().getFullYear()} Start Faster. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
