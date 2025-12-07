import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { Timesheet, TimesheetStatus } from "@/lib/timesheets";

type ListParams = {
  startDate?: string;
  endDate?: string;
  status?: TimesheetStatus | "ALL";
};

const timesheetKeys = {
  list: (params: ListParams) => ["timesheets", params] as const,
};

function buildQuery(params: ListParams) {
  const search = new URLSearchParams();
  if (params.startDate) search.append("startDate", params.startDate);
  if (params.endDate) search.append("endDate", params.endDate);
  if (params.status && params.status !== "ALL")
    search.append("status", params.status);
  const query = search.toString();
  return query ? `/api/timesheets?${query}` : "/api/timesheets";
}

export function useTimesheetsQuery(
  params: ListParams,
): UseQueryResult<Timesheet[], Error> {
  return useQuery({
    queryKey: timesheetKeys.list(params),
    queryFn: async () => {
      const res = await apiFetch<{ data: Timesheet[] }>(buildQuery(params));
      return res.data;
    },
  });
}

export function useCreateTimesheet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      week: number;
      startDate: string;
      endDate: string;
      hours: number;
    }) =>
      apiFetch("/api/timesheets", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timesheets"] });
    },
  });
}

export function useUpdateTimesheet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      id: string;
      week: number;
      startDate: string;
      endDate: string;
      hours: number;
    }) =>
      apiFetch(`/api/timesheets/${payload.id}`, {
        method: "PUT",
        body: JSON.stringify({
          week: payload.week,
          startDate: payload.startDate,
          endDate: payload.endDate,
          hours: payload.hours,
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timesheets"] });
    },
  });
}
