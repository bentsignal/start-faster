import type { ReactNode } from "react";
import { ArrowDownWideNarrow, ListFilter, Loader } from "lucide-react";

import { Button } from "@acme/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@acme/ui/drawer";

export function ResultsHeader({
  sortOpen,
  setSortOpen,
  filtersOpen,
  setFiltersOpen,
  isFiltering,
  activeFilterCount,
  sortDrawerTitle,
  sortDrawerDescription,
  filterDrawerTitle,
  filterDrawerDescription,
  sortControls,
  filterControls,
  summaryContent,
}: {
  sortOpen: boolean;
  setSortOpen: (open: boolean) => void;
  filtersOpen: boolean;
  setFiltersOpen: (open: boolean) => void;
  isFiltering: boolean;
  activeFilterCount: number;
  sortDrawerTitle: string;
  sortDrawerDescription: string;
  filterDrawerTitle: string;
  filterDrawerDescription: string;
  sortControls: ReactNode;
  filterControls: ReactNode;
  summaryContent?: ReactNode;
}) {
  return (
    <header className="space-y-3 lg:hidden">
      <div className="space-y-3">
        {summaryContent}

        <div className="flex items-center gap-2 lg:hidden">
          <Drawer open={sortOpen} onOpenChange={setSortOpen}>
            <DrawerTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1">
                {isFiltering ? (
                  <Loader className="size-3.5 animate-spin" />
                ) : (
                  <ArrowDownWideNarrow className="size-3.5" />
                )}
                Sort
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader className="text-left">
                <DrawerTitle>{sortDrawerTitle}</DrawerTitle>
                <DrawerDescription>{sortDrawerDescription}</DrawerDescription>
              </DrawerHeader>
              <div className="space-y-4 px-4 pb-6">{sortControls}</div>
            </DrawerContent>
          </Drawer>

          <Drawer open={filtersOpen} onOpenChange={setFiltersOpen}>
            <DrawerTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1 gap-2">
                {isFiltering ? (
                  <Loader className="size-3.5 animate-spin" />
                ) : (
                  <ListFilter className="size-3.5" />
                )}
                Filters
                {activeFilterCount > 0 ? (
                  <span className="bg-primary text-primary-foreground min-w-5 rounded-full px-1.5 text-xs leading-5">
                    {activeFilterCount}
                  </span>
                ) : null}
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader className="text-left">
                <DrawerTitle>{filterDrawerTitle}</DrawerTitle>
                <DrawerDescription>{filterDrawerDescription}</DrawerDescription>
              </DrawerHeader>
              <div className="px-4 pb-6">{filterControls}</div>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    </header>
  );
}
