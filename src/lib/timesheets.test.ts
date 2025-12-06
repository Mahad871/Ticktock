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
  it("filters by start and end date overlapping weeks", () => {
    const all = listTimesheets();
    expect(all.length).toBeGreaterThan(0);

    const filtered = listTimesheets({
      startDate: "2024-01-10",
      endDate: "2024-01-20",
    });

    // Should include weeks that overlap the selected range (weeks 2 and 3)
    const weeks = filtered.map((s) => s.week);
    expect(weeks).toContain(2);
    expect(weeks).toContain(3);
  });
});

