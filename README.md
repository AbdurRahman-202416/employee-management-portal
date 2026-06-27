# Employee Management Portal (HRMS)

An enterprise-grade portal for managing people, attendance, tasks, and leave —
built with Next.js 16, TypeScript, Tailwind CSS, and a MongoDB-ready data layer.

> **Runs with zero setup.** Out of the box it uses a built-in seeded demo
> dataset (40 employees, attendance, tasks, leave, etc.). Add a `MONGODB_URI`
> later and it switches to a real database automatically.

## Quick start

```bash
npm install
npm run dev
# open http://localhost:3000
```

### Demo accounts (password for all: `demo1234`)

| Role        | Email             | Can do                                           |
| ----------- | ----------------- | ------------------------------------------------ |
| Super Admin | super@kona.dev    | Everything + roles, settings, audit logs         |
| Admin / HR  | admin@kona.dev    | Employees, attendance, tasks, approvals, reports |
| Employee    | employee@kona.dev | Own attendance, tasks, leave & late-entry forms  |

## Features

- 🔐 **Authentication & dynamic RBAC** — roles live in data, permissions are
  checked everywhere (add a role without touching code).
- 🧑‍💼 **Employee management** — directory, profiles, auto IDs (`EMP-0001`).
- 🪪 **Employee details page** — attendance + leave + task + application history.
- 📍 **Attendance** — geo-verified check in / out, weekend & late detection.
- ✅ **Tasks** — assign → in-progress → done → approve / reopen workflow.
- 🌴 **Leave & late entry** — applications with approve / reject.
- 📊 **Dashboards** — separate views for admins and employees, with charts.
- 📈 **Reports** — filter attendance, export to Excel / PDF.
- 🔔 **Notifications**, 🏢 **departments**, 🧾 **audit logs**, ⚙️ **settings**.
- 🌙 Dark mode, fully responsive, skeletons, empty states.

## Scripts

| Command             | What it does                |
| ------------------- | --------------------------- |
| `npm run dev`       | Start the development server |
| `npm run build`     | Production build            |
| `npm run start`     | Run the production build    |
| `npm run typecheck` | Type-check without emitting |
| `npm run lint`      | Lint the codebase           |

## Environment

Copy `.env.example` to `.env.local` and fill in when ready. Everything has a
safe default, so the demo runs even with empty values. See
[`docs/PROJECT-STRUCTURE.md`](docs/PROJECT-STRUCTURE.md) for how the code is
organized.

## Going to a real database

The whole app talks to data through `src/server/repositories/*`. That is the one
place to switch from the in-memory store to the Mongoose models in
`src/server/models` — no UI or API changes needed.
# employee-management-portal
