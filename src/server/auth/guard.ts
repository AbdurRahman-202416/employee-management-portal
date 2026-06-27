/** Server-side guards for pages and API route handlers. */

import "server-only";
import { redirect } from "next/navigation";
import { getSessionUser } from "./session";
import { can } from "@/lib/permissions";
import type { Permission, SessionUser } from "@/types";

/** Use in a protected server page. Redirects to /login when signed out. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

/** Use in a protected server page. Redirects to /dashboard if not allowed. */
export async function requirePermission(permission: Permission): Promise<SessionUser> {
  const user = await requireUser();
  if (!can(user, permission)) redirect("/dashboard");
  return user;
}

/** Use in an API route. Returns the user or a 401/403 Response. */
export async function authorize(
  permission?: Permission
): Promise<{ user: SessionUser } | { error: Response }> {
  const user = await getSessionUser();
  if (!user) {
    return { error: Response.json({ success: false, error: "Not signed in" }, { status: 401 }) };
  }
  if (permission && !can(user, permission)) {
    return { error: Response.json({ success: false, error: "Not allowed" }, { status: 403 }) };
  }
  return { user };
}
