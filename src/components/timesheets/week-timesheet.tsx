"use client";

import { useMemo, useState } from "react";
import { Plus, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Task = {
  id: string;
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
};

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="relative flex items-center justify-end gap-3">
      <div className="text-xs font-semibold text-[#0f1729]">
        {value}/{max} hrs
      </div>
      <div className="w-36">
        <div className="relative h-1.5 rounded-full bg-[#e7ebf3]">
          <div
            className="absolute left-0 top-0 h-1.5 rounded-full bg-[#f37d32]"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <div className="text-[10px] font-semibold text-[#9aa3b5]">100%</div>
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
  return (
    <div className="flex items-center gap-3 rounded-md border border-dashed border-[#d7dce5] bg-white px-3 py-2">
      <div className="flex-1 text-sm text-[#0f1729]">{task.description}</div>
      <div className="flex items-center gap-2 text-xs text-[#6b7280]">
        <span>{task.hours} hrs</span>
        <span className="rounded-sm border border-[#d7dce5] px-2 py-[2px] text-[#0f1729]">
          {task.project}
        </span>
        <div className="relative">
          <button
            className="rounded px-1 py-1 text-[#6b7280] hover:bg-[#f1f3f7]"
            aria-label="More"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
          <div className="flex gap-3 text-xs font-medium text-[#1f63f0]">
            <button onClick={onEdit} className="hover:underline">
              Edit
            </button>
            <button onClick={onDelete} className="hover:underline">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddTaskRow({ onAdd }: { onAdd: () => void }) {
  return (
    <button
      onClick={onAdd}
      className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-[#d7dce5] bg-[#f9fafb] px-3 py-2 text-sm font-medium text-[#1f63f0] hover:bg-[#f1f3f7]"
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

export function WeekTimesheet() {
  const [days, setDays] = useState<DayEntry[]>([
    {
      id: "jan21",
      dateLabel: "Jan 21",
      tasks: [
        {
          id: "t1",
          description: "Homepage Development",
          project: "Project Name",
          hours: 4,
        },
        {
          id: "t2",
          description: "Homepage Development",
          project: "Project Name",
          hours: 4,
        },
      ],
    },
    {
      id: "jan22",
      dateLabel: "Jan 22",
      tasks: [
        {
          id: "t3",
          description: "Homepage Development",
          project: "Project Name",
          hours: 4,
        },
        {
          id: "t4",
          description: "Homepage Development",
          project: "Project Name",
          hours: 4,
        },
        {
          id: "t5",
          description: "Homepage Development",
          project: "Project Name",
          hours: 4,
        },
      ],
    },
    { id: "jan23", dateLabel: "Jan 23", tasks: [] },
    { id: "jan24", dateLabel: "Jan 24", tasks: [] },
    { id: "jan25", dateLabel: "Jan 25", tasks: [] },
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>({
    description: "",
    project: "Project Name",
    hours: "",
    dayId: "jan21",
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

  const openCreate = (dayId: string) => {
    setError(null);
    setForm({
      description: "",
      project: "Project Name",
      hours: "",
      dayId,
    });
    setModalOpen(true);
  };

  const openEdit = (dayId: string, task: Task) => {
    setError(null);
    setForm({
      id: task.id,
      description: task.description,
      project: task.project,
      hours: task.hours,
      dayId,
    });
    setModalOpen(true);
  };

  const upsertTask = () => {
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

    setDays((prev) =>
      prev.map((day) => {
        if (day.id !== form.dayId) return day;
        if (form.id) {
          return {
            ...day,
            tasks: day.tasks.map((t) =>
              t.id === form.id
                ? {
                    ...t,
                    description: form.description,
                    project: form.project,
                    hours: Number(form.hours),
                  }
                : t,
            ),
          };
        }
        const newTask: Task = {
          id: crypto.randomUUID(),
          description: form.description,
          project: form.project,
          hours: Number(form.hours),
        };
        return { ...day, tasks: [...day.tasks, newTask] };
      }),
    );

    setModalOpen(false);
  };

  const deleteTask = (dayId: string, taskId: string) => {
    setDays((prev) =>
      prev.map((day) =>
        day.id === dayId
          ? { ...day, tasks: day.tasks.filter((t) => t.id !== taskId) }
          : day,
      ),
    );
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

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="rounded-2xl border border-[#1f63f0] bg-[#fdfefe] shadow-sm">
          <div className="flex items-center justify-between border-b border-[#e7ebf3] px-6 py-4">
            <div className="space-y-1">
              <h1 className="text-lg font-semibold text-[#0f1729]">
                This week’s timesheet
              </h1>
              <p className="text-xs text-[#6b7280]">21 - 26 January, 2024</p>
            </div>
            <ProgressBar value={totalHours} max={40} />
          </div>

          <div className="space-y-6 px-6 py-6">
            {days.map((day) => (
              <div key={day.id} className="space-y-3">
                <div className="text-sm font-semibold text-[#0f1729]">
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

        <div className="mt-6 rounded-2xl border border-[#e7ebf3] bg-white px-8 py-6 text-center text-sm text-[#6b7280] shadow-sm">
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
            <Label className="text-sm text-[#0f1729]" htmlFor="description">
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
            <Label className="text-sm text-[#0f1729]" htmlFor="project">
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
            <Label className="text-sm text-[#0f1729]" htmlFor="hours">
              Hours
            </Label>
            <Input
              id="hours"
              type="number"
              min={0}
              max={24}
              value={form.hours}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, hours: Number(e.target.value) }))
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
    </div>
  );
}
