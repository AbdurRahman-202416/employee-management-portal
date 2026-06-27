import { authorize } from "@/server/auth/guard";
import { markOneRead } from "@/server/repositories/misc";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authorize("notification.view");
  if ("error" in auth) return auth.error;
  const { id } = await params;
  markOneRead(auth.user.id, id);
  return Response.json({ success: true });
}
