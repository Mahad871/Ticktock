import { render, screen } from "@testing-library/react";
import React from "react";
import { vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";

import { TimesheetDashboard } from "@/components/timesheets/timesheet-dashboard";
import type { TimesheetStatus } from "@/lib/timesheets";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const baseData = [
  {
    id: "1",
    week: 1,
    startDate: "2024-01-01",
    endDate: "2024-01-07",
    hours: 40,
    status: "COMPLETED" as TimesheetStatus,
  },
];

let queryState: {
  data: typeof baseData;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
} = {
  data: baseData,
  isPending: false,
  isError: false,
  error: null,
};

vi.mock("@/hooks/use-timesheets", () => ({
  useTimesheetsQuery: () => queryState,
  useCreateTimesheet: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateTimesheet: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

function renderWithClient(ui: React.ReactElement) {
  const client = new QueryClient();
  return render(
    <SessionProvider
      session={{
        user: { name: "John Doe", email: "john@example.com" },
        expires: "2099-01-01T00:00:00.000Z",
      }}
    >
      <QueryClientProvider client={client}>{ui}</QueryClientProvider>
    </SessionProvider>,
  );
}

describe("TimesheetDashboard", () => {
  it("renders timesheet rows", () => {
    queryState = {
      data: baseData,
      isPending: false,
      isError: false,
      error: null,
    };
    renderWithClient(<TimesheetDashboard />);
    expect(screen.getByText("Your Timesheets")).toBeInTheDocument();
    expect(screen.getByText("1 - 7 January, 2024")).toBeInTheDocument();
    expect(screen.getByText(/completed/i)).toBeInTheDocument();
  });

  it("shows skeletons while loading", () => {
    queryState = {
      data: [],
      isPending: true,
      isError: false,
      error: null,
    };
    renderWithClient(<TimesheetDashboard />);
    expect(screen.getAllByRole("row").length).toBeGreaterThan(0);
  });
});
