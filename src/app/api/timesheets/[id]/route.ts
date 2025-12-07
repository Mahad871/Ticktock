import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { TimesheetPayloadSchema } from "@/lib/schemas";
import { getTimesheet, updateTimesheet } from "@/lib/timesheets";

type RouteContext = { params: Promise<{ id: string }> };

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
  return NextResponse.json({ data: sheet });
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = getTimesheet(id);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const json = await request.json();
  const parsed = TimesheetPayloadSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const updated = updateTimesheet(id, parsed.data);
  return NextResponse.json({ data: updated });
}
