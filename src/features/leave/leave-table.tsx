"use client";

import { DataTable, type ColumnDef } from "@/components/common/data-table";
import { StatusBadge } from "@/components/common/status-badge";
import { EmployeeLink } from "@/components/common/employee-link";
import { ReviewActions } from "@/features/applications/review-actions";
import { formatDate } from "@/lib/date";
import { titleCase } from "@/lib/format";

export interface LeaveRow {
  id: string;
  employeeId: string;
  employeeName: string;
  type: string;
  fromDate: string;
  toDate: string;
  days: number;
  reason: string;
  status: string;
}

export function LeaveTable({
  rows,
  canApprove,
  canViewEmployee,
}: {
  rows: LeaveRow[];
  canApprove: boolean;
  canViewEmployee: boolean;
}) {
  const columns: ColumnDef<LeaveRow>[] = [
    { key: "type", header: "Type", sortable: true, render: (r) => titleCase(r.type) },
    ...(canApprove
      ? [
          {
            key: "employeeName",
            header: "Employee",
            sortable: true,
            render: (r: LeaveRow) => <EmployeeLink id={r.employeeId} name={r.employeeName} canView={canViewEmployee} />,
          } as ColumnDef<LeaveRow>,
        ]
      : []),
    { key: "fromDate", header: "From", render: (r) => formatDate(r.fromDate) },
    { key: "toDate", header: "To", render: (r) => formatDate(r.toDate) },
    { key: "days", header: "Days", align: "right" },
    { key: "reason", header: "Reason", render: (r) => <span className="text-muted-foreground">{r.reason}</span> },
    { key: "status", header: "Status", render: (r) => <StatusBadge kind="application" value={r.status} /> },
    ...(canApprove
      ? [
          {
            key: "action",
            header: "Action",
            align: "right",
            render: (r: LeaveRow) =>
              r.status === "pending" ? (
                <ReviewActions endpoint={`/api/leave/${r.id}`} subject="leave request" />
              ) : (
                <span className="text-xs text-muted-foreground">Reviewed</span>
              ),
          } as ColumnDef<LeaveRow>,
        ]
      : []),
  ];

  return (
    <DataTable
      columns={columns}
      data={rows}
      searchKeys={["employeeName", "type", "reason", "status"]}
      searchPlaceholder="Search by employee, type, reason, status…"
      pageSize={12}
      emptyTitle="No leave applications"
      rowHref={(r) => `/leave/${r.id}`}
    />
  );
}
