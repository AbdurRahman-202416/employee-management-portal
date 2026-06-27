import type { Metadata } from "next";
import { requireUser, requirePermission } from "@/server/auth/guard";
import { can } from "@/lib/permissions";
import { listEmployees } from "@/server/repositories/employees";
import { listDepartments, departmentName, listRoles } from "@/server/repositories/lookups";
import { fullName } from "@/lib/format";
import { PageHeader } from "@/components/common/page-header";
import { EmployeesTable, type EmployeeRow } from "@/features/employees/employees-table";
import { EmployeeDialog } from "@/features/employees/employee-dialog";

export const metadata: Metadata = { title: "Employees" };

export default async function EmployeesPage({
  searchParams,
}: {
  searchParams: Promise<{ department?: string }>;
}) {
  const user = await requireUser();
  await requirePermission("employee.view");
  const { department } = await searchParams;

  const employees: EmployeeRow[] = listEmployees({ departmentId: department }).map((e) => ({
    ...e,
    name: fullName(e.firstName, e.lastName),
    departmentName: departmentName(e.departmentId),
  }));

  const departments = listDepartments().map((d) => ({ id: d.id, name: d.name }));
  const roles = listRoles().map((r) => ({ id: r.id, name: r.name }));
  const activeDept = department ? departmentName(department) : null;

  return (
    <>
      <PageHeader
        title="Employees"
        description={
          activeDept
            ? `${employees.length} people in ${activeDept}.`
            : `${employees.length} people across the organization.`
        }
        actions={can(user, "employee.create") ? <EmployeeDialog departments={departments} roles={roles} /> : undefined}
      />
      <EmployeesTable employees={employees} departments={departments} currentDepartment={department ?? ""} />
    </>
  );
}
