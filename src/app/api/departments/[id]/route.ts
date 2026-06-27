import { authorize } from "@/server/auth/guard";
import { deleteDepartment } from "@/server/repositories/lookups";
import { listEmployees } from "@/server/repositories/employees";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authorize("department.delete");
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const headcount = listEmployees({ departmentId: id }).length;
  if (headcount > 0) {
    return Response.json(
      { success: false, error: `Reassign ${headcount} employee(s) before deleting this department` },
      { status: 400 }
    );
  }
  if (!deleteDepartment(id)) {
    return Response.json({ success: false, error: "Department not found" }, { status: 404 });
  }
  return Response.json({ success: true });
}
