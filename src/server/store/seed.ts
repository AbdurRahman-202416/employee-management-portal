/**
 * SEED — builds a realistic demo dataset so the portal is fully usable
 * the moment it starts, with no database required.
 * Data is deterministic (seeded random) so it stays stable across restarts.
 */

import bcrypt from "bcryptjs";
import { DEFAULT_ROLES } from "@/config/permissions.config";
import { DEFAULT_SETTINGS } from "@/config/app.config";
import { minutesOfDay } from "@/lib/date";
import type {
  AttendanceRecord,
  AttendanceStatus,
  Department,
  Employee,
  LateEntryApplication,
  LeaveApplication,
  Notification,
  TaskItem,
  AuditLog,
} from "@/types";

// --- deterministic pseudo-random number generator (mulberry32) ---
function rng(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = rng(20260627);
const pick = <T>(arr: T[]) => arr[Math.floor(rand() * arr.length)];
const between = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;

const FIRST = [
  "Arif", "Nusrat", "Tanvir", "Sadia", "Rakib", "Maria", "Hasan", "Farhana",
  "Imran", "Sumaiya", "Naimul", "Tasnia", "Sabbir", "Rumana", "Fahim", "Jannat",
  "Mizan", "Lamia", "Shovon", "Priya", "Rifat", "Mahin", "Zarif", "Oishi",
  "Tahmid", "Nabila", "Sakib", "Ria", "Niloy", "Mehjabin", "Asif", "Tania",
  "Rashed", "Anika", "Jubair", "Samira", "Galib", "Proma", "Shihab", "Ifra",
];
const LAST = [
  "Hossain", "Akter", "Rahman", "Islam", "Chowdhury", "Ahmed", "Karim", "Begum",
  "Khan", "Sultana", "Mahmud", "Jahan", "Hasan", "Siddiqui", "Alam", "Noor",
];
const DESIGNATIONS = [
  "Software Engineer", "Senior Engineer", "Product Designer", "QA Engineer",
  "Accountant", "HR Executive", "Marketing Specialist", "Operations Officer",
  "Support Agent", "Team Lead", "Data Analyst", "Project Coordinator",
];

export interface SeedData {
  settings: typeof DEFAULT_SETTINGS;
  roles: typeof DEFAULT_ROLES;
  departments: Department[];
  employees: Employee[];
  attendance: AttendanceRecord[];
  tasks: TaskItem[];
  leaves: LeaveApplication[];
  lateEntries: LateEntryApplication[];
  notifications: Notification[];
  auditLogs: AuditLog[];
}

function dateKey(daysAgo: number) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}
function isoFor(daysAgo: number, hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - daysAgo);
  d.setUTCHours(h - 6, m, 0, 0); // Asia/Dhaka is UTC+6 -> store UTC
  return d.toISOString();
}

