import { redirect } from "next/navigation";

import { auth } from "@/auth";

type Timesheet = {
  week: number;
  range: string;
  status: "COMPLETED" | "INCOMPLETE" | "MISSING";
  action: "View" | "Update" | "Create";
  statusColor: string;
  statusBg: string;
  statusText: string;
};

const timesheets: Timesheet[] = [
  {
    week: 1,
    range: "1 - 5 January, 2024",
    status: "COMPLETED",
    action: "View",
    statusColor: "text-[#2f9b76]",
    statusBg: "bg-[#e4f6ed]",
    statusText: "COMPLETED",
  },
  {
    week: 2,
    range: "8 - 12 January, 2024",
    status: "COMPLETED",
    action: "View",
    statusColor: "text-[#2f9b76]",
    statusBg: "bg-[#e4f6ed]",
    statusText: "COMPLETED",
  },
  {
    week: 3,
    range: "15 - 19 January, 2024",
    status: "INCOMPLETE",
    action: "Update",
    statusColor: "text-[#c6a300]",
    statusBg: "bg-[#fff7d8]",
    statusText: "INCOMPLETE",
  },
  {
    week: 4,
    range: "22 - 26 January, 2024",
    status: "COMPLETED",
    action: "View",
    statusColor: "text-[#2f9b76]",
    statusBg: "bg-[#e4f6ed]",
    statusText: "COMPLETED",
  },
  {
    week: 5,
    range: "28 January - 1 February, 2024",
    status: "MISSING",
    action: "Create",
    statusColor: "text-[#c3407b]",
    statusBg: "bg-[#ffe5f1]",
    statusText: "MISSING",
  },
];

function StatusBadge({ sheet }: { sheet: Timesheet }) {
  return (
    <span
      className={`inline-flex rounded-sm px-3 py-1 text-xs font-semibold uppercase ${sheet.statusBg} ${sheet.statusColor}`}
    >
      {sheet.statusText}
    </span>
  );
}

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-[#f7f8fb] text-[#0f1729]">
      <header className="border-b border-[#e7ebf3] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <span className="text-xl font-semibold tracking-tight text-[#0f1729]">
              ticktock
            </span>
            <nav className="text-sm font-medium text-[#0f1729]">Timesheets</nav>
          </div>
          <div className="text-sm font-medium text-[#0f1729]">John Doe ▾</div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="rounded-2xl border border-[#e7ebf3] bg-white shadow-sm">
          <div className="border-b border-[#e7ebf3] px-8 py-6">
            <h1 className="text-2xl font-semibold text-[#0f1729]">
              Your Timesheets
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-4 px-8 py-5">
            <div className="flex items-center gap-2">
              <label className="text-sm text-[#6b7280]">Date Range</label>
              <button className="flex items-center gap-2 rounded-md border border-[#d7dce5] bg-white px-3 py-[9px] text-sm text-[#0f1729] shadow-sm">
                Date Range
                <span className="text-[#6b7280]">↓</span>
              </button>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-[#6b7280]">Status</label>
              <button className="flex items-center gap-2 rounded-md border border-[#d7dce5] bg-white px-3 py-[9px] text-sm text-[#0f1729] shadow-sm">
                Status
                <span className="text-[#6b7280]">↓</span>
              </button>
            </div>
          </div>

          <div className="px-8 pb-6">
            <div className="overflow-hidden rounded-lg border border-[#e7ebf3]">
              <table className="min-w-full divide-y divide-[#e7ebf3] text-sm">
                <thead className="bg-white text-xs font-semibold uppercase text-[#6b7280]">
                  <tr>
                    <th className="px-4 py-3 text-left">Week #</th>
                    <th className="px-4 py-3 text-left">
                      <span className="inline-flex items-center gap-1">
                        Date <span className="text-[#9aa3b5]">↓</span>
                      </span>
                    </th>
                    <th className="px-4 py-3 text-left">
                      <span className="inline-flex items-center gap-1">
                        Status <span className="text-[#9aa3b5]">↓</span>
                      </span>
                    </th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e7ebf3] bg-white text-sm">
                  {timesheets.map((sheet) => (
                    <tr key={sheet.week} className="hover:bg-[#f9fafb]">
                      <td className="px-4 py-4 text-[#0f1729]">{sheet.week}</td>
                      <td className="px-4 py-4 text-[#0f1729]">
                        {sheet.range}
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge sheet={sheet} />
                      </td>
                      <td className="px-4 py-4 text-[#1f63f0]">
                        {sheet.action}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 text-sm text-[#0f1729]">
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 rounded-md border border-[#d7dce5] bg-white px-3 py-2 text-sm text-[#0f1729] shadow-sm">
                  5 per page <span className="text-[#6b7280]">↓</span>
                </button>
              </div>

              <div className="flex items-center gap-1">
                <button className="rounded-md px-3 py-2 text-[#6b7280] hover:bg-[#f1f3f7]">
                  Previous
                </button>
                {["1", "2", "3", "4", "5", "6", "7", "8", "...", "99"].map(
                  (p) => (
                    <button
                      key={p}
                      className={`min-w-[36px] rounded-md px-3 py-2 text-sm ${
                        p === "3"
                          ? "bg-[#e7ebf3] font-semibold text-[#0f1729]"
                          : "text-[#0f1729] hover:bg-[#f1f3f7]"
                      }`}
                    >
                      {p}
                    </button>
                  ),
                )}
                <button className="rounded-md px-3 py-2 text-[#6b7280] hover:bg-[#f1f3f7]">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-[#e7ebf3] bg-white px-8 py-6 text-center text-sm text-[#6b7280] shadow-sm">
          © 2024 tentwenty. All rights reserved.
        </div>
      </main>
    </div>
  );
}
