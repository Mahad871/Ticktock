import { mockTimesheetEntries } from "@/lib/mock-data";

export type TimesheetEntry = {
  id: string;
  timesheetId: string;
  date: string; // ISO date
  description: string;
  project: string;
  hours: number;
};

type UpsertEntryPayload = {
  date: string;
  description: string;
  project: string;
  hours: number;
};

const entriesStore: Record<string, TimesheetEntry[]> = {};

Object.entries(mockTimesheetEntries).forEach(([timesheetId, entries]) => {
  entriesStore[timesheetId] = entries.map((e) => ({
    ...e,
    timesheetId,
  }));
});

export function listEntries(timesheetId: string): TimesheetEntry[] {
  return entriesStore[timesheetId] ? [...entriesStore[timesheetId]] : [];
}

export function addEntry(
  timesheetId: string,
  payload: UpsertEntryPayload,
): TimesheetEntry {
  const entry: TimesheetEntry = {
    id: crypto.randomUUID(),
    timesheetId,
    ...payload,
  };
  if (!entriesStore[timesheetId]) {
    entriesStore[timesheetId] = [];
  }
  entriesStore[timesheetId].push(entry);
  return entry;
}

export function updateEntry(
  timesheetId: string,
  entryId: string,
  payload: UpsertEntryPayload,
): TimesheetEntry | null {
  const list = entriesStore[timesheetId];
  if (!list) return null;
  const idx = list.findIndex((e) => e.id === entryId);
  if (idx === -1) return null;
  const updated = { ...list[idx], ...payload };
  list[idx] = updated;
  return updated;
}

export function deleteEntry(
  timesheetId: string,
  entryId: string,
): TimesheetEntry | null {
  const list = entriesStore[timesheetId];
  if (!list) return null;
  const idx = list.findIndex((e) => e.id === entryId);
  if (idx === -1) return null;
  const [removed] = list.splice(idx, 1);
  return removed;
}
