import { getSessionUser } from "@/server/auth/session";

export async function GET() {
  const user = await getSessionUser();
  return Response.json({ success: true, data: user });
}
