"use client";

import { cn } from "@/lib/utils";
import type { TimesheetStatus } from "@/lib/timesheets";

const statusStyles: Record<
  TimesheetStatus,
  { bg: string; text: string; label: string }
> = {
  COMPLETED: {
    bg: "bg-status-success",
    text: "text-status-success-foreground",
    label: "COMPLETED",
  },
  INCOMPLETE: {
    bg: "bg-status-warn",
    text: "text-status-warn-foreground",
    label: "INCOMPLETE",
  },
  MISSING: {
    bg: "bg-status-danger",
    text: "text-status-danger-foreground",
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
