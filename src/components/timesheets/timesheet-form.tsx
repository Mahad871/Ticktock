import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z
  .object({
    week: z.coerce.number().int().positive(),
    hours: z.coerce.number().min(0).max(168),
    startDate: z.string(),
    endDate: z.string(),
  })
  .refine(
    (val) => new Date(val.startDate) <= new Date(val.endDate),
    "Start date must be before end date.",
  );

export type TimesheetFormValues = z.infer<typeof schema>;

type TimesheetFormProps = {
  initialValues?: Partial<TimesheetFormValues>;
  mode: "create" | "update" | "view";
  onSubmit: (values: TimesheetFormValues) => Promise<void> | void;
  onClose: () => void;
  submitting: boolean;
  error?: string | null;
};

export function TimesheetForm({
  initialValues,
  mode,
  onSubmit,
  onClose,
  submitting,
  error,
}: TimesheetFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TimesheetFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      week: initialValues?.week ?? undefined,
      hours: initialValues?.hours ?? undefined,
      startDate: initialValues?.startDate ?? "",
      endDate: initialValues?.endDate ?? "",
    },
  });

  return (
    <form
      className="space-y-4"
      onSubmit={handleSubmit(async (vals: TimesheetFormValues) => {
        await onSubmit(vals);
        reset(vals);
      })}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Week #</Label>
          <Input
            type="number"
            min={1}
            disabled={mode === "view"}
            {...register("week")}
          />
          {errors.week && (
            <p className="text-xs text-destructive">{errors.week.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Hours</Label>
          <Input
            type="number"
            min={0}
            max={168}
            disabled={mode === "view"}
            {...register("hours")}
          />
          {errors.hours && (
            <p className="text-xs text-destructive">{errors.hours.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">
            Start date
          </Label>
          <Input
            type="date"
            disabled={mode === "view"}
            {...register("startDate")}
          />
          {errors.startDate && (
            <p className="text-xs text-destructive">
              {errors.startDate.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">
            End date
          </Label>
          <Input
            type="date"
            disabled={mode === "view"}
            {...register("endDate")}
          />
          {errors.endDate && (
            <p className="text-xs text-destructive">{errors.endDate.message}</p>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-3">
        <Button variant="ghost" type="button" onClick={onClose}>
          Close
        </Button>
        {mode !== "view" && (
          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving..." : "Save"}
          </Button>
        )}
      </div>
    </form>
  );
}
