import { getStore } from "../store/db";
import type { Employee, SafeEmployee } from "@/types";

export function toSafe(emp: Employee): SafeEmployee {
  const { passwordHash: _omit, ...safe } = emp;
  void _omit;
  return safe;
}

export function listEmployees(opts?: {
  search?: string;
  departmentId?: string;
  status?: string;
}): SafeEmployee[] {
  const { employees } = getStore();
  let rows = employees.filter((e) => !e.isDeleted);

  if (opts?.search) {
    const q = opts.search.toLowerCase();
    rows = rows.filter(
      (e) =>
        `${e.firstName} ${e.lastName}`.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.employeeId.toLowerCase().includes(q)
    );
  }
  if (opts?.departmentId) rows = rows.filter((e) => e.departmentId === opts.departmentId);
  if (opts?.status) rows = rows.filter((e) => e.employmentStatus === opts.status);

  return rows
    .sort((a, b) => a.employeeId.localeCompare(b.employeeId))
    .map(toSafe);
}

export function getEmployee(id: string): Employee | undefined {
  return getStore().employees.find((e) => e.id === id && !e.isDeleted);
}

export function getEmployeeByEmail(email: string): Employee | undefined {
  return getStore().employees.find(
    (e) => e.email.toLowerCase() === email.toLowerCase() && !e.isDeleted
  );
}

export function nextEmployeeId(): string {
  const { employees } = getStore();
  const max = employees.reduce((acc, e) => {
    const n = Number(e.employeeId.replace("EMP-", ""));
    return Number.isFinite(n) ? Math.max(acc, n) : acc;
  }, 0);
  return `EMP-${String(max + 1).padStart(4, "0")}`;
}

export function createEmployee(emp: Employee): Employee {
  getStore().employees.push(emp);
  return emp;
}

export function updateEmployee(id: string, patch: Partial<Employee>): Employee | undefined {
  const store = getStore();
  const idx = store.employees.findIndex((e) => e.id === id);
  if (idx === -1) return undefined;
  store.employees[idx] = { ...store.employees[idx], ...patch };
  return store.employees[idx];
}

export function softDeleteEmployee(id: string): boolean {
  const emp = getStore().employees.find((e) => e.id === id);
  if (!emp) return false;
  emp.isDeleted = true;
  emp.employmentStatus = "inactive";
  return true;
}
