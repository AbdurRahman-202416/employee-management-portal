/**
 * SESSION & AUTH
 * --------------------------------------------------------------
 * Login sessions are signed JWTs stored in an httpOnly cookie
 * (not readable by JavaScript -> safe from XSS token theft).
 * Permissions are rebuilt fresh from the store on every request,
 * so a role change takes effect immediately.
 */

import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { getEmployee } from "../repositories/employees";
import { getRole } from "../repositories/lookups";
import { fullName } from "@/lib/format";
import type { Employee, SessionUser } from "@/types";
import { SESSION_COOKIE, SESSION_MAX_AGE as MAX_AGE } from "./constants";

export { SESSION_COOKIE };

function secret(): Uint8Array {
  const value =
    process.env.AUTH_SECRET ||
    "dev-only-insecure-secret-change-me-in-production-please-1234567890";
  if (!process.env.AUTH_SECRET && process.env.NODE_ENV === "production") {
    console.warn("[auth] AUTH_SECRET is not set — using an insecure dev fallback.");
  }
  return new TextEncoder().encode(value);
}

export function buildSessionUser(emp: Employee): SessionUser {
  const role = getRole(emp.roleId);
  return {
    id: emp.id,
    employeeId: emp.employeeId,
    name: fullName(emp.firstName, emp.lastName),
    email: emp.email,
    roleSlug: role?.slug ?? "employee",
    roleName: role?.name ?? "Employee",
    permissions: role?.permissions ?? [],
    departmentId: emp.departmentId,
    photoUrl: emp.photoUrl,
    mustChangePassword: emp.mustChangePassword,
  };
}

export async function createSession(userId: string) {
  const token = await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/** Read the current user, or null if not signed in. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    const userId = payload.sub as string;
    const emp = getEmployee(userId);
    if (!emp) return null;
    return buildSessionUser(emp);
  } catch {
    return null;
  }
}
