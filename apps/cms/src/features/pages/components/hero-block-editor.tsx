import { Check } from "lucide-react";

import type { HeroBlock, HeroId } from "@acme/convex/page-validators";
import { HEROES } from "@acme/convex/page-validators";
import { HERO_REGISTRY } from "@acme/features/heroes";
import { Image } from "@acme/features/image";
import { cn } from "@acme/ui/utils";

export function HeroBlockEditor({
  block,
  onChange,
}: {
  block: HeroBlock;
  onChange: (block: HeroBlock) => void;
}) {
  function handleSelect(heroId: HeroId) {
    onChange({ ...block, data: { heroId } });
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <HeroSelector heroId={block.data.heroId} onSelect={handleSelect} />
    </div>
  );
}

function HeroSelector({
  heroId,
  onSelect,
}: {
  heroId: HeroId;
  onSelect: (id: HeroId) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-muted-foreground text-xs font-medium">Hero</span>
      <div className="flex flex-col gap-2">
        {HEROES.map((id) => {
          const hero = HERO_REGISTRY[id];
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- remove disable comment after more than 1 hero exists
          const isSelected = id === heroId;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelect(id)}
              className={cn(
                "flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors",
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-foreground/40 hover:bg-muted/50",
              )}
            >
              <Image
                src={hero.image}
                width={40}
                height={40}
                alt={hero.description}
              />
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="text-sm font-medium">{hero.label}</span>
                <span className="text-muted-foreground text-xs">
                  {hero.description}
                </span>
              </div>
              {isSelected ? (
                <Check className="text-primary size-4 shrink-0" />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
