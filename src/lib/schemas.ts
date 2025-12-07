import { z } from "zod";

const dateString = z
  .string()
  .refine((val) => !Number.isNaN(Date.parse(val)), "Invalid date");

export const TimesheetPayloadSchema = z
  .object({
    week: z.number().int().positive(),
    startDate: dateString,
    endDate: dateString,
    hours: z.number().min(0).max(168),
  })
  .refine(
    ({ startDate, endDate }) => new Date(startDate) <= new Date(endDate),
    {
      message: "startDate must be on or before endDate",
      path: ["endDate"],
    },
  );

export type TimesheetPayload = z.infer<typeof TimesheetPayloadSchema>;

export const EntryPayloadSchema = z.object({
  date: dateString,
  description: z.string().trim().min(1, "description is required"),
  project: z.string().trim().min(1, "project is required"),
  hours: z.number().min(0).max(24),
});

export type EntryPayload = z.infer<typeof EntryPayloadSchema>;
