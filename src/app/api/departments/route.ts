import { z } from "zod";
import { authorize } from "@/server/auth/guard";
import { createDepartment } from "@/server/repositories/lookups";

const Schema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required").max(6, "Code must be 6 characters or fewer"),
  description: z.string().min(1, "Description is required"),
});

export async function POST(request: Request) {
  const auth = await authorize("department.manage");
  if ("error" in auth) return auth.error;

  const body = await request.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const dept = createDepartment(parsed.data);
  return Response.json({ success: true, data: dept });
}
