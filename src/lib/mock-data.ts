export const mockUsers = [
  {
    id: "demo user",
    email: "demo@example.com",
    name: "Demo User",
    password: "password",
  },
];

export const mockTimesheets = [
  {
    id: "1",
    week: 1,
    startDate: "2026-01-01",
    endDate: "2026-01-05",
    hours: 40,
  },
  {
    id: "2",
    week: 2,
    startDate: "2026-01-08",
    endDate: "2026-01-12",
    hours: 40,
  },
  {
    id: "3",
    week: 3,
    startDate: "2026-01-15",
    endDate: "2026-01-19",
    hours: 18,
  },
  {
    id: "4",
    week: 4,
    startDate: "2026-01-22",
    endDate: "2026-01-26",
    hours: 32,
  },
  {
    id: "5",
    week: 5,
    startDate: "2026-01-28",
    endDate: "2026-02-01",
    hours: 0,
  },
  {
    id: "6",
    week: 6,
    startDate: "2026-02-02",
    endDate: "2026-02-06",
    hours: 40,
  },
  {
    id: "7",
    week: 7,
    startDate: "2026-02-08",
    endDate: "2026-02-12",
    hours: 40,
  },
  {
    id: "8",
    week: 8,
    startDate: "2026-02-15",
    endDate: "2026-02-19",
    hours: 40,
  },
  {
    id: "9",
    week: 9,
    startDate: "2026-02-22",
    endDate: "2026-02-26",
    hours: 10,
  },
  {
    id: "10",
    week: 10,
    startDate: "2026-03-01",
    endDate: "2026-03-05",
    hours: 0,
  },
  {
    id: "11",
    week: 11,
    startDate: "2026-03-08",
    endDate: "2026-03-12",
    hours: 40,
  },
  {
    id: "12",
    week: 12,
    startDate: "2026-03-15",
    endDate: "2026-03-19",
    hours: 20,
  },
];

export const mockTimesheetEntries: Record<
  string,
  {
    id: string;
    date: string; // ISO date
    description: string;
    project: string;
    hours: number;
  }[]
> = {
  "4": [
    {
      id: "e-1",
      date: "2024-01-21",
      description: "Homepage Development",
      project: "Project Name",
      hours: 4,
    },
    {
      id: "e-2",
      date: "2024-01-21",
      description: "Homepage Development",
      project: "Project Name",
      hours: 4,
    },
    {
      id: "e-3",
      date: "2024-01-22",
      description: "Homepage Development",
      project: "Project Name",
      hours: 4,
    },
    {
      id: "e-4",
      date: "2024-01-22",
      description: "Homepage Development",
      project: "Project Name",
      hours: 4,
    },
    {
      id: "e-5",
      date: "2024-01-22",
      description: "Homepage Development",
      project: "Project Name",
      hours: 4,
    },
  ],
};
