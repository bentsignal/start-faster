import type { OrderListItem } from "~/features/account/lib/orders-list-data";
import { getTrackingEntries } from "~/features/account/lib/order-list-helpers";

export function TrackingNumbers({ order }: { order: OrderListItem }) {
  const trackingEntries = getTrackingEntries(order);

  if (trackingEntries.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm">
      <span className="text-muted-foreground text-[11px] font-semibold tracking-[0.18em] uppercase">
        Tracking
      </span>
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 font-medium">
        {trackingEntries.map((trackingEntry, index) => (
          <span key={`${trackingEntry.number}-${index}`} className="contents">
            {index > 0 ? (
              <span className="text-muted-foreground" aria-hidden="true">
                •
              </span>
            ) : null}
            {trackingEntry.url ? (
              <a
                href={trackingEntry.url}
                target="_blank"
                rel="noreferrer"
                className="text-foreground underline underline-offset-4"
              >
                {trackingEntry.number}
              </a>
            ) : (
              <span className="text-foreground">{trackingEntry.number}</span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
