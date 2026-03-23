/// <reference types="vite/client" />
import type { GenericSchema, SchemaDefinition } from "convex/server";
import { convexTest } from "convex-test";
import { componentsGeneric, defineSchema } from "convex/server";
import { test } from "vitest";

import { type ComponentApi } from "../component/_generated/component.js";
import { register } from "../test.js";

export const modules = import.meta.glob("./**/*.*s");

export function initConvexTest<
  Schema extends SchemaDefinition<GenericSchema, boolean>,
>(schema?: Schema) {
  const t = convexTest(schema ?? defineSchema({}), modules);
  register(t);
  return t;
}
export const components = componentsGeneric() as unknown as {
  convexFilesControl: ComponentApi;
};

test("setup", () => {});
