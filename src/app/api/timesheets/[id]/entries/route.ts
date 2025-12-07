import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { EntryPayloadSchema } from "@/lib/schemas";
import {
  addEntry,
  listEntries,
  type TimesheetEntry,
} from "@/lib/timesheet-entries";
import { getTimesheet, updateTimesheet } from "@/lib/timesheets";

type RouteContext = { params: Promise<{ id: string }> };

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

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sheet = getTimesheet(id);
  if (!sheet) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const data = listEntries(id);
  return NextResponse.json({ data });
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sheet = getTimesheet(id);
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

  const entry: TimesheetEntry = addEntry(id, parsed.data);

  recomputeTimesheetHours(id);

  return NextResponse.json({ data: entry }, { status: 201 });
}
