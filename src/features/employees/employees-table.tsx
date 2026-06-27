"use client";

import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/common/status-badge";
import { DataTable, type ColumnDef } from "@/components/common/data-table";
import { Select } from "@/components/ui/input";
import type { SafeEmployee } from "@/types";

export type EmployeeRow = SafeEmployee & { departmentName: string; name: string };

const columns: ColumnDef<EmployeeRow>[] = [
  {
    key: "name",
    header: "Employee",
    sortable: true,
    render: (e) => (
      <div className="flex items-center gap-3">
        <Avatar name={e.name} src={e.photoUrl} size="sm" />
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">{e.name}</p>
          <p className="tabular text-xs text-muted-foreground">{e.employeeId}</p>
        </div>
      </div>
    ),
  },
  { key: "email", header: "Email", sortable: true, hideOnMobile: true },
  { key: "departmentName", header: "Department", sortable: true },
  { key: "designation", header: "Designation", sortable: true, hideOnMobile: true },
  {
    key: "employmentStatus",
    header: "Status",
    align: "center",
    render: (e) => <StatusBadge kind="employment" value={e.employmentStatus} />,
  },
];

export function EmployeesTable({
  employees,
  departments,
  currentDepartment,
}: {
  employees: EmployeeRow[];
  departments: { id: string; name: string }[];
  currentDepartment: string;
}) {
  const router = useRouter();

  return (
    <DataTable
      columns={columns}
      data={employees}
      searchKeys={["name", "email", "employeeId", "designation"]}
      searchPlaceholder="Search employees by name, email, ID…"
      emptyTitle="No employees found"
      emptyDescription="Add your first employee to get started."
      toolbar={
        <Select
          value={currentDepartment}
          onChange={(e) =>
            router.push(e.target.value ? `/employees?department=${e.target.value}` : "/employees")
          }
          className="w-48"
          aria-label="Filter by department"
        >
          <option value="">All departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </Select>
      }
    />
  );
}
