import { cronJobs } from "convex/server";

import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "shopify catalog reconcile",
  { minutes: 10 },
  internal.shopify.reconcile.reconcileCatalog,
  {},
);

export default crons;