export function buildSeed(): SeedData {
  const passwordHash = bcrypt.hashSync("demo1234", 10);

  const departments: Department[] = [
    { id: "dep-hr", name: "Human Resources", code: "HR", description: "People & culture", createdAt: dateKey(400) },
    { id: "dep-acc", name: "Accounts", code: "ACC", description: "Finance & payroll", createdAt: dateKey(400) },
    { id: "dep-it", name: "Engineering", code: "IT", description: "Product & platform", createdAt: dateKey(400) },
    { id: "dep-mkt", name: "Marketing", code: "MKT", description: "Growth & brand", createdAt: dateKey(400) },
    { id: "dep-ops", name: "Operations", code: "OPS", description: "Delivery & support", createdAt: dateKey(400) },
  ];

  const employees: Employee[] = [];

  // Fixed demo accounts (shown on the login screen).
  const demoSeeds: { id: string; first: string; last: string; email: string; roleId: string; dep: string; desig: string }[] = [
    { id: "emp-super", first: "Jasim", last: "Uddin", email: "super@gmail.com", roleId: "role-superadmin", dep: "dep-it", desig: "Engineering Lead" },
    { id: "emp-admin", first: "Nadia", last: "Rahman", email: "admin@gmail.com", roleId: "role-admin", dep: "dep-hr", desig: "HR Manager" },
    { id: "emp-employee", first: "Rakib", last: "Hasan", email: "employee@gmail.com", roleId: "role-employee", dep: "dep-it", desig: "Software Engineer" },
  ];

  let counter = 1;
  const makeEmpId = () => `EMP-${String(counter++).padStart(4, "0")}`;

  for (const d of demoSeeds) {
    employees.push({
      id: d.id,
      employeeId: makeEmpId(),
      firstName: d.first,
      lastName: d.last,
      email: d.email,
      phone: `+8801${between(300000000, 999999999)}`,
      departmentId: d.dep,
      designation: d.desig,
      roleId: d.roleId,
      joiningDate: dateKey(between(200, 800)),
      employmentStatus: "active",
      photoUrl: `https://i.pravatar.cc/150?u=${d.id}`,
      passwordHash,
      mustChangePassword: false,
      leave: {
        sick: { allocated: 10, used: between(0, 6) },
        annual: { allocated: 20, used: between(2, 12) },
      },
      createdAt: dateKey(800),
      isDeleted: false,
    });
  }

  // 37 generated employees -> 40 total.
  for (let i = 0; i < 37; i++) {
    const first = pick(FIRST);
    const last = pick(LAST);
    employees.push({
      id: `emp-${i + 1}`,
      employeeId: makeEmpId(),
      firstName: first,
      lastName: last,
      email: `${first.toLowerCase()}.${last.toLowerCase()}${i}@gmail.com`,
      phone: `+8801${between(300000000, 999999999)}`,
      departmentId: pick(departments).id,
      designation: pick(DESIGNATIONS),
      roleId: "role-employee",
      joiningDate: dateKey(between(30, 900)),
      employmentStatus: rand() > 0.1 ? "active" : "on-leave",
      photoUrl: `https://i.pravatar.cc/150?u=emp-${i + 1}`,
      passwordHash,
      mustChangePassword: false,
      leave: {
        sick: { allocated: 10, used: between(0, 8) },
        annual: { allocated: 20, used: between(0, 16) },
      },
      createdAt: dateKey(between(30, 900)),
      isDeleted: false,
    });
  }

  // --- Attendance: last 30 calendar days for each active employee ---
  const attendance: AttendanceRecord[] = [];
  const officeStart = minutesOfDay(DEFAULT_SETTINGS.officeStart);
  const officeEnd = minutesOfDay(DEFAULT_SETTINGS.officeEnd);
  let attId = 1;

  for (const emp of employees) {
    for (let day = 0; day < 30; day++) {
      const d = new Date();
      d.setUTCDate(d.getUTCDate() - day);
      const weekday = d.getUTCDay();
      if (!DEFAULT_SETTINGS.workdays.includes(weekday)) continue; // skip weekends

      const roll = rand();
      let status: AttendanceStatus = "present";
      let checkInMin = officeStart - between(0, 20);
      let checkOutMin = officeEnd + between(0, 30);

      if (roll < 0.06) {
        status = "absent";
      } else if (roll < 0.1) {
        status = "leave";
      } else {
        if (rand() < 0.18) {
          status = "late";
          checkInMin = officeStart + between(20, 70);
        }
        if (rand() < 0.12) {
          status = status === "late" ? "late" : "early-exit";
          checkOutMin = officeEnd - between(20, 90);
        }
      }

      if (status === "absent" || status === "leave") {
        attendance.push({
          id: `att-${attId++}`,
          employeeId: emp.id,
          date: dateKey(day),
          status,
          workedMinutes: 0,
        });
        continue;
      }

      const ci = `${String(Math.floor(checkInMin / 60)).padStart(2, "0")}:${String(checkInMin % 60).padStart(2, "0")}`;
      const co = `${String(Math.floor(checkOutMin / 60)).padStart(2, "0")}:${String(checkOutMin % 60).padStart(2, "0")}`;
      attendance.push({
        id: `att-${attId++}`,
        employeeId: emp.id,
        date: dateKey(day),
        checkInAt: isoFor(day, ci),
        checkInGeo: { lat: 23.7806 + (rand() - 0.5) * 0.01, lng: 90.4074 + (rand() - 0.5) * 0.01 },
        checkOutAt: isoFor(day, co),
        checkOutGeo: { lat: 23.7806 + (rand() - 0.5) * 0.01, lng: 90.4074 + (rand() - 0.5) * 0.01 },
        status,
        workedMinutes: Math.max(0, checkOutMin - checkInMin),
      });
    }
  }

  // --- Tasks ---
  const TASK_TITLES = [
    "Build attendance export", "Fix login redirect", "Design leave form",
    "Write API tests", "Optimize dashboard query", "Update employee profile UI",
    "Review pull request", "Prepare monthly report", "Refactor task board",
    "Add dark mode polish", "Investigate slow report", "Onboard new hire",
    "Set up CI pipeline", "Draft release notes", "Audit permissions",
  ];
  const priorities = ["low", "medium", "high", "urgent"] as const;
  const taskStatuses = ["todo", "in-progress", "pending-approval", "approved", "reopened"] as const;
  const tasks: TaskItem[] = [];
  for (let i = 0; i < 28; i++) {
    const assignee = pick(employees);
    tasks.push({
      id: `task-${i + 1}`,
      code: `TSK-${String(i + 1).padStart(4, "0")}`,
      title: pick(TASK_TITLES),
      description: "Auto-generated demo task for portal preview.",
      assigneeId: assignee.id,
      assignedById: "emp-admin",
      priority: pick([...priorities]),
      status: pick([...taskStatuses]),
      dueDate: dateKey(-between(1, 14)),
      comments: [],
      createdAt: dateKey(between(1, 20)),
    });
  }

  // --- Leave applications ---
  const leaves: LeaveApplication[] = [];
  const appStatuses = ["pending", "approved", "rejected"] as const;
  for (let i = 0; i < 14; i++) {
    const emp = pick(employees);
    const from = between(1, 20);
    leaves.push({
      id: `leave-${i + 1}`,
      employeeId: emp.id,
      type: rand() > 0.5 ? "sick" : "annual",
      fromDate: dateKey(from),
      toDate: dateKey(Math.max(0, from - between(0, 3))),
      days: between(1, 4),
      reason: pick(["Fever", "Family event", "Personal work", "Medical checkup", "Travel"]),
      status: pick([...appStatuses]),
      reviewedById: "emp-admin",
      createdAt: dateKey(from + 1),
    });
  }

  // --- Late entry applications ---
  const lateEntries: LateEntryApplication[] = [];
  for (let i = 0; i < 10; i++) {
    const emp = pick(employees);
    lateEntries.push({
      id: `late-${i + 1}`,
      employeeId: emp.id,
      date: dateKey(between(1, 20)),
      reason: pick(["Traffic jam", "Medical", "Family emergency", "Bus breakdown"]),
      status: pick([...appStatuses]),
      reviewedById: "emp-admin",
      createdAt: dateKey(between(1, 20)),
    });
  }

  // --- Demo items owned by the employee, so notifications link to real pages ---
  const demoTask: TaskItem = {
    id: "task-demo-1",
    code: "TSK-0101",
    title: "Fix login redirect",
    description: "After sign-in, users should land on the dashboard, not the login page. Reproduce, fix the redirect, and confirm on mobile.",
    assigneeId: "emp-employee",
    assignedById: "emp-admin",
    priority: "high",
    status: "in-progress",
    dueDate: dateKey(-5),
    comments: [
      { id: "cmt-1", authorId: "emp-admin", body: "Please prioritize this — it affects all users.", createdAt: isoFor(1, "09:15") },
    ],
    createdAt: isoFor(1, "09:10"),
  };
  tasks.unshift(demoTask);

  const demoLeave: LeaveApplication = {
    id: "leave-demo-1",
    employeeId: "emp-employee",
    type: "sick",
    fromDate: dateKey(3),
    toDate: dateKey(2),
    days: 2,
    reason: "Fever and rest advised by doctor",
    status: "approved",
    reviewedById: "emp-admin",
    createdAt: isoFor(4, "10:00"),
  };
  leaves.unshift(demoLeave);

  const demoLate: LateEntryApplication = {
    id: "late-demo-1",
    employeeId: "emp-employee",
    date: dateKey(2),
    reason: "Traffic jam on the way to office",
    status: "approved",
    reviewedById: "emp-admin",
    createdAt: isoFor(2, "09:05"),
  };
  lateEntries.unshift(demoLate);

  // --- Notifications (for the demo employee) — each links to its item ---
  const notifications: Notification[] = [
    { id: "ntf-1", userId: "emp-employee", type: "task-assigned", title: "New task assigned", message: "You were assigned 'Fix login redirect'.", read: false, createdAt: isoFor(0, "09:10"), entityType: "task", entityId: demoTask.id },
    { id: "ntf-2", userId: "emp-employee", type: "leave-approved", title: "Leave approved", message: "Your sick leave was approved.", read: false, createdAt: isoFor(1, "14:00"), entityType: "leave", entityId: demoLeave.id },
    { id: "ntf-3", userId: "emp-employee", type: "lateentry-approved", title: "Late entry approved", message: "Your late entry for traffic was approved.", read: true, createdAt: isoFor(2, "10:30"), entityType: "lateentry", entityId: demoLate.id },
  ];

  // --- Audit logs ---
  const auditLogs: AuditLog[] = [
    { id: "log-1", actorId: "emp-admin", action: "employee.create", entity: "Employee", entityId: "emp-5", summary: "Nadia Rahman added a new employee", createdAt: isoFor(1, "11:20") },
    { id: "log-2", actorId: "emp-super", action: "settings.update", entity: "Settings", entityId: "settings", summary: "Jasim Uddin updated office hours", createdAt: isoFor(2, "16:05") },
    { id: "log-3", actorId: "emp-admin", action: "leave.approve", entity: "LeaveApplication", entityId: "leave-2", summary: "Nadia Rahman approved a leave request", createdAt: isoFor(0, "12:45") },
  ];

  return {
    settings: { ...DEFAULT_SETTINGS },
    roles: DEFAULT_ROLES.map((r) => ({ ...r, permissions: [...r.permissions] })),
    departments,
    employees,
    attendance,
    tasks,
    leaves,
    lateEntries,
    notifications,
    auditLogs,
  };
}
