import { authorize } from "@/server/auth/guard";
import { deleteRole } from "@/server/repositories/lookups";
import { listEmployees } from "@/server/repositories/employees";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authorize("role.delete");
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const assigned = listEmployees().filter((e) => e.roleId === id).length;
  if (assigned > 0) {
    return Response.json(
      { success: false, error: `Reassign ${assigned} employee(s) before deleting this role` },
      { status: 400 }
    );
  }

  const result = deleteRole(id);
  if (result === "not-found") return Response.json({ success: false, error: "Role not found" }, { status: 404 });
  if (result === "system") return Response.json({ success: false, error: "System roles cannot be deleted" }, { status: 400 });
  return Response.json({ success: true });
}
