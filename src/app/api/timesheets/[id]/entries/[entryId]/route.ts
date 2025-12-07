import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { EntryPayloadSchema } from "@/lib/schemas";
import {
  deleteEntry,
  listEntries,
  updateEntry,
  type TimesheetEntry,
} from "@/lib/timesheet-entries";
import { getTimesheet, updateTimesheet } from "@/lib/timesheets";

function recomputeTimesheetHours(timesheetId: string) {
  const sheet = getTimesheet(timesheetId);
  if (!sheet) return;
  const totalHours = listEntries(timesheetId).reduce(
    (sum, entry) => sum + entry.hours,
    0,
  );
  updateTimesheet(timesheetId, {
    week: sheet.week,
    startDate: sheet.startDate,
    endDate: sheet.endDate,
    hours: totalHours,
  });
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string; entryId: string } },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sheet = getTimesheet(params.id);
  if (!sheet) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const json = await request.json();
  const parsed = EntryPayloadSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const updated = updateEntry(params.id, params.entryId, parsed.data);

  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  recomputeTimesheetHours(params.id);

  return NextResponse.json({ data: updated });
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string; entryId: string } },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sheet = getTimesheet(params.id);
  if (!sheet) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const removed: TimesheetEntry | null = deleteEntry(params.id, params.entryId);
  if (!removed) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  recomputeTimesheetHours(params.id);

  return NextResponse.json({ data: removed });
}
