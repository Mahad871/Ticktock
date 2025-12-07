"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { type DateRange } from "react-day-picker";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { StatusBadge } from "@/components/timesheets/status-badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import type { TimesheetStatus } from "@/lib/timesheets";
import { cn } from "@/lib/utils";
import {
  useCreateTimesheet,
  useTimesheetsQuery,
  useUpdateTimesheet,
} from "@/hooks/use-timesheets";

type FormState = {
  week: number | "";
  startDate: string;
  endDate: string;
  hours: number | "";
};

type ModalMode = "create" | "update" | "view";

function formatRange(start: string, end: string) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const sameMonth = startDate.getMonth() === endDate.getMonth();
  const month = startDate.toLocaleString("default", { month: "long" });
  const endMonth = endDate.toLocaleString("default", { month: "long" });
  const year = startDate.getFullYear();
  const endYear = endDate.getFullYear();

  if (sameMonth && year === endYear) {
    return `${startDate.getDate()} - ${endDate.getDate()} ${month}, ${year}`;
  }
  return `${startDate.getDate()} ${month}, ${year} - ${endDate.getDate()} ${endMonth}, ${endYear}`;
}

function ActionButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className="text-sm font-medium text-primary hover:underline"
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function Modal({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-surface w-full max-w-lg rounded-xl border border-border shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <button
            aria-label="Close"
            className="text-muted-foreground hover:text-foreground"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function TimesheetDashboard() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState<TimesheetStatus | "ALL">(
    "ALL",
  );
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [showRangePicker, setShowRangePicker] = useState(false);
  const [showRowsMenu, setShowRowsMenu] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("create");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    week: "",
    startDate: "",
    endDate: "",
    hours: "",
  });
  const [formError, setFormError] = useState<string | null>(null);
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    data: timesheets = [],
    isPending,
    isError,
    error,
  } = useTimesheetsQuery({
    startDate,
    endDate,
    status: statusFilter,
  });
  const createMutation = useCreateTimesheet();
  const updateMutation = useUpdateTimesheet();
  const saving = createMutation.isPending || updateMutation.isPending;

  const handleSave = async () => {
    if (modalMode === "view") {
      setModalOpen(false);
      return;
    }
    if (form.week === "" || form.startDate === "" || form.endDate === "") {
      setFormError("All fields are required.");
      return;
    }
    if (form.hours === "" || Number.isNaN(Number(form.hours))) {
      setFormError("Hours must be a number.");
      return;
    }
    if (Number(form.hours) < 0 || Number(form.hours) > 168) {
      setFormError("Hours must be between 0 and 168.");
      return;
    }
    if (new Date(form.startDate) > new Date(form.endDate)) {
      setFormError("Start date must be before end date.");
      return;
    }

    setFormError(null);
    try {
      if (modalMode === "create") {
        await createMutation.mutateAsync({
          week: Number(form.week),
          startDate: form.startDate,
          endDate: form.endDate,
          hours: Number(form.hours),
        });
      } else if (modalMode === "update" && activeId) {
        await updateMutation.mutateAsync({
          id: activeId,
          week: Number(form.week),
          startDate: form.startDate,
          endDate: form.endDate,
          hours: Number(form.hours),
        });
      }
      await queryClient.invalidateQueries({ queryKey: ["timesheets"] });
      setModalOpen(false);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Unable to save timesheet.",
      );
    }
  };

  const actionLabel = (status: TimesheetStatus) => {
    if (status === "MISSING") return "Create";
    if (status === "INCOMPLETE") return "Update";
    return "View";
  };

  const navigateToWeekTimesheet = (timesheetId: string) => {
    router.push(`/dashboard/week?week=${timesheetId}`);
  };

  const totalPages = Math.max(
    1,
    Math.ceil((timesheets.length || 1) / pageSize),
  );
  const paginated = timesheets.slice(
    (page - 1) * pageSize,
    (page - 1) * pageSize + pageSize,
  );

  const goToPage = (p: number) => {
    const target = Math.min(totalPages, Math.max(1, p));
    setPage(target);
  };

  const hasFilters =
    Boolean(startDate) || Boolean(endDate) || statusFilter !== "ALL";

  const visiblePages = useMemo<(number | "ellipsis")[]>(() => {
    const pages: (number | "ellipsis")[] = [];
    const addRange = (start: number, end: number) => {
      for (let i = start; i <= end; i++) pages.push(i);
    };

    if (totalPages <= 10) {
      addRange(1, totalPages);
      return pages;
    }

    const siblings = 1;
    const start = Math.max(2, page - siblings);
    const end = Math.min(totalPages - 1, page + siblings);

    pages.push(1);
    if (start > 2) pages.push("ellipsis");
    addRange(start, end);
    if (end < totalPages - 1) pages.push("ellipsis");
    pages.push(totalPages);

    return pages;
  }, [page, totalPages]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="bg-surface border-b border-border">
        <div className="mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <span className="text-xl font-semibold tracking-tight text-foreground">
              ticktock
            </span>
            <nav className="text-sm font-medium text-foreground">
              Timesheets
            </nav>
          </div>
          <div className="text-sm font-medium text-foreground">John Doe ▾</div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="bg-surface rounded-xl border border-border shadow-sm">
          <div className="flex flex-wrap items-center gap-4 px-8 py-6">
            <h1 className="text-2xl font-semibold text-foreground">
              Your Timesheets
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-4 px-8 pb-5">
            <div className="relative">
              <button
                onClick={() => setShowRangePicker((v) => !v)}
                className="border-border-strong bg-surface flex h-10 items-center gap-2 rounded-md border px-3 text-sm text-foreground shadow-sm"
              >
                {dateRange?.from && dateRange?.to
                  ? `${format(dateRange.from, "d MMM, yyyy")} - ${format(
                      dateRange.to,
                      "d MMM, yyyy",
                    )}`
                  : "Date Range"}
                <span className="text-muted-foreground">▾</span>
              </button>
              {showRangePicker && (
                <div className="bg-surface absolute z-20 mt-2 rounded-lg border border-border p-3 shadow-lg">
                  <Calendar
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={(range) => {
                      setDateRange(range);
                    }}
                    numberOfMonths={2}
                    className="rounded-lg border shadow-sm"
                  />
                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setDateRange(undefined);
                        setStartDate("");
                        setEndDate("");
                        setShowRangePicker(false);
                        setPage(1);
                      }}
                    >
                      Clear
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        if (dateRange?.from)
                          setStartDate(
                            dateRange.from.toISOString().slice(0, 10),
                          );
                        else setStartDate("");
                        if (dateRange?.to)
                          setEndDate(dateRange.to.toISOString().slice(0, 10));
                        else setEndDate("");
                        setShowRangePicker(false);
                        setPage(1);
                      }}
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                title="Status"
                onClick={() => setShowStatusMenu((v) => !v)}
                className="border-border-strong bg-surface flex h-10 items-center gap-2 rounded-md border px-3 text-sm text-foreground shadow-sm"
              >
                {statusFilter === "ALL"
                  ? "Status"
                  : statusFilter === "COMPLETED"
                    ? "Completed"
                    : statusFilter === "INCOMPLETE"
                      ? "Incomplete"
                      : "Missing"}
                <span className="text-muted-foreground">▾</span>
              </button>
              {showStatusMenu && (
                <div className="bg-surface absolute z-20 mt-1 w-40 rounded-md border border-border shadow-lg">
                  {[
                    { label: "Status", value: "ALL" },
                    { label: "Completed", value: "COMPLETED" },
                    { label: "Incomplete", value: "INCOMPLETE" },
                    { label: "Missing", value: "MISSING" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setStatusFilter(opt.value as TimesheetStatus | "ALL");
                        setShowStatusMenu(false);
                        setPage(1);
                      }}
                      className="hover:bg-surface-muted flex w-full items-center justify-between px-3 py-2 text-left text-sm"
                    >
                      {opt.label}
                      {statusFilter === opt.value && (
                        <span className="text-primary">•</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {hasFilters && (
              <Button
                variant="ghost"
                onClick={() => {
                  setDateRange(undefined);
                  setStartDate("");
                  setEndDate("");
                  setStatusFilter("ALL");
                  setShowRangePicker(false);
                  setShowStatusMenu(false);
                }}
                className="h-10"
              >
                Clear filters
              </Button>
            )}
          </div>

          <div className="px-8 pb-6">
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="bg-surface min-w-full divide-y divide-border text-sm">
                <thead className="bg-muted/60 text-xs font-semibold uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <span className="inline-flex items-center gap-1">
                        Week #{" "}
                        <span className="text-muted-foreground/70">↓</span>
                      </span>
                    </th>
                    <th className="px-4 py-3 text-left">
                      <span className="inline-flex items-center gap-1">
                        Date <span className="text-muted-foreground/70">↓</span>
                      </span>
                    </th>
                    <th className="px-4 py-3 text-left">
                      <span className="inline-flex items-center gap-1">
                        Status{" "}
                        <span className="text-muted-foreground/70">↓</span>
                      </span>
                    </th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-surface divide-y divide-border text-sm">
                  {isPending &&
                    [...Array(pageSize)].map((_, idx) => (
                      <tr key={`skeleton-${idx}`}>
                        <td className="bg-muted/60 px-4 py-4">
                          <div className="h-4 w-10 animate-pulse rounded bg-muted" />
                        </td>
                        <td className="px-4 py-4">
                          <div className="h-4 w-40 animate-pulse rounded bg-muted" />
                        </td>
                        <td className="px-4 py-4">
                          <div className="h-5 w-24 animate-pulse rounded bg-muted" />
                        </td>
                        <td className="px-4 py-4">
                          <div className="h-4 w-16 animate-pulse rounded bg-muted" />
                        </td>
                      </tr>
                    ))}
                  {!isPending && isError && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-6 text-center text-destructive"
                      >
                        {error instanceof Error
                          ? error.message
                          : "Unable to load timesheets."}
                      </td>
                    </tr>
                  )}
                  {!isPending && !isError && timesheets.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-6 text-center text-muted-foreground"
                      >
                        No timesheets found.
                      </td>
                    </tr>
                  )}
                  {!isPending &&
                    !isError &&
                    paginated.map((sheet) => (
                      <tr key={sheet.id} className="hover:bg-primary/5">
                        <td className="bg-muted/60 px-4 py-4 text-foreground">
                          {sheet.week}
                        </td>
                        <td className="px-4 py-4 text-foreground">
                          {formatRange(sheet.startDate, sheet.endDate)}
                        </td>
                        <td className="px-4 py-4">
                          <StatusBadge status={sheet.status} />
                        </td>
                        <td className="px-4 py-4 text-primary">
                          <ActionButton
                            label={actionLabel(sheet.status)}
                            onClick={() => navigateToWeekTimesheet(sheet.id)}
                          />
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 text-sm text-foreground">
              <div className="relative">
                <button
                  onClick={() => setShowRowsMenu((v) => !v)}
                  className="border-border-strong flex items-center gap-2 rounded-md border bg-muted/60 px-3 py-2 text-sm text-foreground shadow-sm"
                >
                  {pageSize} per page{" "}
                  <span className="text-muted-foreground">▾</span>
                </button>
                {showRowsMenu && (
                  <div className="bg-surface absolute z-20 mt-1 w-32 rounded-md border border-border shadow-lg">
                    {[5, 10, 20].map((n) => (
                      <button
                        key={n}
                        onClick={() => {
                          setPageSize(n);
                          setPage(1);
                          setShowRowsMenu(false);
                        }}
                        className="hover:bg-surface-muted flex w-full items-center justify-between px-3 py-2 text-left text-sm"
                      >
                        {n} per page
                        {pageSize === n && (
                          <span className="text-primary">•</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-surface flex items-center overflow-hidden rounded-md border border-border text-sm text-muted-foreground shadow-sm">
                <button
                  onClick={() => goToPage(page - 1)}
                  disabled={page === 1}
                  className={cn(
                    "border-r border-border px-3 py-2 text-muted-foreground hover:text-primary",
                    "disabled:cursor-not-allowed disabled:text-muted-foreground/60",
                  )}
                >
                  Previous
                </button>
                {visiblePages.map((p, idx) =>
                  p === "ellipsis" ? (
                    <span
                      key={`ellipsis-${idx}`}
                      className="border-r border-border px-3 py-2 text-muted-foreground/80"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => goToPage(p)}
                      className={cn(
                        "px-3 py-2 text-sm",
                        idx !== visiblePages.length - 1 &&
                          "border-r border-border",
                        p === page
                          ? "font-semibold text-primary"
                          : "text-muted-foreground hover:text-primary",
                      )}
                    >
                      {p}
                    </button>
                  ),
                )}
                <button
                  onClick={() => goToPage(page + 1)}
                  disabled={page === totalPages}
                  className={cn(
                    "border-l border-border px-3 py-2 text-muted-foreground hover:text-primary",
                    "disabled:cursor-not-allowed disabled:text-muted-foreground/60",
                  )}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-surface mt-6 rounded-xl border border-border px-8 py-6 text-center text-sm text-muted-foreground shadow-sm">
          © 2024 tentwenty. All rights reserved.
        </div>
      </main>
      <Modal
        open={modalOpen}
        title={
          modalMode === "view"
            ? "View Timesheet"
            : modalMode === "create"
              ? "Add Timesheet"
              : "Update Timesheet"
        }
        onClose={() => setModalOpen(false)}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Week #
              </label>
              <Input
                type="number"
                min={1}
                value={form.week}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, week: Number(e.target.value) }))
                }
                disabled={modalMode === "view"}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Hours
              </label>
              <Input
                type="number"
                min={0}
                max={168}
                value={form.hours}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    hours: Number(e.target.value),
                  }))
                }
                disabled={modalMode === "view"}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Start date
              </label>
              <Input
                type="date"
                value={form.startDate}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, startDate: e.target.value }))
                }
                disabled={modalMode === "view"}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                End date
              </label>
              <Input
                type="date"
                value={form.endDate}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, endDate: e.target.value }))
                }
                disabled={modalMode === "view"}
              />
            </div>
          </div>

          {formError && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {formError}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Close
            </Button>
            {modalMode !== "view" && (
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
