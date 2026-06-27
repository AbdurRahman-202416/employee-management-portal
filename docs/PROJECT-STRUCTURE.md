# Project Structure (plain-language guide)

This project is organized so that **the folder name tells you what lives inside**.
Even without reading code, the map below explains where everything is.

```
employee-management-portal/
├── docs/                  → Documentation (this file, design notes)
├── public/                → Static files (images, icons)
├── .env.example           → List of settings you can fill in
└── src/                   → All the source code
    │
    ├── app/               → PAGES & WEB ADDRESSES (Next.js App Router)
    │   ├── (auth)/login/      → The sign-in screen  (/login)
    │   ├── (dashboard)/       → Everything you see after signing in
    │   │   ├── dashboard/         → Home dashboard (different for admin vs staff)
    │   │   ├── employees/         → People directory + the employee details page
    │   │   ├── attendance/        → Attendance log
    │   │   ├── tasks/             → Task board
    │   │   ├── leave/             → Leave applications
    │   │   ├── late-entry/        → Late-entry applications
    │   │   ├── departments/       → Departments
    │   │   ├── reports/           → Attendance reports + export
    │   │   ├── roles/             → Roles & permissions
    │   │   ├── audit-logs/        → Activity history
    │   │   ├── notifications/     → Your alerts
    │   │   └── settings/          → Company policy (office hours, leave, etc.)
    │   └── api/               → The "backend" — handles login, check-in, approvals
    │
    ├── components/        → REUSABLE UI BUILDING BLOCKS
    │   ├── ui/                → Basic pieces: button, card, input, badge, avatar
    │   ├── common/            → Bigger reusable parts: data table, stat card,
    │   │                        page header, status badge, empty state
    │   ├── charts/            → Bar & donut charts
    │   ├── layout/            → Sidebar, top bar, the page frame
    │   └── providers/         → App-wide context (who is signed in)
    │
    ├── config/           → SETTINGS THAT DRIVE THE APP (edit these, not code)
    │   ├── app.config.ts          → App name, company policy defaults, demo accounts
    │   ├── navigation.config.ts   → What appears in the sidebar
    │   ├── permissions.config.ts  → Every permission + the default roles
    │   └── status.config.ts       → Colors & labels for every status
    │
    ├── features/         → FEATURE-SPECIFIC SCREENS (one folder per feature)
    │   ├── dashboard/ employees/ attendance/ tasks/
    │   ├── applications/ reports/ notifications/
    │
    ├── server/           → THE BACKEND BRAIN (never runs in the browser)
    │   ├── store/             → The built-in demo database + seed data
    │   ├── repositories/      → The only place that reads/writes data
    │   │                        (swap to MongoDB here)
    │   ├── models/            → MongoDB schemas (for when a real DB is added)
    │   └── auth/              → Sign-in, sessions, permission checks
    │
    ├── lib/              → SMALL HELPERS (dates, formatting, class names)
    ├── types/            → The shape of every record (employee, task, ...)
    └── proxy.ts          → Route protection (was "middleware" before Next.js 16)
```

## The few rules that keep it clean

1. **Pages stay thin.** A page in `app/` fetches data and hands it to a
   component. It does not contain business logic.
2. **One door to the data.** Everything goes through `server/repositories/*`.
   To move from the demo store to MongoDB, you change only that folder.
3. **Config over code.** The sidebar, roles, permissions, and status colors are
   data in `config/` — change behavior without editing components.
4. **Permissions, not role names.** Access is decided by permissions
   (`leave.approve`), so a new role works instantly.
5. **Server vs browser.** Files in `server/` only run on the server. Components
   marked `"use client"` run in the browser.

## Naming conventions

- Files: `kebab-case.tsx` (e.g. `data-table.tsx`).
- React components: `PascalCase` (e.g. `DataTable`).
- Config files end in `.config.ts`. Backend data files live under `server/`.
