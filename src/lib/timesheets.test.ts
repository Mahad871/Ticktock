import { describe, expect, it } from "vitest";

import { computeStatus, listTimesheets } from "./timesheets";

describe("computeStatus", () => {
  it("returns COMPLETED for >= 40 hours", () => {
    expect(computeStatus(40)).toBe("COMPLETED");
    expect(computeStatus(45)).toBe("COMPLETED");
  });

  it("returns INCOMPLETE for between 1 and 39 hours", () => {
    expect(computeStatus(1)).toBe("INCOMPLETE");
    expect(computeStatus(20)).toBe("INCOMPLETE");
  });

  it("returns MISSING for 0 hours", () => {
    expect(computeStatus(0)).toBe("MISSING");
  });
});

describe("listTimesheets", () => {
  it("filters by overlapping date ranges", () => {
    const all = listTimesheets();
    expect(all.length).toBeGreaterThan(0);

    const filtered = listTimesheets({
      startDate: "2024-01-10",
      endDate: "2024-01-20",
    });

    // All returned items (if any) should intersect the range
    expect(filtered.length).toBeGreaterThanOrEqual(0);
    filtered.forEach((s) => {
      const entryStart = new Date(s.startDate).getTime();
      const entryEnd = new Date(s.endDate).getTime();
      const filterStart = new Date("2024-01-10").getTime();
      const filterEnd = new Date("2024-01-20").getTime();
      expect(entryEnd).toBeGreaterThanOrEqual(filterStart);
      expect(entryStart).toBeLessThanOrEqual(filterEnd);
    });
    expect(filtered.length).toBeLessThanOrEqual(all.length);
  });
});
