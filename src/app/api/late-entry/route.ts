import { z } from "zod";
import { authorize } from "@/server/auth/guard";
import { createLateEntry } from "@/server/repositories/applications";

const Schema = z.object({
  date: z.string().min(1, "Date is required"),
  reason: z.string().min(1, "Reason is required"),
});

export async function POST(request: Request) {
  const auth = await authorize("lateentry.apply");
  if ("error" in auth) return auth.error;

  const body = await request.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const entry = createLateEntry({ employeeId: auth.user.id, ...parsed.data });
  return Response.json({ success: true, data: { id: entry.id } });
}
