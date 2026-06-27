import type { Metadata } from "next";
import { requireUser } from "@/server/auth/guard";
import { can } from "@/lib/permissions";
import { listLeave } from "@/server/repositories/applications";
import { getEmployee } from "@/server/repositories/employees";
import { fullName } from "@/lib/format";
import { PageHeader } from "@/components/common/page-header";
import { LeaveTable, type LeaveRow } from "@/features/leave/leave-table";
import { LeaveDialog } from "@/features/leave/leave-dialog";

export const metadata: Metadata = { title: "Leave" };

export default async function LeavePage() {
  const user = await requireUser();
  const canApprove = can(user, "leave.approve");
  const canViewEmployee = can(user, "employee.view");

  const rows: LeaveRow[] = listLeave(canApprove ? {} : { employeeId: user.id }).map((l) => {
    const emp = getEmployee(l.employeeId);
    return {
      id: l.id,
      employeeId: l.employeeId,
      employeeName: emp ? fullName(emp.firstName, emp.lastName) : "—",
      type: l.type,
      fromDate: l.fromDate,
      toDate: l.toDate,
      days: l.days,
      reason: l.reason,
      status: l.status,
    };
  });

  return (
    <>
      <PageHeader
        title="Leave"
        description={canApprove ? "Review and approve leave requests." : "Your leave applications."}
        actions={can(user, "leave.apply") ? <LeaveDialog /> : undefined}
      />
      <LeaveTable rows={rows} canApprove={canApprove} canViewEmployee={canViewEmployee} />
    </>
  );
}
