import { z } from "zod";
import { authorize } from "@/server/auth/guard";
import { getTask, updateTaskStatus } from "@/server/repositories/tasks";

const StatusSchema = z
  .object({
    status: z.enum(["todo", "in-progress", "pending-approval", "approved", "reopened"]),
    note: z.string().optional(),
  })
  .refine((d) => d.status !== "reopened" || (d.note?.trim().length ?? 0) > 0, {
    message: "A reason is required when reopening",
    path: ["note"],
  });

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authorize("task.update.status");
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const task = getTask(id);
  if (!task) return Response.json({ success: false, error: "Task not found" }, { status: 404 });

  const body = await request.json().catch(() => null);
  const parsed = StatusSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ success: false, error: "Invalid status" }, { status: 400 });
  }

  const isOwner = task.assigneeId === auth.user.id;
  const isManager = auth.user.permissions.includes("task.approve");
  const wantsApprovalAction = ["approved", "reopened"].includes(parsed.data.status);

  // Employees can move their own tasks; only managers can approve/reopen.
  if (!isManager && (!isOwner || wantsApprovalAction)) {
    return Response.json({ success: false, error: "Not allowed" }, { status: 403 });
  }

  const updated = updateTaskStatus(id, parsed.data.status, parsed.data.note);
  return Response.json({ success: true, data: updated });
}
