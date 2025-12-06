import { NextResponse } from "next/server";

import { getTimesheet, updateTimesheet } from "@/lib/timesheets";

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

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const sheet = getTimesheet(params.id);
  if (!sheet) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ data: sheet });
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  const existing = getTimesheet(params.id);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const errors = validatePayload(body);
  if (errors.length > 0) {
    return NextResponse.json(
      { error: "Invalid payload", details: errors },
      { status: 400 },
    );
  }

  const updated = updateTimesheet(params.id, {
    week: body.week,
    startDate: body.startDate,
    endDate: body.endDate,
    hours: body.hours,
  });

  return NextResponse.json({ data: updated });
}
