import { z } from "zod";
import { authorize } from "@/server/auth/guard";
import { updateSettings } from "@/server/repositories/lookups";

const Schema = z.object({
  officeStart: z.string().min(1),
  officeEnd: z.string().min(1),
  lateGraceMinutes: z.number().int().min(0).max(240),
  workdays: z.array(z.number().int().min(0).max(6)),
  timezone: z.string().min(1),
  leaveAllocation: z.object({
    sick: z.number().int().min(0).max(365),
    annual: z.number().int().min(0).max(365),
  }),
});

export async function PATCH(request: Request) {
  const auth = await authorize("settings.manage");
  if ("error" in auth) return auth.error;

  const body = await request.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const updated = updateSettings(parsed.data);
  return Response.json({ success: true, data: updated });
}
