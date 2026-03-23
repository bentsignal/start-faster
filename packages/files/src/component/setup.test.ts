/// <reference types="vite/client" />
import actionRetrier from "@convex-dev/action-retrier/test";
import { convexTest } from "convex-test";
import { test } from "vitest";

import schema from "./schema.js";

export const modules = import.meta.glob("./**/*.*s");

export function initConvexTest() {
  const t = convexTest(schema, modules);
  actionRetrier.register(t);
  return t;
}

test("setup", () => {});
