import { z } from "zod";
import { authorize } from "@/server/auth/guard";
import { checkIn, checkOut } from "@/server/repositories/attendance";

const CheckSchema = z.object({
  action: z.enum(["in", "out"]),
  lat: z.number(),
  lng: z.number(),
});

export async function POST(request: Request) {
  const auth = await authorize("attendance.check");
  if ("error" in auth) return auth.error;

  const body = await request.json().catch(() => null);
  const parsed = CheckSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ success: false, error: "Location is required" }, { status: 400 });
  }

  const { action, lat, lng } = parsed.data;
  if (action === "in") {
    const rec = checkIn(auth.user.id, { lat, lng });
    return Response.json({ success: true, data: rec });
  }

  const rec = checkOut(auth.user.id, { lat, lng });
  if (!rec) {
    return Response.json({ success: false, error: "You need to check in first" }, { status: 400 });
  }
  return Response.json({ success: true, data: rec });
}
