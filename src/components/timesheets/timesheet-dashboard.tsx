"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { type DateRange } from "react-day-picker";
import { useRouter } from "next/navigation";

import { StatusBadge } from "@/components/timesheets/status-badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api-client";
import type { Timesheet, TimesheetStatus } from "@/lib/timesheets";
import { cn } from "@/lib/utils";

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
      className="text-sm font-medium text-[#1f63f0] hover:underline"
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
      <div className="w-full max-w-lg rounded-xl border border-[#e7ebf3] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#e7ebf3] px-5 py-4">
          <h3 className="text-lg font-semibold text-[#0f1729]">{title}</h3>
          <button
            aria-label="Close"
            className="text-[#6b7280] hover:text-[#0f1729]"
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
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const fetchTimesheets = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      const query = params.toString() ? `?${params.toString()}` : "";
      const res = await apiFetch<{ data: Timesheet[] }>(
        `/api/timesheets${query}`,
      );
      setTimesheets(res.data);
      setPage(1);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load timesheets.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimesheets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

    setSaving(true);
    setFormError(null);
    try {
      if (modalMode === "create") {
        await apiFetch("/api/timesheets", {
          method: "POST",
          body: JSON.stringify({
            week: Number(form.week),
            startDate: form.startDate,
            endDate: form.endDate,
            hours: Number(form.hours),
          }),
        });
      } else if (modalMode === "update" && activeId) {
        await apiFetch(`/api/timesheets/${activeId}`, {
          method: "PUT",
          body: JSON.stringify({
            week: Number(form.week),
            startDate: form.startDate,
            endDate: form.endDate,
            hours: Number(form.hours),
          }),
        });
      }
      await fetchTimesheets();
      setModalOpen(false);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Unable to save timesheet.",
      );
    } finally {
      setSaving(false);
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
          <div className="flex flex-wrap items-center gap-4 px-8 py-6">
            <h1 className="text-2xl font-semibold text-[#0f1729]">
              Your Timesheets
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-4 px-8 pb-5">
            <div className="relative">
              <button
                onClick={() => setShowRangePicker((v) => !v)}
                className="flex h-10 items-center gap-2 rounded-md border border-[#d7dce5] bg-white px-3 text-sm text-[#0f1729] shadow-sm"
              >
                {dateRange?.from && dateRange?.to
                  ? `${format(dateRange.from, "d MMM, yyyy")} - ${format(
                      dateRange.to,
                      "d MMM, yyyy",
                    )}`
                  : "Date Range"}
                <span className="text-[#6b7280]">▾</span>
              </button>
              {showRangePicker && (
                <div className="absolute z-20 mt-2 rounded-lg border border-[#d7dce5] bg-white p-3 shadow-lg">
                  <Calendar
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={(range) => {
                      setDateRange(range);
                      if (range?.from)
                        setStartDate(range.from.toISOString().slice(0, 10));
                      if (range?.to)
                        setEndDate(range.to.toISOString().slice(0, 10));
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
                      }}
                    >
                      Clear
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        setShowRangePicker(false);
                        fetchTimesheets();
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
                className="flex h-10 items-center gap-2 rounded-md border border-[#d7dce5] bg-white px-3 text-sm text-[#0f1729] shadow-sm"
              >
                {statusFilter === "ALL"
                  ? "Status"
                  : statusFilter === "COMPLETED"
                    ? "Completed"
                    : statusFilter === "INCOMPLETE"
                      ? "Incomplete"
                      : "Missing"}
                <span className="text-[#6b7280]">▾</span>
              </button>
              {showStatusMenu && (
                <div className="absolute z-20 mt-1 w-40 rounded-md border border-[#d7dce5] bg-white shadow-lg">
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
                      }}
                      className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-[#f1f3f7]"
                    >
                      {opt.label}
                      {statusFilter === opt.value && (
                        <span className="text-[#1f63f0]">•</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Button
              variant="outline"
              onClick={fetchTimesheets}
              className="h-10"
            >
              Apply filters
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setStartDate("");
                setEndDate("");
                setStatusFilter("ALL");
                fetchTimesheets();
              }}
              className="h-10"
            >
              Reset
            </Button>
          </div>

          <div className="px-8 pb-6">
            <div className="overflow-hidden rounded-lg border border-[#e7ebf3]">
              <table className="min-w-full divide-y divide-[#e7ebf3] bg-white text-sm">
                <thead className="bg-muted/60 text-xs font-semibold uppercase text-[#6b7280]">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <span className="inline-flex items-center gap-1">
                        Week # <span className="text-[#9aa3b5]">↓</span>
                      </span>
                    </th>
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
                  {loading && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-6 text-center text-[#6b7280]"
                      >
                        Loading timesheets...
                      </td>
                    </tr>
                  )}
                  {!loading && error && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-6 text-center text-red-600"
                      >
                        {error}
                      </td>
                    </tr>
                  )}
                  {!loading && !error && timesheets.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-6 text-center text-[#6b7280]"
                      >
                        No timesheets found.
                      </td>
                    </tr>
                  )}
                  {!loading &&
                    !error &&
                    paginated.map((sheet) => (
                      <tr key={sheet.id} className="hover:bg-primary/5">
                        <td className="bg-muted/60 px-4 py-4 text-[#0f1729]">
                          {sheet.week}
                        </td>
                        <td className="px-4 py-4 text-[#0f1729]">
                          {formatRange(sheet.startDate, sheet.endDate)}
                        </td>
                        <td className="px-4 py-4">
                          <StatusBadge status={sheet.status} />
                        </td>
                        <td className="px-4 py-4 text-[#1f63f0]">
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

            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 text-sm text-[#0f1729]">
              <div className="relative">
                <button
                  onClick={() => setShowRowsMenu((v) => !v)}
                  className="flex items-center gap-2 rounded-md border border-[#d7dce5] bg-muted/60 px-3 py-2 text-sm text-[#0f1729] shadow-sm"
                >
                  {pageSize} per page <span className="text-[#6b7280]">▾</span>
                </button>
                {showRowsMenu && (
                  <div className="absolute z-20 mt-1 w-32 rounded-md border border-[#d7dce5] bg-white shadow-lg">
                    {[5, 10, 20].map((n) => (
                      <button
                        key={n}
                        onClick={() => {
                          setPageSize(n);
                          setPage(1);
                          setShowRowsMenu(false);
                        }}
                        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-[#f1f3f7]"
                      >
                        {n} per page
                        {pageSize === n && (
                          <span className="text-[#1f63f0]">•</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => goToPage(page - 1)}
                  disabled={page === 1}
                  className="rounded-md px-3 py-2 text-[#6b7280] hover:bg-[#f1f3f7] disabled:opacity-50"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .slice(0, 7)
                  .map((p) => (
                    <button
                      key={p}
                      onClick={() => goToPage(p)}
                      className={cn(
                        "min-w-[36px] rounded-md px-3 py-2 text-sm",
                        p === page
                          ? "bg-[#e7ebf3] font-semibold text-[#0f1729]"
                          : "text-[#0f1729] hover:bg-[#f1f3f7]",
                      )}
                    >
                      {p}
                    </button>
                  ))}
                {totalPages > 7 && (
                  <>
                    <span className="px-2 text-[#6b7280]">...</span>
                    <button
                      onClick={() => goToPage(totalPages)}
                      className={cn(
                        "min-w-[36px] rounded-md px-3 py-2 text-sm",
                        page === totalPages
                          ? "bg-[#e7ebf3] font-semibold text-[#0f1729]"
                          : "text-[#0f1729] hover:bg-[#f1f3f7]",
                      )}
                    >
                      {totalPages}
                    </button>
                  </>
                )}
                <button
                  onClick={() => goToPage(page + 1)}
                  disabled={page === totalPages}
                  className="rounded-md px-3 py-2 text-[#6b7280] hover:bg-[#f1f3f7] disabled:opacity-50"
                >
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
              <label className="text-sm font-medium text-[#0f1729]">
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
              <label className="text-sm font-medium text-[#0f1729]">
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
              <label className="text-sm font-medium text-[#0f1729]">
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
              <label className="text-sm font-medium text-[#0f1729]">
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
