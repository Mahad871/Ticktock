"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { InputCounter } from "@/components/ui/input-counter";
import { apiFetch } from "@/lib/api-client";

type AddEntryDialogProps = {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  dayId: string;
  timesheetId: string;
};

export function AddEntryDialog({
  open,
  onClose,
  onSaved,
  dayId,
  timesheetId,
}: AddEntryDialogProps) {
  const [project, setProject] = useState("Project Name");
  const [typeOfWork, setTypeOfWork] = useState("Bug fixes");
  const [description, setDescription] = useState("");
  // placeholder for future note support
  const [note, setNote] = useState("");
  const [hours, setHours] = useState(12);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setProject("Project Name");
      setTypeOfWork("Bug fixes");
      setDescription("");
      setNote("");
      setHours(12);
      setError(null);
    }
  }, [open]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await apiFetch(`/api/timesheets/${timesheetId}/entries`, {
        method: "POST",
        body: JSON.stringify({
          date: dayId,
          description: description || typeOfWork,
          project,
          hours,
        }),
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save entry right now.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="bg-surface w-full max-w-3xl rounded-md border border-border shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">
            Add New Entry
          </h2>
          <button
            className="text-muted-foreground hover:text-foreground"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="space-y-6 px-6 py-6">
          <div className="space-y-2">
            <div className="flex items-center gap-1 text-sm font-medium text-foreground">
              Select Project{" "}
              <span className="text-status-danger-foreground">*</span>
            </div>
            <Select value={project} onValueChange={setProject}>
              <SelectTrigger>
                <SelectValue placeholder="Project Name" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Project Name">Project Name</SelectItem>
                <SelectItem value="Website Redesign">
                  Website Redesign
                </SelectItem>
                <SelectItem value="Mobile App">Mobile App</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-1 text-sm font-medium text-foreground">
              Type of Work{" "}
              <span className="text-status-danger-foreground">*</span>
            </div>
            <Select value={typeOfWork} onValueChange={setTypeOfWork}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Bug fixes">Bug fixes</SelectItem>
                <SelectItem value="Feature">Feature</SelectItem>
                <SelectItem value="Refactor">Refactor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-1 text-sm font-medium text-foreground">
              Task description{" "}
              <span className="text-status-danger-foreground">*</span>
            </div>
            <Textarea
              placeholder="Write text here ..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[140px]"
            />
            <div className="text-xs text-muted-foreground">
              A note for extra info
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-1 text-sm font-medium text-foreground">
              Hours <span className="text-status-danger-foreground">*</span>
            </div>
            <InputCounter
              value={hours}
              min={0}
              max={24}
              onChange={setHours}
              className="w-fit"
            />
          </div>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        <div className="bg-surface-muted flex items-center justify-end gap-3 border-t border-border px-6 py-4">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Add entry"}
          </Button>
        </div>
      </div>
    </div>
  );
}
