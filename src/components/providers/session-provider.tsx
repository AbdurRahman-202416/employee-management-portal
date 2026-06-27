"use client";

import { createContext, useContext } from "react";
import type { Permission, SessionUser } from "@/types";

const SessionContext = createContext<SessionUser | null>(null);

export function SessionProvider({
  user,
  children,
}: {
  user: SessionUser;
  children: React.ReactNode;
}) {
  return <SessionContext.Provider value={user}>{children}</SessionContext.Provider>;
}

/** Read the current signed-in user inside any client component. */
export function useSession(): SessionUser {
  const user = useContext(SessionContext);
  if (!user) throw new Error("useSession must be used inside <SessionProvider>");
  return user;
}

/** Show children only if the user has the given permission. */
export function Can({
  permission,
  children,
  fallback = null,
}: {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const user = useSession();
  return user.permissions.includes(permission) ? <>{children}</> : <>{fallback}</>;
}
