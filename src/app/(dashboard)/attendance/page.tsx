import type { Metadata } from "next";
import { requireUser } from "@/server/auth/guard";
import { can } from "@/lib/permissions";
import { listAttendance } from "@/server/repositories/attendance";
import { getEmployee } from "@/server/repositories/employees";
import { fullName } from "@/lib/format";
import { PageHeader } from "@/components/common/page-header";
import { AttendanceTable, type AttendanceRow } from "@/features/attendance/attendance-table";

export const metadata: Metadata = { title: "Attendance" };

export default async function AttendancePage() {
  const user = await requireUser();
  const seeAll = can(user, "attendance.view.all");

  const canViewEmployee = can(user, "employee.view");
  const records = listAttendance(seeAll ? {} : { employeeId: user.id }).slice(0, 300);
  const rows: AttendanceRow[] = records.map((r) => {
    const emp = getEmployee(r.employeeId);
    return {
      id: r.id,
      employeeId: r.employeeId,
      canViewEmployee,
      employeeName: emp ? fullName(emp.firstName, emp.lastName) : "—",
      date: r.date,
      checkInAt: r.checkInAt,
      checkOutAt: r.checkOutAt,
      status: r.status,
      workedMinutes: r.workedMinutes,
    };
  });

  return (
    <>
      <PageHeader
        title="Attendance"
        description={seeAll ? "Company-wide attendance log." : "Your attendance history."}
      />
      <AttendanceTable rows={rows} />
    </>
  );
}
