import { useState } from "react";
import { Image } from "@unpic/react";
import { Info, Menu, X } from "lucide-react";

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

import { navItems, secondaryNavLinks } from "~/components/header/nav-data";

export function VerticalMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger
        aria-label="Open navigation menu"
        className="mr-0! min-[1380px]:hidden"
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
              src="/public/logo.webp"
              alt="Start Faster"
              width={200}
              height={200}
              className="h-6 xl:h-12"
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
          <Accordion defaultValue={[]} className="mb-20 rounded-none border-0">
            {navItems.map((item) => (
              <AccordionItem key={item.label} value={item.label}>
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <item.icon className="text-primary h-4 w-4" />
                    <span className="text-muted-foreground">{item.label}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="py-1 text-sm font-medium">View all</div>
                  <div className="flex flex-col">
                    {item.items.map((subItem) => (
                      <button
                        key={subItem.label}
                        type="button"
                        className="text-muted-foreground py-1 text-left text-sm"
                        onClick={() => setIsOpen(false)}
                      >
                        {subItem.label}
                      </button>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
            <AccordionItem value="secondary">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <Info className="text-primary h-4 w-4" />
                  <span className="text-muted-foreground">Resources</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col">
                  {secondaryNavLinks.map((link) => (
                    <button
                      key={link}
                      type="button"
                      className="text-muted-foreground py-1 text-left text-sm"
                      onClick={() => setIsOpen(false)}
                    >
                      {link}
                    </button>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
