import type { Metadata } from "next";
import { requireUser } from "@/server/auth/guard";
import { can } from "@/lib/permissions";
import { listLateEntry } from "@/server/repositories/applications";
import { attendanceOn } from "@/server/repositories/attendance";
import { getEmployee } from "@/server/repositories/employees";
import { fullName } from "@/lib/format";
import { PageHeader } from "@/components/common/page-header";
import { LateEntryTable, type LateEntryRow } from "@/features/late-entry/late-entry-table";
import { LateEntryDialog } from "@/features/late-entry/late-entry-dialog";

export const metadata: Metadata = { title: "Late Entry" };

export default async function LateEntryPage() {
  const user = await requireUser();
  const canApprove = can(user, "lateentry.approve");
  const canViewEmployee = can(user, "employee.view");

  const rows: LateEntryRow[] = listLateEntry(canApprove ? {} : { employeeId: user.id }).map((l) => {
    const emp = getEmployee(l.employeeId);
    const att = attendanceOn(l.employeeId, l.date);
    return {
      id: l.id,
      employeeId: l.employeeId,
      employeeName: emp ? fullName(emp.firstName, emp.lastName) : "—",
      date: l.date,
      checkInAt: att?.checkInAt,
      checkOutAt: att?.checkOutAt,
      workedMinutes: att?.workedMinutes,
      reason: l.reason,
      status: l.status,
    };
  });

  return (
    <>
      <PageHeader
        title="Late Entry"
        description={canApprove ? "Review late-entry requests." : "Your late-entry applications."}
        actions={can(user, "lateentry.apply") ? <LateEntryDialog /> : undefined}
      />
      <LateEntryTable rows={rows} canApprove={canApprove} canViewEmployee={canViewEmployee} />
    </>
  );
}
