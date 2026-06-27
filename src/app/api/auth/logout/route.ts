import { destroySession } from "@/server/auth/session";

export async function POST() {
  await destroySession();
  return Response.json({ success: true });
}
