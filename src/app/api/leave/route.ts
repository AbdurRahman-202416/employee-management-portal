import { z } from "zod";
import { authorize } from "@/server/auth/guard";
import { createLeave } from "@/server/repositories/applications";
import { dayCount } from "@/lib/date";

const Schema = z
  .object({
    type: z.enum(["sick", "annual"]),
    fromDate: z.string().min(1, "From date is required"),
    toDate: z.string().min(1, "To date is required"),
    reason: z.string().min(1, "Reason is required"),
  })
  .refine((d) => d.toDate >= d.fromDate, { message: "To date must be after from date", path: ["toDate"] });

export async function POST(request: Request) {
  const auth = await authorize("leave.apply");
  if ("error" in auth) return auth.error;

  const body = await request.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const leave = createLeave({
    employeeId: auth.user.id,
    ...parsed.data,
    days: dayCount(parsed.data.fromDate, parsed.data.toDate),
  });
  return Response.json({ success: true, data: { id: leave.id } });
}
