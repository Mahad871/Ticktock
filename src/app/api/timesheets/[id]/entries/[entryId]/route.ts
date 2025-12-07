import { NextResponse } from "next/server";

import {
  deleteEntry,
  listEntries,
  updateEntry,
  type TimesheetEntry,
} from "@/lib/timesheet-entries";
import { getTimesheet, updateTimesheet } from "@/lib/timesheets";

type Payload = {
  date?: unknown;
  description?: unknown;
  project?: unknown;
  hours?: unknown;
};

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

function validatePayload(body: Payload) {
  const errors: string[] = [];
  if (typeof body?.date !== "string") errors.push("date is required");
  if (typeof body?.description !== "string")
    errors.push("description is required");
  if (typeof body?.project !== "string") errors.push("project is required");
  if (typeof body?.hours !== "number" || Number.isNaN(body.hours)) {
    errors.push("hours must be a number");
  }
  return errors;
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string; entryId: string } },
) {
  const sheet = getTimesheet(params.id);
  if (!sheet) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const body = (await request.json()) as Payload;
  const errors = validatePayload(body);
  if (errors.length) {
    return NextResponse.json(
      { error: "Invalid payload", details: errors },
      { status: 400 },
    );
  }

  const updated = updateEntry(params.id, params.entryId, {
    date: body.date as string,
    description: body.description as string,
    project: body.project as string,
    hours: body.hours as number,
  });

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
