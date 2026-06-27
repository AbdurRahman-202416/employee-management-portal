"use client";

import { DataTable, type ColumnDef } from "@/components/common/data-table";
import { StatusBadge } from "@/components/common/status-badge";
import { EmployeeLink } from "@/components/common/employee-link";
import { formatDate, formatTime, formatDuration } from "@/lib/date";

export interface AttendanceRow {
  id: string;
  employeeId: string;
  employeeName: string;
  canViewEmployee: boolean;
  date: string;
  checkInAt?: string;
  checkOutAt?: string;
  status: string;
  workedMinutes: number;
}

const columns: ColumnDef<AttendanceRow>[] = [
  {
    key: "employeeName",
    header: "Employee",
    sortable: true,
    render: (r) => <EmployeeLink id={r.employeeId} name={r.employeeName} canView={r.canViewEmployee} />,
  },
  { key: "date", header: "Date", sortable: true, render: (r) => formatDate(r.date) },
  { key: "checkInAt", header: "Check In", render: (r) => formatTime(r.checkInAt) },
  { key: "checkOutAt", header: "Check Out", hideOnMobile: true, render: (r) => formatTime(r.checkOutAt) },
  { key: "workedMinutes", header: "Worked", align: "right", hideOnMobile: true, render: (r) => formatDuration(r.workedMinutes) },
  { key: "status", header: "Status", align: "center", render: (r) => <StatusBadge kind="attendance" value={r.status} /> },
];

export function AttendanceTable({ rows }: { rows: AttendanceRow[] }) {
  return (
    <DataTable
      columns={columns}
      data={rows}
      searchKeys={["employeeName", "date"]}
      searchPlaceholder="Search by employee or date…"
      pageSize={12}
      emptyTitle="No attendance records"
    />
  );
}
