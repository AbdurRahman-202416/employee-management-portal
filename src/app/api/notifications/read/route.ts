import { authorize } from "@/server/auth/guard";
import { markAllRead } from "@/server/repositories/misc";

export async function POST() {
  const auth = await authorize("notification.view");
  if ("error" in auth) return auth.error;
  markAllRead(auth.user.id);
  return Response.json({ success: true });
}
