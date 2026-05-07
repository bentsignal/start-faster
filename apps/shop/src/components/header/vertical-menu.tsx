import { useState } from "react";
import { Menu, X } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@acme/ui/accordion";
import { ScrollArea } from "@acme/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@acme/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@acme/ui/tooltip";

import { navItems, secondaryNavLinks } from "~/components/header/nav-data";
import { Image } from "~/components/image";

function DisabledNavItem({ label }: { label: string }) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={<span />}
        className="text-muted-foreground/50 cursor-default py-1 text-left text-sm"
      >
        {label}
      </TooltipTrigger>
      <TooltipContent side="right">
        Placeholder link for demo purposes.
      </TooltipContent>
    </Tooltip>
  );
}

export function VerticalMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger
        aria-label="Open navigation menu"
        className="mr-0! xl:hidden"
      >
        <Menu className="text-muted-foreground h-6 w-6" strokeWidth={1.5} />
      </SheetTrigger>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="max-h-screen p-0 sm:max-w-md"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Mobile pop-up navigation menu</SheetTitle>
          <SheetDescription>
            Browse categories and support resources.
          </SheetDescription>
        </SheetHeader>
        <div className="flex items-center justify-between p-4">
          <div>
            <Image
              src="/logo.webp"
              alt="Start Faster Logo"
              width={32}
              height={32}
            />
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
          >
            <X className="text-muted-foreground h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>
        <ScrollArea className="h-full px-4">
          <p className="text-muted-foreground/60 mt-1 mb-2 text-xs italic">
            Grayed-out links are placeholders for demo purposes.
          </p>
          <TooltipProvider>
            <Accordion
              defaultValue={[]}
              className="mb-20 rounded-none border-0"
            >
              {navItems.map((item) => (
                <AccordionItem key={item.label} value={item.label}>
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">
                        {item.label}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-col">
                      <DisabledNavItem label="View all" />
                      {item.items.map((subItem) => (
                        <DisabledNavItem
                          key={subItem.label}
                          label={subItem.label}
                        />
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
              <AccordionItem value="secondary">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Resources</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col">
                    {secondaryNavLinks.map((link) => (
                      <a
                        key={link.label}
                        href={link.href}
                        className="text-muted-foreground py-1 text-left text-sm"
                        onClick={() => setIsOpen(false)}
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TooltipProvider>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
