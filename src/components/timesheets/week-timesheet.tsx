"use client";
/* eslint-disable @next/next/no-inline-styles, react-native/no-inline-styles */

import { useEffect, useMemo, useRef, useState } from "react";
import { MoreHorizontal, Plus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AddEntryDialog } from "@/components/timesheets/add-entry-dialog";
import {
  useCreateEntry,
  useDeleteEntry,
  useTimesheetDetail,
  useTimesheetEntries,
  useUpdateEntry,
} from "@/hooks/use-timesheet-entries";

type Task = {
  id: string;
  date: string;
  description: string;
  project: string;
  hours: number;
};

type DayEntry = {
  id: string;
  dateLabel: string;
  tasks: Task[];
};

type FormState = {
  id?: string;
  description: string;
  project: string;
  hours: number | "";
  dayId: string;
  date?: string;
};

type WeekTimesheetProps = {
  timesheetId?: string;
};

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  // Keep the bubble within the bar bounds
  const bubblePct = Math.min(95, Math.max(5, pct));
  return (
    <div className="relative space-y-2">
      <div className="flex items-center gap-3">
        <div className="relative w-full min-w-[200px] overflow-visible">
          <div
            className="absolute -top-10 flex w-full -translate-x-1/2 flex-col items-center sm:-top-10"
            style={{ left: `${bubblePct}%` }}
          >
            <div className="bg-surface rounded-xl px-3 py-2 text-xs font-semibold text-foreground shadow-md">
              {value}/{max} hrs
            </div>
            <div className="bg-surface h-2 w-3 -translate-y-[6px] rotate-45" />
          </div>
          <div className="mx-3 h-2 rounded-full bg-border sm:mx-1 sm:h-2">
            <div
              className="bg-status-warn-foreground h-2 rounded-full transition-all sm:h-2"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        <div className="text-xs font-semibold text-muted-foreground">
          {pct}%
        </div>
      </div>
    </div>
  );
}

