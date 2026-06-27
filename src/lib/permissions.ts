/** Permission checks shared by UI and server. Always check permissions,
 *  never role names — this is what makes roles dynamic. */

import type { Permission, SessionUser } from "@/types";

export function can(
  user: Pick<SessionUser, "permissions"> | null | undefined,
  permission: Permission
): boolean {
  if (!user) return false;
  return user.permissions.includes(permission);
}

export function canAny(
  user: Pick<SessionUser, "permissions"> | null | undefined,
  permissions: Permission[]
): boolean {
  if (!user) return false;
  return permissions.some((p) => user.permissions.includes(p));
}
