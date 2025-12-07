import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { WeekTimesheet } from "@/components/timesheets/week-timesheet";

type WeekPageSearchParams = {
  week?: string;
  id?: string;
  timesheetId?: string;
};

export default async function WeekPage(props: {
  searchParams?: Promise<WeekPageSearchParams>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/");
  }
  const searchParams = await props.searchParams;
  const timesheetId =
    searchParams?.week ?? searchParams?.id ?? searchParams?.timesheetId;
  return <WeekTimesheet timesheetId={timesheetId} />;
}
