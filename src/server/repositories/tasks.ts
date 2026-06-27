import { getStore } from "../store/db";
import type { TaskItem, TaskPriority, TaskStatus } from "@/types";

export function nextTaskCode(): string {
  const { tasks } = getStore();
  const max = tasks.reduce((acc, t) => {
    const n = Number(t.code.replace("TSK-", ""));
    return Number.isFinite(n) ? Math.max(acc, n) : acc;
  }, 0);
  return `TSK-${String(max + 1).padStart(4, "0")}`;
}

export function createTask(input: {
  title: string;
  description: string;
  assigneeId: string;
  assignedById: string;
  priority: TaskPriority;
  dueDate: string;
}): TaskItem {
  const task: TaskItem = {
    id: `task-${Date.now()}`,
    code: nextTaskCode(),
    title: input.title,
    description: input.description,
    assigneeId: input.assigneeId,
    assignedById: input.assignedById,
    priority: input.priority,
    status: "todo",
    dueDate: input.dueDate,
    comments: [],
    createdAt: new Date().toISOString(),
  };
  getStore().tasks.unshift(task);
  return task;
}

export function listTasks(opts?: { assigneeId?: string; status?: TaskStatus }): TaskItem[] {
  let rows = getStore().tasks;
  if (opts?.assigneeId) rows = rows.filter((t) => t.assigneeId === opts.assigneeId);
  if (opts?.status) rows = rows.filter((t) => t.status === opts.status);
  return [...rows].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getTask(id: string): TaskItem | undefined {
  return getStore().tasks.find((t) => t.id === id);
}

export function taskStats(assigneeId?: string) {
  const rows = assigneeId
    ? getStore().tasks.filter((t) => t.assigneeId === assigneeId)
    : getStore().tasks;
  return {
    total: rows.length,
    todo: rows.filter((t) => t.status === "todo").length,
    inProgress: rows.filter((t) => t.status === "in-progress").length,
    pendingApproval: rows.filter((t) => t.status === "pending-approval").length,
    approved: rows.filter((t) => t.status === "approved").length,
    reopened: rows.filter((t) => t.status === "reopened").length,
  };
}

export function updateTaskStatus(id: string, status: TaskStatus, note?: string): TaskItem | undefined {
  const t = getStore().tasks.find((x) => x.id === id);
  if (!t) return undefined;
  t.status = status;
  // Capture the reviewer's note only on approval / reopen decisions.
  if (status === "approved" || status === "reopened") {
    t.reviewNote = note?.trim() || undefined;
  }
  return t;
}
