import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@acme/ui/navigation-menu";

import { navItems } from "~/components/header/nav-data";

function HorizontalMenuItem({
  label,
  description,
}: {
  label: string;
  description: string;
}) {
  return (
    <button
      type="button"
      className="group hover:bg-primary/10 flex h-full w-full flex-col justify-center gap-1 rounded-md p-4 text-left"
    >
      <p className="text-popover-foreground text-lg font-bold">{label}</p>
      <p className="text-md text-muted-foreground font-normal">{description}</p>
    </button>
  );
}

export function HorizontalMenu() {
  return (
    <div className="border-border bg-background hidden border-b min-[1380px]:block">
      <div className="container flex items-center justify-center px-6">
        <NavigationMenu align="center" className="justify-center">
          <NavigationMenuList className="flex w-full justify-between">
            {navItems.map((item) => (
              <NavigationMenuItem key={item.label}>
                <NavigationMenuTrigger
                  className={
                    item.label === "Sale"
                      ? "rounded-none bg-transparent text-red-400 hover:bg-transparent hover:text-red-500 data-open:bg-transparent data-open:text-red-500"
                      : "text-muted-foreground hover:text-primary data-open:text-primary rounded-none bg-transparent hover:bg-transparent data-open:bg-transparent"
                  }
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </NavigationMenuTrigger>
                <NavigationMenuContent className="p-0!">
                  <div className="grid w-[min(90vw,72rem)] grid-cols-[1fr_1.5fr] gap-3 p-6">
                    <div className="flex h-full items-center justify-center">
                      <img
                        src={
                          item.ad?.image ??
                          "https://assets.gardeners.com/m/7ef302a1548259ad/High_Res_JPG-cat_hero_24A19a_BirdiesSale.jpg"
                        }
                        alt={item.ad?.alt ?? `${item.label} promotion`}
                        className="rounded-md"
                      />
                    </div>
                    <div className="grid w-full grid-cols-2 gap-3">
                      {item.items.map((subItem) => (
                        <HorizontalMenuItem
                          key={subItem.label}
                          label={subItem.label}
                          description={subItem.description}
                        />
                      ))}
                      <HorizontalMenuItem
                        label={
                          item.label === "Advice" ? "Learn more" : "View all"
                        }
                        description={
                          item.label === "Advice"
                            ? "Explore more expert advice from our team."
                            : `Shop all items from ${item.label}.`
                        }
                      />
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </div>
  );
}
