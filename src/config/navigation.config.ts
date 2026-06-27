/**
 * NAVIGATION CONFIG — the sidebar is generated from this list.
 * Add a page here (with its required permission) and it appears in the
 * sidebar automatically for the roles that are allowed to see it.
 */

import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  ListTodo,
  PlaneTakeoff,
  Clock,
  Building2,
  FileBarChart,
  Bell,
  ShieldCheck,
  ScrollText,
  Settings,
} from "lucide-react";
import type { Permission } from "@/types";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  permission: Permission;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const NAVIGATION: NavSection[] = [
  {
    title: "Overview",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        permission: "dashboard.view",
      },
    ],
  },
  {
    title: "Work",
    items: [
      {
        label: "Attendance",
        href: "/attendance",
        icon: CalendarCheck,
        permission: "attendance.view.own",
      },
      {
        label: "Tasks",
        href: "/tasks",
        icon: ListTodo,
        permission: "task.view.own",
      },
      {
        label: "Leave",
        href: "/leave",
        icon: PlaneTakeoff,
        permission: "leave.apply",
      },
      {
        label: "Late Entry",
        href: "/late-entry",
        icon: Clock,
        permission: "lateentry.apply",
      },
    ],
  },
  {
    title: "People",
    items: [
      {
        label: "Employees",
        href: "/employees",
        icon: Users,
        permission: "employee.view",
      },
      {
        label: "Departments",
        href: "/departments",
        icon: Building2,
        permission: "department.view",
      },
      {
        label: "Reports",
        href: "/reports",
        icon: FileBarChart,
        permission: "report.view",
      },
    ],
  },
  {
    title: "Administration",
    items: [
      {
        label: "Roles",
        href: "/roles",
        icon: ShieldCheck,
        permission: "role.manage",
      },
      {
        label: "Audit Logs",
        href: "/audit-logs",
        icon: ScrollText,
        permission: "auditlog.view",
      },
      {
        label: "Settings",
        href: "/settings",
        icon: Settings,
        permission: "settings.manage",
      },
    ],
  },
  {
    title: "Account",
    items: [
      {
        label: "Notifications",
        href: "/notifications",
        icon: Bell,
        permission: "notification.view",
      },
    ],
  },
];
