import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@acme/ui/tooltip";

const footerLinks = [
  {
    title: "Customer Service",
    links: [
      { label: "Support", href: "/support" },
      { label: "FAQs", href: "/about-us" },
      { label: "Shipping Information", href: null },
      { label: "Returns & Exchanges", href: null },
    ],
  },
  {
    title: "About Us",
    links: [
      { label: "Our Story", href: null },
      { label: "Sustainability", href: null },
      { label: "Store Locations", href: null },
      { label: "Careers", href: null },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Style Blog", href: null },
      { label: "Lookbook", href: null },
      { label: "Size Guide", href: null },
      { label: "Gift Cards", href: null },
    ],
  },
] as const;

function DisabledFooterLink({ label }: { label: string }) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={<span />}
        className="text-muted-foreground/50 cursor-default text-sm"
      >
        {label}
      </TooltipTrigger>
      <TooltipContent>Placeholder link for demo purposes.</TooltipContent>
    </Tooltip>
  );
}

export function Footer() {
  return (
    <TooltipProvider>
      <footer className="border-border border-t pt-14 pb-10">
        <div className="mx-auto max-w-5xl px-6 md:px-16 lg:px-6">
          <p className="text-muted-foreground/60 mb-4 text-center text-xs italic md:hidden">
            Grayed-out links are placeholders for demo purposes.
          </p>
          <div className="grid grid-cols-1 gap-y-10 text-center md:grid-cols-4 md:gap-x-8 md:text-left">
            {footerLinks.map((section) => (
              <div key={section.title}>
                <h3 className="mb-4 text-sm font-medium">{section.title}</h3>
                <ul className="space-y-2.5">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      {link.href ? (
                        <a
                          href={link.href}
                          className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <DisabledFooterLink label={link.label} />
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div>
              <h3 className="mb-4 text-sm font-medium">Connect With Us</h3>
              <ul className="space-y-2.5">
                <li>
                  <a
                    href="https://www.instagram.com/bentsignal/"
                    className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Instagram
                  </a>
                </li>
                <li>
                  <a
                    href="https://x.com/bentsignal"
                    className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    X (Twitter)
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/bentsignal"
                    className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Github
                  </a>
                </li>
                <li>
                  <a
                    href="https://discord.gg/Ep9YsvhZ"
                    className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Discord
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="text-muted-foreground mt-14 text-center text-xs">
            <p>
              &copy; {new Date().getFullYear()} Start Faster, by{" "}
              <a
                href="https://bentsignal.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                bentsignal
              </a>
              . All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>
    </TooltipProvider>
  );
}