function TaskRow({
  task,
  onEdit,
  onDelete,
  disabled,
  deleting,
}: {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  disabled?: boolean;
  deleting?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handler = (evt: MouseEvent) => {
      if (!open) return;
      if (menuRef.current && !menuRef.current.contains(evt.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="border-border-strong bg-surface flex items-center gap-3 rounded-md border border-dashed px-3 py-2">
      <div className="flex-1 text-sm text-foreground">{task.description}</div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>{task.hours} hrs</span>
        <span className="border-border-strong rounded-sm border px-2 py-[2px] text-foreground">
          {task.project}
        </span>
        <div className="relative">
          <button
            className="hover:bg-surface-muted rounded px-1 py-1 text-muted-foreground"
            aria-label="More"
            onClick={() => setOpen((v) => !v)}
            disabled={disabled}
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
          {open && (
            <div
              ref={menuRef}
              className="bg-surface absolute right-0 top-8 z-20 flex flex-col rounded-lg border border-border py-1 pr-6 shadow-lg"
            >
              <button
                className="hover:bg-surface-muted flex w-full items-center px-2 py-2 text-left text-sm text-muted-foreground"
                onClick={() => {
                  setOpen(false);
                  onEdit();
                }}
                disabled={disabled}
              >
                Edit
              </button>
              <button
                className="flex w-full items-center px-2 py-2 text-left text-sm text-destructive hover:bg-destructive/10"
                onClick={() => {
                  setOpen(false);
                  onDelete();
                }}
                disabled={disabled}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AddTaskRow({ onAdd }: { onAdd: () => void }) {
  return (
    <button
      onClick={onAdd}
      className="border-border-strong bg-surface-muted flex w-full items-center justify-center gap-2 rounded-md border border-dashed px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary"
    >
      <Plus className="h-4 w-4" />
      Add new task
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
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const first = dialogRef.current?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    first?.focus();
    const handleKey = (evt: KeyboardEvent) => {
      if (evt.key === "Escape") {
        evt.stopPropagation();
        onClose();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4"
      role="presentation"
      onClick={(evt) => {
        if (evt.target === evt.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="bg-surface w-full max-w-lg rounded-xl border border-border shadow-2xl outline-none"
      >
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

export function WeekTimesheet({ timesheetId = "4" }: WeekTimesheetProps) {
  const [timesheetRange, setTimesheetRange] = useState("21 - 26 January, 2024");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>({
    description: "",
    project: "Project Name",
    hours: "",
    dayId: "",
  });

  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const {
    data: sheet,
    isPending: sheetPending,
    isError: sheetError,
  } = useTimesheetDetail(timesheetId);
  const {
    data: entries = [],
    isPending: entriesPending,
    isError: entriesError,
  } = useTimesheetEntries(timesheetId);
  const createEntry = useCreateEntry(timesheetId);
  const updateEntry = useUpdateEntry(timesheetId);
  const deleteEntryMutation = useDeleteEntry(timesheetId);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const isSavingEntry = createEntry.isPending || updateEntry.isPending;

  const days: DayEntry[] = useMemo(() => {
    if (!sheet) return [];
    const start = new Date(sheet.startDate);
    const end = new Date(sheet.endDate);
    const result: DayEntry[] = [];
    for (
      let dt = new Date(start);
      dt.getTime() <= end.getTime();
      dt.setDate(dt.getDate() + 1)
    ) {
      const iso = dt.toISOString().slice(0, 10);
      const label = dt.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      result.push({
        id: iso,
        dateLabel: label,
        tasks: entries.filter((t) => t.date === iso),
      });
    }
    return result;
  }, [entries, sheet]);

  const totalHours = useMemo(
    () =>
      days.reduce(
        (sum, day) => sum + day.tasks.reduce((s, t) => s + t.hours, 0),
        0,
      ),
    [days],
  );

  useEffect(() => {
    if (!sheet) return;
    const startLabel = new Date(sheet.startDate).toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
    });
    const endLabel = new Date(sheet.endDate).toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    setTimesheetRange(`${startLabel} - ${endLabel}`);
  }, [sheet]);

  const openCreate = (dayId: string) => {
    setSelectedDayId(dayId);
    setShowAddDialog(true);
  };

  const openEdit = (dayId: string, task: Task) => {
    setError(null);
    setForm({
      id: task.id,
      date: task.date,
      description: task.description,
      project: task.project,
      hours: task.hours,
      dayId,
    });
    setModalOpen(true);
  };

  const upsertTask = async () => {
    if (!form.description.trim()) {
      setError("Description is required.");
      return;
    }
    if (form.hours === "" || Number.isNaN(Number(form.hours))) {
      setError("Hours must be a number.");
      return;
    }
    if (Number(form.hours) < 0 || Number(form.hours) > 24) {
      setError("Hours must be between 0 and 24.");
      return;
    }

    try {
      if (form.id) {
        await updateEntry.mutateAsync({
          entryId: form.id,
          date: form.date ?? form.dayId,
          description: form.description,
          project: form.project,
          hours: Number(form.hours),
        });
      } else {
        await createEntry.mutateAsync({
          date: form.dayId,
          description: form.description,
          project: form.project,
          hours: Number(form.hours),
        });
      }
      setModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["timesheet", timesheetId] });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save entry right now.",
      );
    }
  };

  const deleteTask = async (_dayId: string, taskId: string) => {
    if (deleteEntryMutation.isPending) return;
    setDeletingId(taskId);
    try {
      await deleteEntryMutation.mutateAsync(taskId);
      queryClient.invalidateQueries({ queryKey: ["timesheet", timesheetId] });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete entry right now.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AppShell contentClassName="mx-auto overflow-x-hidden py-8 sm:px-0">
      <div className="bg-surface w-full rounded-xl border border-border shadow-sm">
        <div className="flex flex-col gap-3 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="space-y-1">
            <h1 className="text-lg font-semibold text-foreground">
              This week’s timesheet
            </h1>
            <p className="text-xs text-muted-foreground">
              {sheetPending ? "Loading..." : timesheetRange}
            </p>
          </div>
          <div className="mt-7 w-full sm:w-auto">
            <ProgressBar value={totalHours} max={40} />
          </div>
        </div>

        <div className="space-y-6 px-2 py-6 sm:px-6">
          {(sheetPending || entriesPending) && (
            <>
              {[...Array(5)].map((_, idx) => (
                <div key={`skeleton-day-${idx}`} className="space-y-3">
                  <div className="h-4 w-24 animate-pulse rounded bg-muted-foreground/20" />
                  {[...Array(2)].map((__, jdx) => (
                    <div
                      key={`row-${idx}-${jdx}`}
                      className="border-border-strong bg-surface flex items-center gap-3 rounded-md border border-dashed px-3 py-4"
                    >
                      <div className="h-4 w-32 animate-pulse rounded bg-muted-foreground/20" />
                    </div>
                  ))}
                  <div className="border-border-strong h-10 w-full animate-pulse rounded-md border border-dashed bg-muted" />
                </div>
              ))}
            </>
          )}

          {!sheetPending &&
            !entriesPending &&
            days.map((day) => (
              <div key={day.id} className="space-y-3">
                <div className="text-sm font-semibold text-foreground">
                  {day.dateLabel}
                </div>

                {day.tasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    onEdit={() => openEdit(day.id, task)}
                    onDelete={() => deleteTask(day.id, task.id)}
                    disabled={deleteEntryMutation.isPending}
                    deleting={deletingId === task.id}
                  />
                ))}

                <AddTaskRow onAdd={() => openCreate(day.id)} />
              </div>
            ))}

          {!sheetPending &&
            !entriesPending &&
            !sheetError &&
            !entriesError &&
            days.length === 0 && (
              <div className="bg-surface-muted rounded-md border border-border px-4 py-6 text-center text-sm text-muted-foreground">
                No entries yet for this timesheet.
              </div>
            )}

          {(sheetError || entriesError) && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              Unable to load this week’s timesheet.
            </div>
          )}
        </div>
      </div>

      <Modal
        open={modalOpen}
        title={form.id ? "Edit task" : "Add task"}
        onClose={() => setModalOpen(false)}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm text-foreground" htmlFor="description">
              Description
            </Label>
            <Input
              id="description"
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-foreground" htmlFor="project">
              Project
            </Label>
            <Input
              id="project"
              value={form.project}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, project: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-foreground" htmlFor="hours">
              Hours
            </Label>
            <Input
              id="hours"
              type="number"
              min={0}
              max={24}
              value={form.hours}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  hours: Number(e.target.value),
                }))
              }
            />
          </div>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={upsertTask} disabled={isSavingEntry}>
              {isSavingEntry ? "Saving..." : form.id ? "Save" : "Add"}
            </Button>
          </div>
        </div>
      </Modal>
      <AddEntryDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onSaved={() => {
          queryClient.invalidateQueries({
            queryKey: ["timesheet", timesheetId],
          });
          queryClient.invalidateQueries({
            queryKey: ["timesheet", timesheetId, "entries"],
          });
        }}
        timesheetId={timesheetId}
        dayId={selectedDayId ?? ""}
      />
    </AppShell>
  );
}
