"use client";

import { DataTable, type ColumnDef } from "@/components/common/data-table";
import { StatusBadge } from "@/components/common/status-badge";
import { EmployeeLink } from "@/components/common/employee-link";
import { ReviewActions } from "@/features/applications/review-actions";
import { formatDate, formatTime, formatDuration } from "@/lib/date";

export interface LateEntryRow {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkInAt?: string;
  checkOutAt?: string;
  workedMinutes?: number;
  reason: string;
  status: string;
}

export function LateEntryTable({
  rows,
  canApprove,
  canViewEmployee,
}: {
  rows: LateEntryRow[];
  canApprove: boolean;
  canViewEmployee: boolean;
}) {
  const columns: ColumnDef<LateEntryRow>[] = [
    { key: "date", header: "Date", sortable: true, render: (r) => formatDate(r.date) },
    ...(canApprove
      ? [
          {
            key: "employeeName",
            header: "Employee",
            sortable: true,
            render: (r: LateEntryRow) => <EmployeeLink id={r.employeeId} name={r.employeeName} canView={canViewEmployee} />,
          } as ColumnDef<LateEntryRow>,
        ]
      : []),
    { key: "checkInAt", header: "Check In", align: "right", hideOnMobile: true, render: (r) => formatTime(r.checkInAt) },
    { key: "checkOutAt", header: "Check Out", align: "right", hideOnMobile: true, render: (r) => formatTime(r.checkOutAt) },
    { key: "workedMinutes", header: "Worked", align: "right", hideOnMobile: true, render: (r) => (r.workedMinutes ? formatDuration(r.workedMinutes) : "—") },
    { key: "reason", header: "Reason", hideOnMobile: true, render: (r) => <span className="text-muted-foreground">{r.reason}</span> },
    { key: "status", header: "Status", render: (r) => <StatusBadge kind="application" value={r.status} /> },
    ...(canApprove
      ? [
          {
            key: "action",
            header: "Action",
            align: "right",
            render: (r: LateEntryRow) =>
              r.status === "pending" ? (
                <ReviewActions endpoint={`/api/late-entry/${r.id}`} subject="late entry" />
              ) : (
                <span className="text-xs text-muted-foreground">Reviewed</span>
              ),
          } as ColumnDef<LateEntryRow>,
        ]
      : []),
  ];

  return (
    <DataTable
      columns={columns}
      data={rows}
      searchKeys={["employeeName", "reason", "status", "date"]}
      searchPlaceholder="Search by employee, reason, status, date…"
      pageSize={12}
      emptyTitle="No late-entry applications"
      rowHref={(r) => `/late-entry/${r.id}`}
    />
  );
}
