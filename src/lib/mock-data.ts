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
    hours: 40,
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
  "1": [
    {
      id: "e1-1",
      date: "2026-01-01",
      description: "Project planning",
      project: "Project Name",
      hours: 8,
    },
    {
      id: "e1-2",
      date: "2026-01-02",
      description: "API design",
      project: "Project Name",
      hours: 8,
    },
    {
      id: "e1-3",
      date: "2026-01-03",
      description: "API implementation",
      project: "Project Name",
      hours: 8,
    },
    {
      id: "e1-4",
      date: "2026-01-04",
      description: "Frontend integration",
      project: "Project Name",
      hours: 8,
    },
    {
      id: "e1-5",
      date: "2026-01-05",
      description: "QA & fixes",
      project: "Project Name",
      hours: 8,
    },
  ],
  "2": [
    {
      id: "e2-1",
      date: "2026-01-08",
      description: "Sprint planning",
      project: "Project Name",
      hours: 8,
    },
    {
      id: "e2-2",
      date: "2026-01-09",
      description: "Feature work",
      project: "Project Name",
      hours: 8,
    },
    {
      id: "e2-3",
      date: "2026-01-10",
      description: "Feature work",
      project: "Project Name",
      hours: 8,
    },
    {
      id: "e2-4",
      date: "2026-01-11",
      description: "Bug fixes",
      project: "Project Name",
      hours: 8,
    },
    {
      id: "e2-5",
      date: "2026-01-12",
      description: "Review & QA",
      project: "Project Name",
      hours: 8,
    },
  ],
  "3": [
    {
      id: "e3-1",
      date: "2026-01-15",
      description: "Feature spike",
      project: "Project Name",
      hours: 6,
    },
    {
      id: "e3-2",
      date: "2026-01-16",
      description: "Prototype",
      project: "Project Name",
      hours: 6,
    },
    {
      id: "e3-3",
      date: "2026-01-17",
      description: "Cleanup",
      project: "Project Name",
      hours: 6,
    },
  ],
  "4": [
    {
      id: "e-1",
      date: "2026-01-22",
      description: "Homepage Development",
      project: "Project Name",
      hours: 4,
    },
    {
      id: "e-2",
      date: "2026-01-22",
      description: "Homepage Development",
      project: "Project Name",
      hours: 4,
    },
    {
      id: "e-3",
      date: "2026-01-23",
      description: "Homepage Development",
      project: "Project Name",
      hours: 4,
    },
    {
      id: "e-4",
      date: "2026-01-24",
      description: "Homepage Development",
      project: "Project Name",
      hours: 4,
    },
    {
      id: "e-5",
      date: "2026-01-25",
      description: "Homepage Development",
      project: "Project Name",
      hours: 4,
    },
    {
      id: "e-6",
      date: "2026-01-26",
      description: "Homepage Development",
      project: "Project Name",
      hours: 20,
    },
  ],
  "5": [],
};
