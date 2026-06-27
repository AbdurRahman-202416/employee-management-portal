import { authorize } from "@/server/auth/guard";
import { deleteTask, getTask } from "@/server/repositories/tasks";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authorize("task.delete");
  if ("error" in auth) return auth.error;

  const { id } = await params;
  if (!getTask(id)) return Response.json({ success: false, error: "Task not found" }, { status: 404 });

  deleteTask(id);
  return Response.json({ success: true });
}
