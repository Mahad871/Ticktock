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

const store: Timesheet[] = [
  {
    id: "1",
    week: 1,
    startDate: "2024-01-01",
    endDate: "2024-01-05",
    hours: 40,
    status: "COMPLETED",
  },
  {
    id: "2",
    week: 2,
    startDate: "2024-01-08",
    endDate: "2024-01-12",
    hours: 40,
    status: "COMPLETED",
  },
  {
    id: "3",
    week: 3,
    startDate: "2024-01-15",
    endDate: "2024-01-19",
    hours: 18,
    status: "INCOMPLETE",
  },
  {
    id: "4",
    week: 4,
    startDate: "2024-01-22",
    endDate: "2024-01-26",
    hours: 40,
    status: "COMPLETED",
  },
  {
    id: "5",
    week: 5,
    startDate: "2024-01-28",
    endDate: "2024-02-01",
    hours: 0,
    status: "MISSING",
  },
];

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
