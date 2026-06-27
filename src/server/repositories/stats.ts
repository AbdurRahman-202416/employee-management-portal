/** Aggregated numbers and chart series for the dashboards. */

import { getStore } from "../store/db";
import { toDateKey } from "@/lib/date";
import { departmentName } from "./lookups";
import { taskStats } from "./tasks";
import { pendingApplicationCount } from "./applications";
import { summaryFor } from "./attendance";

export interface AdminStats {
  totalEmployees: number;
  presentToday: number;
  absentToday: number;
  pendingApplications: number;
  activeTasks: number;
  attendanceTrend: { date: string; present: number; late: number; absent: number }[];
  leaveOverview: { name: string; value: number }[];
  departmentSplit: { name: string; value: number }[];
}

export function adminStats(): AdminStats {
  const store = getStore();
  const employees = store.employees.filter((e) => !e.isDeleted);

  // "Today" = today if it has records, otherwise the most recent working day
  // (so the demo dashboard never shows an empty weekend).
  const allDates = Array.from(new Set(store.attendance.map((a) => a.date))).sort();
  const today = toDateKey();
  const statDay = allDates.includes(today) ? today : allDates[allDates.length - 1] ?? today;
  const todayRows = store.attendance.filter((a) => a.date === statDay);

  const presentToday = todayRows.filter((a) => a.status === "present" || a.status === "late").length;
  const absentToday = todayRows.filter((a) => a.status === "absent").length;

  // last 7 work entries grouped by date
  const dates = allDates.slice(-7);
  const attendanceTrend = dates.map((date) => {
    const rows = store.attendance.filter((a) => a.date === date);
    return {
      date,
      present: rows.filter((a) => a.status === "present").length,
      late: rows.filter((a) => a.status === "late").length,
      absent: rows.filter((a) => a.status === "absent").length,
    };
  });

  const leaveOverview = [
    { name: "Approved", value: store.leaves.filter((l) => l.status === "approved").length },
    { name: "Pending", value: store.leaves.filter((l) => l.status === "pending").length },
    { name: "Rejected", value: store.leaves.filter((l) => l.status === "rejected").length },
  ];

  const deptMap = new Map<string, number>();
  for (const e of employees) deptMap.set(e.departmentId, (deptMap.get(e.departmentId) ?? 0) + 1);
  const departmentSplit = [...deptMap.entries()].map(([id, value]) => ({
    name: departmentName(id),
    value,
  }));

  return {
    totalEmployees: employees.length,
    presentToday,
    absentToday,
    pendingApplications: pendingApplicationCount(),
    activeTasks: store.tasks.filter((t) => t.status !== "approved").length,
    attendanceTrend,
    leaveOverview,
    departmentSplit,
  };
}

export interface EmployeeStats {
  todayStatus: string;
  checkInAt?: string;
  checkOutAt?: string;
  remainingLeave: number;
  assignedTasks: number;
  pendingTasks: number;
  monthlyAttendance: { label: string; value: number }[];
  taskProgress: { name: string; value: number }[];
}

export function employeeStats(employeeId: string): EmployeeStats {
  const store = getStore();
  const emp = store.employees.find((e) => e.id === employeeId);
  const today = toDateKey();
  const todayRow = store.attendance.find((a) => a.employeeId === employeeId && a.date === today);
  const sum = summaryFor(employeeId, 30);
  const t = taskStats(employeeId);

  const remainingLeave = emp
    ? emp.leave.sick.allocated - emp.leave.sick.used + (emp.leave.annual.allocated - emp.leave.annual.used)
    : 0;

  return {
    todayStatus: todayRow?.status ?? "not-checked-in",
    checkInAt: todayRow?.checkInAt,
    checkOutAt: todayRow?.checkOutAt,
    remainingLeave,
    assignedTasks: t.total,
    pendingTasks: t.todo + t.inProgress + t.reopened,
    monthlyAttendance: [
      { label: "Present", value: sum.present },
      { label: "Late", value: sum.late },
      { label: "Early Exit", value: sum.earlyExit },
      { label: "Absent", value: sum.absent },
      { label: "Leave", value: sum.leave },
    ],
    taskProgress: [
      { name: "To Do", value: t.todo },
      { name: "In Progress", value: t.inProgress },
      { name: "Pending", value: t.pendingApproval },
      { name: "Approved", value: t.approved },
    ],
  };
}
