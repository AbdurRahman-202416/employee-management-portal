import { z } from "zod";
import { authorize } from "@/server/auth/guard";
import { setLeaveStatus, deleteLeave } from "@/server/repositories/applications";

const Schema = z
  .object({ status: z.enum(["approved", "rejected"]), note: z.string().optional() })
  .refine((d) => d.status !== "rejected" || (d.note?.trim().length ?? 0) > 0, {
    message: "A reason is required when rejecting",
    path: ["note"],
  });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authorize("leave.approve");
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const updated = setLeaveStatus(id, parsed.data.status, auth.user.id, parsed.data.note);
  if (!updated) return Response.json({ success: false, error: "Not found" }, { status: 404 });
  return Response.json({ success: true, data: updated });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authorize("leave.delete");
  if ("error" in auth) return auth.error;
  const { id } = await params;
  if (!deleteLeave(id)) return Response.json({ success: false, error: "Not found" }, { status: 404 });
  return Response.json({ success: true });
}
