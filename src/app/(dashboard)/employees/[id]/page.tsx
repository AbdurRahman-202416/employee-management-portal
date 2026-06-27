import { notFound, redirect } from "next/navigation";
import {
  Mail,
  Phone,
  Building2,
  CalendarDays,
  Briefcase,
  IdCard,
} from "lucide-react";
import { requireUser } from "@/server/auth/guard";
import { can } from "@/lib/permissions";
import { getEmployee } from "@/server/repositories/employees";
import { departmentName, getRole, listDepartments, listRoles } from "@/server/repositories/lookups";
import { summaryFor } from "@/server/repositories/attendance";
import { taskStats, listTasks } from "@/server/repositories/tasks";
import { listLeave, listLateEntry } from "@/server/repositories/applications";
import { fullName, percent } from "@/lib/format";
import { formatDate } from "@/lib/date";
import { cn } from "@/lib/cn";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/common/status-badge";
import { EmployeeDialog } from "@/features/employees/employee-dialog";
import { DeleteButton } from "@/components/common/delete-button";
import type { LeaveBalance } from "@/types";

function AttendanceTile({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 text-center">
      <p className={cn("tabular text-2xl font-semibold", tone)}>{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function LeaveGauge({ title, balance, tone }: { title: string; balance: LeaveBalance; tone: string }) {
  const remaining = balance.allocated - balance.used;
  const pct = percent(balance.used, balance.allocated);
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">{title}</span>
        <span className="tabular text-muted-foreground">
          {remaining}/{balance.allocated} left
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full", tone)} style={{ width: `${pct}%` }} />
      </div>
      <div className="tabular flex justify-between text-xs text-muted-foreground">
        <span>{balance.used} used</span>
        <span>{balance.allocated} allocated</span>
      </div>
    </div>
  );
}

export default async function EmployeeDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const viewer = await requireUser();
  if (viewer.id !== id && !can(viewer, "employee.view")) redirect("/dashboard");

  const emp = getEmployee(id);
  if (!emp) notFound();

  const name = fullName(emp.firstName, emp.lastName);
  const role = getRole(emp.roleId);
  const month = summaryFor(emp.id, 30);
  const year = summaryFor(emp.id, 365);
  const tasks = taskStats(emp.id);
  const recentTasks = listTasks({ assigneeId: emp.id }).slice(0, 5);
  const leaves = listLeave({ employeeId: emp.id }).slice(0, 5);
  const lates = listLateEntry({ employeeId: emp.id }).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Passport header — the signature element */}
      <Card className="overflow-hidden">
        <div className="h-24 bg-sidebar" />
        <CardContent className="pt-0">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <Avatar name={name} src={emp.photoUrl} size="xl" className="-mt-10 ring-4 ring-card" />
            <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-semibold tracking-tight">{name}</h1>
                  <StatusBadge kind="employment" value={emp.employmentStatus} />
                </div>
                <p className="text-sm text-muted-foreground">
                  {emp.designation} · {departmentName(emp.departmentId)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone="primary" className="tabular w-fit text-sm">
                  <IdCard className="h-3.5 w-3.5" /> {emp.employeeId}
                </Badge>
                {can(viewer, "employee.edit") && (
                  <EmployeeDialog
                    mode="edit"
                    departments={listDepartments().map((d) => ({ id: d.id, name: d.name }))}
                    roles={listRoles().map((r) => ({ id: r.id, name: r.name }))}
                    initial={{
                      id: emp.id,
                      firstName: emp.firstName,
                      lastName: emp.lastName,
                      email: emp.email,
                      phone: emp.phone,
                      departmentId: emp.departmentId,
                      designation: emp.designation,
                      roleId: emp.roleId,
                      joiningDate: emp.joiningDate,
                      employmentStatus: emp.employmentStatus,
                    }}
                  />
                )}
                {can(viewer, "employee.delete") && (
                  <DeleteButton
                    variant="icon"
                    endpoint={`/api/employees/${emp.id}`}
                    title="Delete employee?"
                    subtitle={`${name} will be removed from the directory.`}
                    redirectTo="/employees"
                  />
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 border-t border-border pt-5 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" /> <span className="truncate text-foreground">{emp.email}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" /> <span className="text-foreground">{emp.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Briefcase className="h-4 w-4" /> <span className="text-foreground">{role?.name}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarDays className="h-4 w-4" /> <span className="text-foreground">Joined {formatDate(emp.joiningDate)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Attendance summary */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Attendance Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <p className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Building2 className="h-4 w-4" /> Current Month (last 30 days)
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <AttendanceTile label="Present" value={month.present} tone="text-success" />
                <AttendanceTile label="Late" value={month.late} tone="text-warning" />
                <AttendanceTile label="Early Exit" value={month.earlyExit} tone="text-warning" />
                <AttendanceTile label="Absent" value={month.absent} tone="text-danger" />
              </div>
            </div>
            <div>
              <p className="mb-3 text-sm font-medium text-muted-foreground">Current Year</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <AttendanceTile label="Working Days" value={year.workingDays} tone="text-foreground" />
                <AttendanceTile label="Present" value={year.present} tone="text-success" />
                <AttendanceTile label="Late" value={year.late} tone="text-warning" />
                <AttendanceTile label="Leave" value={year.leave} tone="text-info" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leave summary */}
        <Card>
          <CardHeader>
            <CardTitle>Leave Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <LeaveGauge title="Sick Leave" balance={emp.leave.sick} tone="bg-info" />
            <LeaveGauge title="Annual Leave" balance={emp.leave.annual} tone="bg-primary" />
          </CardContent>
        </Card>
      </div>

      {/* Task summary */}
      <Card>
        <CardHeader>
          <CardTitle>Task Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <AttendanceTile label="Total Assigned" value={tasks.total} tone="text-foreground" />
            <AttendanceTile label="In Progress" value={tasks.inProgress} tone="text-info" />
            <AttendanceTile label="Pending Approval" value={tasks.pendingApproval} tone="text-warning" />
            <AttendanceTile label="Approved" value={tasks.approved} tone="text-success" />
          </div>
          <div className="divide-y divide-border">
            {recentTasks.length === 0 && <p className="py-3 text-sm text-muted-foreground">No tasks.</p>}
            {recentTasks.map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">{t.title}</p>
                  <p className="tabular text-xs text-muted-foreground">{t.code} · Due {formatDate(t.dueDate)}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <StatusBadge kind="priority" value={t.priority} />
                  <StatusBadge kind="task" value={t.status} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Application history */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Leave Applications</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            {leaves.length === 0 && <p className="py-3 text-sm text-muted-foreground">No leave history.</p>}
            {leaves.map((l) => (
              <div key={l.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <div>
                  <p className="font-medium capitalize text-foreground">{l.type} leave</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(l.fromDate)} – {formatDate(l.toDate)} · {l.days} day(s)
                  </p>
                </div>
                <StatusBadge kind="application" value={l.status} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Late Entry Applications</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            {lates.length === 0 && <p className="py-3 text-sm text-muted-foreground">No late entries.</p>}
            {lates.map((l) => (
              <div key={l.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <div>
                  <p className="font-medium text-foreground">{formatDate(l.date)}</p>
                  <p className="text-xs text-muted-foreground">{l.reason}</p>
                </div>
                <StatusBadge kind="application" value={l.status} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
