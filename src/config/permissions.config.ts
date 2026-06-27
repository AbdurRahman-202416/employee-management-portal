/**
 * PERMISSIONS & DEFAULT ROLES
 * ---------------------------------------------------------------
 * This file is the heart of the "dynamic roles" design.
 * - PERMISSION_GROUPS: every permission, grouped for the Role editor UI.
 * - DEFAULT_ROLES: the roles the system seeds on first run.
 * A Super Admin can later create new roles (HR, Team Lead, ...) and
 * toggle permissions WITHOUT any code change.
 */

import type { Permission, Role } from "@/types";

export const PERMISSION_GROUPS: {
  group: string;
  items: { key: Permission; label: string }[];
}[] = [
  {
    group: "Dashboard",
    items: [{ key: "dashboard.view", label: "View dashboard" }],
  },
  {
    group: "Employees",
    items: [
      { key: "employee.view", label: "View employees" },
      { key: "employee.create", label: "Add employees" },
      { key: "employee.edit", label: "Edit employees" },
    ],
  },
  {
    group: "Departments",
    items: [
      { key: "department.view", label: "View departments" },
      { key: "department.manage", label: "Manage departments" },
    ],
  },
  {
    group: "Attendance",
    items: [
      { key: "attendance.check", label: "Check in / out" },
      { key: "attendance.view.own", label: "View own attendance" },
      { key: "attendance.view.all", label: "View all attendance" },
    ],
  },
  {
    group: "Tasks",
    items: [
      { key: "task.view.own", label: "View own tasks" },
      { key: "task.view.all", label: "View all tasks" },
      { key: "task.create", label: "Create & assign tasks" },
      { key: "task.update.status", label: "Update task status" },
      { key: "task.approve", label: "Approve / reopen tasks" },
    ],
  },
  {
    group: "Leave",
    items: [
      { key: "leave.apply", label: "Apply for leave" },
      { key: "leave.view.all", label: "View all leave" },
      { key: "leave.approve", label: "Approve leave" },
    ],
  },
  {
    group: "Late Entry",
    items: [
      { key: "lateentry.apply", label: "Apply for late entry" },
      { key: "lateentry.view.all", label: "View all late entries" },
      { key: "lateentry.approve", label: "Approve late entry" },
    ],
  },
  {
    group: "System",
    items: [
      { key: "report.view", label: "View reports" },
      { key: "notification.view", label: "View notifications" },
      { key: "role.manage", label: "Manage roles" },
      { key: "settings.manage", label: "Manage settings" },
      { key: "auditlog.view", label: "View audit logs" },
    ],
  },
  {
    group: "Danger Zone",
    items: [
      { key: "employee.delete", label: "Delete employees" },
      { key: "department.delete", label: "Delete departments" },
      { key: "role.delete", label: "Delete roles" },
      { key: "task.delete", label: "Delete tasks" },
      { key: "leave.delete", label: "Delete leave applications" },
      { key: "lateentry.delete", label: "Delete late entries" },
    ],
  },
];

export const ALL_PERMISSIONS: Permission[] = PERMISSION_GROUPS.flatMap((g) =>
  g.items.map((i) => i.key)
);

const EMPLOYEE_PERMISSIONS: Permission[] = [
  "dashboard.view",
  "attendance.check",
  "attendance.view.own",
  "task.view.own",
  "task.update.status",
  "leave.apply",
  "lateentry.apply",
  "notification.view",
];

const ADMIN_PERMISSIONS: Permission[] = [
  ...EMPLOYEE_PERMISSIONS,
  "employee.view",
  "employee.create",
  "employee.edit",
  "department.view",
  "department.manage",
  "attendance.view.all",
  "task.view.all",
  "task.create",
  "task.approve",
  "leave.view.all",
  "leave.approve",
  "lateentry.view.all",
  "lateentry.approve",
  "report.view",
];

export const DEFAULT_ROLES: Role[] = [
  {
    id: "role-superadmin",
    name: "Super Admin",
    slug: "superadmin",
    description: "Full system access, including roles and settings.",
    permissions: [...ALL_PERMISSIONS],
    isSystem: true,
  },
  {
    id: "role-admin",
    name: "Admin / HR",
    slug: "admin",
    description: "Manages employees, attendance, tasks, and approvals.",
    permissions: ADMIN_PERMISSIONS,
    isSystem: true,
  },
  {
    id: "role-employee",
    name: "Employee",
    slug: "employee",
    description: "Standard staff access: own attendance, tasks, applications.",
    permissions: EMPLOYEE_PERMISSIONS,
    isSystem: true,
  },
];
