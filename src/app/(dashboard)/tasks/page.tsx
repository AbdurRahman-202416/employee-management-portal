import type { Metadata } from "next";
import { requireUser } from "@/server/auth/guard";
import { can } from "@/lib/permissions";
import { listTasks } from "@/server/repositories/tasks";
import { getEmployee, listEmployees } from "@/server/repositories/employees";
import { fullName } from "@/lib/format";
import { PageHeader } from "@/components/common/page-header";
import { TasksTable, type TaskRow } from "@/features/tasks/tasks-table";
import { TaskDialog } from "@/features/tasks/task-dialog";

export const metadata: Metadata = { title: "Tasks" };

export default async function TasksPage() {
  const user = await requireUser();
  const seeAll = can(user, "task.view.all");
  const canApprove = can(user, "task.approve");
  const canUpdate = can(user, "task.update.status");
  const canViewEmployee = can(user, "employee.view");

  const tasks = listTasks(seeAll ? {} : { assigneeId: user.id });
  const rows: TaskRow[] = tasks.map((t) => {
    const emp = getEmployee(t.assigneeId);
    const isOwner = t.assigneeId === user.id;
    return {
      id: t.id,
      code: t.code,
      title: t.title,
      assigneeId: t.assigneeId,
      canViewEmployee,
      assigneeName: emp ? fullName(emp.firstName, emp.lastName) : "—",
      priority: t.priority,
      status: t.status,
      dueDate: t.dueDate,
      canEdit: canApprove || (canUpdate && isOwner),
      canApprove,
    };
  });

  return (
    <>
      <PageHeader
        title="Tasks"
        description={seeAll ? "All assigned tasks and their progress." : "Tasks assigned to you."}
        actions={
          can(user, "task.create") ? (
            <TaskDialog
              employees={listEmployees().map((e) => ({ id: e.id, name: fullName(e.firstName, e.lastName) }))}
            />
          ) : undefined
        }
      />
      <TasksTable rows={rows} />
    </>
  );
}
