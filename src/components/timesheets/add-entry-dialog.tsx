"use client";

import { useEffect, useRef, useState } from "react";
import { Info } from "lucide-react";

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
  const [hours, setHours] = useState(12);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const descriptionRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!open) {
      setProject("Project Name");
      setTypeOfWork("Bug fixes");
      setDescription("");
      setHours(12);
      setError(null);
    } else {
      descriptionRef.current?.focus();
      const handleKey = (evt: KeyboardEvent) => {
        if (evt.key === "Escape") {
          evt.stopPropagation();
          onClose();
        }
      };
      document.addEventListener("keydown", handleKey);
      return () => document.removeEventListener("keydown", handleKey);
    }
  }, [open, onClose]);

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4"
      role="presentation"
      onClick={(evt) => {
        if (evt.target === evt.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Add entry"
        className="bg-surface w-full max-w-xl rounded-lg border border-border shadow-2xl outline-none"
      >
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
              <span className="inline-flex items-center gap-1">
                Select Project{" "}
                <span className="text-status-danger-foreground">*</span>
              </span>
              <span
                className="inline-flex items-center"
                title="Choose the project this task belongs to."
              >
                <Info
                  className="h-3.5 w-3.5 text-muted-foreground"
                  aria-label="Project info"
                  role="img"
                />
              </span>
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
              <span className="inline-flex items-center gap-1">
                Type of Work{" "}
                <span className="text-status-danger-foreground">*</span>
              </span>
              <span
                className="inline-flex items-center"
                title="Pick the category that best describes this task."
              >
                <Info
                  className="h-3.5 w-3.5 text-muted-foreground"
                  aria-label="Type of work info"
                  role="img"
                />
              </span>
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
              ref={descriptionRef}
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

        <div className="bg-surface-muted border-t border-border px-4 py-4 sm:px-6">
          <div className="grid grid-cols-2 gap-3">
            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? "Saving..." : "Add entry"}
            </Button>
            <Button variant="outline" onClick={onClose} className="w-full">
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
