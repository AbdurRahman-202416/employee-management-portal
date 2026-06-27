import { z } from "zod";
import { authorize } from "@/server/auth/guard";
import { createRole } from "@/server/repositories/lookups";
import { ALL_PERMISSIONS } from "@/config/permissions.config";
import type { Permission } from "@/types";

const Schema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  permissions: z.array(z.string()).min(1, "Select at least one permission"),
});

export async function POST(request: Request) {
  const auth = await authorize("role.manage");
  if ("error" in auth) return auth.error;

  const body = await request.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  // Keep only known permissions.
  const permissions = parsed.data.permissions.filter((p): p is Permission =>
    (ALL_PERMISSIONS as string[]).includes(p)
  );

  const role = createRole({ name: parsed.data.name, description: parsed.data.description, permissions });
  return Response.json({ success: true, data: { id: role.id } });
}
