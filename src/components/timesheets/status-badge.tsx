"use client";

import { cn } from "@/lib/utils";
import type { TimesheetStatus } from "@/lib/timesheets";

const statusStyles: Record<
  TimesheetStatus,
  { bg: string; text: string; label: string }
> = {
  COMPLETED: {
    bg: "bg-[#e4f6ed]",
    text: "text-[#2f9b76]",
    label: "COMPLETED",
  },
  INCOMPLETE: {
    bg: "bg-[#fff7d8]",
    text: "text-[#c6a300]",
    label: "INCOMPLETE",
  },
  MISSING: {
    bg: "bg-[#ffe5f1]",
    text: "text-[#c3407b]",
    label: "MISSING",
  },
};

export function StatusBadge({ status }: { status: TimesheetStatus }) {
  const style = statusStyles[status];
  return (
    <span
      className={cn(
        "inline-flex rounded-sm px-3 py-1 text-xs font-semibold uppercase",
        style.bg,
        style.text,
      )}
    >
      {style.label}
    </span>
  );
}
