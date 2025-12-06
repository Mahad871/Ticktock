import { NextResponse } from "next/server";

import {
  addEntry,
  listEntries,
  type TimesheetEntry,
} from "@/lib/timesheet-entries";
import { getTimesheet } from "@/lib/timesheets";

type Payload = {
  date?: unknown;
  description?: unknown;
  project?: unknown;
  hours?: unknown;
};

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

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const sheet = getTimesheet(params.id);
  if (!sheet) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const data = listEntries(params.id);
  return NextResponse.json({ data });
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
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

  const entry: TimesheetEntry = addEntry(params.id, {
    date: body.date as string,
    description: body.description as string,
    project: body.project as string,
    hours: body.hours as number,
  });

  return NextResponse.json({ data: entry }, { status: 201 });
}
