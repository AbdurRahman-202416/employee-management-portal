"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DataTable, type ColumnDef } from "@/components/common/data-table";
import { StatusBadge } from "@/components/common/status-badge";
import { EmployeeLink } from "@/components/common/employee-link";
import { Select } from "@/components/ui/input";
import { formatDate } from "@/lib/date";
import type { TaskStatus } from "@/types";

export interface TaskRow {
  id: string;
  code: string;
  title: string;
  assigneeId: string;
  assigneeName: string;
  canViewEmployee: boolean;
  priority: string;
  status: string;
  dueDate: string;
  canEdit: boolean;
  canApprove: boolean;
}

function StatusCell({ row }: { row: TaskRow }) {
  const router = useRouter();
  // Work-progression statuses only; Approve / Reopen happen on the task
  // details page with a confirmation step and a note.
  const base: TaskStatus[] = ["todo", "in-progress", "pending-approval"];
  const options: TaskStatus[] = base.includes(row.status as TaskStatus)
    ? base
    : [row.status as TaskStatus, ...base];

  async function update(status: string) {
    const res = await fetch(`/api/tasks/${row.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const json = await res.json();
    if (!json.success) {
      toast.error(json.error ?? "Could not update");
      return;
    }
    toast.success("Task updated");
    router.refresh();
  }

  if (!row.canEdit) return <StatusBadge kind="task" value={row.status} />;

  return (
    <Select
      value={row.status}
      onChange={(e) => update(e.target.value)}
      onClick={(e) => e.stopPropagation()}
      className="h-8 w-40 text-xs"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o.replace("-", " ")}
        </option>
      ))}
    </Select>
  );
}

const columns: ColumnDef<TaskRow>[] = [
  { key: "code", header: "Code", sortable: true, className: "tabular font-medium" },
  { key: "title", header: "Task", sortable: true },
  {
    key: "assigneeName",
    header: "Assignee",
    sortable: true,
    render: (r) => <EmployeeLink id={r.assigneeId} name={r.assigneeName} canView={r.canViewEmployee} />,
  },
  { key: "priority", header: "Priority", align: "center", render: (r) => <StatusBadge kind="priority" value={r.priority} /> },
  { key: "dueDate", header: "Due", render: (r) => formatDate(r.dueDate) },
  { key: "status", header: "Status", render: (r) => <StatusCell row={r} /> },
];

export function TasksTable({ rows }: { rows: TaskRow[] }) {
  return (
    <DataTable
      columns={columns}
      data={rows}
      searchKeys={["code", "title", "assigneeName"]}
      searchPlaceholder="Search tasks…"
      pageSize={12}
      emptyTitle="No tasks yet"
      rowHref={(r) => `/tasks/${r.id}`}
    />
  );
}
