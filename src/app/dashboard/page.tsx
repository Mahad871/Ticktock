import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { TimesheetDashboard } from "@/components/timesheets/timesheet-dashboard";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  return <TimesheetDashboard />;
}
