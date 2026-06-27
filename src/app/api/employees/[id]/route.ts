import { z } from "zod";
import { authorize } from "@/server/auth/guard";
import { getEmployee, updateEmployee } from "@/server/repositories/employees";
import { addAuditLog } from "@/server/repositories/misc";
import { fullName } from "@/lib/format";

const UpdateSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(3),
  departmentId: z.string().min(1),
  designation: z.string().min(1),
  roleId: z.string().min(1),
  joiningDate: z.string().min(1),
  employmentStatus: z.enum(["active", "on-leave", "inactive"]),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authorize("employee.edit");
  if ("error" in auth) return auth.error;

  const { id } = await params;
  if (!getEmployee(id)) return Response.json({ success: false, error: "Employee not found" }, { status: 404 });

  const body = await request.json().catch(() => null);
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const updated = updateEmployee(id, parsed.data);
  addAuditLog({
    id: `log-${Date.now()}`,
    actorId: auth.user.id,
    action: "employee.edit",
    entity: "Employee",
    entityId: id,
    summary: `${auth.user.name} updated ${fullName(parsed.data.firstName, parsed.data.lastName)}`,
    createdAt: new Date().toISOString(),
  });

  return Response.json({ success: true, data: { id: updated?.id } });
}
