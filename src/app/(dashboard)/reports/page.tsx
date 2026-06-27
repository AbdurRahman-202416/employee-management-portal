import type { Metadata } from "next";
import { requirePermission } from "@/server/auth/guard";
import { listAttendance } from "@/server/repositories/attendance";
import { getEmployee } from "@/server/repositories/employees";
import { listDepartments, departmentName } from "@/server/repositories/lookups";
import { fullName } from "@/lib/format";
import { PageHeader } from "@/components/common/page-header";
import { ReportsClient, type ReportRow } from "@/features/reports/reports-client";

export const metadata: Metadata = { title: "Reports" };

export default async function ReportsPage() {
  await requirePermission("report.view");

  const rows: ReportRow[] = listAttendance()
    .slice(0, 500)
    .map((r) => {
      const emp = getEmployee(r.employeeId);
      return {
        id: r.id,
        employeeName: emp ? fullName(emp.firstName, emp.lastName) : "—",
        department: emp ? departmentName(emp.departmentId) : "—",
        date: r.date,
        status: r.status,
        checkInAt: r.checkInAt,
        checkOutAt: r.checkOutAt,
        workedMinutes: r.workedMinutes,
      };
    });

  return (
    <>
      <PageHeader
        title="Reports"
        description="Filter attendance and export to Excel or PDF."
      />
      <ReportsClient rows={rows} departments={listDepartments().map((d) => ({ id: d.id, name: d.name }))} />
    </>
  );
}
