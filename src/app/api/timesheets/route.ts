import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { TimesheetPayloadSchema } from "@/lib/schemas";
import {
  createTimesheet,
  listTimesheets,
  type Timesheet,
} from "@/lib/timesheets";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json();
  const parsed = TimesheetPayloadSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const sheet: Timesheet = createTimesheet(parsed.data);
  return NextResponse.json({ data: sheet }, { status: 201 });
}
