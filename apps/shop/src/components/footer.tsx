const footerLinks = [
  {
    title: "Customer Service",
    links: [
      "Contact Us",
      "FAQs",
      "Shipping Information",
      "Returns & Exchanges",
    ],
  },
  {
    title: "About Us",
    links: ["Our Story", "Sustainability", "Store Locations", "Careers"],
  },
  {
    title: "Resources",
    links: ["Style Blog", "Lookbook", "Size Guide", "Gift Cards"],
  },
] as const;

export function Footer() {
  return (
    <footer className="border-border border-t pt-14 pb-10">
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-4">
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="mb-4 text-sm font-medium">{section.title}</h3>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                    >
                      {link}
                    </a>
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
                  href="#"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  X (Twitter)
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  TikTok
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  Pinterest
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="text-muted-foreground mt-14 text-center text-xs">
          <p>
            &copy; {new Date().getFullYear()} Start Faster. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
