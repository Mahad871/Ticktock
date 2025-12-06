import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { WeekTimesheet } from "@/components/timesheets/week-timesheet";

export default async function WeekPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/");
  }
  return <WeekTimesheet />;
}

