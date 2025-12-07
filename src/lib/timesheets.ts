import { mockTimesheetEntries, mockTimesheets } from "@/lib/mock-data";

export type TimesheetStatus = "COMPLETED" | "INCOMPLETE" | "MISSING";

export type Timesheet = {
  id: string;
  week: number;
  startDate: string; // ISO date
  endDate: string; // ISO date
  hours: number;
  status: TimesheetStatus;
};

type UpsertPayload = {
  week: number;
  startDate: string;
  endDate: string;
  hours: number;
};

const globalTimesheetKey = "__tt_timesheets_store__";
const existingStore = (globalThis as Record<string, unknown>)[
  globalTimesheetKey
] as Timesheet[] | undefined;

const store: Timesheet[] =
  existingStore ?? initializeTimesheetStore(mockTimesheets);

if (!existingStore) {
  (globalThis as Record<string, unknown>)[globalTimesheetKey] = store;
}

function initializeTimesheetStore(seed: typeof mockTimesheets): Timesheet[] {
  return seed.map((t) => {
    const entryHours = mockTimesheetEntries[t.id]?.reduce(
      (sum, entry) => sum + entry.hours,
      0,
    );
    const hours = entryHours ?? t.hours;
    return {
      ...t,
      hours,
      status: computeStatus(hours),
    };
  });
}

export function computeStatus(hours: number): TimesheetStatus {
  if (hours >= 40) return "COMPLETED";
  if (hours > 0) return "INCOMPLETE";
  return "MISSING";
}

export function listTimesheets(params?: {
  startDate?: string;
  endDate?: string;
  status?: TimesheetStatus;
}): Timesheet[] {
  const { startDate, endDate, status } = params ?? {};
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;

  return store
    .filter((entry) => {
      const entryStart = new Date(entry.startDate);
      const entryEnd = new Date(entry.endDate);

      if (start && entryEnd < start) return false;
      if (end && entryStart > end) return false;
      if (status && entry.status !== status) return false;
      return true;
    })
    .sort((a, b) => a.week - b.week);
}

export function createTimesheet(payload: UpsertPayload): Timesheet {
  const status = computeStatus(payload.hours);
  const id = crypto.randomUUID();
  const sheet: Timesheet = { id, status, ...payload };
  store.push(sheet);
  return sheet;
}

export function updateTimesheet(
  id: string,
  payload: UpsertPayload,
): Timesheet | null {
  const existing = store.find((s) => s.id === id);
  if (!existing) return null;
  const status = computeStatus(payload.hours);
  Object.assign(existing, payload, { status });
  return existing;
}

export function getTimesheet(id: string): Timesheet | null {
  return store.find((s) => s.id === id) ?? null;
}
