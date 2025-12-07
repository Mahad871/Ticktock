import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { Timesheet } from "@/lib/timesheets";
import type { TimesheetEntry } from "@/lib/timesheet-entries";

const timesheetKeys = {
  detail: (id: string) => ["timesheet", id] as const,
  entries: (id: string) => ["timesheet", id, "entries"] as const,
};

export function useTimesheetDetail(
  id: string | undefined,
): UseQueryResult<Timesheet | null, Error> {
  return useQuery({
    queryKey: timesheetKeys.detail(id ?? "unknown"),
    enabled: Boolean(id),
    queryFn: async () => {
      const res = await apiFetch<{ data: Timesheet }>(`/api/timesheets/${id}`);
      return res.data;
    },
  });
}

export function useTimesheetEntries(
  id: string | undefined,
): UseQueryResult<TimesheetEntry[], Error> {
  return useQuery({
    queryKey: timesheetKeys.entries(id ?? "unknown"),
    enabled: Boolean(id),
    queryFn: async () => {
      const res = await apiFetch<{ data: TimesheetEntry[] }>(
        `/api/timesheets/${id}/entries`,
      );
      return res.data;
    },
  });
}

export function useCreateEntry(timesheetId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      date: string;
      description: string;
      project: string;
      hours: number;
    }) =>
      apiFetch(`/api/timesheets/${timesheetId}/entries`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      if (timesheetId) {
        queryClient.invalidateQueries({
          queryKey: timesheetKeys.entries(timesheetId),
        });
        queryClient.invalidateQueries({
          queryKey: timesheetKeys.detail(timesheetId),
        });
      }
    },
  });
}

export function useUpdateEntry(timesheetId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      entryId: string;
      date: string;
      description: string;
      project: string;
      hours: number;
    }) =>
      apiFetch(`/api/timesheets/${timesheetId}/entries/${payload.entryId}`, {
        method: "PUT",
        body: JSON.stringify({
          date: payload.date,
          description: payload.description,
          project: payload.project,
          hours: payload.hours,
        }),
      }),
    onSuccess: () => {
      if (timesheetId) {
        queryClient.invalidateQueries({
          queryKey: timesheetKeys.entries(timesheetId),
        });
        queryClient.invalidateQueries({
          queryKey: timesheetKeys.detail(timesheetId),
        });
      }
    },
  });
}

export function useDeleteEntry(timesheetId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (entryId: string) =>
      apiFetch(`/api/timesheets/${timesheetId}/entries/${entryId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      if (timesheetId) {
        queryClient.invalidateQueries({
          queryKey: timesheetKeys.entries(timesheetId),
        });
        queryClient.invalidateQueries({
          queryKey: timesheetKeys.detail(timesheetId),
        });
      }
    },
  });
}
