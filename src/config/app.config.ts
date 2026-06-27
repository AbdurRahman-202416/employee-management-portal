/**
 * APP CONFIG — global, non-secret settings.
 * Brand name, default company policy, and demo login hints all live here
 * so they can be changed in one place.
 */

import type { AppSettings } from "@/types";

export const APP_CONFIG = {
  name: "Workspace",
  fullName: "Employee Management Portal",
  company: "Acme",
  description: "Attendance, tasks, leave, and people — in one place.",
  /** When true, the seeded in-memory data store is used (no database needed). */
  useInMemoryData: !process.env.MONGODB_URI,
} as const;

/** Default company policy. Editable later from Settings (settings.manage). */
export const DEFAULT_SETTINGS: AppSettings = {
  officeStart: "09:00",
  officeEnd: "18:00",
  lateGraceMinutes: 15,
  workdays: [0, 1, 2, 3, 4], // Sun–Thu (Bangladesh work week)
  timezone: "Asia/Dhaka",
  leaveAllocation: {
    sick: 10,
    annual: 20,
  },
};

/** Shown on the login screen so a client can try the demo instantly. */
export const DEMO_ACCOUNTS = [
  { label: "Super Admin", email: "super@gmail.com", password: "demo1234" },
  { label: "Admin / HR", email: "admin@gmail.com", password: "demo1234" },
  { label: "Employee", email: "employee@gmail.com", password: "demo1234" },
];
