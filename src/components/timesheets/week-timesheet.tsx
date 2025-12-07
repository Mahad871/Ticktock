"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MoreHorizontal, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/api-client";
import { AddEntryDialog } from "@/components/timesheets/add-entry-dialog";

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
  return (
    <div className="relative flex items-center justify-end gap-3">
      <div className="text-xs font-semibold text-foreground">
        {value}/{max} hrs
      </div>
      <div className="w-36">
        <div className="relative h-1.5 rounded-full bg-border">
          <div
            className="absolute left-0 top-0 h-1.5 rounded-full bg-primary"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <div className="text-[10px] font-semibold text-muted-foreground/70">
        100%
      </div>
    </div>
  );
}

function TaskRow({
  task,
  onEdit,
  onDelete,
}: {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
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
              >
                Edit
              </button>
              <button
                className="flex w-full items-center px-2 py-2 text-left text-sm text-destructive hover:bg-destructive/10"
                onClick={() => {
                  setOpen(false);
                  onDelete();
                }}
              >
                Delete
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
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
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

export function WeekTimesheet({ timesheetId = "4" }: WeekTimesheetProps) {
  const [days, setDays] = useState<DayEntry[]>([]);
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

  const totalHours = useMemo(
    () =>
      days.reduce(
        (sum, day) => sum + day.tasks.reduce((s, t) => s + t.hours, 0),
        0,
      ),
    [days],
  );

  const buildDays = (startDate: string, endDate: string, tasks: Task[]) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
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
        tasks: tasks.filter((t) => t.date === iso),
      });
    }
    setDays(result);
  };

  const loadData = useCallback(async () => {
    try {
      const sheet = await apiFetch<{
        data: { startDate: string; endDate: string };
      }>(`/api/timesheets/${timesheetId}`);
      const entries = await apiFetch<{ data: Task[] }>(
        `/api/timesheets/${timesheetId}/entries`,
      );
      const startDate = sheet.data.startDate;
      const endDate = sheet.data.endDate;
      buildDays(startDate, endDate, entries.data);
      const startLabel = new Date(startDate).toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
      });
      const endLabel = new Date(endDate).toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      setTimesheetRange(`${startLabel} - ${endLabel}`);
    } catch {
      // ignore errors for mock data
    }
  }, [timesheetId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
        await apiFetch(`/api/timesheets/${timesheetId}/entries/${form.id}`, {
          method: "PUT",
          body: JSON.stringify({
            date: form.date ?? form.dayId,
            description: form.description,
            project: form.project,
            hours: Number(form.hours),
          }),
        });
      } else {
        await apiFetch(`/api/timesheets/${timesheetId}/entries`, {
          method: "POST",
          body: JSON.stringify({
            date: form.dayId,
            description: form.description,
            project: form.project,
            hours: Number(form.hours),
          }),
        });
      }
      await loadData();
      setModalOpen(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save entry right now.",
      );
    }
  };

  const deleteTask = async (_dayId: string, taskId: string) => {
    try {
      await apiFetch(`/api/timesheets/${timesheetId}/entries/${taskId}`, {
        method: "DELETE",
      });
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete entry right now.",
      );
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="bg-surface border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
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

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="bg-surface rounded-xl border border-border shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div className="space-y-1">
              <h1 className="text-lg font-semibold text-foreground">
                This week’s timesheet
              </h1>
              <p className="text-xs text-muted-foreground">{timesheetRange}</p>
            </div>
            <ProgressBar value={totalHours} max={40} />
          </div>

          <div className="space-y-6 px-6 py-6">
            {days.map((day) => (
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
                  />
                ))}

                <AddTaskRow onAdd={() => openCreate(day.id)} />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface mt-6 rounded-xl border border-border px-8 py-6 text-center text-sm text-muted-foreground shadow-sm">
          © 2024 tentwenty. All rights reserved.
        </div>
      </main>

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
            <Button onClick={upsertTask}>{form.id ? "Save" : "Add"}</Button>
          </div>
        </div>
      </Modal>
      <AddEntryDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onSaved={loadData}
        timesheetId={timesheetId}
        dayId={selectedDayId ?? ""}
      />
    </div>
  );
}
