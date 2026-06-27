import { z } from "zod";
import { authorize } from "@/server/auth/guard";
import { createTask } from "@/server/repositories/tasks";
import { getEmployee } from "@/server/repositories/employees";
import { addNotification } from "@/server/repositories/misc";

const Schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  assigneeId: z.string().min(1, "Assignee is required"),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  dueDate: z.string().min(1, "Due date is required"),
});

export async function POST(request: Request) {
  const auth = await authorize("task.create");
  if ("error" in auth) return auth.error;

  const body = await request.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  if (!getEmployee(parsed.data.assigneeId)) {
    return Response.json({ success: false, error: "Assignee not found" }, { status: 400 });
  }

  const task = createTask({ ...parsed.data, assignedById: auth.user.id });

  // Notify the assignee, linked to the new task.
  addNotification({
    id: `ntf-${Date.now()}`,
    userId: parsed.data.assigneeId,
    type: "task-assigned",
    title: "New task assigned",
    message: `You were assigned '${task.title}'.`,
    read: false,
    createdAt: new Date().toISOString(),
    entityType: "task",
    entityId: task.id,
  });

  return Response.json({ success: true, data: { id: task.id, code: task.code } });
}
