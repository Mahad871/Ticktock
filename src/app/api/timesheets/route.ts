import { NextResponse } from "next/server";

import {
  createTimesheet,
  listTimesheets,
  type Timesheet,
} from "@/lib/timesheets";

type Payload = {
  week?: unknown;
  startDate?: unknown;
  endDate?: unknown;
  hours?: unknown;
};

function validatePayload(body: Payload) {
  const errors: string[] = [];
  if (typeof body?.week !== "number") errors.push("week is required");
  if (typeof body?.startDate !== "string") errors.push("startDate is required");
  if (typeof body?.endDate !== "string") errors.push("endDate is required");
  if (typeof body?.hours !== "number" || Number.isNaN(body.hours)) {
    errors.push("hours must be a number");
  }
  return errors;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("startDate") ?? undefined;
  const endDate = searchParams.get("endDate") ?? undefined;
  const status = (searchParams.get("status") ?? undefined) as
    | "COMPLETED"
    | "INCOMPLETE"
    | "MISSING"
    | undefined;

  const data = listTimesheets({ startDate, endDate, status });
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const body = await request.json();
  const errors = validatePayload(body);
  if (errors.length > 0) {
    return NextResponse.json(
      { error: "Invalid payload", details: errors },
      { status: 400 },
    );
  }

  const sheet: Timesheet = createTimesheet({
    week: body.week,
    startDate: body.startDate,
    endDate: body.endDate,
    hours: body.hours,
  });

  return NextResponse.json({ data: sheet }, { status: 201 });
}
