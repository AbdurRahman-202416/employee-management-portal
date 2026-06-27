/** Small read helpers for reference data: departments, roles, settings. */

import { getStore } from "../store/db";
import type { Department, Role, AppSettings } from "@/types";

export function listDepartments(): Department[] {
  return [...getStore().departments].sort((a, b) => a.name.localeCompare(b.name));
}

export function createDepartment(input: { name: string; code: string; description: string }): Department {
  const dept: Department = {
    id: `dep-${input.code.toLowerCase()}-${getStore().departments.length + 1}`,
    name: input.name,
    code: input.code.toUpperCase(),
    description: input.description,
    createdAt: new Date().toISOString().slice(0, 10),
  };
  getStore().departments.push(dept);
  return dept;
}

export function updateDepartment(id: string, patch: Partial<Department>): Department | undefined {
  const dept = getStore().departments.find((d) => d.id === id);
  if (!dept) return undefined;
  Object.assign(dept, patch);
  return dept;
}

export function deleteDepartment(id: string): boolean {
  const store = getStore();
  const idx = store.departments.findIndex((d) => d.id === id);
  if (idx === -1) return false;
  store.departments.splice(idx, 1);
  return true;
}

export function getDepartment(id: string): Department | undefined {
  return getStore().departments.find((d) => d.id === id);
}

export function departmentName(id: string): string {
  return getDepartment(id)?.name ?? "—";
}

export function listRoles(): Role[] {
  return getStore().roles;
}

export function getRole(id: string): Role | undefined {
  return getStore().roles.find((r) => r.id === id);
}

export function createRole(input: { name: string; description: string; permissions: Role["permissions"] }): Role {
  const role: Role = {
    id: `role-${Date.now()}`,
    name: input.name,
    slug: input.name.toLowerCase().replace(/\s+/g, "-"),
    description: input.description,
    permissions: input.permissions,
    isSystem: false,
  };
  getStore().roles.push(role);
  return role;
}

/** Returns "ok", "not-found", or "system" (system roles cannot be deleted). */
export function deleteRole(id: string): "ok" | "not-found" | "system" {
  const store = getStore();
  const role = store.roles.find((r) => r.id === id);
  if (!role) return "not-found";
  if (role.isSystem) return "system";
  store.roles = store.roles.filter((r) => r.id !== id);
  return "ok";
}

export function getSettings(): AppSettings {
  return getStore().settings;
}

export function updateSettings(patch: Partial<AppSettings>): AppSettings {
  Object.assign(getStore().settings, patch);
  return getStore().settings;
}
