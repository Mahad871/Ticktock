import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { WeekTimesheet } from "@/components/timesheets/week-timesheet";

type WeekPageSearchParams = {
  week?: string;
  id?: string;
  timesheetId?: string;
};

export default async function WeekPage({
  searchParams,
}: {
  searchParams?: WeekPageSearchParams;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/");
  }
  const timesheetId =
    searchParams?.week ?? searchParams?.id ?? searchParams?.timesheetId;
  return <WeekTimesheet timesheetId={timesheetId} />;
}
