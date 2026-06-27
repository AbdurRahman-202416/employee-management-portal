import type { Metadata } from "next";
import Link from "next/link";
import { Users, ArrowRight } from "lucide-react";
import { requireUser, requirePermission } from "@/server/auth/guard";
import { can } from "@/lib/permissions";
import { listDepartments } from "@/server/repositories/lookups";
import { listEmployees } from "@/server/repositories/employees";
import { PageHeader } from "@/components/common/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DepartmentDialog } from "@/features/departments/department-dialog";
import { DeleteButton } from "@/components/common/delete-button";

export const metadata: Metadata = { title: "Departments" };

export default async function DepartmentsPage() {
  const user = await requireUser();
  await requirePermission("department.view");
  const departments = listDepartments();
  const employees = listEmployees();

  return (
    <>
      <PageHeader
        title="Departments"
        description="Organize your workforce into teams."
        actions={can(user, "department.manage") ? <DepartmentDialog /> : undefined}
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {departments.map((d) => {
          const count = employees.filter((e) => e.departmentId === d.id).length;
          return (
            <Link key={d.id} href={`/employees?department=${d.id}`} className="group">
              <Card className="transition-colors hover:border-primary">
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground">{d.name}</h3>
                    <div className="flex items-center gap-1">
                      <Badge tone="primary">{d.code}</Badge>
                      {can(user, "department.delete") && (
                        <DeleteButton
                          variant="icon"
                          endpoint={`/api/departments/${d.id}`}
                          title="Delete department?"
                          subtitle={`${d.name} will be removed. Employees must be reassigned first.`}
                        />
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{d.description}</p>
                  <div className="flex items-center justify-between">
                    <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                      <Users className="h-4 w-4 text-muted-foreground" /> {count} employees
                    </p>
                    <span className="flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                      View list <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </>
  );
}
