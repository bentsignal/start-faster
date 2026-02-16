import { describe, expect, it } from "vitest";

import { maxIso, mergeCursor } from "../reconcileUtils";

describe("reconcile cursors", () => {
  it("returns latest ISO timestamp", () => {
    expect(
      maxIso([
        "2025-01-01T00:00:00.000Z",
        "2025-01-02T00:00:00.000Z",
        "2024-12-30T00:00:00.000Z",
      ]),
    ).toBe("2025-01-02T00:00:00.000Z");
  });

  it("merges cursors without moving backward", () => {
    expect(
      mergeCursor("2025-01-05T00:00:00.000Z", "2025-01-04T00:00:00.000Z"),
    ).toBe("2025-01-05T00:00:00.000Z");
    expect(
      mergeCursor("2025-01-05T00:00:00.000Z", "2025-01-06T00:00:00.000Z"),
    ).toBe("2025-01-06T00:00:00.000Z");
  });
});
