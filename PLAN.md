## Timesheet App Improvement Plan

This plan upgrades the project to a senior-level implementation with theming, structure, validation, UX polish, accessibility, and testing rigor.

### Goals

- Consistent theming via tokens; no scattered hex values.
- Shared, accessible UI primitives (dialogs/menus/inputs).
- Clean separation of concerns (data hooks, UI components).
- Robust validation/auth at API and client layers.
- Responsive, polished UX with skeletons/loaders.
- Accessible interactions and keyboard support.
- Tests covering core flows, guards, and validation.

### Current Issues (summary)

- Hard-coded colors across components; not using theme tokens.
- Duplicated modals/dialogs; missing focus trapping/ARIA.
- Large monolithic components mixing data + UI.
- API routes unauthenticated; limited validation (dates/hours).
- Loading/error states partial; no skeletons.
- No tests for UI flows or auth redirect.
- Limited accessibility affordances (focus, labels, roles).
- No consistent error handling surface for API failures.

### Work Plan (phased, detailed)

1. **Foundations (theme + packages)**
   - Add brand/status CSS variables in `globals.css`; map in `tailwind.config.ts` (surface, border, text, primary, muted, status.success/warn/danger).
   - Install and configure: `@tanstack/react-query`, `zod`, `react-hook-form`, `@hookform/resolvers`, `@testing-library/react`, `@testing-library/user-event`, `vitest` (or jest) + `jsdom`.
   - Add React Query provider in root layout; create `lib/query-client.ts` to share client and default options (retries, stale times).

2. **UI primitives & layout**
   - Replace custom modals with shadcn `Dialog` (focus trap, aria labels); replace status/per-page menus with `DropdownMenu`; keep `Select` where appropriate.
   - Extract `AppShell` (Header/Footer) reused by dashboard + week pages; ensure nav/user controls are consistent.
   - Normalize buttons to shadcn variants; remove inline hex styling; use icons where helpful.
   - Accessibility: ensure labels/input ids match, dialogs have titles/descriptions, menus are keyboard navigable.

3. **Theming sweep**
   - Replace hex classes in `timesheet-dashboard.tsx`, `week-timesheet.tsx`, `status-badge.tsx`, `app/page.tsx` with semantic Tailwind classes using new tokens (e.g., `bg-surface`, `text-primary`, `border-border`, `bg-status-success`).
   - Define status utility classes (success/warn/danger) for badges and alerts; ensure light/dark readiness via CSS variables.

4. **Component decomposition**
   - Dashboard: split into `TimesheetFilters`, `TimesheetTable`, `Pagination`, `TimesheetModal` (unified add/view/edit). Keep data-fetching hooks (`useTimesheetsQuery`, `useTimesheetMutations`) separate from presentational components.
   - Week view: split into `DayList`, `TaskList`, `TaskDialog` (shared add/edit), and reuse AddEntry dialog logic; keep data hooks in `hooks/useTimesheetEntries`.
   - Move helpers (formatRange, pagination calc) into `lib/date` and `lib/pagination`.

5. **Data & validation**
   - Create zod schemas: `TimesheetPayload` (week number, start<=end, hours 0–168) and `EntryPayload` (date, description, project, hours 0–24).
   - Use schemas in API routes; return 400 with details; keep type inference for client.
   - Use `react-hook-form` + zod in dashboard modal and task dialog; prefill values for edit; show inline field errors.

6. **Auth hardening**
   - In API routes, require session (`auth()`); return 401/403 when unauthenticated.
   - Keep page-level redirect guard; ensure client fetchers surface 401 as a sign-out/redirect path.

7. **UX polish**
   - Hook up Create/Update/View buttons to the unified modal; view mode disables inputs.
   - Add skeletons/shimmers: dashboard table rows, filters bar; week view day/task list; button-level loading on saves; spinners for blocking actions.
   - Inline error banners for fetch/mutate failures; consider toast for success/error; ensure retry/refresh guidance.
   - Ensure date/hour validation messages are user-friendly and concise.
   - Empty states: friendly text and CTA to add entries.

8. **Testing**
   - RTL tests: filters update query, pagination navigation, modal validation errors, add/edit success path, auth redirect for `/dashboard` when unauthenticated, skeletons visible during loading, disabled buttons while saving.
   - API schema tests (optional) to ensure validation failures return 400; unit-test helper functions (formatRange, pagination).
   - Accessibility checks: at least assert roles/labels for dialogs and inputs.

### Packages to install

- `@tanstack/react-query`
- `zod`
- `react-hook-form`
- `@hookform/resolvers`
- `@testing-library/react`
- `@testing-library/user-event`
- `vitest` (or jest) and `jsdom` test env

### Definition of Done

- No raw hex colors in components; all via tokens/tailwind mapping.
- Shared dialogs/menus (shadcn) with accessibility defaults.
- API routes authenticated and validated; client forms validated with zod.
- Visible skeletons/loaders for dashboard and week view; inline errors shown.
- Add/edit uses the same form component; edit pre-fills data.
- Tests added and passing for key flows, guards, and validation; accessibility roles/labels verified.
